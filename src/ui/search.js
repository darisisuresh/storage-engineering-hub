import {NAV} from '../core/router.js';
import {COMMANDS,VENDORS} from '../../data.js';
import {PURE_TOPICS,PURE_BUILDERS} from '../../pure-data.js';
import {POPULAR_ITEMS} from '../../popular.js';
import {HPE_SYSTEMS} from '../../hpe-data.js';
import {EVOLUTION_EVENTS,EVOLUTION_VENDORS} from '../../evolution-data.js';
import {evolutionRoute} from '../../evolution-core.js';
export function initSearch({$,escape,resetCommands,render,closeMenu}){
const dialog=$('#search-dialog');
function openSearch(){if(!dialog.open)dialog.showModal();$('#global-search').value='';search();$('#global-search').focus();}
function search(){
  const q=$('#global-search').value.toLowerCase().trim();
  const tools=NAV.filter(([key,label])=>q.split(/\s+/).every(term=>`${key} ${label} ${key==='performance'?'CSV telemetry latency IOPS throughput queue depth workload baseline trends':''}`.toLowerCase().includes(term))).map(([key,label])=>({title:label,label:'TOOL',href:`#${key}`}));
  const cmds=COMMANDS.filter(c=>q.split(/\s+/).every(term=>`${c.title} ${c.syntax} ${c.description} ${VENDORS[c.vendor].name}`.toLowerCase().includes(term))).map(c=>({title:c.title,label:VENDORS[c.vendor].short,href:`#commands/${c.vendor}/${c.id}`}));
  const pureTopics=[...PURE_TOPICS,...PURE_BUILDERS.map(([id,title,note])=>['builders/'+id,title,note])].filter(([id,title,note])=>q.split(/\s+/).every(term=>`pure storage ${id} ${title} ${note}`.toLowerCase().includes(term))).map(([id,title])=>({title:'Pure / '+title,label:'PURE TOPIC',href:`#pure/${id}`}));
  const popularItems=POPULAR_ITEMS.filter(p=>q.split(/\s+/).every(term=>`${p.title} ${p.note} ${p.vendor} ${p.kind}`.toLowerCase().includes(term))).map(p=>({title:p.title,label:p.kind.toUpperCase(),href:`#popular/${p.id}`}));
  const hpeItems=HPE_SYSTEMS.filter(s=>q.split(/\s+/).every(t=>`hpe ${s.name} ${s.fit}`.toLowerCase().includes(t))).map(s=>({title:s.name,label:"HPE SYSTEM",href:`#hpe/planning/${s.id}`}));
  const evolutionItems=q?EVOLUTION_EVENTS.filter(e=>q.split(/\s+/).every(t=>`storage evolution history releases ${EVOLUTION_VENDORS[e.vendor].name} ${e.family} ${e.models.join(' ')} ${e.year}`.toLowerCase().includes(t))).map(e=>({title:`${e.year} / ${e.models.join(', ')}`,label:'STORAGE EVOLUTION',href:evolutionRoute({q:e.models[0],vendor:e.vendor,from:e.year,to:e.year})})):[];
  const entries=[...tools,...evolutionItems,...hpeItems,...popularItems,...pureTopics,...cmds].slice(0,24);
  $('#search-results').innerHTML=entries.length?entries.map(r=>`<a href="${r.href}"><span>${escape(r.title)}</span><small>${escape(r.label)}</small></a>`).join(''):'<div class="empty">No results. Try a vendor name or operational task.</div>';
}
$('#search-open').addEventListener('click',openSearch);$('#search-close').addEventListener('click',()=>dialog.close());$('#global-search').addEventListener('input',search);
$('#search-results').addEventListener('click',e=>{if(e.target.closest('a')){resetCommands();dialog.close();if(e.target.closest('a').hash===location.hash)render();}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():openSearch();}if(e.key==='Escape')closeMenu(true);});


}
