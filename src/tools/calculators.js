import {normalizeWwn,raidCapacity,throughput,transferHours} from '../../core.js';
import {escape,codeBlock,pageTitle,field} from '../ui/components.js';
const $=s=>document.querySelector(s);
export function calculatorsPage() {
  return pageTitle('Sizing desk', 'Numbers before<br><em>assumptions.</em>', 'Small, transparent calculations for planning. Units and exclusions are shown with every result.')
    + `<div class="grid cols-2"><section class="card"><p class="callout-title">01 / THEORETICAL RAID CAPACITY</p><h2>RAID capacity</h2><form id="raid-form" class="stack section-gap"><div class="grid cols-2">${field('count','Total drive count',8,'number','min="3" step="1" required')}${field('tb','TB per drive (decimal)',4,'number','min="0.001" step="any" required')}${field('spares','Dedicated spare drives',0,'number','min="0" step="1" required')}<label class="field">RAID level<select name="level"><option value="5">RAID 5</option><option value="6" selected>RAID 6</option><option value="10">RAID 10</option></select></label></div><button class="btn" type="submit">Calculate capacity</button></form><div id="raid-result" aria-live="polite"></div><p class="page-note">Theoretical RAID only, not vendor provisionable capacity. Assumes equal-size drives in one RAID group; dedicated spares are subtracted before parity or mirrors. No deductions for filesystem metadata, controller/system reserves, snapshots or free-space headroom. No compression/deduplication credit. Distributed spares, vendor protection layouts and mixed drive sizes require the vendor sizing tool. Decimal TB = 10¹² bytes; TiB = 2⁴⁰ bytes.</p></section>
    <section class="card"><p class="callout-title">02 / PAYLOAD THROUGHPUT</p><h2>IOPS → throughput</h2><form id="throughput-form" class="stack section-gap"><div class="grid cols-2">${field('iops','Operations per second',10000,'number','min="0" step="any" required')}${field('kib','Block size (KiB)',8,'number','min="0.001" step="any" required')}</div><button class="btn" type="submit">Calculate throughput</button></form><div id="throughput-result" aria-live="polite"></div><p class="page-note">IOPS × block size. Payload only; excludes protocol overhead and workload variability.</p></section>
    <section class="card"><p class="callout-title">03 / TRANSFER WINDOW</p><h2>Data transfer estimate</h2><form id="transfer-form" class="stack section-gap"><div class="grid cols-3">${field('tb','Data size (TB)',1,'number','min="0.001" step="any" required')}${field('mbps','Link rate (Mbps)',1000,'number','min="0.001" step="any" required')}${field('efficiency','Effective utilization (%)',70,'number','min="0.001" max="100" step="any" required')}</div><button class="btn" type="submit">Estimate transfer time</button></form><div id="transfer-result" aria-live="polite"></div><p class="page-note">Decimal units. Constant effective rate is assumed; no allowance for changing data, retries or latency stalls.</p></section>
    <section class="card"><p class="callout-title">04 / PORT IDENTIFIERS</p><h2>WWPN formatter</h2><form id="wwn-form" class="stack section-gap"><label class="field">64-bit hexadecimal identifier<input name="wwn" placeholder="2100000000000001" required></label><button class="btn" type="submit">Format WWPN</button></form><div id="wwn-result" aria-live="polite"></div><p class="page-note">Accepts spaces, colons, dots, hyphens or a leading 0x. Other characters are rejected.</p></section></div>`;
}

export function handleCalculatorSubmit(form,v){
  if(form.id==='wwn-form'){
    try{$('#wwn-result').innerHTML=codeBlock(normalizeWwn(v.wwn),'NORMALIZED WWPN');}catch(error){$('#wwn-result').innerHTML=`<p class="error" role="alert">${escape(error.message)}</p>`;}return true;
  }
  if(form.id==='raid-form'){
    try{const r=raidCapacity(+v.count,+v.tb,v.level,+v.spares);$('#raid-result').innerHTML=`<div class="result"><strong>${r.usable.toLocaleString(undefined,{maximumFractionDigits:3})} TB theoretical after RAID</strong><p>${r.tib.toFixed(3)} TiB · ${r.raw.toFixed(3)} TB raw · ${r.spareCapacity.toFixed(3)} TB dedicated spares · ${r.protectionCapacity.toFixed(3)} TB parity / mirrors. Vendor metadata, system reserves and operational headroom have not been deducted; this is not provisionable capacity.</p></div>`;}catch(error){$('#raid-result').innerHTML=`<p class="error" role="alert">${escape(error.message)}</p>`;}return true;
  }
  if(form.id==='throughput-form'){
    try{const r=throughput(+v.iops,+v.kib);$('#throughput-result').innerHTML=`<div class="result"><strong>${r.mib.toFixed(3)} MiB/s</strong><p>${r.mb.toFixed(3)} MB/s (decimal) · ${v.iops} IOPS × ${v.kib} KiB</p></div>`;}catch(error){$('#throughput-result').innerHTML=`<p class="error" role="alert">${escape(error.message)}</p>`;}return true;
  }
  if(form.id==='transfer-form'){
    try{const hours=transferHours(+v.tb,+v.mbps,+v.efficiency);$('#transfer-result').innerHTML=`<div class="result"><strong>${hours.toFixed(3)} hours</strong><p>${(hours*60).toFixed(1)} minutes at ${v.efficiency}% of the stated link rate</p></div>`;}catch(error){$('#transfer-result').innerHTML=`<p class="error" role="alert">${escape(error.message)}</p>`;}return true;
  }
return false;
}

export function initCalculatorInputs(){
 const outputs={'raid-form':'raid-result','throughput-form':'throughput-result','transfer-form':'transfer-result','wwn-form':'wwn-result'};
 for(const event of ['input','change'])document.addEventListener(event,e=>{
  const id=outputs[e.target.closest('form')?.id],output=id?document.getElementById(id):null;
  if(output?.textContent.trim())output.innerHTML='<p class="page-note">Inputs changed. Submit the form again to update this result.</p>';
 });
}
