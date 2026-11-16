import fs from 'node:fs';
import {APP_VERSION} from '../release-info.js';
const {version}=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
if(version!==APP_VERSION)throw new Error('package.json and release-info.js versions differ.');
if(!fs.readFileSync(new URL('../CHANGELOG.md',import.meta.url),'utf8').includes(`## [${version}]`))throw new Error('Current version needs a CHANGELOG.md entry.');
console.log(`Release metadata verified: v${version}`);
