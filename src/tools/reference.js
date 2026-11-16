import {VENDORS,TRANSLATIONS} from '../../data.js';
import {fillTemplate} from '../../core.js';
export function createView(ctx){
const {escape,pageTitle,field,tabs,codeBlock}=ctx;
function translatorPage() {
  const t = TRANSLATIONS.find(t=>t.id===ctx.currentId)||TRANSLATIONS[0];
  const values = {sid:'000197800001',svm:'svm_apps',vsan:'10',vol:'app_data01',...ctx.state.translation};
  return pageTitle('Operational equivalents', 'Same question.<br><em>Different syntax.</em>', 'Compare the inspection workflow across platforms. This is a curated task map, not an arbitrary command converter.')
    + tabs(TRANSLATIONS.map(t=>({id:t.id,title:t.title})),'translator',t.id)
    + `<section class="card"><h2>${escape(t.title)}</h2><p class="intro section-gap">${escape(t.note)}</p><form id="translation-form" class="grid cols-3 section-gap">${field('sid','PowerMax array SID',values.sid)}${field('svm','ONTAP storage VM',values.svm)}${field('vsan','Cisco VSAN',values.vsan)}${field('vol','Pure volume',values.vol)}</form></section><div id="translation-output" class="grid cols-2 section-gap">${Object.entries(t.commands).map(([key,syntax])=>`<article class="card" data-translation="${key}"><h3>${VENDORS[key].name}</h3>${codeBlock(fillTemplate(syntax,values),'READ-ONLY TASK REFERENCE')}</article>`).join('')}</div>`;
}

return {translatorPage};
}
