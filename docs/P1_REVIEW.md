# P1 review fixes — v1.3.0

Review: https://chatgpt.com/share/6afa595a-f854-83ea-a288-b94698eae6c3

## Scope and closure

| Finding | Change | Evidence |
| --- | --- | --- |
| Browser suites absent from CI | Read-only validation runs on PRs, main pushes and dispatch. All eight Chromium suites must pass before the deployment job starts. The exact tested `_site` artifact is uploaded once and deployed unchanged. | `.github/workflows/pages.yml`, `scripts/run-browser-tests.mjs`; both P0 adversarial browser suites retained |
| RAID assumptions unclear | Labels say theoretical, not provisionable. Results separate raw capacity, dedicated spare capacity and parity/mirror capacity. Equal drives, one group, units, vendor metadata/system reserves, snapshots, headroom and data-reduction exclusions are explicit. Invalid/overflow inputs fail. | `tests/core.test.mjs`, `tests/p1.test.mjs`, `tests/p1-browser.cjs` |
| Insufficient command provenance and release metadata | All 122 distinct catalog commands carry product scope, minimum tested release, tested-release list, required privileges, operational risk, official reference, validation status and review/validation dates. Shared command desk, Pure/HPE references and catalog-backed question/guide cards expose metadata. Installed-release fields show explicit unverified status. | `scripts/validate-catalog.mjs`, `tests/p1.test.mjs`, `tests/p1-browser.cjs` |

## Verification and limits

Syntax/release/catalog validation and 42 unit tests pass. All eight browser suites are required by CI. The new regression checks target-release labels, unknown lab/privilege fields, escaping, capacity accounting and responsive layout. Browser runner propagates suite failures as a nonzero exit (observed during a real layout regression and corrected before release).

No physical storage equipment was tested. Minimum tested release, required privileges and review/validation dates intentionally remain null, and testedReleases remains empty; these are visible unknowns, not manufactured compatibility assertions. The validator rejects unsupported verification claims until an evidence-backed validation workflow is added. Official links can require vendor entitlement and may be family-level references. Selecting a release never promotes a command to verified.

Tutorial/translation/automation snippets outside the command catalog remain educational examples and are not certified procedures. P0 reviewed planning gates remain separate and unchanged. RAID estimates are not vendor-specific sizing calculations. Branch-protection/ruleset settings have not been changed; CI deployment itself is blocked on validation failure. P2 restructuring, licensing and new analyzers remain outside this release.
