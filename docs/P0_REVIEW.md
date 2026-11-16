# November 15 review: P0 remediation

Review supplied by the owner: https://chatgpt.com/share/6afa595a-f854-83ea-a288-b94698eae6c3

The review was retrieved in Chromium after the static URL returned a preview-only page. It is a source-level review, not an equipment validation report.

| Finding | Release | Status |
| --- | --- | --- |
| P0-1: zoning requires existing-object checks, captured configuration, ownership and rollback dependency checks | v1.1.0 | Addressed for supported, normalized offline evidence; see validation and trust limits below |
| P0-2: Pure changes require imported state, capacity, object/mapping and dependency validation | v1.2.0 | Addressed for supported, normalized offline evidence; see trust limits |

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

P1 requests were addressed separately in v1.3.0; see [P1_REVIEW.md](P1_REVIEW.md) for browser CI/PR gates, command metadata and RAID presentation. P2 architecture and documentation are addressed separately in [P2_REVIEW.md](P2_REVIEW.md); optional new analyzers remain roadmap features.

## P0-2 implementation (v1.2.0)

Every Pure builder requires complete fresh FlashArray identity-matched inventory, a full Purity 6.x release, a captured reference to release-specific CLI help and declared command/option capabilities, and a named ticket/snapshot/syntax review. Missing/partial/example/stale/future evidence, unknown releases, array mismatch, unhealthy/pending state and absent command capabilities block all generated changes. Capability data is operator-normalized; the website does not parse or certify the underlying CLI help.

Host creation checks existing hosts/groups and initiator ownership. Volume creation checks active and pending-destroy names, explicit pod availability/state and physical/logical allocation budgets using exact BigInt arithmetic. The conservative byte budget uses binary unit multipliers and rounds upward, reserves the supplied physical headroom, and assumes no compression or deduplication savings; it is not a vendor capacity-sizing certification.

Connections require existing active volumes and owner identities, explicit LUNs, and checks across owner/group member mappings. Existing presentations, ambiguous group overlap or replicated/retention/pod ambiguity fail closed. Disconnections require exact captured mappings and recorded ownership, quiesced I/O and known dependency state. Destruction requires explicit retirement approval and blocks any remaining host/group mappings, snapshots, protection groups, replication, pod/retention dependencies or unknown/SafeMode recovery policy. These are deliberately conservative supported cases; manual vendor-reviewed procedures are required for everything else.

Inverse changes and recovery commands are withheld rather than offered as an unconditional backout. Fresh post-change evidence and a separate reviewed recovery procedure are required. Export records include the array, release, snapshot, help reference, reviewer, ticket and object ownership, and recheck freshness. Edits invalidate review/output. No evidence or reviewer data is persisted.

Closure evidence: tests/pure-safety.test.mjs, tests/pure.test.mjs, tests/pure-safety-browser.cjs and the Pure browser regression. The full local suite has 40 passing unit tests plus syntax/version checks. No FlashArray was queried or changed. Passing checks cannot prove a supplied capture is truthful or still matches equipment at execution time.

The v1.2.0 zoning contract also cross-checks captured effective zoning against the defined active configuration and requires the exact model and per-switch release. Mixed/unmodeled states are blocked rather than assumed compatible.
