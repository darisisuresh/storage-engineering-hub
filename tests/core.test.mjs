import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWwn,raidCapacity,throughput,transferHours,generateZoning,fillTemplate} from '../core.js';
import {COMMANDS,PLAYBOOKS,UPGRADES} from '../data.js';
const zone={host:'app01',array:'storage01',vendor:'cisco',mode:'sist',A:{host:'2100000000000001',targets:'5000000000000001\n5000000000000003',cfg:'PROD_A',vsan:'10'},B:{host:'2100000000000002',targets:'5000000000000002',cfg:'PROD_B',vsan:'20'}};
test('WWPN normalization accepts valid separators and refuses silent character removal',()=>{
 assert.equal(normalizeWwn('0x2100.0000.0000.0001'),'21:00:00:00:00:00:00:01');
 assert.equal(normalizeWwn('21-00-00-00-00-00-00-01'),'21:00:00:00:00:00:00:01');
 for(const bad of ['z2100000000000001','210000000000001','21000000000000010','210000000000000g'])assert.throws(()=>normalizeWwn(bad));
});
test('RAID capacity subtracts spares and parity, validates mirrors and reports binary units',()=>{
 assert.equal(raidCapacity(9,4,'6',1).usable,24);
 assert.equal(raidCapacity(8,4,'10').usable,16);
 assert.equal(raidCapacity(3,4,'5').usable,8);
 assert.ok(Math.abs(raidCapacity(8,4,'6').tib-21.827872842550278)<1e-9);
 for(const args of [[5,4,'10'],[3,4,'6'],[8,-1,'6'],[8,4,'50'],[8,4,'6',6],[8.5,4,'5']])assert.throws(()=>raidCapacity(...args));
});
test('throughput and transfer use explicitly declared units',()=>{
 assert.deepEqual(throughput(10000,8),{mib:78.125,mb:81.92});
 assert.equal(transferHours(1,1000,100),8000/3600);
 assert.equal(throughput(0,8).mib,0);
 assert.throws(()=>throughput(-1,8));assert.throws(()=>transferHours(1,0,70));assert.throws(()=>transferHours(1,1000,101));
});
test('SIST creates one zone per target in independent fabrics with explicit Cisco mode exits',()=>{
 const [a,b]=generateZoning(zone);assert.equal(a.zoneCount,2);assert.equal(b.zoneCount,1);
 assert.match(a.apply,/vsan 10/);assert.match(b.apply,/vsan 20/);assert.doesNotMatch(a.apply,/21:00:00:00:00:00:00:02/);
 assert.match(a.apply,/exit\ndevice-alias commit/);assert.match(a.rollback,/no member Z_app01_storage01_A_1/);
 assert.doesNotMatch(a.apply,/zone commit vsan/);
});
test('SIMT includes all targets in one zone and enhanced Cisco commits explicitly',()=>{
 const [a]=generateZoning({...zone,mode:'simt',enhanced:true});assert.equal(a.zoneCount,1);
 assert.match(a.apply,/member device-alias T_storage01_A_1/);assert.match(a.apply,/member device-alias T_storage01_A_2/);
 assert.match(a.apply,/zone commit vsan 10/);assert.match(a.rollback,/zone commit vsan 10/);
});
test('Brocade rollback removes generated membership without deleting existing configuration',()=>{
 const [a]=generateZoning({...zone,vendor:'brocade'});
 assert.match(a.apply,/cfgAdd "PROD_A"/);assert.match(a.rollback,/cfgRemove "PROD_A"/);assert.doesNotMatch(a.rollback,/cfgDelete|cfgClear/i);
 assert.match(a.rollback,/aliDelete "T_storage01_A_2"/);assert.match(a.rollback,/aliDelete "H_app01_A"/);
});
test('zoning rejects command injection, duplicate WWPNs, invalid VSAN and empty targets',()=>{
 for(const modified of [{...zone,host:'bad\nend'},{...zone,A:{...zone.A,cfg:'x";cfgclear'}},{...zone,A:{...zone.A,vsan:'4094'}},{...zone,A:{...zone.A,targets:''}},{...zone,B:{...zone.B,host:zone.A.host}}])assert.throws(()=>generateZoning(modified));
});
test('template filling preserves unresolved tokens and inserts values literally',()=>{
 assert.equal(fillTemplate('show {{name}} {{other}}',{name:'$&'}),'show $& {{other}}');
});
test('catalog IDs and playbook links are consistent',()=>{
 assert.equal(COMMANDS.length,32);assert.equal(new Set(COMMANDS.map(c=>c.id)).size,COMMANDS.length);
 for(const p of [...PLAYBOOKS,...UPGRADES])for(const id of p.commands)assert.ok(COMMANDS.some(c=>c.id===id),id);
});
