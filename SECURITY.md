# Security policy

## Supported version

Security fixes target the latest published release and main. Older releases are historical snapshots. See GitHub Releases for current versions and CHANGELOG.md for changes.

## Reporting

Use the repository's **Security → Advisories → Report a vulnerability** page:
https://github.com/darisisuresh/storage-engineering-hub/security/advisories/new

Submit a minimal synthetic reproduction, affected release/route, expected and observed behavior, and impact. Do not submit production evidence, credentials or unredacted customer data. If the private reporting page is unavailable, use the owner's public profile contact information to arrange a private channel before sharing sensitive details. Do not publish exploit details in a public issue before coordination. No response-time commitment or bug bounty is offered.

## Trust boundary

- The application does not connect to storage equipment, execute CLI, call an AI API or send application telemetry. Normal GitHub Pages requests and links opened to external sites remain outside that application boundary.
- Browser inputs and imported evidence are untrusted. Render variable content as text or through the shared escaping helper. Keep the CSP and vendor-source restrictions intact.
- Structured imported captures are operator assertions, not authenticated live state. Freshness, identity, ownership, dependencies and reviewer checks are mandatory for supported plan generation. Example fixtures cannot authorize changes.
- Generated plans are offline drafts. Independent exact-release syntax/RBAC review and current device-state validation remain necessary. Tests do not establish equipment compatibility.
- localStorage is not a secret store. Only supported scratch/preferences fields cross the persistence allowlist. Imported performance telemetry/results, evidence, review controls and prompt contents must never be persisted. Session-only controls and privacy documentation are described in privacy.txt.
- Clipboard contents and exported files need separate handling. Clearing toolkit data does not erase downloads, clipboard, other tabs or browser history.

## Verification

PR/main CI checks syntax and local module/style asset references, command metadata, unit tests and all browser suites, including adversarial P0 fixtures and the website proof/accessibility suite. Deployment depends on successful validation and consumes the tested allowlisted artifact. These checks are not a penetration test, an external link availability monitor or a vendor certification.
