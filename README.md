# Storage Engineering Hub

A browser-based storage engineering toolkit created for **Suresh Kumar Darisi**.

**Website:** https://darisisuresh.github.io/storage-engineering-hub/

This repository contains an independent implementation with a fresh Git history. Application source, interface, checklists, and automation examples were newly written for this project. Vendor command names describe the relevant vendor interfaces; this project is not affiliated with or certified by those vendors.

## Features

| Workspace | Capabilities |
| --- | --- |
| Vendor commands | 67 read-only inspection entries for NetApp ONTAP, Dell PowerMax, Pure Storage FlashArray, Cisco MDS and Brocade FOS; editable parameters; search; saved favorites |
| Pure Storage | 66 command examples across 13 families; 66 task answers; 10 current-family/historical-catalog entries; provisioning and protection guidance; five validated CLI builders; local assistant and prompt composition; Remote Assist lifecycle |
| SAN zoning | Independent Fabric A/B inputs; Cisco or Brocade syntax; SIST and SIMT; multiple targets; strict WWPN/name/VSAN validation; rollback; text ticket export |
| CLI equivalents | Five curated operational task comparisons across five vendor families |
| Calculators | RAID 5/6/10 with spares; TB/TiB distinction; IOPS to MB/s and MiB/s; data transfer time; WWPN normalization |
| Incident playbooks | Four evidence-oriented checklists; locally saved progress and notes; handoff downloads |
| Upgrade planning | Five platform readiness checklists; current/target release and ticket fields; local progress; export |
| Automation | Original Python, Ansible and shell examples for read-only inventory or local validation; copy and file download |
| AI prompt composer | Four structured prompt types that incorporate custom context; copy and download; no model connection or simulated diagnosis |
| Application | Global command search (Ctrl/Cmd+K); light/dark themes; responsive navigation; keyboard focus states |

The toolkit generates text and performs local calculations. It does not execute commands, monitor infrastructure, retrieve telemetry or call an AI model. Device syntax and nondisruptive upgrade availability must be checked against the installed model and software release. Zoning assumes existing configuration names, new aliases/zones, and pre-existing members that remain after rollback.

## Run locally

The application has **no runtime dependencies and no build step**. Serve the directory over HTTP so ES modules load correctly:

```sh
python3 -m http.server 3000
```

Open http://localhost:3000/.

Node.js 22+ is used only for verification:

```sh
npm run check
npm test
```

There is no dependency installation requirement for those checks. Tests cover WWPN validation, RAID calculations and edge cases, units, Cisco/Brocade zoning and rollback, input rejection, and catalog consistency.

### Optional browser integration check

With the local server running, install Playwright in your preferred test environment and make Chromium available:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.cjs
```

`PLAYWRIGHT_MODULE` may point to an existing Playwright installation. `TEST_URL` defaults to http://127.0.0.1:3000/. Browser checks cover all major workflows, exports, persistence and responsive route rendering. Screenshots are written to the OS temporary directory.

## Deployment

The GitHub Actions workflow checks syntax, runs logic tests, packages exactly nine application files and publishes GitHub Pages. It has a manual dispatch trigger as well as a push trigger for `main`.

## Pure Storage workspace

Open [Pure Storage](https://darisisuresh.github.io/storage-engineering-hub/#pure/overview). This independently written extension covers the topic areas in the [requested reference](https://www.rajeshvu.com/storage/pure/), with an in-app coverage map linking each source topic to its replacement. It does not reproduce the original articles, website code, images or command list wholesale.

The command desk includes 35 read-only Pure entries; the dedicated Pure reference additionally labels change examples. Builders support multiple FC/iSCSI/NVMe hosts, optional new host groups, volume sequences, private/shared connections, optional bounded LUN sequences, disconnection, and destruction drafts. All builders run locally and export text. Destruction drafts omit eradication and treat recovery as policy-dependent. No infrastructure action is performed. Builder inputs are not persisted.

Model pages separate historical identifiers from family guidance and intentionally omit stale performance/capacity figures. The local assistant performs catalog matching, not model inference. Prompt composition does not contact a provider. Read the exact installed release documentation before using an example.

Run additional checks with `node tests/pure-browser.cjs` in the same Playwright environment described above.

## Browser data

Favorites, command parameters, zoning inputs, theme, incident notes, upgrade fields and checklists are saved under the `seh-v1` localStorage key. Prompt contents are not persisted. The About page can clear saved toolkit data after confirmation. Normal hosting requests are handled by GitHub Pages; the application uses no analytics or external scripts/fonts.

## Source references

Syntax review uses vendor documentation, linked in the app:

- [Pure Storage / Everpure documentation portal](https://support.everpuredata.com/)
- [FlashArray family datasheet](https://www.everpuredata.com/content/dam/pdf/en/datasheets/ds-everpure-flasharray-family.pdf)
- [Official FlashArray provisioning example](https://support.everpuredata.com/r/proxmox/proxmox-pbs-quickstart)
- [NetApp ONTAP command reference](https://docs.netapp.com/us-en/ontap-cli/)
- [NetApp ONTAP REST API](https://docs.netapp.com/us-en/ontap-restapi/)
- [Cisco MDS command reference](https://www.cisco.com/c/en/us/td/docs/dcn/mds9000/sw/9x/command/cisco-mds-9000-nx-os-command-reference-guide-9x/show_commands.html)
- [Cisco zoning procedures](https://www.cisco.com/c/en/us/support/docs/storage-networking/storage-networking/200230-SAN-How-To-Zoning-Methods.html)
- [Dell Solutions Enabler documentation](https://www.dell.com/support/manuals/en-us/solutions-enabler/)
- [Broadcom Fabric OS 8.2.x command reference](https://docs.broadcom.com/doc/FOS-82x-Command-RM) (version-specific)

Copyright © 2026 Suresh Kumar Darisi. All rights reserved.
