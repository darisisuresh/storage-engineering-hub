export function normalizeWwn(value) {
  const raw = String(value).trim().replace(/^0x/i, '').replace(/[\s:.-]/g, '');
  if (!/^[a-f0-9]{16}$/i.test(raw)) throw new Error('WWPN must contain exactly 16 hexadecimal digits; separators may be spaces, colons, periods, or hyphens.');
  return raw.toLowerCase().match(/../g).join(':');
}
export function raidCapacity(count, tb, level, spares = 0) {
  const active = count - spares;
  if (!Number.isInteger(count) || !Number.isInteger(spares) || spares < 0 || !Number.isFinite(tb) || tb <= 0) throw new Error('Use whole drive counts and a positive drive capacity.');
  if (!['5', '6', '10'].includes(String(level))) throw new Error('Choose RAID 5, 6, or 10.');
  if (active < (String(level) === '5' ? 3 : 4) || (String(level) === '10' && active % 2)) throw new Error('RAID 5 needs 3 active drives; RAID 6 needs 4; RAID 10 needs an even count of at least 4.');
  const usable = tb * (String(level) === '10' ? active / 2 : active - (String(level) === '6' ? 2 : 1));
  return { raw: count * tb, usable, tib: usable * 1e12 / 2 ** 40, overhead: count * tb - usable };
}
export function throughput(iops, kib) {
  if (!Number.isFinite(iops) || !Number.isFinite(kib) || iops < 0 || kib <= 0) throw new Error('Enter nonnegative IOPS and a positive block size.');
  return { mib: iops * kib / 1024, mb: iops * kib * 1024 / 1e6 };
}
export function transferHours(tb, mbps, efficiency) {
  if (![tb, mbps, efficiency].every(Number.isFinite) || tb <= 0 || mbps <= 0 || efficiency <= 0 || efficiency > 100) throw new Error('Use positive values and an efficiency between 0 and 100%.');
  return tb * 1e12 * 8 / (mbps * 1e6 * efficiency / 100) / 3600;
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
  return fabrics.map(f => {
    const h = `H_${host}_${f.fabric}`;
    const targets = f.targets.map((wwn, i) => ({ name: `T_${array}_${f.fabric}_${i + 1}`, wwn }));
    const zones = mode === 'simt' ? [{ name: `Z_${host}_${array}_${f.fabric}`, members: [h, ...targets.map(t => t.name)] }] : targets.map((t, i) => ({ name: `Z_${host}_${array}_${f.fabric}_${i + 1}`, members: [h, t.name] }));
    const intro = `# Fabric ${f.fabric} — ${mode.toUpperCase()}\n# Assumes existing ${vendor === 'cisco' ? 'zoneset and VSAN' : 'configuration'}. Verify names and existing members first.\n# Review and approve this change before activation.\n`;
    let apply, rollback;
    if (vendor === 'brocade') {
      apply = [`aliCreate "${h}", "${f.initiator}"`, ...targets.map(t => `aliCreate "${t.name}", "${t.wwn}"`), ...zones.map(z => `zoneCreate "${z.name}", "${z.members.join(';')}"`), `cfgAdd "${f.cfg}", "${zones.map(z => z.name).join(';')}"`, 'cfgSave', `cfgEnable "${f.cfg}"`, 'cfgActvShow'].join('\n');
      rollback = [`cfgRemove "${f.cfg}", "${zones.map(z => z.name).join(';')}"`, 'cfgSave', `cfgEnable "${f.cfg}"`, ...zones.map(z => `zoneDelete "${z.name}"`), ...targets.map(t => `aliDelete "${t.name}"`), `aliDelete "${h}"`, 'cfgSave', 'cfgActvShow'].join('\n');
    } else {
      const commit = enhanced ? [`zone commit vsan ${f.vsan}`] : [];
      apply = ['configure terminal', 'device-alias database', `device-alias name ${h} pwwn ${f.initiator}`, ...targets.map(t => `device-alias name ${t.name} pwwn ${t.wwn}`), 'exit', 'device-alias commit', ...zones.flatMap(z => [`zone name ${z.name} vsan ${f.vsan}`, ...z.members.map(m => `member device-alias ${m}`), 'exit']), `zoneset name ${f.cfg} vsan ${f.vsan}`, ...zones.map(z => `member ${z.name}`), 'exit', `zoneset activate name ${f.cfg} vsan ${f.vsan}`, ...commit, 'end', 'copy running-config startup-config', `show zoneset active vsan ${f.vsan}`].join('\n');
      rollback = ['configure terminal', `zoneset name ${f.cfg} vsan ${f.vsan}`, ...zones.map(z => `no member ${z.name}`), 'exit', ...zones.map(z => `no zone name ${z.name} vsan ${f.vsan}`), `zoneset activate name ${f.cfg} vsan ${f.vsan}`, ...commit, 'end', 'copy running-config startup-config', `show zoneset active vsan ${f.vsan}`, '# Device aliases are retained; check references before removing them.'].join('\n');
    }
    return { fabric: f.fabric, zoneCount: zones.length, apply: intro + apply, rollback: intro + '# Roll back only zones newly created by this ticket. Keep pre-existing configuration members.\n' + rollback };
  });
}
export function fillTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => String(values[key] ?? match));
}
