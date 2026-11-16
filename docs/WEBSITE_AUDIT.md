# Website proof and regression audit — v1.5.1

Audited November 15, 2026 (America/New_York).

## Scope

Reviewed the live v1.5.0 site and local source for wording, navigation, imports, calculations, rendering, accessibility and public reference links. All ten existing live browser suites passed before corrections; targeted inspection exposed additional paths they did not cover.

The new proof suite scans 20 representative routes in both light and dark themes (40 rendered states), including a populated synthetic performance dashboard, vendor commands, Pure question/CLI/builder views, HPE commands, evolution, calculators, planning, prompts, biography and utilities. Existing browser suites retain their broader workspace/subroute and responsive coverage. Additional keyboard and layout checks use widths 320, 390, 768 and 1440 pixels.

## Confirmed findings and corrections

| Finding | Reproduction / resulting correction |
| --- | --- |
| Skip link changed the active tool | Activating `#main` entered the hash router's fallback. The skip link now keeps the route/data and focuses/scrolls the existing main landmark. |
| Closed mobile sidebar remained in the keyboard order | CSS transforms alone did not disable links. Collapsed navigation is now inert and hidden from accessibility navigation, expands access when opened, exposes `aria-controls`, and restores the menu button on Escape. |
| Malformed file import did not show its error | Staging a file advanced the revision before parsing threw, so the asynchronous catch suppressed the error. Staging now handles parse rejection itself and reports a rejected import, with no old charts/exports. Invalid UTF-8 also rejects visibly. |
| Analyzer could retain hidden data after a same-route search refresh | Starting a fresh analyzer page now clears its closure and pending import revision. Refresh, clear and route exit all discard the working import. |
| Calculator answers remained visible after inputs changed | Calculator/WWPN edits now replace previous results with an instruction to submit again. |
| Extreme numeric inputs displayed Infinity | Throughput and transfer functions now reject overflow and unrepresentable positive results. Analyzer baseline ratios outside numeric range are null with an explicit unavailable status, not Infinity or a false zero-baseline explanation. |
| Insufficient contrast | Automated checks found 21 failing route/theme states before corrections, principally light-theme muted/Pure text, plus transitional dark-button contrast. Darkened the affected text colors and removed background transitions that temporarily mismatched button text on theme changes. |
| Awkward or misleading copy | Rephrased generated task questions, corrected canonical CSV headers and site metadata, removed an unverified Pure release-baseline implication, and described backout as a separately reviewed post-change draft. |
| Three missing research references | Confirmed 404s using GET after HEAD screening. Replaced the Dell investor URL with the original Dell newsroom announcement. Replaced missing NetApp PDF links with relevant issuer filings, retained original URL metadata and disclosed that corroborating family/model context does not independently replace every historical date claim. |

## Reference audit and limits

Screened 107 distinct public reference URLs collected from the audited routes. Initial HEAD results were 70 HTTP 200, 29 HTTP 403, 3 HTTP 404 and 5 HTTP/2 transport errors. All three 404s were confirmed with normal GET requests. Primary reference content was inspected before replacements.

Access-denied and transport-error responses are **unverified availability**, not proof of a missing page. They were not replaced with guessed references. This is a dated audit, not an ongoing external-link availability guarantee or a fresh verification of every product-history claim. Source-access notes retain the distinction between original research and current corroboration.

## Validation

- Syntax, local static asset references, release metadata and catalog checks: passed for 52 deployed assets and 122 command records.
- Unit tests: 60 passed, including calculator overflow/underflow and unrepresentable baseline ratios.
- Existing ten browser suites: passed, including both P0 adversarial planning suites.
- New website proof browser suite: passed; zero automated violations in the 40 scanned states for axe-core 4.14.0's selected WCAG 2 A/AA and WCAG 2.1 AA rules, plus keyboard/mobile navigation, malformed/UTF-8 import rejection, calculator invalidation/ranges and refresh cleanup.
- The eleven browser suites are required by the deployment workflow. The exact browser-tested artifact is deployed.

Axe is pinned as a development-only dependency. Its script is injected only into the isolated browser audit context; the production CSP and static artifact do not include it. Reduced-motion rendering keeps contrast measurements stable. Existing functional suites continue to test the normal production CSP.

Automated checks and targeted visual/keyboard review do not constitute full WCAG conformance, an independent security assessment or physical-device verification. No production captures, reviewer details or credentials were used. No equipment was queried or changed; command compatibility and P0 offline-evidence trust limits remain as documented.
