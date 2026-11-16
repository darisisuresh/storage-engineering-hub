import {VENDORS,COMMANDS,PLAYBOOKS,UPGRADES} from '../../data.js';
export function createView(ctx){
const {escape,pageTitle,field,tabs,commandCard}=ctx;
function checklist(id, steps) {
  const checks = Array.isArray(ctx.state.checks[id]) ? ctx.state.checks[id] : [];
  return `<div class="checklist">${steps.map(([title,body],i)=>`<label class="checkitem ${checks.includes(i)?'done':''}"><input type="checkbox" data-check="${escape(id)}" data-index="${i}" ${checks.includes(i)?'checked':''}><span><strong>${escape(title)}</strong><p>${escape(body)}</p></span></label>`).join('')}</div>`;
}
function progress(id, total) {
  const count = (Array.isArray(ctx.state.checks[id])?ctx.state.checks[id]:[]).filter(i=>i>=0&&i<total).length;
  return `<div class="row between"><span class="micro" id="check-count">${count} OF ${total} CHECKED</span><button class="btn small" data-action="reset-checks" data-id="${id}">Reset checklist</button></div><progress id="check-progress" max="${total}" value="${count}" aria-label="Checklist progress"></progress>`;
}
function incidentsPage() {
  const p = PLAYBOOKS.find(p=>p.id===ctx.currentId)||PLAYBOOKS[0];
  return pageTitle('Incident desk', 'Evidence first.<br><em>Action second.</em>', 'Follow a repeatable triage path, record observations, and export a handoff. Choose saved or session-only inputs in About.')
    + tabs(PLAYBOOKS.map(p=>({id:p.id,title:p.title})),'incidents',p.id)
    + `<section class="card"><div class="row between"><h2>${escape(p.title)}</h2><span class="tag">${escape(p.severity)}</span></div><p class="intro section-gap">${escape(p.summary)}</p>${progress(p.id,p.steps.length)}${checklist(p.id,p.steps)}<label class="field">Incident notes<textarea id="incident-notes" rows="5" placeholder="Sanitized observations only — saved in this browser when saving is enabled">${escape(ctx.state.notes?.[p.id]||'')}</textarea></label><div class="form-actions"><button class="btn primary" data-action="export-incident" data-id="${p.id}">Export incident handoff ↓</button></div></section><div class="section-head"><h2>Related inspection commands</h2><small>READ-ONLY</small></div>${p.commands.map(id=>commandCard(COMMANDS.find(c=>c.id===id),false)).join('')}`;
}
function upgradesPage() {
  const u = UPGRADES.find(u=>u.vendor===ctx.currentId)||UPGRADES[0];
  const id = `upgrade-${u.vendor}`, all = [...u.pre,...u.execute,...u.post];
  const info = ctx.state.upgradeInfo?.[u.vendor]||{};
  return pageTitle('Upgrade readiness', 'A plan that includes<br><em>the way back.</em>', 'Release-neutral planning checklists. Select exact code versions with the vendor’s supported upgrade path and interoperability documentation.')
    + `<p><a class="btn" href="#hpe/upgrades">HPE family-specific upgrade readiness →</a></p>`
    + tabs(UPGRADES.map(u=>({id:u.vendor,title:VENDORS[u.vendor].short})),'upgrades',u.vendor)
    + `<div class="upgrade-columns"><section class="card"><h2>${escape(u.title)}</h2><form id="upgrade-info" class="grid cols-2 section-gap">${field('current','Current code',info.current||'')}${field('target','Planned target code',info.target||'')}${field('ticket','Change ticket',info.ticket||'')}${field('window','Change window',info.window||'')}</form><div class="section-gap">${progress(id,all.length)}</div><div class="check-group">${[['Pre-flight',u.pre,0],['Execution checkpoints',u.execute,u.pre.length],['Post-change validation',u.post,u.pre.length+u.execute.length]].map(([title,items,offset])=>`<h3>${title}</h3><div class="checklist">${items.map((text,i)=>`<label class="checkitem ${(ctx.state.checks[id]||[]).includes(i+offset)?'done':''}"><input type="checkbox" data-check="${id}" data-index="${i+offset}" ${(ctx.state.checks[id]||[]).includes(i+offset)?'checked':''}><span><p>${escape(text)}</p></span></label>`).join('')}</div>`).join('')}</div><button class="btn primary" data-action="export-upgrade" data-id="${u.vendor}">Export readiness plan ↓</button></section><section><div class="notice">A checked box records your confirmation; the site does not test equipment or certify readiness. Downgrade and rollback availability depend on the platform, release and completed upgrade stages.</div><h3>Baseline commands</h3>${u.commands.map(id=>commandCard(COMMANDS.find(c=>c.id===id),false)).join('')}<a class="btn" href="${VENDORS[u.vendor].source}" target="_blank" rel="noopener noreferrer">Vendor documentation ↗</a></section></div>`;
}

return {incidentsPage,upgradesPage};
}
