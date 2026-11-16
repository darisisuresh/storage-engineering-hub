import {AUTOMATION} from '../../data.js';
export function createView(ctx){
const {escape,pageTitle,tabs,codeBlock}=ctx;
function automationPage() {
  const a = AUTOMATION.find(a=>a.id===ctx.currentId)||AUTOMATION[0];
  return pageTitle('Automation desk', 'Useful starting points.<br><em>Readable by design.</em>', 'Original read-only examples for inventory and validation. Review dependencies and adapt them to your environment before running locally.')
    + tabs(AUTOMATION.map(a=>({id:a.id,title:a.title})),'automation',a.id)
    + `<article class="card"><div class="row between"><h2>${escape(a.title)}</h2><span class="tag">${escape(a.language)}</span></div><p class="intro section-gap">${escape(a.note)}</p>${codeBlock(a.code,a.language.toUpperCase()+' / READ-ONLY EXAMPLE')}<div class="form-actions"><button class="btn" data-action="download-automation" data-id="${a.id}">Download example ↓</button></div></article><p class="page-note">Credentials are supplied in your own execution environment, never through this website. No scripts run on your equipment from here.</p>`;
}

return {automationPage};
}
