export async function copyText(text, toast) {
  try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
  catch {
    const box = document.createElement('textarea'); box.value = text; document.body.append(box); box.select();
    const copied = document.execCommand('copy'); box.remove(); toast(copied ? 'Copied to clipboard' : 'Clipboard unavailable. Select and copy the text manually.');
  }
}
export function download(text, filename, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}
