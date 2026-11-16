import {escape,pageTitle} from '../ui/components.js';
import {parseCsv,suggestMapping,normalizeCsv,FIELDS,METRICS,MAX_CSV_BYTES,sampleCsv,normalizedCsv,CANONICAL} from './csv.js';
import {analyzeWorkload,alignSamples,defaultWindows,analysisReport,DEFAULT_THRESHOLDS,METRIC_INFO,REFERENCES,trendLabel} from './analysis.js';
import {chartMarkup,formatNumber,utc} from './charts.js';
const $=selector=>document.querySelector(selector);
const option=(value,label,selected)=>`<option value="${escape(value)}" ${String(value)===String(selected)?'selected':''}>${escape(label)}</option>`;
const timeInput=(name,label,value)=>`<label class="field">${escape(label)}<input name="${name}" type="datetime-local" step="0.001" value="${utc(value).slice(0,-1)}" required></label>`;
export function createPerformanceWorkspace({download}){
 let parsed=null,dataset=null,result=null,comparison=null,sourceLabel='',sample=false,revision=0,settings=null;
 const clear=()=>{revision++;parsed=null;dataset=null;result=null;comparison=null;sourceLabel='';sample=false;settings=null;};
 function importCard(){return `<section class="card perf-import"><div class="row between"><div><p class="eyebrow">01 / BRING YOUR TELEMETRY</p><h2>Import a performance CSV</h2></div><span class="tag">LOCAL ANALYSIS</span></div><p>Use redacted interval measurements, with a timezone on every timestamp. Nothing is uploaded or saved in browser storage.</p><div class="perf-import-actions"><label class="field">Choose CSV · UTF-8 · up to 5 MiB<input id="perf-file" type="file" accept=".csv,text/csv,text/plain"></label><div class="form-actions"><button type="button" class="btn" id="perf-demo">Explore synthetic demo</button><button type="button" class="btn" id="perf-template">Download sample CSV</button></div></div><details id="perf-paste"><summary>Paste CSV instead</summary><form id="perf-paste-form"><label class="field section-gap">CSV text<textarea id="perf-csv" rows="5" spellcheck="false" maxlength="5242880" placeholder="timestamp,system,resource,iops,throughput_mib_s,latency_p95_ms,latency_p99_ms,queue_depth,used_gib,total_gib"></textarea></label><button class="btn section-gap" type="submit">Preview columns</button></form></details><p id="perf-error" class="error" role="alert"></p><p id="perf-import-status" class="small-text" role="status"></p></section>`;}
 function page(){clear();return pageTitle('Performance desk','Understand the<br><em>workload.</em>','Compare storage telemetry in time, establish a baseline, and inspect the evidence behind every finding.')+`<div id="performance-workspace">${importCard()}<div id="perf-mapping"></div><div id="perf-analysis"></div><section class="card perf-methods section-gap"><details><summary>CSV format, analysis method &amp; limits</summary><div class="perf-method-grid"><div><h3>Bring measurements, not counters</h3><p>Map a timestamp and any available metric. Optional system/resource labels separate workloads; include measurement layer in the label. IOPS and throughput must already be rates. Queue depth is outstanding I/O. Use blank cells for unknown values.</p><p>Canonical columns: <code>${CANONICAL.join(', ')}</code>. Download the sample for unit-specific header names. Quoted CSV fields and UTC offsets are supported.</p></div><div><h3>Transparent comparisons</h3><p>Statistics use all raw samples with equal sample weight. Baseline changes need at least three nonblank values per window. Least-squares slopes need three values; they describe this window, not a forecast. Rising/falling flags require R² ≥ 0.5 and a fitted end-to-end shift ≥ 20% of the sample mean; these are heuristic flags. Thresholds are adjustable demonstration heuristics, not vendor limits or universal SLOs.</p><p>Charts align UTC buckets: mean IOPS/throughput/queue, maximum reported P95/P99, last available capacity. Reported quantiles are not pooled into a global percentile. Missing values are never interpolated. Large chart segments use a min/max envelope; tables and calculations retain all raw samples.</p></div></div><p>Findings are observations and next checks, not proof of a root cause or equipment health. Collection layer, block size, read/write mix and intervals must be comparable. Do not change production settings from this report.</p><div class="source-list">${REFERENCES.map(([title,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(title)} ↗</a>`).join('')}</div></details></section></div>`;}
 function showError(error){if($('#perf-error'))$('#perf-error').textContent=error.message;}
 function invalidate(){result=null;comparison=null;if($('#perf-results'))$('#perf-results').innerHTML='<p class="notice">Inputs changed. Analyze again to update findings, charts and exports.</p>';}
 function stage(text,label,isSample=false){
  revision++;parsed=null;dataset=null;settings=null;invalidate();sourceLabel=label;sample=isSample;
  $('#perf-error').textContent='';$('#perf-import-status').textContent='Validating CSV structure…';$('#perf-analysis').replaceChildren();$('#perf-mapping').replaceChildren();
  try{parsed=parseCsv(text);renderMapping();$('#perf-import-status').textContent=`${parsed.rows.length.toLocaleString()} records · ${parsed.headers.length} columns. Review mapping and units before analysis.`;return true;}
  catch(error){parsed=null;showError(error);$('#perf-import-status').textContent='Import rejected. Correct the CSV and try again.';return false;}
 }
 function renderMapping(){
  const suggested=suggestMapping(parsed.headers);
  $('#perf-mapping').innerHTML=`<section class="card section-gap"><p class="eyebrow">02 / CONFIRM MEANING &amp; UNITS</p><h2>Map your columns</h2><p>Timestamp and at least one metric are required. Unmapped or blank metrics remain unknown. Unsupported values reject the import with a record number.</p><form id="perf-mapping-form"><div class="perf-mapping-grid">${FIELDS.map(([key,label])=>`<label class="field">${escape(label)}<select name="map-${key}">${option(-1,'Not supplied',suggested[key])}${parsed.headers.map((h,i)=>option(i,h,suggested[key])).join('')}</select></label>`).join('')}</div><div class="grid cols-3 section-gap">${[['throughput','Throughput units',['MiB/s','MB/s','bytes/s']],['latency','Latency units',['ms','us','s']],['capacity','Capacity units',['GiB','TiB','GB','TB','bytes']]].map(([key,label,values])=>`<label class="field">${label}<select name="unit-${key}">${values.map(v=>option(v,v,values[0])).join('')}</select></label>`).join('')}</div><p class="page-note">Confirm units even when columns were matched by name. Rate values are sample-weighted; percentiles are already calculated by your collector.</p><button class="btn primary section-gap" type="submit">Import &amp; analyze</button></form></section>`;
 }
 function commit(form){
  const data=new FormData(form),mapping=Object.fromEntries(FIELDS.map(([key])=>[key,Number(data.get('map-'+key))])),units=Object.fromEntries(['throughput','latency','capacity'].map(key=>[key,data.get('unit-'+key)]));
  dataset=normalizeCsv(parsed,mapping,units);settings={key:dataset.series[0].key,comparisonKey:'',bucketSeconds:60,...defaultWindows(dataset.records.filter(r=>r.key===dataset.series[0].key)),thresholds:{...DEFAULT_THRESHOLDS}};
  $('#perf-mapping').replaceChildren();$('#perf-import-status').textContent=`${sample?'SYNTHETIC DEMONSTRATION · ':''}${dataset.records.length.toLocaleString()} accepted records · ${dataset.series.length} workloads${dataset.reordered?' · sorted by UTC timestamp':''}.`;
  renderControls();analyze();
 }
 function renderControls(){
  const s=settings;
  $('#perf-analysis').innerHTML=`<section class="perf-dataset section-gap"><div><span class="tag">${sample?'SYNTHETIC DEMONSTRATION':'IMPORTED DATA · MEMORY ONLY'}</span><h2>${escape(sample?'A workload shift, made visible.':'Your telemetry workspace.')}</h2><p>Source: ${escape(sourceLabel)} · ${dataset.records.length.toLocaleString()} records · UTC</p></div><button class="btn" type="button" id="perf-clear">Clear imported data</button></section><section class="card section-gap"><form id="perf-analysis-form"><div class="grid cols-3"><label class="field">Primary workload<select name="workload" id="perf-workload">${dataset.series.map(w=>option(w.key,`${w.system} / ${w.resource}`,s.key)).join('')}</select></label><label class="field">Compare workload · same UTC axis<select name="comparison">${option('','No comparison',s.comparisonKey)}${dataset.series.filter(w=>w.key!==s.key).map(w=>option(w.key,`${w.system} / ${w.resource}`,s.comparisonKey)).join('')}</select></label><label class="field">Chart alignment<select name="bucket">${[[0,'Exact timestamps'],[60,'1 minute'],[300,'5 minutes'],[900,'15 minutes']].map(([v,l])=>option(v,l,s.bucketSeconds)).join('')}</select></label></div><div class="perf-window-grid section-gap"><fieldset><legend>Baseline window · UTC</legend><div class="grid cols-2">${timeInput('baselineStart','From',s.baselineStart)}${timeInput('baselineEnd','Through',s.baselineEnd)}</div></fieldset><fieldset><legend>Analysis window · UTC</legend><div class="grid cols-2">${timeInput('start','From',s.start)}${timeInput('end','Through',s.end)}</div></fieldset></div><details class="section-gap"><summary>Adjust finding thresholds · heuristics, not vendor limits</summary><div class="perf-thresholds section-gap">${Object.entries(s.thresholds).map(([key,value])=>`<label class="field">${escape(({p95:'P95 latency (ms)',p99:'P99 latency (ms)',queue:'Queue depth',capacity:'Capacity used (%)',change:'Baseline change (%)'})[key])}<input type="number" name="threshold-${key}" value="${value}" min="0.001" ${key==='capacity'?'max="100"':''} step="any" required></label>`).join('')}</div></details><button class="btn primary section-gap" type="submit">Analyze selected windows</button><p id="perf-analysis-error" class="error" role="alert"></p></form></section><div id="perf-results" aria-live="polite"></div>`;
 }
 function readSettings(form){
  const values=new FormData(form),next={key:values.get('workload'),comparisonKey:values.get('comparison'),bucketSeconds:Number(values.get('bucket')),thresholds:{}};
  for(const k of ['start','end','baselineStart','baselineEnd'])next[k]=Date.parse(values.get(k)+'Z');
  for(const k of Object.keys(DEFAULT_THRESHOLDS))next.thresholds[k]=Number(values.get('threshold-'+k));
  return next;
 }
 function analyze(){
  result=null;comparison=null;
  try{
   const next=analyzeWorkload(dataset.records,settings.key,settings);
   if(settings.comparisonKey){
    try{comparison=analyzeWorkload(dataset.records,settings.comparisonKey,settings);}catch(error){throw Error(`Comparison workload: ${error.message}`);}
   }
   result=next;$('#perf-analysis-error').textContent='';renderResults();
  }catch(error){result=null;comparison=null;$('#perf-analysis-error').textContent=error.message;$('#perf-results').replaceChildren();}
 }
 function metricCard(k){
  const m=result.metrics[k],now=m.current,before=m.baseline;
  const delta=m.percentChange===null?(m.comparisonStatus==='out-of-range'?'Relative change exceeds the supported numeric range':m.comparisonStatus==='zero-baseline'?'Baseline mean is zero; relative change undefined':'Need 3 samples per window'):`${m.percentChange>=0?'+':''}${formatNumber(m.percentChange,1)}% vs baseline`;
  return `<article class="perf-metric"><span class="micro">${escape(METRIC_INFO[k].name)}</span><strong>${formatNumber(now.mean)} <small>${escape(METRIC_INFO[k].unit)}</small></strong><span>${escape(delta)}</span><p>${now.count} analysis / ${before.count} baseline samples · sample mean${['p95','p99'].includes(k)?' of reported interval quantiles':''}</p></article>`;
 }
 function renderResults(){
  const visible=dataset.records.filter(r=>[settings.key,settings.comparisonKey].includes(r.key)&&r.time>=settings.baselineStart&&r.time<=settings.end),aligned=alignSamples(visible,settings.bucketSeconds);
  const series=[result,comparison].filter(Boolean).map(r=>({label:`${r.system} / ${r.resource}`,cadenceSeconds:r.quality.cadenceSeconds,points:aligned.filter(p=>p.key===r.key)}));
  const range={from:settings.bucketSeconds?Math.floor(settings.baselineStart/(settings.bucketSeconds*1000))*settings.bucketSeconds*1000:settings.baselineStart,to:settings.end,baselineEnd:settings.baselineEnd,start:settings.start,bucketSeconds:settings.bucketSeconds};
  $('#perf-results').innerHTML=`<div class="perf-summary section-gap">${['iops','throughput','p95','p99'].map(metricCard).join('')}</div><div class="section-head"><div><p class="eyebrow">TIME-ALIGNED TELEMETRY</p><h2>The same moment. Every metric.</h2></div></div><div class="perf-legend">${series.map((s,i)=>`<span><i class="perf-swatch perf-series-${i}"></i>${escape(s.label)}</span>`).join('')}<span class="perf-baseline-key">Shaded: baseline</span></div><div class="grid cols-2 perf-charts">${['iops','throughput','p95','p99','queue','used'].map(k=>chartMarkup(k,series,range)).join('')}</div><p class="page-note">UTC-aligned charts use separate, labeled scales. Curves do not imply causation. P95/P99 are maximum reported interval values per chart bucket, not pooled percentiles.</p><div class="section-head"><div><p class="eyebrow">EVIDENCE, THEN INTERPRETATION</p><h2>${result.findings.length} observations to review</h2></div><span class="tag">NO ROOT-CAUSE CLAIM</span></div><div class="perf-findings">${result.findings.map(f=>`<article class="card perf-finding"><span class="tag">${escape(f.level)}</span><h3>${escape(f.title)}</h3><p>${escape(f.observation)}</p><p><strong>Next check:</strong> ${escape(f.next)}</p><details><summary>Supporting CSV records</summary><ul>${f.evidence.map(e=>`<li><a href="#perf-record-${e.record}" data-perf-record="${e.record}">Record ${e.record}</a> · <time>${e.timestamp}</time></li>`).join('')}</ul></details></article>`).join('')}</div>${coverage()}<section class="card section-gap"><div class="row between"><h2>Inspect &amp; export the evidence</h2><span class="tag">UTC · NORMALIZED UNITS</span></div><p>Exports contain imported identifiers and observations. Review them before sharing. Normalized CSV includes all accepted workloads, not only the active selection.</p><div class="form-actions"><button type="button" class="btn" id="perf-export-report">Download analysis JSON</button><button type="button" class="btn" id="perf-export-csv">Download normalized CSV</button></div><details id="perf-samples" class="section-gap"><summary>Raw samples for the selected primary workload</summary><p class="page-note">Raw values before chart aggregation. Showing up to 200 analysis records; use normalized CSV for all samples. Supporting record links add the exact cited record when needed.</p><div id="perf-sample-table"></div></details></section>`;
  renderTable();
 }
 function coverage(){
  const trendRows=METRICS.map(k=>{const t=result.metrics[k].current;return `<tr><th scope="row">${escape(METRIC_INFO[k].name)}</th><td>${t.count} / ${result.current.length}</td><td>${formatNumber(t.median)}</td><td>${formatNumber(t.max)}</td><td>${t.slopePerHour===null?'Need 3 samples':`${formatNumber(t.slopePerHour,3)} ${escape(METRIC_INFO[k].unit)}/hour`}</td><td>${escape(trendLabel(t))}</td><td>${formatNumber(t.r2,3)}</td></tr>`;}).join('');
  const q=result.quality;
  return `<section class="card section-gap"><h2>Coverage, baseline &amp; trends</h2><p>${result.current.length} analysis / ${result.baseline.length} baseline records · median analysis cadence: ${q.cadenceSeconds===null?'unknown':formatNumber(q.cadenceSeconds)+' seconds'} · ${q.gaps.length} collection gaps. Statistics are sample-weighted, not time-weighted.</p>${comparison?`<p>Comparison coverage: ${comparison.current.length} analysis / ${comparison.baseline.length} baseline records; ${comparison.quality.gaps.length} gaps. Comparison lines are visual context; findings and statistics above apply to the primary workload.</p>`:''}<div class="perf-table-wrap"><table class="perf-table"><caption>Primary workload statistics; slopes are least-squares descriptions of the selected window, not forecasts. R² measures fit, not confidence or causation.</caption><thead><tr><th scope="col">Metric</th><th scope="col">Present</th><th scope="col">Sample median</th><th scope="col">Peak</th><th scope="col">Trend slope</th><th scope="col">Trend flag</th><th scope="col">R²</th></tr></thead><tbody>${trendRows}</tbody></table></div><p class="page-note">Latency statistics summarize already-reported quantiles. Different collection intervals or missingness can bias sample-weighted comparisons. Missing capacity or latency is not evidence of healthy service.</p></section>`;
 }
 function renderTable(extraRecord){
  const rows=result.current.slice(0,200);if(extraRecord&&!rows.some(r=>r.sourceRow===extraRecord)){const match=dataset.records.find(r=>r.sourceRow===extraRecord&&r.key===result.key);if(match)rows.unshift(match);}
  $('#perf-sample-table').innerHTML=`<div class="perf-table-wrap"><table class="perf-table"><caption>${escape(result.system)} / ${escape(result.resource)} · imported raw sample values</caption><thead><tr><th>Record</th><th>Timestamp (UTC)</th>${METRICS.map(k=>`<th>${escape(METRIC_INFO[k].name)} (${escape(METRIC_INFO[k].unit)})</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr id="perf-record-${r.sourceRow}" tabindex="-1"><th scope="row">${r.sourceRow}</th><td>${utc(r.time)}</td>${METRICS.map(k=>`<td>${formatNumber(r[k],4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 }
 document.addEventListener('submit',event=>{
  if(!event.target.closest('#performance-workspace'))return;event.preventDefault();
  try{
   if(event.target.id==='perf-paste-form')stage($('#perf-csv').value,'Pasted CSV');
   if(event.target.id==='perf-mapping-form')commit(event.target);
   if(event.target.id==='perf-analysis-form'){settings=readSettings(event.target);analyze();}
  }catch(error){showError(error);}
 });
 document.addEventListener('input',event=>{
  if(!event.target.closest('#performance-workspace'))return;
  if(event.target.closest('#perf-analysis-form'))invalidate();
  if(event.target.id==='perf-csv'){revision++;parsed=null;dataset=null;settings=null;result=null;comparison=null;$('#perf-mapping').replaceChildren();$('#perf-analysis').replaceChildren();$('#perf-import-status').textContent='CSV changed. Preview the columns again.';}
 });
 document.addEventListener('change',async event=>{
  if(!event.target.closest('#performance-workspace'))return;
  if(event.target.id==='perf-workload'&&dataset){settings={...readSettings(event.target.closest('form')),...defaultWindows(dataset.records.filter(r=>r.key===event.target.value)),key:event.target.value,comparisonKey:''};invalidate();renderControls();return;}
  if(event.target.closest('#perf-analysis-form'))invalidate();
  if(event.target.id==='perf-file'){
   const file=event.target.files[0];if(!file)return;const token=++revision;
   parsed=null;dataset=null;result=null;comparison=null;$('#perf-mapping').replaceChildren();$('#perf-analysis').replaceChildren();$('#perf-import-status').textContent='Reading local CSV…';$('#perf-error').textContent='';
   try{if(file.size>MAX_CSV_BYTES)throw Error('Choose a UTF-8 CSV no larger than 5 MiB.');const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());if(token!==revision||!$('#performance-workspace'))return;stage(text,file.name);}
   catch(error){if(token===revision&&$('#performance-workspace')){showError(error);$('#perf-import-status').textContent='Import rejected. Correct the CSV and try again.';}}
  }
 });
 document.addEventListener('click',event=>{
  const target=event.target.closest('button,[data-perf-record]');if(!target||!target.closest('#performance-workspace'))return;
  try{
   if(target.id==='perf-demo'){stage(sampleCsv(),'Synthetic demonstration',true);commit($('#perf-mapping-form'));}
   if(target.id==='perf-template')download(sampleCsv(),'synthetic-storage-performance.csv','text/csv');
   if(target.id==='perf-clear'){clear();$('#main').innerHTML=page();}
   if(target.id==='perf-export-report'&&result)download(JSON.stringify(analysisReport(result,{comparison,bucketSeconds:settings.bucketSeconds,sourceLabel,synthetic:sample}),null,2),'storage-performance-analysis.json','application/json');
   if(target.id==='perf-export-csv'&&result)download(normalizedCsv(dataset.records),'storage-performance-normalized.csv','text/csv');
   if(target.dataset.perfRecord&&result){event.preventDefault();const record=Number(target.dataset.perfRecord);renderTable(record);$('#perf-samples').open=true;const row=$(`#perf-record-${record}`);row?.scrollIntoView({block:'center'});row?.focus({preventScroll:true});}
  }catch(error){showError(error);}
 });
 return {page,clear};
}
