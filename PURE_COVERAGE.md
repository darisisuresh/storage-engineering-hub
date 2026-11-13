# Pure Storage topic coverage

Reviewed 2026-11-13. Scope: the Pure / FlashArray section requested at https://www.rajeshvu.com/storage/pure/. This project provides original task explanations and bounded offline generators, with links for further reading. It does not copy the reference site's prose, images, source code, model-performance tables or entire question bank.

| Reference topic | Local route | Implementation |
| --- | --- | --- |
| CLI commands | #pure/cli | 66 curated examples; all 13 command families; search, impact and family filters |
| CLI question bank | #pure/questions | 66 original task-oriented answers, searchable and expandable |
| FlashArray models | #pure/models | Five family overviews and five historical catalog groups; no stale sizing figures |
| Provisioning | #pure/provisioning | Single host, cluster sharing, and protection/replication planning |
| Host creation | #pure/builders/host | Multiple hosts, validated FC/IQN/NQN initiators, optional new host group and personalities |
| Volume creation | #pure/builders/volume | Scoped names, validated sizes, bounded numeric sequences |
| Volume connection | #pure/builders/connect | Host or host group, optional sequential LUNs and targeted backout |
| Volume disconnection | #pure/builders/disconnect | Explicit targets and owner scope; reviewed-dependency acknowledgement |
| Volume destruction | #pure/builders/destroy | Explicit targets, recovery-policy precheck, acknowledgement and recovery considerations; no eradication in generated draft |
| CLI chat | #pure/assistant | Honest local catalog search plus structured provider-prompt composition; no connected model |
| Remote Assist status | #pure/remote | Read-only state check; separate, impact-labeled session access examples |

Command families: pureadmin, purealert, purearray, pureaudit, pureconfig, puredns, puredrive, purehgroup, purehost, purehw, purepod, pureport, purevol.

## Technical references

- [Official documentation portal](https://support.everpuredata.com/) — select the exact installed Purity//FA release.
- Purity//FA CLI Reference Guide 6.4.3 and 6.5.7, indexed official vendor publications, were used for syntax review. The old support-be.purestorage.com download hostname returned a certificate-name mismatch during direct retrieval; TLS verification was not disabled and no vendor PDF is redistributed. Use the current portal rather than assuming an old direct-download link is usable.
- [Official provisioning example](https://support.everpuredata.com/r/proxmox/proxmox-pbs-quickstart) and [AWS Outposts example](https://support.everpuredata.com/r/amazon-web-services-aws/everpure-flasharray-for-aws-outposts-quick-start-guide?contentId=awdlJLsVZByWksqvnSH01A) supplement host / transport syntax review.
- [Official FlashArray family datasheet](https://www.everpuredata.com/content/dam/pdf/en/datasheets/ds-everpure-flasharray-family.pdf) supplies family positioning. Historical model names are identification aids, not current lifecycle or sizing claims.

## Verification and limits

15 Node tests pass, including catalog coverage, FC normalization, qualified-name validation, duplicate initiator ownership, name injection, size/sequence validation, LUN bounds, acknowledgement, and separate destruction/recovery semantics. The existing browser suite and the Pure-specific suite pass; the latter checks five builders, exports, assistant matching, prompt escaping, models, question filtering, cross-vendor integration, and 64 responsive route/width combinations. Desktop, mobile and dark screenshots were reviewed.

No commands were executed against equipment. Version-neutral planning does not certify upgrade readiness. Exact personality support, capacity interpretation, maximum LUN values, SafeMode and retention behavior require deployment-specific validation. The builder conservatively limits explicit LUN sequences to 1–4095; it does not query collisions or existing connections.
