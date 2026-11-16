# Storage Engineering Hub

A browser-based storage engineering toolkit created for **Suresh Kumar Darisi**.

**Website:** https://darisisuresh.github.io/storage-engineering-hub/

This repository contains an independent implementation with a fresh Git history. Application source, interface, checklists, and automation examples were newly written for this project. Vendor command names describe the relevant vendor interfaces; this project is not affiliated with or certified by those vendors.

## Features

| Workspace | Capabilities |
| --- | --- |
| Popular articles & utilities | 13 featured topics with search/type/vendor filters; original SRDF and PowerMax allocation/deallocation guides; task banks; cylinder converter, classic SYMDEV decoder, batch WWN formatting, device-list formatting, and links to existing Pure tools |
| Storage Evolution | 64 dated milestones and 120 model/generation labels (1995–2026) for Dell/EMC, NetApp, Pure and HPE/HP; timeline, yearly comparison, model index, source notes, filters, bookmarks and CSV evidence export |
| Vendor commands | 91 read-only inspection entries for NetApp ONTAP, Dell PowerMax, Pure Storage FlashArray, HPE Storage, Cisco MDS and Brocade FOS; editable parameters; search; saved favorites |
| HPE Storage | Ten product families; workload/data-type explorer; 24 inspection examples across three CLI dialects; family-specific worksheet export; protection, upgrade and API/CSI guidance |
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

### Browser integration checks

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:browser
```

The runner packages the static application, starts a temporary local server, runs all ten suites sequentially and fails on any suite failure. CI deploys that exact tested artifact. `TEST_URL` optionally targets an existing deployment; `BROWSER_SUITES` selects named suites for focused verification. Failure screenshots are retained in ignored `test-artifacts/`. Playwright is a pinned development dependency; the website has no runtime dependencies.

## Deployment

The GitHub Actions workflow checks syntax, release metadata, all 122 catalog commands, unit tests and all ten browser suites on pull requests and main pushes. Pages deployment depends on successful validation and publishes the same 52 packaged application files. PR jobs have read-only permissions and cannot deploy. A manual dispatch is also available. Repository branch-protection requirements are managed separately.

## Pure Storage workspace

Open [Pure Storage](https://darisisuresh.github.io/storage-engineering-hub/#pure/overview). This independently written extension covers the topic areas in the [requested reference](https://www.rajeshvu.com/storage/pure/), with an in-app coverage map linking each source topic to its replacement. It does not reproduce the original articles, website code, images or command list wholesale.

The command desk includes 35 read-only Pure entries; the dedicated Pure reference additionally labels change examples. Builders require complete captured FlashArray evidence, identity matching and named human review, and support multiple FC/iSCSI/NVMe hosts, optional new host groups, volume sequences, private/shared connections, explicit collision-checked bounded LUN sequences, disconnection, and destruction drafts. All builders run locally and export text. Destruction drafts omit eradication, block unresolved dependencies/retention policy, and withhold automatic recovery commands. No infrastructure action is performed. Builder inputs are not persisted.

Model pages separate historical identifiers from family guidance and intentionally omit stale performance/capacity figures. The local assistant performs catalog matching, not model inference. Prompt composition does not contact a provider. Read the exact installed release documentation before using an example.

Run additional checks with `node tests/pure-browser.cjs` in the same Playwright environment described above.

## Popular Articles & Utilities

The [Popular tab](https://darisisuresh.github.io/storage-engineering-hub/#popular) covers the 13 items featured on the reviewed [reference homepage](https://www.rajeshvu.com/), with original local explanations and links to the original references. Its question banks intentionally describe the local inspection catalog rather than copying the reference’s complete question collections.

Four newly written utilities run locally: explicit-geometry cylinders/tracks/byte conversion with GB vs GiB and separate rounding; classic Symmetrix NAA decoding with unsupported-layout rejection; bulk WWN separator formatting; and hexadecimal device-list formatting with optional deduplication/sorting. Pure volume creation reuses the existing builder. The classic decoder must not be used to infer the current owner of migrated, non-native or unsupported NAA layouts. Inputs are not persisted.

Additional browser checks: `node tests/popular-browser.cjs`.

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

## HPE Storage workspace

Open [HPE Storage](https://darisisuresh.github.io/storage-engineering-hub/#hpe/overview). See [HPE_COVERAGE.md](HPE_COVERAGE.md) for included families, CLI baselines, references and limits. `node tests/hpe-browser.cjs` verifies explorer filters, family-scoped commands, worksheet generation/export, safe rendering and responsive layouts.

## Storage Evolution

Open [Storage Evolution](https://darisisuresh.github.io/storage-engineering-hub/#evolution). The curated research distinguishes announcements, shipping, scheduled availability and documentation milestones. It preserves date precision and marks research gaps. See [EVOLUTION_COVERAGE.md](EVOLUTION_COVERAGE.md) for the full source-linked catalog and scope. Run `node tests/evolution-browser.cjs` for the timeline integration suite.

## Author bio

The [About, bio & sources](https://darisisuresh.github.io/storage-engineering-hub/#about) page includes Suresh Kumar Darisi’s short professional bio and public profile links. Role, focus areas and professional memberships were taken from the public GitHub profile reviewed on 2026-11-14.

## Versioned safety releases

See [GitHub releases](https://github.com/darisisuresh/storage-engineering-hub/releases), [CHANGELOG.md](CHANGELOG.md), [P0 review tracking](docs/P0_REVIEW.md), and the [offline evidence contract](docs/CHANGE_EVIDENCE.md). SAN zoning requires fresh complete imported state and human review; rollback requires a distinct post-change capture. Supplied evidence is not live verification. Evidence and reviewer details are not persisted.

Pure builders use the [Pure evidence contract](docs/CHANGE_EVIDENCE.md#pure-storage-flasharray). Unsupported, incomplete or ambiguous state blocks output. An offline pass is not live device verification.


## Architecture, privacy and contribution policy

See [the architecture guide](docs/architecture/README.md) for routing, shared components, storage, export and tool boundaries. The site remains buildless with no runtime dependencies. [P2 review tracking](docs/P2_REVIEW.md) records the scope and verification.

In About, turn off **Save toolkit inputs in this browser** for session-only use, remove saved toolkit inputs, or download the [privacy statement](privacy.txt). Enter synthetic or redacted data only; imported evidence, reviewer controls and prompt inputs are excluded from toolkit persistence. Clipboard copies, downloads and other open tabs require separate handling.

See [SECURITY.md](SECURITY.md) for private reporting and the offline trust boundary, and [CONTRIBUTING.md](CONTRIBUTING.md) for changes. [LICENSE](LICENSE) preserves the project's existing **all rights reserved** terms.


## Storage Performance Analyzer

Open [Storage Performance Analyzer](https://darisisuresh.github.io/storage-engineering-hub/#performance) from the sidebar. Import/paste a redacted CSV or explore the labeled synthetic demo; map columns and units, select workloads and UTC windows, and compare IOPS, throughput, reported P95/P99 latency, queue depth and capacity. Inspect baseline shifts, trend flags, coverage/gaps and source-record evidence, then export analysis JSON or normalized CSV. Data stays in active page memory and is discarded on leaving the analyzer or reloading.

See [the analyzer guide](docs/PERFORMANCE_ANALYZER.md) for accepted CSV, units, calculations and limits. Findings are adjustable heuristic observations, not a root-cause diagnosis or equipment certification. `tests/performance.test.mjs` and the required `tests/performance-browser.cjs` cover analysis and user workflows.
