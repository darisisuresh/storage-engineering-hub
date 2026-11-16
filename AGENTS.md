# Repository publishing instructions

The owner requests versioned GitHub releases for fixes, with a record of additions and updates.

For each published fix or coherent change set:
- Increment the semantic version in package.json and release-info.js together.
- Add a dated CHANGELOG.md entry separating Added, Updated/Changed and Fixed as applicable; record meaningful validation and remaining limits.
- Run npm run check, npm test and the browser suites affected by the change. Changes to planning safeguards must include adversarial fixtures; never weaken safeguards to preserve old tests.
- Commit the reviewed change, publish its immutable vX.Y.Z tag/GitHub release with that version’s notes, and verify Pages deployment before reporting it live. Do not retag or rewrite an existing version.
- Record the exact scope and closure evidence for externally reviewed P0 findings in docs/P0_REVIEW.md. Do not claim equipment/lab verification from unit or browser tests.

Keep evidence, credentials, raw production captures and reviewer inputs out of Git and browser persistence. Templates and synthetic test fixtures must be unmistakably identified as examples; never enable example evidence as an approved default.
