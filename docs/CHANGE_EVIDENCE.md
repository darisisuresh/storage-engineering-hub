# Offline change evidence

The website accepts operator-normalized JSON evidence, not arbitrary pasted CLI as an authoritative inventory. Imports are processed in memory and are not uploaded or stored in localStorage. Save original configurations outside the browser before a change.

## SAN zoning

1. Capture both independent switch configurations, software versions, active and defined zoning (including effective zone memberships), exact model, per-switch release, device aliases, transactions, VSAN/mode, health and login identities. Verify initiator/target roles against host and storage inventory. Record a unique snapshot ID, actual UTC capture time and external backup reference.
2. Normalize the entire relevant inventory into the downloaded template, reconciling every alias, zone and configuration membership. Cisco needs the global device-alias database plus complete zoning for the selected VSAN; do not omit inactive objects. Brocade requires the complete relevant zoning namespace. Mixed/unknown releases, unsupported peer/smart/IVR zoning and unresolved/raw memberships are blocked.
3. Replace all example values with captured facts and change `exampleOnly` to false only for real operator-reconciled evidence. The template itself cannot authorize a draft. Set inventoryComplete only when the complete inventory was checked.
4. Review the proposal, original saved snapshot, exact release documentation, privileges, approved ticket and recovery conditions. The generator accepts only documentation-scoped NX-OS 9.x or FOS 8.2.x profiles; it does not claim lab testing.
5. Immediately before applying, repeat read-only checks and compare with the baseline; stop on drift. Use your organization’s execution/change approval process. The website never applies a command.
6. For rollback, capture a second distinct snapshot after the change. Re-enter the original ticket and reviewer confirmations. The checker verifies original and owned objects and blocks membership/dependency drift. Aliases/zones are retained; their deletion needs a separate cleanup procedure.

A missing or incomplete snapshot, unsupported state, absent review, stale/future capture, conflict or mismatched identity blocks output. A pass means only that the supplied data satisfies these rules, not that the real equipment was verified.

## Pure Storage FlashArray

Use the Pure builder’s template and schemas/pure-evidence.schema.json. Capture the actual array ID, full Purity 6.x release, array health, complete hosts/initiators, host-group membership, active and pending-destroy volumes, every private/shared connection and LUN, snapshots, protection groups, pods, capacity and retention/recovery policy. Record actual original backup and release-specific CLI-help references. Normalize the command/option capabilities only after reviewing the help for the exact captured release; examples are not capability evidence.

Enter the expected array ID independently so a wrong-array capture is rejected. Import reconciled complete state, then provide the named review and original ticket. For volume creation supply exact decimal byte strings for free physical headroom, required reserve, logical allocation budget and pod budgets where relevant. The planner uses a conservative binary-unit full-allocation budget, rounded upward, without assuming data reduction. This is a planning bound rather than certified physical sizing.

Explicit starting LUNs are required for new connections. Existing presentations and grouped-host private mappings need separate reviewed procedures. For disconnect/destroy, record actual coordinated application I/O quiescence and target ownership. Destruction also needs explicit retirement approval and known recovery evidence, with no mappings, snapshots, protection groups, replicated/pod dependencies or retention holds. SafeMode destruction/recovery is unsupported here and must follow its vendor procedure.

The builders do not emit automatic disconnect/recovery backouts. Use fresh post-change evidence and a separately reviewed vendor procedure for inverse operations. Original raw capture truthfulness is an operator responsibility. No credentials, evidence documents, file content or reviewer details are stored by the application.
