import {APP_VERSION} from '../../release-info.js';
import {METRICS} from './csv.js';
export const METRIC_INFO={
 iops:{name:'IOPS',unit:'ops/s'},throughput:{name:'Throughput',unit:'MiB/s'},p95:{name:'Reported P95 latency',unit:'ms'},p99:{name:'Reported P99 latency',unit:'ms'},queue:{name:'Queue depth',unit:'outstanding I/O'},used:{name:'Used capacity',unit:'GiB'},total:{name:'Total capacity',unit:'GiB'}
};
export const DEFAULT_THRESHOLDS={p95:10,p99:20,queue:64,capacity:80,change:50};
export const REFERENCES=[
 ['CSV field/quoting format','https://www.rfc-editor.org/rfc/rfc4180'],
 ['Why reported quantiles cannot be pooled','https://prometheus.io/docs/practices/histograms/'],
 ['Storage performance metric interpretation','https://docs.netapp.com/us-en/e-series-santricity-118/sm-storage/interpret-performance-data.html'],
 ['Client versus storage latency and concurrency','https://docs.cloud.google.com/netapp/volumes/docs/plan-and-prepare/volume-performance-sizing']
];
const mean=values=>values.reduce((a,b)=>a+b,0)/values.length;
export function median(values){if(!values.length)return null;const v=[...values].sort((a,b)=>a-b),m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;}
export function trendLabel(stat){
 if(stat.slopePerHour===null)return 'Insufficient samples';
 if(stat.max===stat.min)return 'Flat in this window';
 const relative=stat.mean===0?0:Math.abs(stat.changeAcrossWindow)/stat.mean;
 if(stat.r2>=0.5&&relative>=0.2)return stat.slopePerHour>0?'Rising':'Falling';
 return 'No strong linear trend';
}
export function summarize(records,metric){
 const points=records.filter(r=>r[metric]!==null&&r[metric]!==undefined);
 if(!points.length)return {count:0,min:null,max:null,mean:null,median:null,slopePerHour:null,r2:null,changeAcrossWindow:null};
 const values=points.map(r=>r[metric]),avg=mean(values),xs=points.map(r=>(r.time-points[0].time)/3600000),mx=mean(xs);
 let slopePerHour=null,r2=null,changeAcrossWindow=null;
 if(points.length>=3&&xs.at(-1)>0){
  const xx=xs.reduce((s,x)=>s+(x-mx)**2,0),xy=xs.reduce((s,x,i)=>s+(x-mx)*(values[i]-avg),0),yy=values.reduce((s,y)=>s+(y-avg)**2,0);
  slopePerHour=xy/xx;r2=yy===0?1:Math.min(1,Math.max(0,xy*xy/(xx*yy)));changeAcrossWindow=slopePerHour*xs.at(-1);
 }
 return {count:values.length,min:Math.min(...values),max:Math.max(...values),mean:avg,median:median(values),slopePerHour,r2,changeAcrossWindow};
}
export function defaultWindows(records){
 const times=[...new Set(records.map(r=>r.time))].sort((a,b)=>a-b),split=Math.max(1,Math.floor(times.length/3));
 if(times.length===1)return {baselineStart:times[0]-1,baselineEnd:times[0]-1,start:times[0],end:times[0]};
 return {baselineStart:times[0],baselineEnd:times[split-1],start:times[Math.min(split,times.length-1)],end:times.at(-1)};
}
export function alignSamples(records,bucketSeconds=60){
 if(![0,60,300,900].includes(bucketSeconds))throw Error('Choose exact timestamps or 1, 5 or 15 minute alignment.');
 const groups=new Map();
 for(const record of records){
  const time=bucketSeconds?Math.floor(record.time/(bucketSeconds*1000))*bucketSeconds*1000:record.time,key=JSON.stringify([record.key,time]);
  if(!groups.has(key))groups.set(key,{time,key:record.key,system:record.system,resource:record.resource,records:[]});groups.get(key).records.push(record);
 }
 return [...groups.values()].map(g=>{
  const row={time:g.time,key:g.key,system:g.system,resource:g.resource,samples:g.records.length,sourceRows:g.records.map(r=>r.sourceRow)};
  for(const k of METRICS){const available=g.records.filter(r=>r[k]!==null);row[k]=!available.length?null:['p95','p99'].includes(k)?Math.max(...available.map(r=>r[k])):['used','total'].includes(k)?available.at(-1)[k]:mean(available.map(r=>r[k]));}
  // Capacity percentage must come from the same original sample, never independently carried fields.
  const capacity=g.records.filter(r=>r.used!==null&&r.total!==null);row.capacityPct=capacity.length?capacity.at(-1).used/capacity.at(-1).total*100:null;
  return row;
 }).sort((a,b)=>a.time-b.time||a.key.localeCompare(b.key));
}
export function dataQuality(records){
 const diffs=records.slice(1).map((r,i)=>r.time-records[i].time).filter(x=>x>0),cadence=median(diffs);
 const gaps=cadence?records.slice(1).flatMap((r,i)=>r.time-records[i].time>cadence*2.5?[{from:records[i].time,to:r.time,durationSeconds:(r.time-records[i].time)/1000}]:[]):[];
 return {count:records.length,cadenceSeconds:cadence===null?null:cadence/1000,gaps,missing:Object.fromEntries(METRICS.map(k=>[k,records.filter(r=>r[k]===null).length]))};
}
const evidence=rows=>rows.slice(0,5).map(r=>({record:r.sourceRow,timestamp:new Date(r.time).toISOString()}));
export function analyzeWorkload(records,key,options={}){
 const series=records.filter(r=>r.key===key).sort((a,b)=>a.time-b.time);
 if(!series.length)throw Error('Select an imported workload.');
 const windows={...defaultWindows(series),...Object.fromEntries(['start','end','baselineStart','baselineEnd'].filter(k=>options[k]!==undefined).map(k=>[k,options[k]]))};
 for(const value of Object.values(windows))if(!Number.isFinite(value))throw Error('Choose valid UTC time windows.');
 if(windows.start>windows.end||windows.baselineStart>windows.baselineEnd)throw Error('Window start must not be after its end.');
 if(windows.baselineEnd>=windows.start)throw Error('Baseline must finish before the analysis window starts; overlapping comparisons are not supported.');
 const thresholds={...DEFAULT_THRESHOLDS,...options.thresholds};
 for(const [k,v] of Object.entries(thresholds))if(!Object.hasOwn(DEFAULT_THRESHOLDS,k)||!Number.isFinite(v)||v<=0||(k==='capacity'&&v>100)||v>1e9)throw Error('Thresholds must be finite positive numbers; capacity must be at most 100%.');
 const current=series.filter(r=>r.time>=windows.start&&r.time<=windows.end),baseline=series.filter(r=>r.time>=windows.baselineStart&&r.time<=windows.baselineEnd);
 if(!current.length)throw Error('No samples in the selected analysis window.');
 const metrics=Object.fromEntries(METRICS.map(k=>{
  const now=summarize(current,k),before=summarize(baseline,k),delta=now.count>=3&&before.count>=3?now.mean-before.mean:null;
  now.trend=trendLabel(now);before.trend=trendLabel(before);
  return [k,{current:now,baseline:before,delta,percentChange:delta===null||before.mean===0?null:delta/before.mean*100}];
 }));
 const findings=[];
 const add=(id,title,observation,next,rows,level='review')=>findings.push({id,title,level,observation,next,evidence:evidence(rows)});
 for(const k of ['p95','p99']){
  const breaches=current.filter(r=>r[k]!==null&&r[k]>thresholds[k]);
  if(breaches.length)add(`${k}-threshold`,`${METRIC_INFO[k].name} exceeds your threshold`,`${breaches.length} of ${metrics[k].current.count} reported values exceed ${thresholds[k]} ms; peak ${metrics[k].current.max.toFixed(3)} ms.`, 'Compare host/application and array latency for these UTC intervals. Inspect read-only path health, workload size, QoS and background activity. A threshold breach does not identify its cause.',breaches);
 }
 const capacity=current.filter(r=>r.used!==null&&r.total!==null&&r.used/r.total*100>=thresholds.capacity);
 if(capacity.length)add('capacity-threshold','Capacity headroom needs review',`${capacity.length} paired used/total samples meet or exceed your ${thresholds.capacity}% capacity threshold. Peak ${(Math.max(...capacity.map(r=>r.used/r.total*100))).toFixed(2)}%.`,'Confirm physical versus logical measurement scope, vendor reserves, snapshots and data reduction before planning capacity. No exhaustion date is inferred.',capacity);
 const queue=current.filter(r=>r.queue!==null&&r.queue>thresholds.queue),coincident=queue.filter(r=>(r.p95!==null&&r.p95>thresholds.p95)||(r.p99!==null&&r.p99>thresholds.p99));
 if(queue.length)add('queue-threshold',coincident.length?'Queue depth and tail latency exceed thresholds together':'Queue depth exceeds your threshold',`${queue.length} samples exceed queue depth ${thresholds.queue}; ${coincident.length} of those same samples also exceed a latency threshold.`, 'Inspect the measurement layer, offered workload, host path health and documented queue/QoS limits. High queue depth alone is not proof of saturation; do not change queue settings from this report.',coincident.length?coincident:queue);
 for(const k of ['iops','throughput','p95','p99','queue']){
  const m=metrics[k];if(m.percentChange!==null&&Math.abs(m.percentChange)>=thresholds.change){
   add(`${k}-baseline`,`${METRIC_INFO[k].name} shifted versus baseline`, `Sample mean changed ${m.percentChange>=0?'+':''}${m.percentChange.toFixed(1)}% (${m.baseline.mean.toFixed(3)} to ${m.current.mean.toFixed(3)} ${METRIC_INFO[k].unit}); ${m.baseline.count} baseline and ${m.current.count} analysis samples.`, 'Check whether the windows represent comparable workload, block size, read/write mix and collection intervals. A workload shift is not by itself a degradation or a causal diagnosis.',[...baseline.filter(r=>r[k]!==null).slice(0,2),...current.filter(r=>r[k]!==null).slice(0,3)],'observation');
  }
 }
 const quality=dataQuality(current);
 if(quality.gaps.length)add('gaps','Collection gaps limit interpretation',`${quality.gaps.length} gaps exceed 2.5× the median observed cadence (${quality.cadenceSeconds} seconds).`, 'Check collector coverage and clocks. Missing intervals are not zeros and are never filled or interpolated.',current.filter(r=>quality.gaps.some(g=>g.to===r.time)),'data-quality');
 if(!findings.length)add('no-rules','No configured rule triggered','No configured rule triggered in the selected data. This is not a health certification.','Check metric coverage, collection layer, sample counts, workload-specific objectives and thresholds before drawing conclusions.',current,'observation');
 return {system:series[0].system,resource:series[0].resource,key,windows,thresholds,current,baseline,metrics,findings,quality,baselineQuality:dataQuality(baseline)};
}
export function analysisReport(result,{comparison=null,bucketSeconds=60,sourceLabel='Imported CSV',synthetic=false,exportedAt=new Date().toISOString()}={}){
 return {schema:'seh-performance-report/v1',application:'Storage Engineering Hub',version:APP_VERSION,sourceLabel,exportedAt,synthetic:synthetic===true,units:{throughput:'MiB/s',latency:'ms',capacity:'GiB',time:'UTC'},methodology:{aggregation:'Sample-weighted statistics of supplied interval values; reported quantiles are not pooled.',alignment:`${bucketSeconds||'Exact timestamp'}${bucketSeconds?' second UTC buckets':''}; mean rates/queue, max reported latency, last available capacity.`,limits:'Offline observations and heuristic rules, not a root-cause diagnosis, equipment certification or a forecast. Missing samples are not imputed.'},analysis:result,comparison,references:REFERENCES};
}
