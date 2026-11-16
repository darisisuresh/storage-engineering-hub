import {readFile,lstat} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {SITE_FILES} from './site-files.mjs';
const files=new Set(SITE_FILES);
assert.equal(files.size,SITE_FILES.length,'Duplicate packaged asset');
function reference(owner,target){
 if(!target||target.startsWith('#')||/^(https?:|data:)/.test(target))return;
 assert(!target.startsWith('/')&&!target.includes('\\'),`${owner}: non-portable asset ${target}`);
 const path=relative(process.cwd(),resolve(dirname(owner),target.split(/[?#]/)[0]));
 assert(files.has(path),`${owner}: referenced asset is not packaged: ${target}`);
}
for(const file of files){
 assert((await lstat(file)).isFile(),`Non-regular source ${file}`);
 const source=await readFile(file,'utf8');
 if(file.endsWith('.js')){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  for(const match of source.matchAll(/^import\s+(?:[^\n;]*?\s+from\s+)?['"]([^'"]+)['"]/gm))reference(file,match[1]);
 }
 if(file.endsWith('.css'))for(const match of source.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g))reference(file,match[1]);
 if(file.endsWith('.html')){
  for(const match of source.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="([^"]+)"/g))reference(file,match[1]);
  assert(source.includes("connect-src 'none'"),'Offline CSP boundary missing');
  assert(!/\son\w+\s*=/.test(source),'Inline event handler in application shell');
 }
}
assert.equal(await readFile('privacy.txt','utf8'),(await import('../src/core/privacy.js')).PRIVACY_STATEMENT,'Privacy download and published text differ');
console.log(`Syntax and local asset references verified: ${files.size} packaged assets`);
