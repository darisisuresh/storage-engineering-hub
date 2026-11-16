import {mkdir,copyFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {SITE_FILES} from './site-files.mjs';
await mkdir('_site',{recursive:true});
for(const name of await readdir('_site')) {
 if(![...SITE_FILES,'.nojekyll'].includes(name))throw new Error(`Unexpected packaged file: ${name}`);
 if(!(await lstat(`_site/${name}`)).isFile())throw new Error('Package contains a non-regular file');
}
for(const file of SITE_FILES){if(!(await lstat(file)).isFile())throw new Error(`Not a regular source file: ${file}`);await copyFile(file,`_site/${file}`);}
await writeFile('_site/.nojekyll','');
console.log(`Packaged ${SITE_FILES.length} static assets`);
