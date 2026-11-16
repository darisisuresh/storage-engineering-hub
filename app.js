import {createPerformanceWorkspace} from './src/performance/ui.js';
import {initSearch} from './src/ui/search.js';
import {PRIVACY_STATEMENT} from './src/core/privacy.js';
import {escape,codeBlock,pageTitle,field,tabs} from './src/ui/components.js';
import {icon} from './src/ui/icons.js';
import {copyText,download} from './src/ui/transfers.js';
import {NAV,parseRoute,navigationMarkup,bindRouter} from './src/core/router.js';
import {createPersistence} from './src/core/persistence.js';
import {createCommandDesk} from './src/tools/commands.js';
import {createPages} from './src/tools/pages.js';
import {createZoningView,defaultZone} from './src/tools/zoning.js';
import {calculatorsPage,handleCalculatorSubmit} from './src/tools/calculators.js';
import {incidentExport,upgradeExport,composePrompt} from './src/core/exporters.js';
import {APP_VERSION} from './release-info.js';
import {zoningRollback,zoningEvidenceExample,zoningTicket} from './zoning-safety.js';
import {reviewValues,resetReview,initEvidenceFiles} from './safety-ui.js';
import {requireFresh} from './safety-core.js';
import {evolutionPage,afterEvolutionRender,initEvolution} from './evolution-ui.js';
import {hpePage,afterHpeRender,initHpe} from './hpe-ui.js';
import {popularPage,afterPopularRender,initPopular} from './popular.js';
import {purePage,afterPureRender,initPure} from './pure-ui.js';
import { VENDORS, COMMANDS, TRANSLATIONS, PLAYBOOKS, UPGRADES, AUTOMATION, PROMPTS } from './data.js';
import { generateZoning, fillTemplate } from './core.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastTimer;
const persistence=createPersistence(COMMANDS,{onError:()=>toast('Browser storage is unavailable. Your changes will last for this session only.')});
let state=persistence.load();
let current = 'home', currentId = '';
let zoningOutput = null;
let zoningRollbackOutput = null;
let generatedPrompt = '';
const context={ $, $$, escape, codeBlock, pageTitle, field, tabs, icon,
 get persistenceEnabled(){return persistence.enabled;},
 get state(){return state;},get currentId(){return currentId;},
 get zoningOutput(){return zoningOutput;},set zoningOutput(v){zoningOutput=v;},
 get zoningRollbackOutput(){return zoningRollbackOutput;},set zoningRollbackOutput(v){zoningRollbackOutput=v;}
};
const commandDesk=createCommandDesk(context);
const {paramsFor,commandCard,commandsPage,updateCommands}=commandDesk;
const {overview,translatorPage,incidentsPage,upgradesPage,automationPage,promptsPage,aboutPage}=createPages(Object.assign(context,{commandCard}));
const {zoningPage,refreshZoningVendor,renderZoningOutput}=createZoningView(context);
const performance=createPerformanceWorkspace({download});
function save(){return persistence.save(state);}
function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function readForm(form) { return Object.fromEntries(new FormData(form)); }
function setTheme(theme) { document.documentElement.dataset.theme = theme; $('#theme').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon'); $('#theme').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`); }
$('#app-version').textContent='v'+APP_VERSION;$('#app-version').href='https://github.com/darisisuresh/storage-engineering-hub/releases/tag/v'+APP_VERSION;
setTheme(state.theme === 'dark' ? 'dark' : 'light');
$('#menu').innerHTML = icon('menu');
$('#search-open').insertAdjacentHTML('afterbegin', icon('search'));
$('#theme').addEventListener('click', () => { state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(state.theme); save(); });
$('#menu').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); $('#menu').setAttribute('aria-expanded', String(open)); });
document.addEventListener('click', e => { if (document.body.classList.contains('menu-open') && !e.target.closest('aside') && !e.target.closest('#menu')) closeMenu(); });
function closeMenu() { document.body.classList.remove('menu-open'); $('#menu').setAttribute('aria-expanded','false'); }

function render() {
  const route=parseRoute(location.hash);const {parts}=route;if(current==='performance'&&route.current!=='performance')performance.clear();current=route.current;currentId=route.currentId;
  document.title = `${NAV.find(n=>n[0]===current)[1]} · Storage Engineering Hub`;
  $('#breadcrumb').textContent = NAV.find(n=>n[0]===current)[1];
  $('#navigation').innerHTML = navigationMarkup(current,COMMANDS.length);
  const views = {performance:performance.page,evolution:()=>evolutionPage(currentId,{escape,codeBlock,field,icon,download,pageTitle}),hpe:()=>hpePage(currentId,parts[2],{escape,codeBlock,field,icon,download}),home:overview,popular:()=>popularPage(currentId,{escape,codeBlock,field,icon,download,pageTitle}),pure:()=>purePage(currentId,parts[2],{escape,codeBlock,field,icon,download}),commands:commandsPage,zoning:zoningPage,translator:translatorPage,calculators:calculatorsPage,incidents:incidentsPage,upgrades:upgradesPage,automation:automationPage,prompts:promptsPage,about:aboutPage};
  $('#main').dataset.page = current;
  $('#main').innerHTML = views[current]();
  if (current==='commands') updateCommands();
  if (current==='evolution') afterEvolutionRender();
  if (current==='hpe') afterHpeRender();
  if (current==='pure') afterPureRender();
  if (current==='popular') afterPopularRender();
  if (current==='zoning') { zoningOutput=null; refreshZoningVendor(); }
  if (current==='prompts') generatedPrompt='';
  closeMenu();
  if ($('#search-dialog').open) $('#search-dialog').close();
  if (parts[2]) setTimeout(()=>{ const el=document.getElementById(`command-${parts[2]}`); if(el)el.scrollIntoView({block:'center'}); },0);
}
bindRouter(render,()=>current);
render();
initEvidenceFiles();
initEvolution({escape,codeBlock,field,icon,download,pageTitle});
initHpe({escape,codeBlock,field,icon,download});
initPure({escape,codeBlock,field,icon,download});
initPopular({escape,codeBlock,field,icon,download,pageTitle});

// All dynamic values are rendered through textContent or the escaping helper.
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id==='command-release') updateCommands();
  if (el.id==='command-filter') { commandDesk.model.filter=el.value; updateCommands(); }
  if (el.dataset.command) {
    const c = COMMANDS.find(c=>c.id===el.dataset.command);
    state.params[c.id] = {...(state.params[c.id]||{}),[el.dataset.param]:el.value}; save();
    $(`#command-${c.id} pre`).textContent = fillTemplate(c.syntax,paramsFor(c));
  }
  if (el.closest('#translation-form')) {
    const t=TRANSLATIONS.find(t=>t.id===currentId)||TRANSLATIONS[0]; const values=readForm($('#translation-form')); state.translation=values;save();
    Object.entries(t.commands).forEach(([key,syntax])=>$(`[data-translation="${key}"] pre`).textContent=fillTemplate(syntax,values));
  }
  if (el.id==='incident-notes') { const p=PLAYBOOKS.find(p=>p.id===currentId)||PLAYBOOKS[0];state.notes={...state.notes,[p.id]:el.value};save(); }
  if (el.closest('#upgrade-info')) { const u=UPGRADES.find(u=>u.vendor===currentId)||UPGRADES[0];state.upgradeInfo={...state.upgradeInfo,[u.vendor]:readForm($('#upgrade-info'))};save(); }
  if (el.closest('#zoning-form')) { if(!el.hasAttribute('data-safety-review'))resetReview(el.closest('form'));zoningOutput=null;zoningRollbackOutput=null;$('#zoning-output').innerHTML='';$('#zoning-error').textContent=''; }
  if (el.closest('#prompt-form')) { generatedPrompt='';$('#prompt-output').innerHTML='<div class="empty section-gap">Inputs changed. Compose again to update the prompt.</div>'; }
});
document.addEventListener('change', e => {
  const el=e.target;
  if(el.id==='persist-data'){const ok=persistence.setEnabled(el.checked);if(ok&&el.checked)save();toast(ok?(el.checked?'Saving enabled for this browser.':'Session-only mode enabled; saved toolkit data removed.'):'Storage could not be changed. Check browser site-data settings.');el.checked=persistence.enabled;}
  if(el.id==='command-category'){commandDesk.model.category=el.value;updateCommands();}
  if(el.id==='saved-only'){commandDesk.model.savedOnly=el.checked;updateCommands();}
  if(el.closest('#zoning-form')){if(!el.hasAttribute('data-safety-review'))resetReview(el.closest('form'));refreshZoningVendor();zoningOutput=null;zoningRollbackOutput=null;$('#zoning-output').innerHTML='';}
  if(el.dataset.check){
    const id=el.dataset.check,index=Number(el.dataset.index),checks=new Set(state.checks[id]||[]);
    el.checked?checks.add(index):checks.delete(index);state.checks[id]=[...checks];save();
    el.closest('.checkitem').classList.toggle('done',el.checked);
    $('#check-count').textContent=`${checks.size} OF ${$('#check-progress').max} CHECKED`;$('#check-progress').value=checks.size;
  }
});
document.addEventListener('submit', e => {
  const form=e.target;if(!form.id)return;e.preventDefault();const v=readForm(form);
  if(form.id==='zoning-rollback-form'){try{zoningRollbackOutput=zoningRollback(zoningOutput,v.zoneRollbackEvidence,reviewValues(v,'zoneRollback'));$('#zone-rollback-error').textContent='';$('#zone-rollback-output').innerHTML=zoningRollbackOutput.map(p=>codeBlock(p.rollback,'DEPENDENCY-CHECKED OFFLINE BACKOUT')).join('');}catch(error){zoningRollbackOutput=null;$('#zone-rollback-error').textContent=error.message;$('#zone-rollback-output').innerHTML='';}return;}
  if(form.id==='zoning-form'){
    try{
      zoningOutput=generateZoning({host:v.host,array:v.array,vendor:v.vendor,mode:v.mode,enhanced:!!v.enhanced,safety:{evidence:v.zoneEvidence,review:reviewValues(v,'zone')},A:{host:v.aHost,targets:v.aTargets,cfg:v.aCfg,vsan:v.aVsan},B:{host:v.bHost,targets:v.bTargets,cfg:v.bCfg,vsan:v.bVsan}});
      state.zoning={...Object.fromEntries(Object.keys(defaultZone).map(k=>[k,v[k]])),enhanced:!!v.enhanced};save();$('#zoning-error').textContent='';renderZoningOutput();$('#zoning-output').scrollIntoView({block:'start',behavior:'smooth'});
    }catch(error){zoningOutput=null;$('#zoning-error').textContent=error.message;$('#zoning-output').innerHTML='';}return;
  }
  if(handleCalculatorSubmit(form,v))return;
  if(form.id==='prompt-form'){
    const p=PROMPTS.find(p=>p.id===currentId)||PROMPTS[0];
    generatedPrompt=composePrompt(p,v);
    $('#prompt-output').innerHTML=codeBlock(generatedPrompt,'READY TO COPY')+'<div class="form-actions"><button class="btn" data-action="download-prompt">Download prompt ↓</button></div>';
  }
});
document.addEventListener('click', e => {
  const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;
  switch(b.dataset.action){
    case 'copy-code': try{if(b.closest('#zoning-output')&&zoningOutput){zoningOutput.forEach(p=>requireFresh(p.audit));(zoningRollbackOutput||[]).forEach(p=>requireFresh(p.audit));}copyText($('pre',b.closest('.codeblock')).textContent,toast);}catch(error){zoningOutput=null;zoningRollbackOutput=null;$('#zoning-output').innerHTML='';resetReview($('#zoning-form'));$('#zoning-error').textContent=error.message;}break;
    case 'favorite':{
      const index=state.favorites.indexOf(id);index<0?state.favorites.push(id):state.favorites.splice(index,1);save();
      const saved=state.favorites.includes(id);b.textContent=saved?'★':'☆';b.classList.toggle('saved',saved);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',`${saved?'Unsave':'Save'} ${COMMANDS.find(c=>c.id===id).title}`);
      if(current==='commands'&&commandDesk.model.savedOnly)updateCommands();break;
    }
    case 'zoning-reset':delete state.zoning;save();render();break;
    case 'download-zoning':if(zoningOutput){try{download(zoningTicket(zoningOutput,zoningRollbackOutput||[]),`zoning-${state.zoning.host}.txt`);}catch(error){toast(error.message);}}break;
    case 'reset-checks':state.checks[id]=[];save();render();break;
    case 'export-incident':{
      const p=PLAYBOOKS.find(p=>p.id===id), checks=state.checks[id]||[];
      download(incidentExport(p,checks,state.notes?.[id]), `incident-${id}.txt`);break;
    }
    case 'export-upgrade':{
      const u=UPGRADES.find(u=>u.vendor===id),checks=state.checks[`upgrade-${id}`]||[],info=state.upgradeInfo?.[id]||{};
      download(upgradeExport(u,checks,info,VENDORS[id].source), `upgrade-${id}.txt`);break;
    }
    case 'download-automation':{const a=AUTOMATION.find(a=>a.id===id);download(a.code,`${id}.${a.language==='Python'?'py':a.language==='Ansible'?'yml':'sh'}`);break;}
    case 'download-prompt':if(generatedPrompt)download(generatedPrompt,'storage-review-prompt.txt');break;
    case 'download-privacy':download(PRIVACY_STATEMENT,'storage-hub-privacy.txt');break;
    case 'clear-data':{
      if(!confirm('Clear all saved toolkit data in this browser? Download any notes or change tickets you need first.'))break;
      if(!persistence.clear()){toast('Could not remove saved data. Clear this site’s data in browser settings.');break;}
      performance.clear();state={favorites:[],params:{},checks:{},theme:state.theme};zoningOutput=null;zoningRollbackOutput=null;generatedPrompt='';toast('Saved toolkit data cleared');render();break;
    }
  }
});
initSearch({$,escape,render,closeMenu,resetCommands(){Object.assign(commandDesk.model,{filter:'',category:'all',savedOnly:false});}});

document.addEventListener('click',e=>{const button=e.target.closest('[data-evidence-example]');if(button&&['zone','zoneRollback'].includes(button.dataset.evidenceExample))download(JSON.stringify(zoningEvidenceExample($('#zoning-form [name=vendor]').value),null,2),'san-zoning-evidence-template.json','application/json');});
for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.closest('#zoning-rollback-form')){if(!e.target.hasAttribute('data-safety-review'))resetReview(e.target.closest('form'));zoningRollbackOutput=null;$('#zone-rollback-output').innerHTML='';$('#zone-rollback-error').textContent='';}});
