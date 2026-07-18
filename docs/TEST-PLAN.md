# Test Plan

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Strategy-level decisions live in [TEST-STRATEGY.md](TEST-STRATEGY.md).

## 1. Objective

Verify that the Toolshop commerce application supports its critical business flows (revenue path: browse → cart → checkout) reliably across supported browsers, with acceptable API correctness and performance.

## 2. Test items

- Toolshop web UI (Angular) — customer & admin roles
- Toolshop REST API v5 (Laravel) — per Swagger spec

## 3. Features to be tested (risk-ranked)

| #   | Feature                                             | Risk                             | Layers               |
| --- | --------------------------------------------------- | -------------------------------- | -------------------- |
| 1   | Checkout flow (cart → payment → confirmation)       | **Critical** — revenue path      | UI E2E, API, k6      |
| 2   | Authentication (register, login, token, roles)      | **Critical** — blocks everything | UI E2E, API, k6      |
| 3   | Product search & filtering (brand, category, price) | High — discovery path            | UI E2E, API, k6      |
| 4   | Cart operations (add, update qty, remove)           | High                             | UI E2E, API          |
| 5   | Order history & invoice                             | Medium                           | UI E2E, API          |
| 6   | Admin product management                            | Medium (smoke only)              | UI E2E               |
| 7   | Input validation & error handling                   | Medium                           | API (negative suite) |

## 4. Features NOT to be tested

- Payment gateway internals (Toolshop mocks payment)
- Email delivery
- Native mobile apps
- Load beyond 50 VUs (local hardware constraint — documented in k6 configs)

## 5. Approach

Per layer — see [TEST-STRATEGY.md](TEST-STRATEGY.md) for reasoning:

- **UI E2E (Playwright)**: journey-based specs, POM, API-seeded data, `@smoke` tag for PR gate
- **API (Playwright + Newman)**: contract (schema/status), integration (auth chains), negative (validation, authz)
- **Performance (k6)**: smoke (1 VU sanity) on PR; load (ramping VUs, p95 thresholds) nightly

## 6. Pass/fail criteria

- A test passes when all its assertions pass on a clean, seeded environment
- The **suite** passes when 100% of non-quarantined tests pass (no "acceptable failure %")
- k6 passes when thresholds hold (see `tests/performance/`)

## 7. Entry / exit criteria

**Entry**: SUT healthy (healthcheck endpoint 200), DB seeded, `.env` valid.
**Exit (per release/PR)**: PR gate green; no open Critical/High defect against changed area.

## 8. Deliverables

- Test specs (this repo) · CI results & artifacts · Allure report (GitHub Pages) · Defect reports ([bug-reports/](bug-reports/))

## 9. Risks & mitigations

| Risk                            | Mitigation                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Flaky UI tests erode trust      | Auto-wait locators, API seeding, retry+trace policy, quarantine process ([TEST-STRATEGY.md §5](TEST-STRATEGY.md)) |
| Shared hosted demo DB pollution | CI and seeding target **local Docker SUT only** ([ENVIRONMENT.md](ENVIRONMENT.md))                                |
| SUT version drift               | `docker-compose.yml` pins the SUT image/ref                                                                       |
