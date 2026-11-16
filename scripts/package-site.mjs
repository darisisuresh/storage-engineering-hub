import {mkdir,copyFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {dirname} from 'node:path';
import {SITE_FILES} from './site-files.mjs';
await mkdir('_site',{recursive:true});
async function checkDirectory(dir,prefix=''){
 for(const name of await readdir(dir)){
  const relative=prefix+name,stat=await lstat(`${dir}/${name}`);
  if(stat.isDirectory()&&SITE_FILES.some(f=>f.startsWith(relative+'/')))await checkDirectory(`${dir}/${name}`,relative+'/');
  else if(!stat.isFile()||![...SITE_FILES,'.nojekyll'].includes(relative))throw new Error(`Unexpected packaged entry: ${relative}`);
 }
}
await checkDirectory('_site');
for(const file of SITE_FILES){
 if(!(await lstat(file)).isFile())throw new Error(`Not a regular source file: ${file}`);
 const target=`_site/${file}`;await mkdir(dirname(target),{recursive:true});await copyFile(file,target);
}
await writeFile('_site/.nojekyll','');console.log(`Packaged ${SITE_FILES.length} static assets`);
