export const MAX_CSV_BYTES=5*1024*1024;
export const MAX_ROWS=20000;
export const METRICS=['iops','throughput','p95','p99','queue','used','total'];
export const FIELDS=[['timestamp','Timestamp (timezone required)'],['system','System label'],['resource','Workload / resource label'],['iops','IOPS'],['throughput','Throughput'],['p95','Reported P95 latency'],['p99','Reported P99 latency'],['queue','Queue depth'],['used','Used capacity'],['total','Total capacity']];
export const CANONICAL=['timestamp','system','resource','iops','throughput_mib_s','latency_p95_ms','latency_p99_ms','queue_depth','used_gib','total_gib'];
export function parseCsv(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_CSV_BYTES)throw Error('Choose a UTF-8 CSV no larger than 5 MiB.');
 text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 const addCell=()=>{if(row.length>=64)throw Error('CSV exceeds 64 columns.');row.push(cell);cell='';closed=false;};
 const addRow=()=>{addCell();if(row.some(c=>c.trim()!==''))rows.push(row);row=[];if(rows.length>MAX_ROWS+1)throw Error('CSV exceeds 20,000 data records.');};
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=ch;}
  else if(ch===',')addCell();
  else if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;addRow();}
  else if(ch==='"'){if(cell||closed)throw Error('Quote must start a CSV field.');quoted=true;}
  else{if(closed)throw Error('Unexpected content after a closing CSV quote.');cell+=ch;}
  if(cell.length>8192)throw Error('A CSV field exceeds 8,192 characters.');
 }
 if(quoted)throw Error('CSV contains an unterminated quoted field.');
 if(cell||row.length||closed)addRow();
 if(rows.length<2)throw Error('CSV needs a header and at least one data record.');
 const headers=rows.shift().map(h=>h.trim());
 if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('CSV headers must be nonempty and unique.');
 for(let i=0;i<rows.length;i++)if(rows[i].length!==headers.length)throw Error(`CSV record ${i+2}: expected ${headers.length} columns, found ${rows[i].length}.`);
 return {headers,rows};
}
export function suggestMapping(headers){
 const aliases={timestamp:['timestamp','time','datetime','date_time'],system:['system','array','system_name'],resource:['resource','volume','workload','lun'],iops:['iops','total_iops'],throughput:['throughput_mib_s','throughput'],p95:['latency_p95_ms','p95'],p99:['latency_p99_ms','p99'],queue:['queue_depth','queue'],used:['used_gib','used'],total:['total_gib','total']};
 return Object.fromEntries(FIELDS.map(([key])=>[key,headers.findIndex(h=>aliases[key].includes(h.toLowerCase()))]));
}
export function parseTimestamp(value){
 const s=String(value).trim();
 const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/i.exec(s);
 if(!m)throw Error('Timestamp must be ISO 8601 with seconds and an explicit timezone, for example 2026-01-01T12:00:00Z.');
 const [,year,month,day,hour,minute,second,,zone]=m;
 const y=Number(year),mo=Number(month),d=Number(day);
 const leap=y%4===0&&(y%100!==0||y%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 const tz=zone==='Z'||zone==='z'?0:Number(zone.slice(1,3))*60+Number(zone.slice(4));
 if(y<1970||y>9999||mo<1||mo>12||d<1||d>days[mo-1]||+hour>23||+minute>59||+second>59||tz>14*60||(!/^z$/i.test(zone)&&Number(zone.slice(4))>59))throw Error('Timestamp contains an invalid calendar date, clock time or timezone.');
 const t=Date.parse(s);if(!Number.isFinite(t)||new Date(t).getUTCFullYear()<1970||new Date(t).getUTCFullYear()>9999)throw Error('Timestamp is outside the supported UTC date range.');return t;
}
const factors={throughput:{'MiB/s':1,'MB/s':1e6/2**20,'bytes/s':1/2**20},latency:{ms:1,us:.001,s:1000},capacity:{GiB:1,TiB:1024,GB:1e9/2**30,TB:1e12/2**30,bytes:1/2**30}};
export function normalizeCsv(parsed,mapping,units={throughput:'MiB/s',latency:'ms',capacity:'GiB'}){
 for(const [kind,choices] of Object.entries(factors))if(!Object.hasOwn(choices,units[kind]))throw Error(`Choose supported ${kind} units.`);
 const selected=FIELDS.map(([k])=>mapping[k]).filter(i=>i!==-1&&i!==undefined);
 if(selected.some(i=>!Number.isInteger(i)||i<0||i>=parsed.headers.length)||new Set(selected).size!==selected.length)throw Error('Map each source column at most once.');
 if(!Number.isInteger(mapping.timestamp)||mapping.timestamp<0||!METRICS.some(k=>Number.isInteger(mapping[k])&&mapping[k]>=0))throw Error('Map a timestamp and at least one metric.');
 const seen=new Set(),series=new Set();let reordered=false,previous=-Infinity;
 const records=parsed.rows.map((row,index)=>{
  const sourceRow=index+2;const get=k=>mapping[k]>=0?row[mapping[k]].trim():'';
  try{
   const time=parseTimestamp(get('timestamp')),system=get('system')||'Imported system',resource=get('resource')||'Imported workload';
   if([system,resource].some(s=>s.length>128||/[\u0000-\u001f\u007f]/.test(s)))throw Error('System/resource labels must be at most 128 characters without control characters.');
   const key=JSON.stringify([system,resource]);series.add(key);if(series.size>100)throw Error('CSV exceeds 100 workloads.');
   const identity=JSON.stringify([system,resource,time]);if(seen.has(identity))throw Error('Duplicate workload/timestamp; split different measurement layers into distinct resource labels.');seen.add(identity);
   if(time<previous)reordered=true;previous=time;
   const item={time,system,resource,key,sourceRow};
   for(const metric of METRICS){
    const raw=get(metric);if(!raw){item[metric]=null;continue;}
    if(!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw))throw Error(`${metric} must be a nonnegative number or blank; counters, percent strings and thousands separators are not accepted.`);
    const factor=metric==='throughput'?factors.throughput[units.throughput]:['p95','p99'].includes(metric)?factors.latency[units.latency]:['used','total'].includes(metric)?factors.capacity[units.capacity]:1;
    const original=Number(raw),value=original*factor;if((original===0&&/[1-9]/.test(raw.split(/[eE]/)[0]))||(original!==0&&value===0)||!Number.isFinite(value)||value>1e15)throw Error(`${metric} exceeds the supported numeric range.`);item[metric]=value;
   }
   if(METRICS.every(k=>item[k]===null))throw Error('No metric values in this record; blanks are missing data, not zero.');
   if(item.p95!==null&&item.p99!==null&&item.p99<item.p95)throw Error('P99 must be at least P95 for the same reported interval.');
   if(item.total!==null&&(item.total<=0||(item.used!==null&&item.used>item.total)))throw Error('Total capacity must be positive and at least used capacity.');
   return item;
  }catch(error){throw Error(`CSV record ${sourceRow}: ${error.message}`);}
 });
 records.sort((a,b)=>a.time-b.time||a.key.localeCompare(b.key));
 return {records,reordered,series:[...series].map(key=>{const [system,resource]=JSON.parse(key);return {key,system,resource};}),units:{throughput:'MiB/s',latency:'ms',capacity:'GiB'}};
}
export function csvCell(value){
 if(value===null||value===undefined)return '';
 if(typeof value==='number')return String(value);
 let s=String(value);if(/^[\s]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
export function normalizedCsv(records){return [CANONICAL.join(','),...records.map(r=>[new Date(r.time).toISOString(),r.system,r.resource,r.iops,r.throughput,r.p95,r.p99,r.queue,r.used,r.total].map(csvCell).join(','))].join('\r\n')+'\r\n';}
export function sampleCsv(){
 const rows=[CANONICAL.join(',')];
 for(let n=0;n<36;n++)for(const resource of ['synthetic-db','synthetic-backup']){
  const load=n<12?1:1+(n-12)/18,db=resource==='synthetic-db';
  rows.push([new Date(Date.UTC(2026,0,1,12,n)).toISOString(),'SYNTHETIC-DEMO',resource,Math.round((db?12000:5000)*load),(db?180:420)*load,(db?2:1.5)*load**3,(db?4:3)*load**3,(db?12:6)*load**2,600+n*2,1000].join(','));
 }
 return rows.join('\r\n')+'\r\n';
}
