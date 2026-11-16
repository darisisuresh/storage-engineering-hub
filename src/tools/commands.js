import {COMMANDS,VENDORS} from '../../data.js';
import {fillTemplate} from '../../core.js';
import {commandMetadata} from '../../command-metadata.js';
export function createCommandDesk(ctx){
const {$,escape,codeBlock,pageTitle,tabs}=ctx;
const model={filter:'',category:'all',savedOnly:false};
function paramsFor(command) { return { ...command.values, ...(ctx.state.params[command.id] || {}) }; }
function commandCard(c, editable = true) {
  const values = paramsFor(c);
  return `<article class="command" id="command-${c.id}"><div class="row between"><div class="row"><span class="tag">${VENDORS[c.vendor].short}</span><span class="micro">${escape(c.category)}</span></div><button class="favorite ${ctx.state.favorites.includes(c.id)?'saved':''}" data-action="favorite" data-id="${c.id}" aria-label="${ctx.state.favorites.includes(c.id)?'Unsave':'Save'} ${escape(c.title)}" aria-pressed="${ctx.state.favorites.includes(c.id)}">${ctx.state.favorites.includes(c.id)?'★':'☆'}</button></div><h3>${escape(c.title)}</h3><p>${escape(c.description)}</p>${editable && Object.keys(c.values).length ? `<div class="params">${Object.entries(values).map(([key,val]) => `<label class="field">${escape(key)}<input value="${escape(val)}" data-command="${c.id}" data-param="${escape(key)}" maxlength="80" spellcheck="false"></label>`).join('')}</div>` : ''}${codeBlock(fillTemplate(c.syntax, values))}${commandMetadata(c,escape,$('#command-release')?.value||'')}</article>`;
}
function commandsPage() {
  const vendor = VENDORS[ctx.currentId] ? ctx.currentId : 'all';
  if(model.category!=='all'&&!COMMANDS.some(c=>(vendor==='all'||c.vendor===vendor)&&c.category===model.category))model.category='all';
  const vendorTabs = [{id:'all',title:'All vendors'},...Object.entries(VENDORS).map(([id,v])=>({id,title:v.short}))];
  return pageTitle('Command desk', vendor === 'all' ? 'The command reference.' : `${escape(VENDORS[vendor].name)}<em> / command desk</em>`, 'Read-only inspection commands with editable parameters. Save frequently used entries and verify syntax against your installed release.')
    + tabs(vendorTabs,'commands',vendor)
    + `<div class="toolbar"><input id="command-filter" type="search" value="${escape(model.filter)}" aria-label="Filter commands" placeholder="Filter by task, command or category…"><select id="command-category" aria-label="Command category"><option value="all">All categories</option>${[...new Set(COMMANDS.filter(c=>vendor==='all'||c.vendor===vendor).map(c=>c.category))].map(cat=>`<option ${model.category===cat?'selected':''}>${escape(cat)}</option>`).join('')}</select><label class="check-field"><input id="saved-only" type="checkbox" ${model.savedOnly?'checked':''}>Saved only</label></div><label class="field">Installed software release (verification target)<input id="command-release" maxlength="60" placeholder="Exact installed version; compatibility remains unverified"></label><div id="commands-list"></div><p class="page-note">Parameters are interpolated as text. This site never executes commands. <a href="#about">Vendor references ↗</a></p>`;
}
function updateCommands() {
  const vendor = VENDORS[ctx.currentId] ? ctx.currentId : 'all';
  const q = model.filter.toLowerCase();
  const list = COMMANDS.filter(c => (vendor==='all'||c.vendor===vendor) && (model.category==='all'||c.category===model.category) && (!model.savedOnly||ctx.state.favorites.includes(c.id)) && `${c.title} ${c.syntax} ${c.description} ${c.category}`.toLowerCase().includes(q));
  $('#commands-list').innerHTML = `<p class="micro">${list.length} ${list.length===1?'ENTRY':'ENTRIES'}</p>` + (list.length ? list.map(c=>commandCard(c)).join('') : '<div class="empty">No commands match. Clear the filter or turn off “Saved only”.</div>');
}

return {model,paramsFor,commandCard,commandsPage,updateCommands};
}
