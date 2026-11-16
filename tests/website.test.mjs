import test from 'node:test';
import assert from 'node:assert/strict';
import {throughput,transferHours} from '../core.js';
import {analyzeWorkload} from '../src/performance/analysis.js';
import {EVOLUTION_SOURCES} from '../evolution-data.js';
test('engineering calculators reject overflow and unrepresentable positive results',()=>{
 for(const args of [[1e308,8],[Number.MIN_VALUE,.001]])assert.throws(()=>throughput(...args),/numeric range/);
 for(const args of [[1e308,1000,70],[1,Number.MIN_VALUE,70],[Number.MIN_VALUE,1e308,70]])assert.throws(()=>transferHours(...args),/numeric range/);
 assert.deepEqual(throughput(0,8),{mib:0,mb:0});assert.equal(transferHours(1,1000,100),1e12/(1000*1e6/8)/3600);
});
test('analyzer marks unrepresentable baseline ratios unavailable rather than exporting Infinity',()=>{
 const records=Array.from({length:9},(_,i)=>({key:'synthetic',system:'SYNTHETIC',resource:'synthetic',time:i*60000,sourceRow:i+2,iops:i<3?1e-300:1e15,throughput:null,p95:null,p99:null,queue:null,used:null,total:null}));
 const result=analyzeWorkload(records,'synthetic');assert.equal(result.metrics.iops.comparisonStatus,'out-of-range');assert.equal(result.metrics.iops.percentChange,null);assert(!result.findings.some(f=>f.observation.includes('Infinity')));
});
test('repaired historical references retain provenance and describe corroboration limits',()=>{
 for(const key of ['netapp3200','netapp8000models']){assert.match(EVOLUTION_SOURCES[key].url,/sec\.gov/);assert.match(EVOLUTION_SOURCES[key].originalUrl,/community\.netapp\.com/);assert.match(EVOLUTION_SOURCES[key].accessNote,/404/);}
 assert.match(EVOLUTION_SOURCES.powerstore.url,/dell\.com.*20200505-dellemc-powerstore/);
});
