import {escape} from '../ui/components.js';
import {METRIC_INFO} from './analysis.js';
export function formatNumber(value,digits=2){return value===null||value===undefined?'—':Number(value).toLocaleString('en-US',{maximumFractionDigits:digits});}
export const utc=value=>new Date(value).toISOString();
// At most two extrema per segment, retaining endpoint order; analysis always uses every sample.
export function envelope(points,limit=500){
 if(points.length<=limit)return points;
 const stride=Math.ceil(points.length/(limit/2)),result=[points[0]];
 for(let i=1;i<points.length-1;i+=stride){
  const chunk=points.slice(i,Math.min(i+stride,points.length-1));
  const low=chunk.reduce((a,b)=>a.value<b.value?a:b),high=chunk.reduce((a,b)=>a.value>b.value?a:b);
  result.push(...(low===high?[low]:[low,high].sort((a,b)=>a.time-b.time)));
 }
 result.push(points.at(-1));return result;
}
export function chartMarkup(metric,series,{from,to,baselineEnd,start,bucketSeconds=60}={}){
 const info=METRIC_INFO[metric],width=620,height=196,left=55,right=16,top=18,bottom=38,w=width-left-right,h=height-top-bottom;
 const all=series.flatMap(s=>s.points.filter(p=>p[metric]!==null));
 if(!all.length)return `<section class="card perf-chart"><h3>${escape(info.name)}</h3><p class="perf-no-data">No ${escape(info.unit)} samples mapped in this window.</p></section>`;
 const max=Math.max(...all.map(p=>p[metric]))||1,range=Math.max(1,to-from),x=t=>left+(t-from)/range*w,y=v=>top+h-(v/max)*h;
 const paths=series.map((s,index)=>{
  const segments=[];let segment=[],previous=null;
  const gap=Math.max(bucketSeconds*1000,s.cadenceSeconds*1000||0)*2.5;
  for(const point of s.points){
   if(point[metric]===null||(previous!==null&&gap&&point.time-previous>gap)){if(segment.length)segments.push(segment);segment=[];}
   if(point[metric]!==null)segment.push({time:point.time,value:point[metric]});previous=point.time;
  }
  if(segment.length)segments.push(segment);
  return segments.map(points=>{const plot=envelope(points);const d=plot.map((p,i)=>`${i?'L':'M'}${x(p.time).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');return `<path d="${d}" class="perf-line perf-series-${index}"/>${plot.length===1?`<circle cx="${x(plot[0].time)}" cy="${y(plot[0].value)}" r="3" class="perf-point perf-series-${index}"/>`:''}`;}).join('');
 }).join('');
 const baselineWidth=Math.max(0,Math.min(w,x(baselineEnd)-left)),analysisX=Math.max(left,x(start));
 const startText=utc(from),endText=utc(to);
 return `<section class="card perf-chart"><div class="row between"><h3>${escape(info.name)}</h3><span class="micro">${escape(info.unit)}</span></div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(info.name)} time-aligned chart from ${startText} to ${endText}. See the sample table for exact values."><rect x="${left}" y="${top}" width="${baselineWidth}" height="${h}" class="perf-baseline-fill"/><rect x="${analysisX}" y="${top}" width="${Math.max(0,width-right-analysisX)}" height="${h}" class="perf-analysis-fill"/>${[0,.5,1].map(r=>`<line x1="${left}" x2="${width-right}" y1="${top+h*r}" y2="${top+h*r}" class="perf-grid-line"/><text x="${left-8}" y="${top+h*r+4}" text-anchor="end">${escape(formatNumber(max*(1-r)))}</text>`).join('')}${paths}<text x="${left}" y="${height-13}">${startText.slice(11,19)}</text><text x="${width-right}" y="${height-13}" text-anchor="end">${endText.slice(11,19)} UTC</text></svg><p class="perf-chart-range">${startText.slice(0,10)} → ${endText.slice(0,10)} · ${bucketSeconds?`${bucketSeconds/60} min buckets`:'exact timestamps'}</p></section>`;
}
