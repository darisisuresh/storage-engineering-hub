import assert from 'node:assert/strict';
import {COMMANDS} from '../data.js';
import {PURE_COMMANDS} from '../pure-data.js';
export function validateCatalog(commands) {
 const ids=new Set();
 for(const c of commands){
  assert(!ids.has(c.id),`Duplicate command ${c.id}`);ids.add(c.id);
  for(const key of ['id','vendor','product','syntax','operationalRisk','validationStatus'])assert(typeof c[key]==='string'&&c[key].trim(),`${c.id}: missing ${key}`);
  const url=new URL(c.officialDocumentationUrl);assert.equal(url.protocol,'https:');
  assert(['docs.netapp.com','www.dell.com','www.cisco.com','docs.broadcom.com','support.everpuredata.com','support.hpe.com','infosight.hpe.com','www.hpe.com'].includes(url.hostname),`${c.id}: non-vendor source`);
  assert.equal(c.validationStatus,'not-lab-verified');assert.deepEqual(c.testedReleases,[]);
  for(const key of ['minimumTestedRelease','requiredPrivileges','documentationReviewedAt','lastValidated'])assert.equal(c[key],null,`${c.id}: unsupported verification claim`);
 }
 return ids.size;
}
const unique=[...new Map([...COMMANDS,...PURE_COMMANDS].map(c=>[c.id,c])).values()];
console.log(`Validated ${validateCatalog(unique)} unique commands; unknown verification fields remain explicit`);
