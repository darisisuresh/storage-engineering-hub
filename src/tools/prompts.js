import {PROMPTS} from '../../data.js';
export function createView(ctx){
const {escape,pageTitle,field,tabs}=ctx;
function promptsPage() {
  const p = PROMPTS.find(p=>p.id===ctx.currentId)||PROMPTS[0];
  return pageTitle('AI workbench', 'Ask a better<br><em>engineering question.</em>', 'Compose a structured prompt from your context and observations. Nothing is sent to an AI service; copy the result into the provider you choose.')
    + tabs(PROMPTS.map(p=>({id:p.id,title:p.title})),'prompts',p.id)
    + `<div class="grid cols-2"><section class="card"><h2>${escape(p.title)}</h2><form id="prompt-form" class="stack section-gap"><label class="field">Platform and release<input name="platform" placeholder="e.g. Cisco MDS, NX-OS release…" required></label><label class="field">Objective<textarea name="objective" rows="3" placeholder="What decision or investigation should the response support?" required></textarea></label><label class="field">Evidence / proposed change<textarea name="evidence" class="code-input" rows="8" placeholder="Paste sanitized observations, logs or a proposed change…" required></textarea></label><label class="field">Constraints<input name="constraints" placeholder="e.g. read-only checks; maintain both fabrics"></label><button class="btn primary" type="submit">Compose prompt ↗</button></form><p class="page-note">Prompt inputs are not persisted. Remove passwords, tokens, private keys and confidential identifiers before pasting here or sharing with another service.</p></section><section class="card"><div class="row between"><h2>Your composed prompt</h2><span class="tag">NO MODEL CONNECTION</span></div><div id="prompt-output"><div class="empty section-gap">Add context on the left, then compose.<br>The complete prompt will appear here.</div></div></section></div>`;
}

return {promptsPage};
}
