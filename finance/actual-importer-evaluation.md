# Evaluation: `tomerh2001/israeli-banks-actual-budget-importer`

Date: 2026-05-10

## Decision

Recommendation: **Do not fork yet**. Use upstream as base, but only after patching or upstreaming a short list of blockers.

Current status against your criteria:

- `@actual-app/api` freshness vs your server: **Fail (version mismatch now)**
- Israeli scrapers freshness/support for your banks: **Likely pass**
- Pi4 deployability from upstream image as-is: **Fail (amd64-only image)**
- Cache persistence (`dataDir`, Chrome profile): **Pass (supported)**
- Dedupe on repeated imports: **Pass in code design, still requires live bank run confirmation**
- Security posture for production credentials: **Needs hardening before use**

---

## Evidence Collected

### 1) Upstream freshness

- Upstream repo is active:
  - Last push: `2026-05-08` (GitHub metadata).
  - Recent releases through `v1.10.4` (`2026-04-02`).
- Upstream currently bundles:
  - `@actual-app/api: 26.3.0`
  - `@tomerh2001/israeli-bank-scrapers: 6.4.0`
- Your deployed Actual server image reports:
  - `actualbudget/actual-server:latest-alpine` with app version `26.5.2`
- Upstream has open dependency PRs to bump `@actual-app/api` (`26.4.0`, `26.5.2`), but those are not merged yet.

Conclusion: upstream is maintained, but current published image is behind your Actual server version and will likely fail its own version guard.

### 2) Pi4/arm64 deployability

- Upstream Docker Hub image `tomerh2001/israeli-banks-actual-budget-importer:latest` is `linux/amd64` only.
- Upstream `compose.yml` explicitly pins `platform: linux/amd64`.
- Upstream base image `ghcr.io/puppeteer/puppeteer:latest` currently resolves to `amd64` in inspected manifest/config.
- Upstream image size is about `1.15 GB` (`1146554963` bytes), so not slim/alpine-lightweight.

Local arm64 build attempt:

- Build command reached dependency install on `linux/arm64`.
- It emitted `InvalidBaseImagePlatform` warning (amd64 base pulled for arm64 target).
- Build failed in this environment at yarn link step (`EACCES` on `/app/.yarn/install-state.gz`), so no clean arm64 image was produced from upstream Dockerfile without edits.

Conclusion: upstream image is not Pi-ready as-is; arm64 support needs explicit work.

### 3) Actual integration behavior

- Uses `actual.init(...)` + `downloadBudget(...)` + `actual.shutdown()`.
- Enforces server/API version equality before running imports.
- Imports with `actual.importTransactions(...)` (not `addTransactions`).
- Transaction `imported_id` is generated via stable function:
  - `stableImportedId(companyId, accountNumber, txn)` using scraper identifier when available.
- Reconciliation transactions use unique IDs per run (expected behavior).
- Config supports specifying `actual.init.dataDir`; docs/examples mount `./cache:/app/cache`.
- `chrome-data` is supported and mounted for persistent browser session/2FA flow.

Conclusion: Actual integration architecture is aligned with dedupe/cache requirements.

### 4) Security posture

Security positives:

- Credentials are expected from mounted config file, not baked into image.
- CI includes CodeQL/Snyk/dependency checks.

Security concerns to fix before production:

- `package.json` start script sets `NODE_TLS_REJECT_UNAUTHORIZED=0` (unsafe; disables TLS cert validation globally).
- Logging includes structured debug output of scraped account metadata and may print raw error payloads; this needs redaction policy review for financial data sensitivity.
- Example docs show plaintext credentials in `config.json` (expected for examples, but production must move to secret-mounted file with strict permissions).

---

## What This Means for “Do We Need to Fork?”

Short answer: **not yet**, but you probably need at least a small maintained delta.

Preferred path:

1. Open/track upstream issues or PRs for:
   - arm64 image publishing (or Dockerfile base/runtime path that supports arm64)
   - removing `NODE_TLS_REJECT_UNAUTHORIZED=0` default
   - optional log-redaction mode
2. If upstream merges quickly, consume upstream directly.
3. If upstream is slow on these blockers, run a **minimal private fork** carrying only:
   - arm64-capable Docker build
   - TLS-safe startup defaults
   - log hardening

---

## Remaining Validation Required With Real Credentials

These were not run here because they require your bank and Actual secrets:

1. One-bank real import smoke test (recommended first: a credit card source like `visaCal` or `max`).
2. Repeat same import window to confirm duplicate suppression in your real data.
3. Restart container and confirm persisted `/app/cache` and `/app/chrome-data` reduce re-auth prompts.
4. Verify logs contain no sensitive credentials/identifiers beyond what you accept.

If you want, I can now implement a temporary `finance` namespace Kubernetes Job manifest template for this importer using Secret-mounted `config.json` (no secrets committed), so you can run these validations safely on the cluster.
