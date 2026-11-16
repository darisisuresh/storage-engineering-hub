# Changelog

Versioned releases record completed changes, their validation and remaining limits. No earlier tag is rewritten.

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
