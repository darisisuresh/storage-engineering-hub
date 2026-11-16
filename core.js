import {validateZoningPlan} from './zoning-safety.js';
export function normalizeWwn(value) {
  const raw = String(value).trim().replace(/^0x/i, '').replace(/[\s:.-]/g, '');
  if (!/^[a-f0-9]{16}$/i.test(raw)) throw new Error('WWPN must contain exactly 16 hexadecimal digits; separators may be spaces, colons, periods, or hyphens.');
  return raw.toLowerCase().match(/../g).join(':');
}
export function raidCapacity(count, tb, level, spares = 0) {
  const active = count - spares;
  if (!Number.isSafeInteger(count) || !Number.isSafeInteger(spares) || spares < 0 || !Number.isFinite(tb) || tb <= 0) throw new Error('Use whole drive counts and a positive drive capacity.');
  if (!['5', '6', '10'].includes(String(level))) throw new Error('Choose RAID 5, 6, or 10.');
  if (active < (String(level) === '5' ? 3 : 4) || (String(level) === '10' && active % 2)) throw new Error('RAID 5 needs 3 active drives; RAID 6 needs 4; RAID 10 needs an even count of at least 4.');
  const usable = tb * (String(level) === '10' ? active / 2 : active - (String(level) === '6' ? 2 : 1));
  if (![count*tb,usable,usable*1e12].every(Number.isFinite)) throw new Error('Capacity exceeds the supported numeric range.');
  return { raw: count * tb, usable, tib: usable * 1e12 / 2 ** 40, overhead: count * tb - usable, spareCapacity: spares*tb, protectionCapacity: active*tb-usable };
}
export function throughput(iops, kib) {
  if (!Number.isFinite(iops) || !Number.isFinite(kib) || iops < 0 || kib <= 0) throw new Error('Enter nonnegative IOPS and a positive block size.');
  const bytes=iops*kib*1024,mib=bytes/2**20,mb=bytes/1e6;
  if(![bytes,mib,mb].every(Number.isFinite)||(iops>0&&(bytes===0||mib===0||mb===0)))throw new Error('Throughput exceeds the supported numeric range.');
  return {mib,mb};
}
export function transferHours(tb, mbps, efficiency) {
  if (![tb, mbps, efficiency].every(Number.isFinite) || tb <= 0 || mbps <= 0 || efficiency <= 0 || efficiency > 100) throw new Error('Use positive values and an efficiency between 0 and 100%.');
  const bytes=tb*1e12,rate=mbps*1e6/8*(efficiency/100),hours=bytes/rate/3600;
  if(![bytes,rate,hours].every(Number.isFinite)||bytes<=0||rate<=0||hours<=0)throw new Error('Transfer estimate exceeds the supported numeric range.');
  return hours;
}
function name(value, label, max = 48) {
  if (!new RegExp(`^[A-Za-z][A-Za-z0-9_]{0,${max - 1}}$`).test(String(value))) throw new Error(`${label}: start with a letter; use letters, digits and underscores only (maximum ${max}).`);
  return value;
}
export function generateZoning(config) {
  const { host, array, vendor, mode = 'sist', enhanced = false } = config;
  name(host, 'Host name', 20); name(array, 'Array name', 20);
  if (!['cisco', 'brocade'].includes(vendor)) throw new Error('Choose Cisco or Brocade syntax.');
  if (!['sist', 'simt'].includes(mode)) throw new Error('Choose SIST or SIMT zoning.');
  const all = [];
  const fabrics = ['A', 'B'].map(fabric => {
    const input = config[fabric];
    if (!input) throw new Error(`Fabric ${fabric} is missing.`);
    name(input.cfg, `Fabric ${fabric} configuration`);
    const initiator = normalizeWwn(input.host);
    const targets = String(input.targets).split(/[\n,;]+/).map(t => t.trim()).filter(Boolean).map(normalizeWwn);
    if (!targets.length || targets.length > 16) throw new Error(`Fabric ${fabric}: supply 1 to 16 target WWPNs.`);
    all.push(initiator, ...targets);
    if (vendor === 'cisco' && (!/^\d+$/.test(String(input.vsan)) || Number(input.vsan) < 1 || Number(input.vsan) > 4093)) throw new Error('Cisco VSAN must be a whole number from 1 to 4093.');
    return { fabric, ...input, initiator, targets };
  });
  if (new Set(all).size !== all.length) throw new Error('Every host and target WWPN must be unique across both fabrics.');
  const plans = fabrics.map(f => {
    const h = `H_${host}_${f.fabric}`;
    const targets = f.targets.map((wwn, i) => ({ name: `T_${array}_${f.fabric}_${i + 1}`, wwn }));
    const zones = mode === 'simt' ? [{ name: `Z_${host}_${array}_${f.fabric}`, members: [h, ...targets.map(t => t.name)] }] : targets.map((t, i) => ({ name: `Z_${host}_${array}_${f.fabric}_${i + 1}`, members: [h, t.name] }));
    zones.forEach(z=>z.type='standard');
    const intro = `# Fabric ${f.fabric} — ${mode.toUpperCase()}\n# Assumes existing ${vendor === 'cisco' ? 'zoneset and VSAN' : 'configuration'}. Verify names and existing members first.\n# Review and approve this change before activation.\n`;
    let apply, rollback;
    if (vendor === 'brocade') {
      apply = [`aliCreate "${h}", "${f.initiator}"`, ...targets.map(t => `aliCreate "${t.name}", "${t.wwn}"`), ...zones.map(z => `zoneCreate "${z.name}", "${z.members.join(';')}"`), `cfgAdd "${f.cfg}", "${zones.map(z => z.name).join(';')}"`, 'cfgSave', `cfgEnable "${f.cfg}"`, 'cfgActvShow'].join('\n');
      rollback = '# Withheld pending state-aware rollback validation.';
    } else {
      const commit = enhanced ? [`zone commit vsan ${f.vsan}`] : [];
      apply = ['configure terminal', 'device-alias database', `device-alias name ${h} pwwn ${f.initiator}`, ...targets.map(t => `device-alias name ${t.name} pwwn ${t.wwn}`), 'exit', 'device-alias commit', ...zones.flatMap(z => [`zone name ${z.name} vsan ${f.vsan}`, ...z.members.map(m => `member device-alias ${m}`), 'exit']), `zoneset name ${f.cfg} vsan ${f.vsan}`, ...zones.map(z => `member ${z.name}`), 'exit', `zoneset activate name ${f.cfg} vsan ${f.vsan}`, ...commit, 'end', 'copy running-config startup-config', `show zoneset active vsan ${f.vsan}`].join('\n');
      rollback = '# Withheld pending state-aware rollback validation.';
    }
    return { fabric: f.fabric, zoneCount: zones.length, ownership:{cfg:f.cfg,vsan:vendor==='cisco'?Number(f.vsan):null,aliases:[{name:h,wwpn:f.initiator},...targets.map(t=>({name:t.name,wwpn:t.wwn}))],zones}, apply: intro + apply, rollback: intro + '# Roll back only zones newly created by this ticket. Keep pre-existing configuration members.\n' + rollback };
  });
  return validateZoningPlan(plans,config);
}
export function fillTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => String(values[key] ?? match));
}
