# Contributing

Start with a public issue describing a reproducible problem using synthetic or redacted inputs. Do not include credentials, customer data, production captures or sensitive change plans. Use the private security-reporting route in SECURITY.md for vulnerabilities.

Read LICENSE before proposing reuse or contributions: the project retains its existing all-rights-reserved terms. Public repository access is not an open-source license. Discuss contribution permissions and acceptance with the owner before submitting substantial new material; do not submit third-party article text, vendor manuals or code you cannot authorize.

For an agreed change:

1. Keep changes scoped to the relevant module. Read docs/architecture/README.md and AGENTS.md.
2. Preserve URL routes, browser-state migration and the offline trust boundary. Add only synthetic fixtures; never introduce approved example evidence or bypass ownership/freshness checks.
3. Add new deployable assets explicitly to scripts/site-files.mjs. Scripts, tests, private inputs and repository metadata must not enter the Pages artifact.
4. Run `npm ci`, `npx playwright install --with-deps chromium`, `npm run check`, `npm test` and `npm run test:browser`.
5. Describe the trigger, resulting behavior, validation and limits. Add vendor compatibility claims only with reviewable documentation or actual lab evidence; leave unknown fields explicit.

The publisher increments package.json, package-lock.json and release-info.js together, records dated additions/updates/fixes, publishes a new immutable release and verifies the live deployment. PR validation does not grant publishing permissions.
