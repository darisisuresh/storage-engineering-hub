# Changelog

Versioned releases record completed changes, their validation and remaining limits. No earlier tag is rewritten.

## [1.3.0] — 2026-11-15

### Fixed
- P1 browser validation now gates Pages deployment and runs on pull requests, including both P0 adversarial browser suites.
- RAID results explicitly identify theoretical capacity and break out dedicated spares versus parity/mirrors, with units and vendor exclusions.
- Every catalog command carries product, risk, official reference and explicit unknown release/privilege/review metadata. Selected releases remain visibly unverified; no lab testing is implied.

### Added
- Pinned Playwright development dependency, reproducible static packaging, browser runner and catalog validation.
- Release target fields in the shared, Pure and HPE command references and regression coverage for P1 behavior.

### Updated
- CI uses the exact browser-tested artifact for deployment. PR checks have read-only repository permissions.
- Validation and remaining limits are recorded in docs/P1_REVIEW.md. These checks do not certify vendor equipment or command compatibility.

## [1.2.0] — 2026-11-15

### Fixed
- Zoning evidence now cross-validates effective versus defined active memberships and captured switch model/per-switch release; divergent or mixed state is blocked.
- **P0-2, Pure change planning:** all five builders now require complete, fresh, array-identity-matched evidence, captured release-specific CLI help capabilities and a named change review before exposing CLI.
- Host creation blocks existing names/groups and initiator ownership conflicts. Volume creation blocks existing/pending-destroy names and checks conservative exact-byte physical/logical budgets and pod state.
- Connections require existing owners/volumes and explicit collision-checked LUNs; existing/shared mappings and overlapping host groups require separate review. Disconnections require the exact mapping, recorded ownership/quiescence and known dependency state.
- Destruction blocks remaining host/group connections, snapshots, protection groups, replication, pods, retention locks, missing retirement approval and unknown/SafeMode recovery policies.
- Automatic Pure inverse/recovery commands are withheld pending fresh post-change evidence and a separate reviewed procedure. Copy/export controls recheck freshness and exports include array, release, snapshot, reviewer and ownership metadata.

### Added
- Pure evidence template/schema and capture guidance; adversarial unit and browser checks, including imported malformed/partial inventories, capacity and mapping conflicts, and review invalidation.

### Updated
- Pure builder UI, documentation and browser regression fixtures to require explicit imported evidence. Templates remain blocked; production evidence/reviewer data is not persisted.

### Validation and limits
- Syntax/version checks, 40 Node tests, dedicated Pure and zoning safety browser checks, and existing main, Pure, Popular, HPE and Evolution browser regressions.
- Both reviewed P0 findings are addressed within the supported offline planning scope. No device was queried or changed; operator-normalized state, capture truthfulness, hardware compatibility and command execution are not independently verified. Unmodeled cases fail closed and require a separate vendor-reviewed procedure.
- P1/P2 review items remain outside this release; see docs/P0_REVIEW.md.

## [1.1.0] — 2026-11-15

### Fixed
- **P0-1, SAN zoning:** executable drafts require complete, fresh, operator-supplied state for both fabrics plus named ticket/snapshot/syntax review. Existing names/WWPN aliases, wrong login roles, missing active configurations, unsupported syntax profiles, pending transactions and unresolved inventory block generation.
- Rollback CLI is withheld until a distinct post-change capture confirms switch identity, original membership, ownership and dependencies. It removes only the ticket’s configuration memberships and retains zones and aliases for separately reviewed cleanup.
- Editing proposal, evidence or review inputs clears stale output and invalidates prior confirmation. Evidence and reviewer details are not persisted.

### Added
- Versioned evidence contract, capture templates, offline validation and audit metadata in zoning exports.
- Adversarial validation tests and browser checks for the new gated workflow.
- Release history, contribution instructions for versioning, and version/changelog consistency checks.

### Validation and limits
- Syntax checks, 34 Node tests, main browser regression and dedicated zoning safety browser checks.
- Documentation-scoped profiles: Cisco MDS NX-OS 9.x and Brocade FOS 8.2.x. No lab execution, live device verification, interoperability certification or guarantee that an operator-supplied snapshot is truthful. Recheck actual state immediately before use.
- **P0-2 remains open in this release:** Pure builders still require state-aware safeguards. The next release addresses it separately.

## [1.0.0] — 2026-11-15

### Added
- First versioned baseline at `cbc0d22483933838b88a7bca191eb76c53378269`, preserving the website state through November 14, 2026.
- Six-vendor command reference, SAN zoning drafts, calculators, incidents, upgrades, automation and prompt composition.
- Pure/HPE workspaces, popular articles/utilities, Storage Evolution research, author bio, responsive light/dark interface.

### Known limitations
- This baseline predates P0 remediation. Generated zoning and Pure changes do not validate captured device state. Subsequent safety releases replace those workflows.
