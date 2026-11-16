# Application architecture

Storage Engineering Hub remains a buildless ES-module application. No framework, bundler or runtime package is required. `app.js` is the composition root: it connects routes, the current in-memory state, views and event handlers. Tools receive an explicit context; live getters prevent stale state after clearing data.

| Boundary | Responsibility |
| --- | --- |
| `src/core/router.js` | Established hash routes, fallback, navigation markup and route focus/scroll behavior |
| `src/ui/components.js`, `icons.js` | Shared escaping, fields, tabs, titles, code blocks and SVG icons |
| `src/ui/search.js`, `transfers.js` | Global search and keyboard behavior; clipboard/download transport |
| `src/core/persistence.js` | Legacy `seh-v1` migration, supported-field projection, session-only mode and removal/error handling |
| `src/core/exporters.js` | Pure text composition for incident handoffs, upgrade readiness and prompts; deterministic timestamps can be supplied in tests |
| `src/tools/commands.js` | Command filtering, saved-only state, editable command cards and release metadata |
| `src/tools/calculators.js` | Calculator view and form handling; engineering formulas remain in `core.js` |
| `src/tools/zoning.js` | Zoning evidence/review form and output rendering; safety/ownership rules remain in `zoning-safety.js` and `safety-core.js` |
| `src/tools/overview.js`, `reference.js`, `operations.js`, `automation.js`, `prompts.js`, `about.js` | Individual existing tool views; `pages.js` composes their factories |
| Root `pure-*`, `hpe-*`, `evolution-*`, `popular*` | Existing vendor/research/utility modules; their public imports remain stable |
| `src/styles/` | Ordered workspace, Pure, Popular, HPE, Evolution and command styles, imported by `styles.css` |

## Data and safety

Saved inputs use the same `seh-v1` key. Reads tolerate missing/malformed data. Writes select supported fields and command parameters; evidence, reviewer controls and prompt contents are excluded. Session-only mode removes durable toolkit inputs and stores only a tab-level setting. Imported evidence remains an untrusted operator assertion. Neither UI refactoring nor browser testing changes P0 authorization, freshness, ownership or dependency rules.

## Packaging and validation

`scripts/site-files.mjs` is the explicit deployment manifest. `package-site.mjs` copies only regular allowlisted assets into `_site`, creates nested directories and rejects unexpected existing entries or symlinks. It does not upload repository files, tests, development dependencies or captures. The browser runner serves only that manifest and runs all nine suites sequentially. CI deploys the same tested artifact after validation.

`npm run check` validates syntax of every packaged JS module, local static import/style/shell asset references, the privacy statement's download parity, release metadata and catalog records. This local-reference check does not test external vendor links or replace an AST security scanner. `npm test` covers engineering and safety behavior plus storage migration, route contracts and exporters. `npm run test:browser` checks the application and both adversarial safety workspaces.

Keep a tool's rendering and state handling in its own module. Reuse shared escaping/components; use `textContent` for user input. Add assets to the manifest and keep route/storage compatibility when extending the app. Do not add live equipment connections or silently claim new vendor support as part of a UI refactor.
