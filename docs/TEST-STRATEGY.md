# Test Strategy

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Operational detail (what exactly is covered) lives in [TEST-PLAN.md](TEST-PLAN.md).

## 1. Principles

1. **Risk-based**: coverage effort follows business risk (revenue path first), not feature count.
2. **Test pyramid, adapted**: this framework sits on top of the SUT's own unit tests — so our pyramid is API-heavy, E2E-light, with performance as a cross-cutting gate.
3. **Determinism over coverage**: a small trusted suite beats a large flaky one. Anything flaky gets quarantined, not retried into green.
4. **Shift-left**: the PR gate runs in minutes; expensive checks (matrix, load) run nightly.

## 2. Layering

| Layer           | Tool                    | Volume     | Purpose                                          |
| --------------- | ----------------------- | ---------- | ------------------------------------------------ |
| API contract    | Newman + Playwright API | Most       | Schema, status codes, auth rules, negative cases |
| API integration | Playwright API          | More       | Multi-step chains (login → cart → checkout)      |
| UI E2E          | Playwright              | Few        | Critical journeys as a real user, cross-browser  |
| Performance     | k6                      | Thresholds | p95 latency budgets on login/search/checkout     |

Why not test everything through the UI? UI tests are the slowest and most fragile layer; anything provable at the API layer is tested there. The UI suite only proves _the user can actually do it_.

## 3. Quality gates

| Gate    | When          | Content                                                                        | Blocking?                    |
| ------- | ------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| PR gate | every push/PR | lint → Newman contract → `@smoke` UI (Chromium, sharded); k6 smoke in parallel | **Yes** — required check     |
| Nightly | cron          | full UI (3 browsers) + full API + k6 load                                      | No, but failures open issues |

## 3a. Performance budgets

k6 exits non-zero when a threshold breaks, so these budgets fail the job rather than merely being printed.

Budgets are scoped to a `journey` tag rather than to `http_req_duration` as a whole, because the checkout scenario has to mint a token before it can post an invoice and that login call would otherwise drag checkout's p95 toward login's much faster numbers — the budget would pass for the wrong reason. `http_req_failed: rate==0` stays global.

| Journey  | Smoke budget (1 VU, PR gate) | Load budget (20 VU, nightly) |
| -------- | ---------------------------- | ---------------------------- |
| Login    | `p(95) < 400ms`              | `p(95) < 550ms`              |
| Search   | `p(95) < 500ms`              | `p(95) < 600ms`              |
| Checkout | `p(95) < 1200ms`             | no load profile              |

`http_req_failed: rate==0` applies to every scenario — a fast error is still an error.

Read paths and write paths get different budgets on purpose: a single number for both is guaranteed to be wrong on one side. The same applies across profiles, which is why smoke and load are separate columns. Login observes ~134ms at 1 VU and ~406ms at 20 VU, so one number would either be unreachable under load or toothless at rest — the original 800ms was the latter, 5.6× above what it was measuring, which is decoration rather than a gate.

The load numbers come from run 30452593269: login `p(95)=405.76ms` at 20 VU with 21,174 checks passing and zero errors, which is the application behaving normally under concurrency, not a regression. All of these are starting points, to be tightened once several nightlies have produced a trend.

**Load profile:** ramping 0 → 20 VU over 2 minutes, hold 1 minute, ramp down. [TEST-PLAN.md](TEST-PLAN.md) §4 puts anything beyond 50 VU out of scope, and the ceiling here is lower still because the runner hosts the SUT alongside k6 on 2 vCPUs — past roughly 20 VU the p95 measures runner saturation rather than the application, which would make the threshold noise. A `constant-arrival-rate` model is the more correct way to express a latency SLO, since load stops backing off when the app slows down; it is the upgrade path if ramping VUs prove too coarse.

**Checkout stays smoke-only.** A load profile against checkout writes hundreds of orders into the SUT database. The container is fresh per run so nothing leaks between runs, but that volume changes the conditions being measured _within_ the run.

## 4. Environments

All automated runs target the **local Dockerized SUT** for isolation and seedability. The public hosted demo is for manual exploratory testing only. See [ENVIRONMENT.md](ENVIRONMENT.md).

## 5. Flakiness policy

- CI: `retries: 2`, `trace: on-first-retry`
- **Zero flaky tests.** Playwright exits 0 when a test passes on retry, so `scripts/check-flake.mjs` reads the json report and fails the run instead. Enforced in the PR gate and nightly — nightly included deliberately, since cross-browser races only surface there
- A flaking test is fixed, or quarantined the same day. There is no third option where it stays green and unreliable

### Quarantine

- Tag the test `@quarantine` and annotate it: `{ type: 'quarantine', description: '<reason>, YYYY-MM-DD' }`
- Exclusion lives in `playwright.config.ts` (`grepInvert`), not in CI commands — a workflow that forgot the flag would leak quarantined tests back into a gate silently
- Quarantined tests still run nightly via the `quarantine-*` projects with `retries: 0`, non-blocking. Parked must never quietly become deleted, and retries would hide the very instability being observed
- `scripts/check-quarantine.mjs` fails the gate on a missing annotation, a missing or future date, or anything quarantined longer than `QUARANTINE_MAX_DAYS` (default 14). Extending the date instead of fixing or deleting the test is how a suite rots

## 6. Defect management

Real defects found in the SUT are documented in [bug-reports/](bug-reports/) using [the template](bug-reports/BUG-TEMPLATE.md), with severity/priority definitions inside the template. Since the SUT is a public practice app, reports are filed in-repo (portfolio evidence) rather than upstream unless genuinely novel.

## 7. Metrics that matter

- PR gate duration (budget: < 10 min)
- Flaky tests (budget: zero). Deliberately binary rather than a percentage: on a suite this size a single flaky test is already 5%, so a rate would measure suite size more than reliability. Revisit when the suite is large enough for a rate to carry signal
- Quarantine size and age (budget: nothing older than 14 days)
- Defect detection: every Critical journey covered at ≥2 layers

## 8. Decision log

Significant choices are recorded as ADRs in [adr/](adr/): [ADR-001 Playwright over Cypress](adr/ADR-001-playwright-over-cypress.md), [ADR-002 API-based data seeding](adr/ADR-002-api-based-data-seeding.md), [ADR-003 accessibility scope and budget](adr/ADR-003-accessibility-scope-and-budget.md), [ADR-004 visual baselines are CI-generated](adr/ADR-004-visual-baselines-are-ci-generated.md).
