# HPE storage coverage

Reviewed 2026-11-13. Original summaries and planning guidance use official HPE product/developer/support references linked in the application. No third-party articles or site implementation were copied.

## Portfolio

- Alletra Storage MP B10000: enterprise block and configuration-dependent file services.
- Alletra Storage MP X10000: object/S3-oriented workload evaluation.
- GreenLake File Storage MP: VAST-based file platform; NFS/SMB planning.
- Alletra 5000/6000 and Nimble: Array OS / NimbleOS lineage.
- Alletra 9000, Primera and 3PAR: virtual-volume/CPG/VLUN lineage.
- MSA: Gen7 2070/2072 and installed-base generation context.
- XP8: enterprise block platform.
- StoreEasy: Windows-based file services.
- StoreOnce: backup-target integration.
- StoreEver: tape-library/media planning.

The explorer filters by block, file, object, backup or tape and workload text. It is an educational shortlist, not a purchasing or sizing certification. Lifecycle and SKU availability are not asserted. GreenLake management and InfoSight analytics are distinguished from physical storage families.

## Platform CLI

24 inspection examples, eight per dialect: Alletra 9000 CLI v9.3 lineage, NimbleOS 5.3, and HPE MSA Gen7 migration guidance. Exact commands must be checked for installed firmware and permissions. Sources:

- https://support.hpe.com/hpesc/public/docDisplay?docId=a00113782en_us
- https://infosight.hpe.com/InfoSight/media/cms/active/public/pubs_Command_Reference_5_3.pdf
- https://www.hpe.com/psnow/doc/a50011807enw
- https://support.hpe.com/hpesc/public/docDisplay?docId=sd00004395en_us

The shared command desk labels the family on every HPE command. These dialects are not generalized to MP, XP, StoreEasy, StoreOnce or tape. The site does not run commands, authenticate to APIs or certify output against live equipment.

## Workflows

Eight tabs cover overview, systems, CLI, provisioning planning, protection, upgrades, automation and resources. Worksheet generation varies by block, object, file, backup or tape architecture, exports plain text, and clears stale output after edits. Inputs are not persisted. Protection and upgrade guidance require family-specific documentation and do not promise firmware downgrade or automatic rollback. Automation guidance links official MP interfaces and CSI backend support documentation; it does not invent a universal HPE endpoint.

Portfolio and interoperability references:

- https://developer.hpe.com/platform/hpe-storage/home/
- https://developer.hpe.com/platform/hpe-alletra/home/
- https://www.hpe.com/psnow/doc/a50006986enw.html
- https://www.hpe.com/us/en/collaterals/collateral.a50009222enw.html
- https://www.hpe.com/psnow/doc/a00073544enw
- https://buy.hpe.com/us/en/fileandbackupsolutions
- https://www.hpe.com/us/en/products/storage/storeonce.html
- https://www.hpe.com/emea_europe/en/products/storage/storeever-tape-storage.html
- https://www.hpe.com/storage/spock
- https://scod.hpedev.io/csi_driver/index.html

Some support references require login or entitlement. Browser and unit tests validate website behavior, not equipment compatibility or command execution.
