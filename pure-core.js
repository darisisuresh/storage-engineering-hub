import { normalizeWwn } from './core.js';

export function pureName(value, label = 'Name', scoped = false) {
  const name = String(value || '').trim();
  const parts = scoped ? name.split('::') : [name];
  if (parts.length > 2 || parts.some(p=>! /^[A-Za-z][A-Za-z0-9_-]{0,62}$/.test(p))) throw new Error(`${label}: use 1–63 letters, digits, underscores or hyphens per name, starting with a letter.${scoped?' A pod::volume name is allowed.':''}`);
  return name;
}
function list(value, label, scoped = false) {
  const values=String(value||'').split(/[\r\n,]+/).map(v=>v.trim()).filter(Boolean).map(v=>pureName(v,label,scoped));
  if(!values.length||values.length>100) throw new Error(`${label}: provide 1–100 explicit names.`);
  if(new Set(values).size!==values.length)throw new Error(`${label}: duplicate names are not allowed.`);
  return values;
}
function integer(value,min,max,label) {
  if(!/^\d+$/.test(String(value))||!Number.isSafeInteger(Number(value))||Number(value)<min||Number(value)>max)throw new Error(`${label}: enter a whole number from ${min} to ${max}.`);
  return Number(value);
}
export function pureSize(value) {
  const s=String(value||'').trim().toUpperCase();
  if(!/^(?:\d+(?:\.\d+)?)?(?:K|M|G|T|P)$/.test(s)||!Number.isFinite(Number(s.slice(0,-1)))||Number(s.slice(0,-1))<=0)throw new Error('Size: enter a positive number with a Purity unit K, M, G, T or P, such as 100G or 1.5T.');
  return s;
}
export function generatePurePlan(kind,values) {
  const preflight=['# Confirm the intended array, Purity release, privilege and approved change.', 'purearray list'];
  let apply=[],verify=[],backout=[],objects=[],effect='Changes configuration',title;
  if(kind==='host') {
    const protocol=values.protocol;
    if(!['fc','iscsi','nvme'].includes(protocol))throw new Error('Choose FC, iSCSI or NVMe initiators.');
    const personality=values.personality||'default';
    if(!['default','esxi','aix','solaris','nvme'].includes(personality))throw new Error('Select a supported personality from the list and verify it for your host.');
    if(protocol==='nvme'&&!['default','nvme'].includes(personality))throw new Error('Use the NVMe personality for the NVMe host builder.');
    const rows=String(values.hosts||'').split(/\r?\n/).map(r=>r.trim()).filter(Boolean);
    if(!rows.length||rows.length>50)throw new Error('Provide 1–50 host rows in the form host | initiator,initiator.');
    const seen=new Set();
    const hosts=rows.map((row,i)=>{
      const parts=row.split('|');if(parts.length!==2)throw new Error(`Host row ${i+1}: use host | initiator,initiator.`);
      const host=pureName(parts[0],`Host row ${i+1}`);
      const initiators=parts[1].split(',').map(s=>s.trim()).filter(Boolean);
      if(!initiators.length||initiators.length>32)throw new Error(`Host ${host}: provide 1–32 initiators.`);
      const normalized=initiators.map(value=>{
        if(protocol==='fc')return normalizeWwn(value).replaceAll(':','');
        const prefix=protocol==='iscsi'?'iqn':'nqn';
        const pattern=new RegExp(`^${prefix}\\.\\d{4}-(?:0[1-9]|1[0-2])\\.[A-Za-z0-9.-]+:[A-Za-z0-9._:-]+$`);
        if(!pattern.test(value))throw new Error(`Host ${host}: use a ${prefix}.YYYY-MM.domain:identifier value. This builder accepts that conservative qualified-name format.`);
        return value;
      });
      for(const value of normalized){const key=value.toLowerCase();if(seen.has(key))throw new Error('An initiator is repeated within or across hosts. Each initiator must have one owner.');seen.add(key);}
      return {host,initiators:normalized};
    });
    if(new Set(hosts.map(h=>h.host)).size!==hosts.length)throw new Error('Host names must be unique.');
    const option=protocol==='fc'?'--wwnlist':protocol==='iscsi'?'--iqnlist':'--nqnlist';
    preflight.push('purehost list','purehgroup list','pureport list --initiator');
    apply=hosts.map(h=>`purehost create ${h.host} ${option} ${h.initiators.join(',')}${protocol==='nvme'?' --personality nvme':personality==='default'?'':` --personality ${personality}`}`);
    if(values.hgroup?.trim()) { const group=pureName(values.hgroup,'New host group');apply.push(`purehgroup create ${group} --hostlist ${hosts.map(h=>h.host).join(',')}`);verify.push(`purehgroup list ${group}`); }
    verify.push(...hosts.map(h=>`purehost list ${h.host}`));
    backout=['# No automatic host deletion is included. Inspect connections and dependencies first.','# Remove only newly created objects using your approved, release-specific procedure.'];
    title='Create Pure host objects';objects=hosts.map(h=>h.host);effect='Creates hosts and optionally a new host group';
  } else if(kind==='volume') {
    const prefix=pureName(values.prefix,'Volume prefix',true),size=pureSize(values.size);
    const count=integer(values.count,1,100,'Volume count'),start=integer(values.start,0,999999,'Starting index'),width=integer(values.width,1,6,'Index width');
    objects=Array.from({length:count},(_,i)=>pureName(`${prefix}${String(start+i).padStart(width,'0')}`,'Generated volume name',true));
    preflight.push('purearray list --space','purevol list');apply=objects.map(vol=>`purevol create ${vol} --size ${size}`);
    verify=objects.map(vol=>`purevol list ${vol}`);
    backout=['# Verify there are no host connections or retained dependencies before planning retirement.','# Do not destroy newly created volumes as an unattended rollback.'];
    title='Create Pure block volumes';effect='Creates storage';
  } else if(kind==='connect'||kind==='disconnect') {
    const owner=pureName(values.owner,'Presentation owner');
    if(!['host','hgroup'].includes(values.ownerType))throw new Error('Choose host or host group presentation.');
    objects=list(values.volumes,'Volumes',true);const flag=`--${values.ownerType}`;
    if(kind==='disconnect'&&values.acknowledge!==true&&values.acknowledge!=='on')throw new Error('Confirm that application and host dependencies have been reviewed before drafting a disconnection.');
    const firstLun=String(values.lun||'').trim();let lun=null;
    if(kind==='connect'&&firstLun){lun=integer(firstLun,1,4095,'Starting LUN');if(lun+objects.length-1>4095)throw new Error('The generated LUN sequence exceeds the builder’s conservative 4095 limit.');}
    preflight.push(`${values.ownerType==='host'?'purehost':'purehgroup'} list --connect ${owner}`,...objects.map(vol=>`purevol list --connect ${vol}`));
    apply=objects.map((vol,i)=>`purevol ${kind} ${vol} ${flag} ${owner}${lun===null?'':` --lun ${lun+i}`}`);
    verify=[`${values.ownerType==='host'?'purehost':'purehgroup'} list --connect ${owner}`,...objects.map(vol=>`purevol list --connect ${vol}`)];
    backout=kind==='connect'?['# Remove only the exact connections added by this ticket, after host/application coordination.',...objects.map(vol=>`purevol disconnect ${vol} ${flag} ${owner}`)]:['# Record original LUNs in the pre-change evidence. Reconnection must preserve approved LUNs.','# Reconnect with the appropriate --lun value and validate the host before resuming I/O.'];
    title=kind==='connect'?'Connect Pure volumes':'Disconnect Pure volumes';effect=kind==='connect'?'Grants volume access':'Removes volume access';
  } else if(kind==='destroy') {
    if(values.acknowledge!==true&&values.acknowledge!=='on')throw new Error('Confirm target ownership, disconnected state, retention and recovery policy before drafting destruction.');
    objects=list(values.volumes,'Volumes',true);
    preflight.push('purearray eradication-config list',...objects.map(vol=>`purevol list --connect ${vol}`),'# Stop if any connection or retention dependency remains.');
    apply=objects.map(vol=>`purevol destroy ${vol}`);
    verify=['purevol list --pending-only'];
    backout=['# Recovery is possible only while the array state and retention policy permit it.',...objects.map(vol=>`purevol recover ${vol}`),'# Verify the recovered objects and separately restore the approved connections/LUNs.','# This ticket intentionally contains no eradicate operation.'];
    title='Destroy disconnected Pure volumes';effect='Destroys storage; recovery is policy-dependent';
  } else throw new Error('Unknown Pure builder.');
  return {title,effect,objects,preflight:preflight.join('\n'),apply:apply.join('\n'),verify:verify.join('\n'),backout:backout.join('\n')};
}
export function purePlanText(plan) {
  return `PURE STORAGE CHANGE DRAFT\n${plan.title}\nImpact: ${plan.effect}\nPrepared: ${new Date().toISOString()}\n\nPRE-CHECKS\n${plan.preflight}\n\nIMPLEMENTATION — REVIEW BEFORE EXECUTING\n${plan.apply}\n\nVERIFICATION\n${plan.verify}\n\nBACKOUT / RECOVERY CONSIDERATIONS\n${plan.backout}\n\nGenerated offline. No array state was queried or changed. Verify syntax with your installed Purity CLI help.\n`;
}
