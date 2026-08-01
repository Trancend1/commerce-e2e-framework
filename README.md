# commerce-e2e-framework

[![E2E Tests](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/e2e.yml/badge.svg)](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/e2e.yml)
[![Nightly Regression](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/nightly.yml/badge.svg)](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/nightly.yml)

Layered QA automation framework for an e-commerce application — **Playwright + TypeScript (UI E2E & API) · Postman/Newman (contract) · k6 (performance) · GitHub Actions (CI/CD)**.

📐 **Start here → [Master Blueprint](commerce-e2e-framework.md)** — purpose, scope, strategy, and full documentation map.

📊 **Live test report → [Allure on GitHub Pages](https://trancend1.github.io/commerce-e2e-framework/)** — rebuilt by every nightly run from the merged UI matrix, API suite, and quarantine results, with a trend chart across runs.

## System Under Test

[Toolshop](https://github.com/testsmith-io/practice-software-testing) — a realistic Angular + Laravel REST API commerce app with Swagger docs, role-based auth (customer/admin), and intentionally seeded defects. Runs locally via Docker.

## Quick start

Verified end to end from a fresh clone on 2026-07-31 — the run that produced [#16](https://github.com/Trancend1/commerce-e2e-framework/pull/16). On a machine that already has the npm cache, the Playwright browsers and the Toolshop images, steps 1–4 take about two minutes. A genuinely cold machine additionally downloads Chromium and roughly a gigabyte of Docker images, which is the part no timing claim here covers.

```bash
# 1. Clone & install
git clone https://github.com/Trancend1/commerce-e2e-framework.git
cd commerce-e2e-framework
npm ci
npx playwright install --with-deps chromium

# 2. Configure
cp .env.example .env   # defaults target the local Docker SUT

# 3. Start the SUT (boots pinned Toolshop images, waits, seeds the DB)
bash scripts/sut-up.sh   # Toolshop UI on :4200, API on :8091

# 4. Run
npm run test:api       # API contract + integration
npm run test:ui        # UI E2E (Chromium)
npm run test:perf      # k6 smoke — needs k6 installed, see below
```

`test:perf` shells out to **k6**, which is a standalone binary rather than an npm dependency, so `npm ci` does not provide it — install it from [k6.io/docs/get-started/installation](https://grafana.com/docs/k6/latest/set-up/install-k6/) first. CI installs it through the k6 action, which is why the gate never noticed. The other three commands need nothing beyond the steps above.

## Case study: what this framework caught, and what it cost

### Three defects in the application

| Defect                                                                                                                                                                  | How it surfaced                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [BUG-001](docs/bug-reports/BUG-001-checkout-proceed-swallowed-during-postcode-lookup.md) — checkout swallows the "Proceed" click while the postcode lookup is in flight | Not by a test written to look for it. It arrived as a flaky WebKit failure in nightly [run 30283340404](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30283340404) — a race the app never signals to the user   |
| [BUG-002](docs/bug-reports/BUG-002-login-password-reveal-button-has-no-accessible-name.md) — login password reveal button has no accessible name                        | First axe-core scan, nightly [run 30462989730](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30462989730). axe rates it `critical`; this report rates it Medium, because a screen reader user can still sign in |
| [BUG-003](docs/bug-reports/BUG-003-catalog-filter-lists-contain-fieldsets.md) — catalog filters wrap `<fieldset>` directly inside `<ul>`                                | Same scan. axe rates it `serious`, rated Low here — the filters stay operable, only their announced structure is wrong                                                                                                             |

The severity column in each report is deliberately not axe's. A rule's impact describes how badly
it breaks assistive technology in general; severity here describes what it costs a user of _this_
application. Translating one into the other is the judgement a scanner cannot make for you.

### Four defects in the test framework itself

These cost more to find than the application bugs, and they are the reason the suite can be
trusted at all.

- **A green pipeline is not evidence the suite ran.** The nightly 3-browser matrix reported green
  for five consecutive nights while only Chromium ever executed. Job conclusions said pass;
  shard-level test counts said otherwise. Nothing catches this except reading the counts.
- **`retries: 2` reported a real race as a pass.** BUG-001 was being retried into green on every
  run. Playwright exits 0 when a retry succeeds, so the gate now reads the JSON report directly —
  [`scripts/check-flake.mjs`](scripts/check-flake.mjs) fails on any `flaky` status, in both gates.
  The budget is a binary zero rather than "< 2%", because on a suite this size one flaky test is
  already 5%.
- **A published report is not automatically an honest one.** The auth-setup fixture runs once per
  shard, and four executions sharing a `historyId` were folded by Allure into a single entry
  showing three retries — a retry badge inside the very report built to make instability visible.
  Fixed by dropping auth-setup results before `allure generate` ([run 30442831597](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30442831597) logs `dropped 4 of 39`).
- **A threshold that cannot fail is not a gate.** The first k6 login budget was 800 ms against an
  observed p95 of ~142 ms — decoration. Tightened to 400 ms, which then broke at 405.76 ms with
  zero errors the first time it ran under load. One number could not serve both conditions, so
  smoke and load now carry separate budgets.

### What it cost

- The PR gate is sharded 2× and held under a 10-minute budget that is **enforced by a job timeout**,
  not merely observed ([run 30287558238](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30287558238)). Anything slower than that gets pushed to the nightly.
- Every new check paid an upfront triage tax. Of the failures the accessibility and visual work
  produced, **two were my own broken tests** — a missing wait after add-to-cart, which had already
  caused an earlier flake — and two were real. Telling those apart is the actual work, and it is
  why [ADR-003](docs/adr/ADR-003-accessibility-scope-and-budget.md) was written _before_ the scan:
  the first run was predicted to be red, so it produced two bug reports instead of a panic.
- Flaky tests are quarantined by config rather than by CI command, so no pipeline can forget the
  exclusion — but they still run nightly and [expire](scripts/check-quarantine.mjs).

### Known gaps

Stated because a portfolio that only lists wins is not evidence of QA judgement.

- Two k6 budgets are still decoration: search under load observes ~82 ms against 600 ms, checkout
  smoke ~32 ms against 1200 ms. They need a few nightlies of trend before tightening, not one sample.
- The accessibility and visual suites run nightly, not on the PR gate. Promoting them is a
  deliberate next step, not an oversight.
- Report retention is bounded at 20 runs, so trend points older than that link to a pruned
  directory — documented in [docs/REPORTING.md](docs/REPORTING.md).

## What to look at (reviewer shortcuts)

| If you want to see...              | Go to                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Engineering decisions & trade-offs | [docs/adr/](docs/adr/)                                                    |
| Test strategy & quality gates      | [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md)                            |
| Real defects found in the SUT      | [docs/bug-reports/](docs/bug-reports/)                                    |
| How CI enforces quality            | [.github/workflows/](.github/workflows/) + [docs/CI-CD.md](docs/CI-CD.md) |
| Framework layering                 | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                              |

## Scripts

| Command                        | Runs                                  |
| ------------------------------ | ------------------------------------- |
| `npm run test:ui`              | Playwright UI E2E                     |
| `npm run test:ui:all-browsers` | UI E2E on Chromium + Firefox + WebKit |
| `npm run test:api`             | Playwright API specs                  |
| `npm run test:contract`        | Newman (Postman collection)           |
| `npm run test:perf`            | k6 smoke test                         |
| `npm run test:smoke`           | PR-gate subset (@smoke tag)           |
| `npm run report`               | Open last Playwright HTML report      |
| `npm run lint`                 | ESLint + Prettier check               |

## License

MIT — see [LICENSE](LICENSE).
