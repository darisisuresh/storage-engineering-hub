import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePurePlan,pureName,pureSize,purePlanText} from '../pure-core.js';
import {PURE_COMMANDS,PURE_FAMILIES,PURE_REFERENCE_MAP,PURE_TOPICS,PURE_MODELS} from '../pure-data.js';
import {COMMANDS,UPGRADES,TRANSLATIONS} from '../data.js';
test('Pure reference covers each of the 13 source families and all 11 topic areas',()=>{
 assert.equal(PURE_FAMILIES.length,13);assert.equal(PURE_REFERENCE_MAP.length,11);assert.equal(PURE_COMMANDS.length,66);
 for(const [family]of PURE_FAMILIES)assert.ok(PURE_COMMANDS.some(c=>c.family===family),family);
 for(const [,route]of PURE_REFERENCE_MAP)assert.ok(PURE_TOPICS.some(([id])=>id===route.split('/')[0]),route);
 assert.ok(PURE_MODELS.some(m=>m.models.includes('FA-310')));assert.ok(PURE_MODELS.some(m=>m.models.includes('//M70')));
 assert.ok(COMMANDS.filter(c=>c.vendor==='pure').every(c=>c.effect==='Read-only'));
 assert.ok(UPGRADES.some(u=>u.vendor==='pure'));assert.ok(TRANSLATIONS.every(t=>t.commands.pure));
});
test('Pure host builder normalizes FC identifiers and handles a shared host group',()=>{
 const p=generatePurePlan('host',{protocol:'fc',personality:'esxi',hosts:'app01 | 21:00:00:00:00:00:00:01,2100000000000002\napp02 | 2100000000000003,2100000000000004',hgroup:'app_cluster'});
 assert.match(p.apply,/purehost create app01 --wwnlist 2100000000000001,2100000000000002 --personality esxi/);
 assert.match(p.apply,/purehgroup create app_cluster --hostlist app01,app02/);assert.equal(p.objects.length,2);
});
test('Pure qualified initiator types stay separate and reject injection or duplicate ownership',()=>{
 assert.match(generatePurePlan('host',{protocol:'iscsi',hosts:'app01 | iqn.2026-01.example:app01'}).apply,/--iqnlist/);
 assert.match(generatePurePlan('host',{protocol:'nvme',hosts:'app01 | nqn.2026-01.example:app01'}).apply,/--personality nvme/);
 for(const hosts of ['app01 | 2100000000000001\napp02 | 21:00:00:00:00:00:00:01','app01 | 2100000000000001\napp01 | 2100000000000002','bad;end | 2100000000000001','app01 | 210000000000000g'])assert.throws(()=>generatePurePlan('host',{protocol:'fc',hosts}));
 assert.throws(()=>generatePurePlan('host',{protocol:'iscsi',hosts:'app01 | iqn.2026-01.example:a; rm'}));
});
test('Pure volume builder validates count, scoped names, suffixes and positive sizes',()=>{
 const p=generatePurePlan('volume',{prefix:'pod01::app_data',size:'1.5t',count:'3',start:'9',width:'3'});
 assert.deepEqual(p.objects,['pod01::app_data009','pod01::app_data010','pod01::app_data011']);assert.match(p.apply,/--size 1.5T/);
 for(const values of [{count:'101'},{size:'0G'},{prefix:'bad;end'},{width:'0'},{count:'1.5'},{prefix:'a'.repeat(63)}])assert.throws(()=>generatePurePlan('volume',{prefix:'data',size:'100G',count:'2',start:'1',width:'3',...values}));
 for(const size of ['1e3G','1G;end','InfinityT','G','-1T'])assert.throws(()=>pureSize(size));
 assert.throws(()=>pureName('pod::vol::nested','Volume',true));
});
test('Pure connections preserve one ownership scope and allocate bounded optional LUNs',()=>{
 const p=generatePurePlan('connect',{ownerType:'hgroup',owner:'app_cluster',volumes:'pod::data01\npod::data02',lun:'30'});
 assert.match(p.apply,/purevol connect pod::data01 --hgroup app_cluster --lun 30/);assert.match(p.apply,/data02 --hgroup app_cluster --lun 31/);
 assert.doesNotMatch(p.apply,/--host /);assert.match(p.backout,/purevol disconnect pod::data01 --hgroup app_cluster/);
 assert.doesNotMatch(generatePurePlan('connect',{ownerType:'host',owner:'app01',volumes:'data01'}).apply,/--lun/);
 for(const values of [{lun:'4095'},{volumes:'a,a'},{owner:'bad\nend'},{ownerType:'both'}])assert.throws(()=>generatePurePlan('connect',{ownerType:'host',owner:'app01',volumes:'a,b',...values}));
});
test('Pure disconnection and destruction require acknowledgement; destruction has no eradication',()=>{
 assert.throws(()=>generatePurePlan('disconnect',{ownerType:'host',owner:'app01',volumes:'data01'}));
 assert.throws(()=>generatePurePlan('destroy',{volumes:'data01'}));
 assert.throws(()=>generatePurePlan('destroy',{volumes:'data01;shutdown',acknowledge:true}));
 assert.throws(()=>generatePurePlan('destroy',{volumes:'data01 shutdown',acknowledge:true}));
 assert.throws(()=>generatePurePlan('destroy',{volumes:'data01',acknowledge:'false'}));
 const d=generatePurePlan('disconnect',{ownerType:'host',owner:'app01',volumes:'data01',acknowledge:true});assert.match(d.apply,/purevol disconnect data01 --host app01/);assert.doesNotMatch(d.apply,/destroy/);
 const p=generatePurePlan('destroy',{volumes:'data01,data02',acknowledge:true});assert.match(p.apply,/purevol destroy data02/);assert.doesNotMatch(p.apply,/eradicate/);assert.match(p.preflight,/eradication-config list/);assert.match(p.backout,/purevol recover data01/);
 assert.match(purePlanText(p),/No array state was queried or changed/);
});
