export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function codeBlock(text, label = 'CLI REFERENCE') {
  return `<div class="codeblock"><div class="codebar"><span class="code-label"><span class="code-indicator"></span>${escape(label)}</span><button type="button" data-action="copy-code">Copy</button></div><pre class="code">${escape(text)}</pre></div>`;
}
export function pageTitle(kicker, title, subtitle, meta = '') {
  return `<section class="hero"><div><p class="eyebrow">${escape(kicker)}</p><h1>${title}</h1><p class="intro">${escape(subtitle)}</p></div>${meta ? `<div class="hero-meta">${meta}</div>` : ''}</section>`;
}
export function field(name, label, value, type = 'text', extra = '') {
  return `<label class="field">${escape(label)}<input name="${escape(name)}" type="${type}" value="${escape(value)}" ${extra}></label>`;
}
export function tabs(items, route, active) {
  return `<div class="tabs">${items.map(item => `<a href="#${route}/${escape(item.id)}" class="${active === item.id ? 'selected' : ''}" ${active === item.id ? 'aria-current="page"' : ''}>${escape(item.title)}</a>`).join('')}</div>`;
}
