# November 15 review: P0 remediation

Review supplied by the owner: https://chatgpt.com/share/6afa595a-f854-83ea-a288-b94698eae6c3

The review was retrieved in Chromium after the static URL returned a preview-only page. It is a source-level review, not an equipment validation report.

| Finding | Release | Status |
| --- | --- | --- |
| P0-1: zoning requires existing-object checks, captured configuration, ownership and rollback dependency checks | v1.1.0 | Addressed for supported, normalized offline evidence; see validation and trust limits below |
| P0-2: Pure changes require imported state, capacity, object/mapping and dependency validation | Planned v1.2.0 | Open in v1.1.0 |

## P0-1 implementation

Generation fails closed unless the user imports complete captured inventory for both independent fabrics and a reviewed original backup reference. The validator checks capture freshness (24 hours maximum; future dates blocked), profile/release/mode, health, default-deny policy, pending transactions, active configuration, resolved memberships, object namespace conflicts, existing WWPN aliases, and online initiator/target role evidence.

A private in-memory ownership manifest is created only after validation. Imported JSON cannot serve as an executable ownership plan. A second, distinct fresh snapshot is required before rollback is exposed. The checker compares switch identity, release/mode, baseline aliases and zones, the exact generated objects and original configuration memberships, and blocks newly introduced configuration dependencies or drift. Backout restores only the ticket’s configuration membership changes; zones and aliases remain, avoiding unattended deletion of referenced objects.

The page requires a named reviewer, ticket, original snapshot confirmation and verification of the release-specific vendor procedure. Any edits clear drafts; proposal edits invalidate review. Exports recheck evidence freshness and contain ownership, source snapshot and reviewer metadata. Evidence is not placed in localStorage.

## Capture contract and limitations

See docs/CHANGE_EVIDENCE.md and schemas/zoning-evidence.schema.json. Raw CLI outputs are not heuristically parsed or trusted as complete; the operator must normalize and reconcile them against the original external backups. Peer/smart/IVR/raw-WWPN or otherwise unresolved zoning is unsupported and must use a separate vendor-reviewed procedure.

Official syntax scopes:
- Cisco MDS NX-OS 9.x: https://www.cisco.com/c/en/us/td/docs/dcn/mds9000/sw/9x/configuration/fabric/cisco-mds-9000-nx-os-fabric-configuration-guide-9x/configuring_and_managing_zones.html
- Brocade FOS 8.2.x: https://docs.broadcom.com/doc/FOS-82x-Command-RM

Passing local validation does not prove the imported state is truthful, current at execution time or compatible with every hardware/software combination. No switch is queried, and no lab or production execution is claimed. A human must recheck current state immediately before applying a draft and stop on any divergence.

## Closure evidence

- tests/zoning-safety.test.mjs: missing/example/partial/stale/future evidence; unsupported profiles/modes; conflicts; wrong roles; unresolved inventory; ownership, identity, membership and dependency drift; rollback retention behavior on both dialects.
- tests/core.test.mjs: existing zoning and calculation regression checks now use explicit captured-state fixtures.
- tests/zoning-safety-browser.cjs: UI gating, real file import, reviewer invalidation, rollback state checks, exports and responsive rendering.

P1/P2 requests in the review remain separate work: browser CI/PR gates, broader command metadata, RAID presentation, architectural restructuring, licensing and optional new analyzers are not claimed as fixed by this P0 release.
