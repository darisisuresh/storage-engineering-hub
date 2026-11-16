import test from 'node:test';
import assert from 'node:assert/strict';
import {COMMANDS} from '../data.js';
import {PURE_COMMANDS} from '../pure-data.js';
import {releaseStatus} from '../command-metadata.js';
import {validateCatalog} from '../scripts/validate-catalog.mjs';
import {raidCapacity} from '../core.js';
test('catalog verification claims stay explicit and reject fabricated validation',()=>{
 const all=[...new Map([...COMMANDS,...PURE_COMMANDS].map(c=>[c.id,c])).values()];assert.equal(validateCatalog(all),122);
 assert.throws(()=>validateCatalog([{...all[0],minimumTestedRelease:'9.3'}]));
 assert.throws(()=>validateCatalog([{...all[0],officialDocumentationUrl:'https://example.com/docs'}]));
 assert.match(releaseStatus(all[0],'9.3'),/Unverified for selected release: 9.3/);
});
test('RAID accounting separates spare and protection capacities and rejects overflow',()=>{
 const r=raidCapacity(9,4,'6',1);assert.equal(r.spareCapacity,4);assert.equal(r.protectionCapacity,8);assert.equal(r.raw,r.usable+r.spareCapacity+r.protectionCapacity);
 assert.equal(raidCapacity(8,4,'10').protectionCapacity,16);
 assert.throws(()=>raidCapacity(Number.MAX_SAFE_INTEGER+1,4,'6'));assert.throws(()=>raidCapacity(8,Number.MAX_VALUE,'6'));
});
