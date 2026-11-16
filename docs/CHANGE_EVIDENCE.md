# Offline change evidence

The website accepts operator-normalized JSON evidence, not arbitrary pasted CLI as an authoritative inventory. Imports are processed in memory and are not uploaded or stored in localStorage. Save original configurations outside the browser before a change.

## SAN zoning

1. Capture both independent switch configurations, software versions, active and defined zoning, device aliases, transactions, VSAN/mode, health and login identities. Verify initiator/target roles against host and storage inventory. Record a unique snapshot ID, actual UTC capture time and external backup reference.
2. Normalize the entire relevant inventory into the downloaded template, reconciling every alias, zone and configuration membership. Cisco needs the global device-alias database plus complete zoning for the selected VSAN; do not omit inactive objects. Brocade requires the complete relevant zoning namespace. Mixed/unknown releases, unsupported peer/smart/IVR zoning and unresolved/raw memberships are blocked.
3. Replace all example values with captured facts and change `exampleOnly` to false only for real operator-reconciled evidence. The template itself cannot authorize a draft. Set inventoryComplete only when the complete inventory was checked.
4. Review the proposal, original saved snapshot, exact release documentation, privileges, approved ticket and recovery conditions. The generator accepts only documentation-scoped NX-OS 9.x or FOS 8.2.x profiles; it does not claim lab testing.
5. Immediately before applying, repeat read-only checks and compare with the baseline; stop on drift. Use your organization’s execution/change approval process. The website never applies a command.
6. For rollback, capture a second distinct snapshot after the change. Re-enter the original ticket and reviewer confirmations. The checker verifies original and owned objects and blocks membership/dependency drift. Aliases/zones are retained; their deletion needs a separate cleanup procedure.

A missing or incomplete snapshot, unsupported state, absent review, stale/future capture, conflict or mismatched identity blocks output. A pass means only that the supplied data satisfies these rules, not that the real equipment was verified.
