import {EVOLUTION_EVENTS,EVOLUTION_VENDORS,EVOLUTION_SOURCES,EVOLUTION_REVIEWED} from './evolution-data.js';
export const EVOLUTION_FIRST_YEAR = Math.min(...EVOLUTION_EVENTS.map(e=>e.year));
export const EVOLUTION_LAST_YEAR = Number(EVOLUTION_REVIEWED.slice(0,4));
export const DEFAULT_EVOLUTION_FILTERS={vendor:'all',type:'all',from:EVOLUTION_FIRST_YEAR,to:EVOLUTION_LAST_YEAR,q:'',sort:'newest',view:'timeline'};
export function normalizeEvolutionFilters(input={}) {
 const year=(value,fallback)=>/^\d{4}$/.test(String(value))&&Number(value)>=EVOLUTION_FIRST_YEAR&&Number(value)<=EVOLUTION_LAST_YEAR?Number(value):fallback;
 return {vendor:Object.hasOwn(EVOLUTION_VENDORS,input.vendor)?input.vendor:'all',type:['NAS','SAN','unified'].includes(input.type)?input.type:'all',from:year(input.from,EVOLUTION_FIRST_YEAR),to:year(input.to,EVOLUTION_LAST_YEAR),q:String(input.q??'').slice(0,160),sort:input.sort==='oldest'?'oldest':'newest',view:['timeline','matrix','models','research'].includes(input.view)?input.view:'timeline'};
}
export function parseEvolutionRoute(route='') {try{return normalizeEvolutionFilters(Object.fromEntries(new URLSearchParams(decodeURIComponent(route))));}catch{return {...DEFAULT_EVOLUTION_FILTERS};}}
export function evolutionRoute(input) {const f=normalizeEvolutionFilters(input);return '#evolution/'+encodeURIComponent(new URLSearchParams(Object.entries(f).filter(([k,v])=>String(v)!==String(DEFAULT_EVOLUTION_FILTERS[k]))).toString());}
export function filterEvolution(input={}) {
 const f=normalizeEvolutionFilters(input),terms=f.q.toLowerCase().trim().split(/\s+/);
 return EVOLUTION_EVENTS.filter(e=>(f.vendor==='all'||e.vendor===f.vendor)&&(f.type==='all'||f.type==='unified'&&e.types.includes('NAS')&&e.types.includes('SAN')||e.types.includes(f.type))&&e.year>=f.from&&e.year<=f.to&&terms.every(t=>`${EVOLUTION_VENDORS[e.vendor].name} ${e.family} ${e.models.join(' ')} ${e.milestone}`.toLowerCase().includes(t))).sort((a,b)=>{const order=a.date.localeCompare(b.date)||a.id.localeCompare(b.id);return f.sort==='oldest'?order:-order;});
}
export function evolutionYears(input={}) {const f=normalizeEvolutionFilters(input);if(f.from>f.to)return [];const rows=filterEvolution(f);return Array.from({length:f.to-f.from+1},(_,i)=>{const year=f.sort==='oldest'?f.from+i:f.to-i;return {year,events:rows.filter(e=>e.year===year)};});}
export function formatEvolutionDate(date) {if(!date)return 'Not established';if(/^\d{4}$/.test(date))return date;if(/^\d{4}-\d{2}$/.test(date))return new Date(date+'-01T00:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});return new Date(date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});}
export function evolutionCSV(input={}) {
 const f=normalizeEvolutionFilters(input),cell=value=>{const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';};
 const headers=['Vendor','Family','Models','Storage type','Year','Milestone date','Date meaning','Milestone','Availability evidence','Announcement scope','Summary','Primary source titles','Primary source URLs','Reviewed'];
 return '\uFEFF'+[headers,...filterEvolution(f).map(e=>[EVOLUTION_VENDORS[e.vendor].name,e.family,e.models.join('; '),e.types.join(' + '),e.year,e.date,e.dateKind,e.milestone,e.availability,e.scope,e.summary,e.sources.map(k=>EVOLUTION_SOURCES[k].title).join('; '),e.sources.map(k=>EVOLUTION_SOURCES[k].url).join(' ; '),EVOLUTION_REVIEWED])].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
