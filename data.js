import {PURE_COMMANDS, PURE_DOCS} from './pure-data.js';
export const VENDORS = {
  pure: { name: 'Pure Storage', short: 'Purity', note: 'FlashArray, hosts & protection', color: '#cf652a', source: PURE_DOCS.portal },
  netapp: { name: 'NetApp ONTAP', short: 'ONTAP', note: 'Volumes, LUNs & replication', color: '#1d6951', source: 'https://docs.netapp.com/us-en/ontap-cli/' },
  powermax: { name: 'Dell PowerMax', short: 'PowerMax', note: 'Arrays, devices & masking', color: '#855c21', source: 'https://www.dell.com/support/manuals/en-us/solutions-enabler/' },
  cisco: { name: 'Cisco MDS', short: 'MDS', note: 'VSANs, logins & zoning', color: '#2b62a0', source: 'https://www.cisco.com/c/en/us/td/docs/dcn/mds9000/sw/9x/command/cisco-mds-9000-nx-os-command-reference-guide-9x/show_commands.html' },
  brocade: { name: 'Brocade Fabric OS', short: 'FOS', note: 'Fabrics, ports & optics', color: '#84559c', source: 'https://docs.broadcom.com/doc/FOS-82x-Command-RM' },
};
const c = (vendor, id, title, category, syntax, description, values = {}) => ({ vendor, id, title, category, syntax, description, values });
export const COMMANDS = [
  ...PURE_COMMANDS.filter(c=>c.effect==='Read-only'),
  c('netapp','nt-health','Cluster health','Health','cluster show','Inspect cluster membership and node health.'),
  c('netapp','nt-ha','HA partner readiness','Health','storage failover show','Check partner visibility and takeover readiness.'),
  c('netapp','nt-capacity','Aggregate capacity','Capacity','storage aggregate show','Inspect physical aggregate allocation before planning growth.'),
  c('netapp','nt-vol','Volume inventory','Capacity','volume show -vserver {{svm}}','List volumes belonging to one storage virtual machine.',{svm:'svm_apps'}),
  c('netapp','nt-lun','LUN inventory','Provisioning','lun show -vserver {{svm}}','Inspect LUN paths, states and provisioned capacity.',{svm:'svm_apps'}),
  c('netapp','nt-map','LUN mappings','Provisioning','lun mapping show -vserver {{svm}}','Inspect how initiator groups are mapped to LUNs.',{svm:'svm_apps'}),
  c('netapp','nt-dr','Replication relationships','Replication','snapmirror show','Review replication status and transfer information.'),
  c('netapp','nt-event','Event log','Health','event log show','Inspect recent events and correlate their timestamps with host symptoms.'),
  c('powermax','pm-arrays','Discovered arrays','Inventory','symcfg list','List arrays visible to the Solutions Enabler management host.'),
  c('powermax','pm-dev','Device inventory','Provisioning','symdev -sid {{sid}} list','Inspect logical devices on the selected array.',{sid:'000197800001'}),
  c('powermax','pm-sg','Storage groups','Provisioning','symaccess -sid {{sid}} list -type storage','List storage groups for the selected array.',{sid:'000197800001'}),
  c('powermax','pm-pg','Port groups','Connectivity','symaccess -sid {{sid}} list -type port','Inspect front-end port group definitions.',{sid:'000197800001'}),
  c('powermax','pm-ig','Initiator groups','Connectivity','symaccess -sid {{sid}} list -type initiator','List initiator groups used by masking views.',{sid:'000197800001'}),
  c('powermax','pm-mv','Masking views','Connectivity','symaccess -sid {{sid}} list view','List the masking views that connect hosts, ports and storage groups.',{sid:'000197800001'}),
  c('powermax','pm-detail','Storage group detail','Provisioning','symaccess -sid {{sid}} show {{group}} -type storage','Inspect membership of one storage group.',{sid:'000197800001',group:'SG_APPLICATION'}),
  c('powermax','pm-rdf','Replication groups','Replication','symcfg -sid {{sid}} list -rdfg all','List RDF group configuration for replication investigation.',{sid:'000197800001'}),
  c('cisco','cs-version','Software inventory','Inventory','show version','Inspect the running NX-OS release and hardware summary.'),
  c('cisco','cs-interface','FC port state','Connectivity','show interface brief','Inspect interface state before following a host path.'),
  c('cisco','cs-flogi','Fabric login database','Connectivity','show flogi database','Inspect devices logged into local switch interfaces.'),
  c('cisco','cs-fcns','Name server entries','Connectivity','show fcns database','Inspect registered devices visible in the fabric.'),
  c('cisco','cs-vsan','VSAN inventory','Zoning','show vsan','Inspect virtual SAN state and membership.'),
  c('cisco','cs-zones','Active zoneset','Zoning','show zoneset active vsan {{vsan}}','Review effective zone membership within one VSAN.',{vsan:'10'}),
  c('cisco','cs-alias','Device aliases','Zoning','show device-alias database','Inspect alias-to-WWPN mappings.'),
  c('cisco','cs-optics','Port transceiver','Connectivity','show interface fc{{port}} transceiver details','Inspect diagnostic information reported by the transceiver.',{port:'1/1'}),
  c('brocade','br-version','Software inventory','Inventory','version','Inspect the Fabric OS release before selecting a procedure.'),
  c('brocade','br-switch','Switch and port state','Connectivity','switchshow','Inspect local switch identity and port status.'),
  c('brocade','br-fabric','Fabric membership','Connectivity','fabricshow','Inspect switches participating in the fabric.'),
  c('brocade','br-errors','Port error counters','Health','porterrshow','Capture counters twice and compare deltas; accumulated totals do not date the fault.'),
  c('brocade','br-optics','Transceiver readings','Connectivity','sfpshow {{port}}','Inspect reported optical information for one port.',{port:'1'}),
  c('brocade','br-zones','Defined configuration','Zoning','cfgshow','Inspect aliases, zones, and configuration membership.'),
  c('brocade','br-effective','Effective configuration','Zoning','cfgactvshow','Inspect the active zoning configuration.'),
  c('brocade','br-name','Name server entries','Connectivity','nsshow','Inspect locally registered Fibre Channel devices.'),
];
export const TRANSLATIONS = [
  { id:'inventory', title:'Find software and inventory', note:'These inspect different object types; they are operational counterparts, not interchangeable commands.', commands:{pure:'purearray list\npurearray list --controller',netapp:'cluster show\nsystem image show',powermax:'symcfg list',cisco:'show version',brocade:'version\nswitchshow'} },
  { id:'connectivity', title:'Investigate host connectivity', note:'Follow the path from host multipathing through switch login and zoning to array presentation.', commands:{pure:'purehost list\npureport list --initiator',netapp:'lun mapping show',powermax:'symaccess -sid {{sid}} list view',cisco:'show flogi database\nshow fcns database',brocade:'switchshow\nnsshow'} },
  { id:'zoning', title:'Inspect effective access', note:'Array mappings and fabric zoning are separate layers of the same host path.', commands:{pure:'purevol list --connect {{vol}}',netapp:'lun mapping show -vserver {{svm}}',powermax:'symaccess -sid {{sid}} list view',cisco:'show zoneset active vsan {{vsan}}',brocade:'cfgactvshow'} },
  { id:'capacity', title:'Review capacity and devices', note:'Physical aggregate space, logical device capacity and switch port inventory use different units and scopes.', commands:{pure:'purearray list --space\npurevol list --space',netapp:'storage aggregate show\nvolume show',powermax:'symdev -sid {{sid}} list',cisco:'show interface brief',brocade:'switchshow'} },
  { id:'replication', title:'Inspect replication and fabric reachability', note:'Switch membership is a transport check; switches do not expose ONTAP or SRDF replication state.', commands:{pure:'purearray list --connect\npurepod replica-link list',netapp:'snapmirror show',powermax:'symcfg -sid {{sid}} list -rdfg all',cisco:'show topology',brocade:'fabricshow'} },
];
export const PLAYBOOKS = [
  { id:'paths', title:'Host has lost storage paths', severity:'P1 / Connectivity', summary:'Establish impact and preserve the remaining path before changing the fabric.', steps:[
    ['Record the incident','Capture host names, LUN identifiers, first-failure time, affected applications, and change activity.'],
    ['Inspect host multipathing','Record surviving paths and compare affected hosts with an unaffected peer. Avoid rescans or reboots until scope is understood.'],
    ['Trace each fabric independently','Match initiator WWPNs to switch logins and array presentation. Verify that both fabrics have the expected target visibility.'],
    ['Compare effective zoning','Check active membership against the approved baseline. Do not assume a saved definition is active.'],
    ['Escalate with evidence','Attach timestamps, path state, switch counters and relevant array events to the vendor case. Obtain approval before any disruptive action.'],
    ['Verify recovery','Confirm expected redundant paths, successful application I/O and no recurring path failures during the agreed observation interval.'],
  ], commands:['pure-host-connect','pure-initiators','cs-flogi','cs-zones','br-effective','nt-map','pm-mv'] },
  { id:'latency', title:'Unexpected I/O latency', severity:'P2 / Performance', summary:'Use correlated measurements to distinguish host, fabric and array bottlenecks.', steps:[
    ['Define the measurement','Record application latency, timestamps, workload change, block size, queue depth and baseline.'],
    ['Check host saturation','Compare CPU, memory pressure, I/O queues and multipath balance with the baseline.'],
    ['Measure fabric deltas','Capture counters at two known times. Correlate discards and physical errors with the affected ports and workload interval.'],
    ['Review array telemetry','Compare front-end latency, backend latency, throughput and utilization in the vendor management tools.'],
    ['Change one variable','Agree a controlled mitigation and rollback; do not disable a port solely because its lifetime counter is nonzero.'],
    ['Observe the result','Re-measure application latency and confirm that an apparent improvement persists under comparable load.'],
  ], commands:['pure-monitor','pure-alerts','br-errors','br-optics','cs-optics','nt-event'] },
  { id:'space', title:'Capacity pressure or write failures', severity:'P1 / Capacity', summary:'Identify the exhausted allocation layer before expanding or deleting anything.', steps:[
    ['Capture affected objects','Record filesystem, datastore, LUN, volume and pool identifiers along with failure timestamps.'],
    ['Locate the constraint','Compare logical allocation, physical free capacity, snapshots and quotas. A large thin LUN does not guarantee physical space.'],
    ['Protect the application','Coordinate with application owners to reduce incoming writes or pause nonessential jobs where appropriate.'],
    ['Plan a capacity change','Validate available physical capacity and the approved expansion procedure. Preserve required retention and recovery points.'],
    ['Execute the approved recovery','Use the vendor-supported procedure for the exact release. Record pre-change and post-change capacity.'],
    ['Confirm end-to-end recovery','Check writable state, application transactions, alert clearance and the capacity forecast.'],
  ], commands:['pure-space','pure-volume-space','nt-capacity','nt-vol','nt-lun','pm-dev'] },
  { id:'replication', title:'Replication is outside its RPO', severity:'P2 / Data protection', summary:'Separate stale reporting, transport faults and replication backlog before selecting a recovery action.', steps:[
    ['Record the protection objective','Capture the required RPO, last confirmed recovery point, relationship identifiers and affected services.'],
    ['Inspect relationship state','Review replication status and event chronology on the source and destination.'],
    ['Check transport and destination','Verify network or fabric reachability and available destination capacity.'],
    ['Estimate backlog','Compare incoming write rate with transfer progress. Account for the bandwidth available to catch up.'],
    ['Approve the repair','Agree the vendor-supported recovery procedure. Failover requires an application and consistency decision; it is not a generic repair step.'],
    ['Validate protection','Confirm successful replication and an acceptable recovery point with the service owner.'],
  ], commands:['pure-pods','pure-replica-links','nt-dr','pm-rdf','br-fabric'] },
];
export const UPGRADES = [
  {vendor:'pure',title:'Purity//FA upgrade readiness',pre:['Confirm the exact FlashArray model, installed Purity release, target path and host interoperability with the vendor.','Verify both controller states, redundant host paths, support connectivity and a recoverable application baseline.','Record replication and protection state; agree the supported service method, observation checkpoints and rollback limits.'],execute:['Use the vendor-approved procedure and service arrangements for this specific upgrade.','Observe each controller transition and host I/O; pause at the agreed checkpoint if paths or applications deviate from baseline.'],post:['Verify the intended Purity release, controller health and full host path redundancy.','Confirm volume presentation, application transactions, alerts and protection state.'],commands:['pure-array','pure-controllers','pure-alerts']},
  {vendor:'netapp', title:'ONTAP rolling upgrade', pre:['Verify the supported upgrade path and hardware interoperability for the target release.','Check cluster health, HA readiness, backup availability and host multipath redundancy.','Read target-release cautions and record the vendor-approved rollback boundary.'], execute:['Follow the release-specific vendor procedure; validate the uploaded image before scheduling it.','Observe each controller transition and verify host I/O before progressing.'], post:['Verify release consistency and cluster/HA health.','Check LUN paths, NAS access, replication and application transactions.'], commands:['nt-health','nt-ha','nt-dr']},
  {vendor:'powermax', title:'PowerMax service upgrade', pre:['Confirm the exact array model, microcode target and interoperability with Dell support.','Arrange the supported service delivery method and required support involvement.','Capture alerts, host path redundancy, replication status and the application baseline.'],execute:['Use the Dell-approved service plan for this array; no generic firmware command is supplied.','Track checkpoints and application health with the service engineer.'],post:['Confirm the reported code level, cleared alerts and all host paths.','Verify masking, replication and application I/O.'],commands:['pm-arrays','pm-mv','pm-rdf']},
  {vendor:'cisco', title:'MDS upgrade planning', pre:['Check hardware, current NX-OS release and the supported target path.','Verify whether the specific upgrade is nondisruptive; do not assume ISSU support.','Save configuration and collect active zoning, fabric topology and host path baselines.'],execute:['Apply the Cisco release-specific upgrade procedure within the approved window.','Validate one fabric and its host paths before changing the redundant fabric.'],post:['Confirm software state, port recovery and active zoneset membership.','Check fabric stability and application path redundancy.'],commands:['cs-version','cs-interface','cs-zones']},
  {vendor:'brocade', title:'Fabric OS upgrade planning', pre:['Check switch model, FOS release notes and the supported intermediate upgrade steps.','Back up switch configuration and capture zoning, fabric membership and counters.','Confirm host path redundancy and the disruption behavior for this exact platform.'],execute:['Follow the supported firmware procedure for the selected switch and FOS release.','Pause at the vendor checkpoints and validate one fabric before the other.'],post:['Verify software version, fabric membership and effective zoning.','Compare new counter deltas and confirm host path recovery.'],commands:['br-version','br-switch','br-effective']},
];
export const AUTOMATION = [
 {id:'pure-inventory',title:'Pure FlashArray inspection capture',language:'Shell',note:'Read-only SSH example. Set PURE_SSH_TARGET to a known management account and array hostname. Use trusted SSH host keys and your approved authentication method. No password or API token is embedded.',code:`#!/usr/bin/env bash
set -euo pipefail
umask 077
: "\u0024{PURE_SSH_TARGET:?Set the approved user@array target}"
[[ "$PURE_SSH_TARGET" =~ ^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$ ]] || exit 2
capture_dir="pure-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir "$capture_dir"
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$PURE_SSH_TARGET" 'purearray list' > "$capture_dir/array.txt"
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$PURE_SSH_TARGET" 'purehost list' > "$capture_dir/hosts.txt"
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$PURE_SSH_TARGET" 'purevol list --connect' > "$capture_dir/connections.txt"
printf 'Saved read-only evidence to %s\\n' "$capture_dir"
`},
 {id:'ontap-rest', title:'ONTAP volume inventory', language:'Python', note:'Read-only REST inventory. Requires Python requests, a trusted CA chain and an ONTAP account with appropriate read access.', code:`import os
import requests

base = os.environ["ONTAP_URL"].rstrip("/")
if not base.startswith("https://"):
    raise ValueError("ONTAP_URL must use HTTPS")
session = requests.Session()
session.auth = (os.environ["ONTAP_USER"], os.environ["ONTAP_PASSWORD"])
url = base + "/api/storage/volumes?fields=name,svm.name,size&max_records=100"
while url:
    response = session.get(url, timeout=30)
    response.raise_for_status()
    page = response.json()
    for volume in page.get("records", []):
        print(volume.get("name"), volume.get("size"))
    next_path = page.get("_links", {}).get("next", {}).get("href")
    # Follow only same-server relative pagination links.
    if next_path and not next_path.startswith("/api/"):
        raise ValueError("Unexpected pagination URL")
    url = base + next_path if next_path else None
`},
 {id:'mds-ansible',title:'MDS configuration capture',language:'Ansible',note:'Read-only example. Install cisco.nxos and ansible.netcommon; supply inventory and credentials through Ansible Vault or your secret manager.',code:`---
- name: Capture MDS operational state
  hosts: mds_switches
  gather_facts: false
  connection: ansible.netcommon.network_cli
  vars:
    ansible_network_os: cisco.nxos.nxos
  tasks:
    - name: Read fabric state
      cisco.nxos.nxos_command:
        commands:
          - show version
          - show interface brief
          - show flogi database
          - show zoneset active
      register: fabric_state
    - name: Display captured output
      ansible.builtin.debug:
        var: fabric_state.stdout
`},
 {id:'wwpn-csv',title:'Validate a WWPN inventory CSV',language:'Python',note:'Local file validation with the Python standard library. CSV must contain a wwpn column. Reports malformed and duplicate entries without connecting to equipment.',code:`import csv
import re
import sys

seen = set()
failed = False
with open(sys.argv[1], newline="", encoding="utf-8-sig") as handle:
    for rownum, row in enumerate(csv.DictReader(handle), start=2):
        value = re.sub(r"[\\s:.-]", "", row.get("wwpn", ""))
        if not re.fullmatch(r"[0-9a-fA-F]{16}", value):
            print(f"Row {rownum}: invalid WWPN")
            failed = True
        elif value.lower() in seen:
            print(f"Row {rownum}: duplicate WWPN")
            failed = True
        else:
            seen.add(value.lower())
raise SystemExit(1 if failed else 0)
`},
 {id:'powermax-shell',title:'PowerMax inventory capture',language:'Shell',note:'Read-only example for a management host with Solutions Enabler configured. Set ARRAY_SID first. Output files are created with owner-only access.',code:`#!/usr/bin/env bash
set -euo pipefail
umask 077
: "\u0024{ARRAY_SID:?Set ARRAY_SID to the target array SID}"
[[ "$ARRAY_SID" =~ ^[0-9]+$ ]] || exit 2
capture_dir="powermax-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir "$capture_dir"
symcfg list > "$capture_dir/arrays.txt"
symdev -sid "$ARRAY_SID" list > "$capture_dir/devices.txt"
symaccess -sid "$ARRAY_SID" list view > "$capture_dir/masking-views.txt"
printf 'Saved inventory to %s\\n' "$capture_dir"
`},
];
export const PROMPTS = [
 {id:'triage',title:'Incident evidence review',role:'Storage incident analyst',instructions:'Review the supplied observations. Separate observed facts, hypotheses and missing evidence. Build a timeline. Suggest read-only checks first. Do not infer counter rates from a single snapshot or claim that a command has been executed.'},
 {id:'change',title:'Change plan review',role:'Storage change reviewer',instructions:'Review the proposed change for dependencies, sequence, validation, rollback limits and impact. Identify assumptions about active zoning, HA and host paths. Require exact platform and software versions before selecting version-dependent commands.'},
 {id:'capacity',title:'Capacity forecast',role:'Storage capacity planner',instructions:'Use the supplied usage samples and dates to calculate growth only when data supports it. State units and distinguish provisioned, logical and physical capacity. Explain headroom, assumptions and uncertainty; request missing retention and growth information.'},
 {id:'automation',title:'Automation code review',role:'Storage automation reviewer',instructions:'Review this automation for input validation, credential handling, TLS verification, pagination, timeouts, idempotency and rollback. Explain which actions read state and which change it. Do not invent successful execution results.'},
];
export const SOURCES = [
 ['Pure Storage / Everpure documentation', PURE_DOCS.portal],
 ['FlashArray family datasheet', PURE_DOCS.family],
 ['Requested Pure topic reference', PURE_DOCS.reference],
 ['NetApp command reference', 'https://docs.netapp.com/us-en/ontap-cli/'],
 ['NetApp ONTAP REST API', 'https://docs.netapp.com/us-en/ontap-restapi/'],
 ['Cisco MDS show commands', VENDORS.cisco.source],
 ['Cisco zoning procedure', 'https://www.cisco.com/c/en/us/support/docs/storage-networking/storage-networking/200230-SAN-How-To-Zoning-Methods.html'],
 ['Dell Solutions Enabler documentation', VENDORS.powermax.source],
 ['Broadcom Fabric OS command reference (8.2.x)', VENDORS.brocade.source],
];
