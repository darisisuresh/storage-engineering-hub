import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,normalizeCsv,suggestMapping,parseTimestamp,normalizedCsv,sampleCsv,csvCell,MAX_ROWS} from '../src/performance/csv.js';
import {analyzeWorkload,alignSamples,summarize,defaultWindows,analysisReport} from '../src/performance/analysis.js';
import {envelope} from '../src/performance/charts.js';
const load=text=>{const parsed=parseCsv(text);return normalizeCsv(parsed,suggestMapping(parsed.headers));};
const close=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const header='timestamp,system,resource,iops,throughput_mib_s,latency_p95_ms,latency_p99_ms,queue_depth,used_gib,total_gib';
const line=(minute,values='100,8,2,4,8,50,100',resource='synthetic-workload')=>`2026-01-01T00:${String(minute).padStart(2,'0')}:00Z,SYNTHETIC,${resource},${values}`;
test('CSV parser supports BOM, CRLF, escaped quotes, quoted commas and embedded newlines',()=>{
 const parsed=parseCsv('\uFEFFtimestamp,resource,iops\r\n2026-01-01T00:00:00Z,"synthetic, ""quoted""",100\r\n2026-01-01T00:01:00Z,"two\nlines",200');assert.equal(parsed.rows.length,2);assert.equal(parsed.rows[0][1],'synthetic, "quoted"');assert.equal(parsed.rows[1][1],'two\nlines');
 for(const text of ['a,a\n1,2','a,b\n1','a,b\n"unterminated,2','a,b\n"x"trailing,2','a,b\nx"y,2','a\n'+('x'.repeat(8193))])assert.throws(()=>parseCsv(text));
 assert.throws(()=>parseCsv('x'.repeat(5*1024*1024+1)));assert.throws(()=>parseCsv('time,iops\n'+Array(MAX_ROWS+1).fill('x,1').join('\n')));
});
test('timestamps require explicit zones and validate real calendar dates without local-time guessing',()=>{
 assert.equal(parseTimestamp('2026-01-01T05:30:00+05:30'),parseTimestamp('2026-01-01T00:00:00Z'));
 assert.doesNotThrow(()=>parseTimestamp('2024-02-29T00:00:00Z'));
 for(const s of ['2026-02-29T00:00:00Z','2026-04-31T00:00:00Z','2026-01-01T24:00:00Z','2026-01-01T00:00:00','01/02/2026 00:00','2026-01-01T00:00:00+14:01','2026-01-01T00:00:00+01:99','1970-01-01T00:00:00+01:00','9999-12-31T23:59:59-01:00'])assert.throws(()=>parseTimestamp(s));
});
test('normalization maps arbitrary columns, converts declared units and preserves missing versus zero',()=>{
 const p=parseCsv('when,target,ops,rate,p95,p99,used,total\n2026-01-01T00:00:00Z,synthetic,0,104.8576,2000,,1,2');
 const m={timestamp:0,resource:1,iops:2,throughput:3,p95:4,p99:5,used:6,total:7};
 const {records:[r]}=normalizeCsv(p,m,{throughput:'MB/s',latency:'us',capacity:'TB'});assert.equal(r.iops,0);assert.equal(r.p95,2);assert.equal(r.p99,null);close(r.throughput,100);close(r.used,1e12/2**30);assert.equal(r.sourceRow,2);
 assert.throws(()=>normalizeCsv(p,{...m,total:6}));assert.throws(()=>normalizeCsv(p,{...m,timestamp:-1}));assert.throws(()=>normalizeCsv(p,m,{throughput:'MBps',latency:'ms',capacity:'GB'}));
});
test('invalid telemetry fails with record references; duplicates, impossible percentiles and capacities are rejected',()=>{
 for(const values of ['-1,8,2,4,8,50,100','1e999,8,2,4,8,50,100','1e-999,8,2,4,8,50,100','100,8,5,4,8,50,100','100,8,2,4,8,101,100','100,8,2,4,8,0,0',',,,,,,'])assert.throws(()=>load(header+'\n'+line(0,values)),/CSV record 2/);
 assert.throws(()=>load(header+'\n'+line(0)+'\n'+line(0)),/Duplicate/);
 const sorted=load(header+'\n'+line(2)+'\n'+line(0));assert.equal(sorted.reordered,true);assert.equal(sorted.records[0].sourceRow,3);
});
test('UTC alignment uses per-workload means, maximum reported quantiles and paired capacity',()=>{
 const raw=load(header+'\n'+line(0,'100,10,2,4,8,40,100')+'\n'+line(1,'300,30,8,12,16,60,100')+'\n'+line(1,'900,90,6,9,10,20,100','synthetic-other')).records;
 const aligned=alignSamples(raw,300);assert.equal(aligned.length,2);const a=aligned.find(r=>r.resource==='synthetic-workload');assert.equal(a.iops,200);assert.equal(a.p95,8);assert.equal(a.p99,12);assert.equal(a.used,60);assert.equal(a.capacityPct,60);assert.deepEqual(a.sourceRows,[2,3]);
 const missing=load(header+'\n'+line(0,'100,10,2,4,8,40,')+'\n'+line(1,'100,10,2,4,8,,100')).records;assert.equal(alignSamples(missing,300)[0].capacityPct,null);assert.throws(()=>alignSamples(raw,120));
});
test('known baseline shifts and simultaneous queue/latency breaches cite actual source records',()=>{
 const csv=header+'\n'+Array.from({length:9},(_,i)=>line(i,i<3?'100,8,2,4,8,50,100':'200,16,12,24,80,90,100')).join('\n');const data=load(csv);const result=analyzeWorkload(data.records,data.series[0].key);
 assert.equal(result.metrics.iops.baseline.mean,100);assert.equal(result.metrics.iops.current.mean,200);assert.equal(result.metrics.iops.percentChange,100);assert(result.findings.some(f=>f.id==='capacity-threshold'));assert.match(result.findings.find(f=>f.id==='queue-threshold').observation,/6 of those same samples/);
 const shift=result.findings.find(f=>f.id==='iops-baseline');assert(shift.evidence.some(e=>e.record===2));assert(shift.evidence.some(e=>e.record===5));
 assert.throws(()=>analyzeWorkload(data.records,data.series[0].key,{...defaultWindows(data.records),start:data.records[0].time}),/overlapping/);assert.throws(()=>analyzeWorkload(data.records,data.series[0].key,{thresholds:{capacity:101}}));
 const report=analysisReport(result,{sourceLabel:'Synthetic demonstration',synthetic:true,exportedAt:'2026-01-01T00:00:00Z'});assert.equal(report.synthetic,true);assert.equal(report.schema,'seh-performance-report/v1');assert.equal(analysisReport(result,{sourceLabel:'Synthetic demonstration'}).synthetic,false);
});
test('zero baseline, insufficient samples and absent metrics never invent relative changes or health claims',()=>{
 const data=load(header+'\n'+Array.from({length:9},(_,i)=>line(i,i<3?'0,,,,,,':'100,,,,,,')).join('\n'));const result=analyzeWorkload(data.records,data.series[0].key);assert.equal(result.metrics.iops.delta,100);assert.equal(result.metrics.iops.percentChange,null);assert.equal(result.metrics.p99.current.count,0);assert.match(result.findings[0].observation,/not a health certification/);
 const one=load(header+'\n'+line(0));assert.equal(analyzeWorkload(one.records,one.series[0].key).metrics.iops.current.slopePerHour,null);
});
test('least-squares trend is based on UTC elapsed time and gaps remain explicit',()=>{
 const points=[0,1,2,3,10].map((n,i)=>({time:n*3600000,iops:n*10,sourceRow:i+2,key:'synthetic',system:'SYNTHETIC',resource:'synthetic',throughput:null,p95:null,p99:null,queue:null,used:null,total:null}));const stat=summarize(points,'iops');close(stat.slopePerHour,10);close(stat.r2,1);
 const result=analyzeWorkload(points,'synthetic',{baselineStart:0,baselineEnd:0,start:3600000,end:36000000});assert.equal(result.quality.gaps.length,1);assert(result.findings.some(f=>f.id==='gaps'));
});
test('normalized exports round-trip numeric values and neutralize spreadsheet formula labels',()=>{
 const data=load(header+'\n'+line(0,'100,8,2,4,8,50,100','"=HYPERLINK(""https://example.com"")"'));const csv=normalizedCsv(data.records);assert(csv.includes("'="));assert.equal(load(csv).records[0].iops,100);assert.equal(csvCell('@SUM(A1)'),"\"'@SUM(A1)\"");assert.equal(csvCell(0),'0');
});
test('synthetic demo contains two explicit workloads and chart decimation retains isolated peaks',()=>{
 const data=load(sampleCsv());assert.equal(data.series.length,2);assert.equal(data.records.length,72);assert(data.records.every(r=>r.system==='SYNTHETIC-DEMO'));
 const points=Array.from({length:2000},(_,i)=>({time:i,value:i===1001?999:1}));const reduced=envelope(points);assert(reduced.length<600);assert(reduced.some(p=>p.value===999));assert.deepEqual(reduced[0],points[0]);assert.deepEqual(reduced.at(-1),points.at(-1));
});
