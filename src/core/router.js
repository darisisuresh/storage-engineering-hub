import {icon} from '../ui/icons.js';
const NAV_ICONS = {performance:'activity',evolution:'activity',hpe:'server',popular:'file',pure:'database',home:'home',commands:'terminal',zoning:'network',translator:'transfer',calculators:'calculator',incidents:'activity',upgrades:'upgrade',automation:'code',prompts:'spark',about:'info'};
export const NAV = [
 ['home','Overview','◫'],['evolution','Storage Evolution','activity'],['popular','Popular articles & utilities','file'],['pure','Pure Storage','database'],['hpe','HPE Storage','server'],['commands','Vendor commands','⌘'],['zoning','SAN zoning','⋈'],['translator','CLI equivalents','⇄'],['calculators','Calculators','＋'],['performance','Storage Performance Analyzer','activity'],['incidents','Incident playbooks','△'],['upgrades','Upgrade planning','↑'],['automation','Automation library','⌁'],['prompts','AI prompt composer','✧'],['about','About, bio & sources','ⓘ'],
];
export function parseRoute(hash,nav=NAV){
 const parts=String(hash).replace(/^#/, '').split('/');
 return {parts,current:nav.some(([id])=>id===parts[0])?parts[0]:'home',currentId:parts[1]||''};
}
export function navigationMarkup(current,count){return NAV.map(([key,label])=>`<a href="#${key}" class="${current===key?'active':''}" ${current===key?'aria-current="page"':''}><span class="nav-icon">${icon(NAV_ICONS[key])}</span><span>${label}</span>${key==='commands'?`<span class="nav-count">${count}</span>`:''}</a>`).join('');}
export function bindRouter(render,getCurrent){
 const handler=()=>{render();if(getCurrent()!=='commands'||!location.hash.split('/')[2])window.scrollTo(0,0);document.querySelector('#main').focus({preventScroll:true});};
 const skip=document.querySelector('.skip');
 const focusWorkspace=event=>{event.preventDefault();const main=document.querySelector('#main');main.focus({preventScroll:true});main.scrollIntoView({block:'start'});};
 skip?.addEventListener('click',focusWorkspace);
 window.addEventListener('hashchange',handler);return ()=>{window.removeEventListener('hashchange',handler);skip?.removeEventListener('click',focusWorkspace);};
}
