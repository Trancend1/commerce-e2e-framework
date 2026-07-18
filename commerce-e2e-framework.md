# commerce-e2e-framework — Master Blueprint

> Layered QA automation framework for a commerce application (Toolshop), built with Playwright + TypeScript.
> This document is the single source of truth. Every supporting doc links back here.

|                       |                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Status**            | Active development                                                                                             |
| **Author**            | Farhan ([@Trancend1](https://github.com/Trancend1))                                                            |
| **System Under Test** | [Toolshop](https://github.com/testsmith-io/practice-software-testing) — Angular + Laravel REST API, Dockerized |
| **Docs index**        | See [Documentation map](#documentation-map)                                                                    |

---

## 1. Purpose

This project exists to demonstrate **QA automation as an engineering discipline**, not a collection of scripts. It provides:

1. A maintainable, layered test framework (UI E2E, API, performance) against a realistic e-commerce application.
2. A CI/CD pipeline that acts as a real quality gate (PR checks, nightly regression, published reports).
3. Documented engineering decisions (ADRs), test strategy, and real defect reports found during testing.

Non-goal: exhaustive coverage of every Toolshop feature. Coverage is **risk-based** (see [Test Strategy](docs/TEST-STRATEGY.md)).

## 2. Testing Scope

**In scope**

- Customer journeys: register, login, browse/search/filter catalog, cart, checkout, order/invoice verification
- Admin journey: login, product management (smoke level)
- API layer: contract + integration tests for `/products`, `/brands`, `/categories`, `/carts`, `/users/login` (per Toolshop Swagger)
- Performance: k6 smoke/load on login, product search, checkout endpoints
- Cross-browser: Chromium, Firefox, WebKit (UI smoke suite)

**Out of scope**

- Native mobile testing (web mobile-emulation only)
- Security penetration testing (exploratory security notes only, filed as bug reports)
- Full localization testing

Details: [docs/TEST-PLAN.md](docs/TEST-PLAN.md)

## 3. Tech Stack

| Concern            | Tool                              | Rationale (full reasoning in ADRs)                                                                                                           |
| ------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI E2E + API tests | **Playwright** (TypeScript)       | Cross-browser, auto-waiting, native API testing, first-party GitHub Actions support — [ADR-001](docs/adr/ADR-001-playwright-over-cypress.md) |
| API contract suite | **Postman + Newman**              | Headless CI execution, industry-standard collection format                                                                                   |
| Performance        | **k6**                            | Scriptable in JS, thresholds as CI pass/fail gates                                                                                           |
| CI/CD              | **GitHub Actions**                | Matrix sharding, artifact upload, Pages deployment                                                                                           |
| Reporting          | **Playwright HTML + Allure**      | Published to GitHub Pages after every nightly run                                                                                            |
| Test data          | **@faker-js/faker** + API seeding | [ADR-002](docs/adr/ADR-002-api-based-data-seeding.md)                                                                                        |
| Runtime            | Node.js 20 LTS, Docker            | Reproducibility                                                                                                                              |

## 4. Folder Architecture

```
commerce-e2e-framework/
├─ .github/workflows/     # CI pipelines (e2e.yml = PR gate, nightly.yml = full run)
├─ tests/
│  ├─ ui/                 # Playwright E2E specs (user journeys)
│  ├─ api/                # API contract + integration specs
│  └─ performance/        # k6 scripts (smoke.js, load.js)
├─ pages/                 # Page Object Model classes
├─ fixtures/              # Custom Playwright fixtures + static test data (JSON)
├─ utils/                 # apiClient, dataFactory, helpers
├─ config/                # environment configs
├─ docs/                  # all documentation (see map below)
├─ playwright.config.ts
├─ docker-compose.yml     # spins up Toolshop SUT locally
├─ .env.example
└─ package.json
```

Design rules: tests never touch selectors directly (POM only); test data is generated or seeded via API, never hardcoded; every layer is independently runnable. Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 5. Test Strategy (summary)

Risk-based, pyramid-shaped:

```
      /  E2E  \        few — critical user journeys, cross-browser
     /  API    \       more — contract, integration, negative cases
    / Perf(k6)  \      thresholds — smoke on PR, load nightly
```

- **PR gate**: smoke E2E (Chromium) + API contract suite. Must pass to merge.
- **Nightly**: full regression, 3 browsers, k6 load, report published.
- **Flakiness policy**: retries=2 on CI, trace-on-first-retry, any test flaky twice in a week gets quarantined and ticketed.

Full strategy incl. entry/exit criteria: [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md)

## 6. Coding Standards & Naming (summary)

- TypeScript strict mode, ESLint + Prettier enforced in CI
- Locators: `getByRole` > `getByTestId` > CSS (last resort). Never XPath.
- One assertion concern per test; arrange-act-assert structure
- Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `ci:`)
- Spec files: `<feature>.spec.ts` · Pages: `<Name>Page.ts` · Fixtures: `<name>.fixture.ts`

Full rules: [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md) · [docs/NAMING-CONVENTION.md](docs/NAMING-CONVENTION.md)

## 7. Environment & Configuration

- `.env` (gitignored) from [`.env.example`](.env.example) — `BASE_URL`, `API_URL`, credentials
- Two targets: **local** (Docker Compose Toolshop, used by CI) and **hosted demo** (practicesoftwaretesting.com, manual exploratory only — shared DB, do not seed)
- All config flows through `config/env.ts`; specs never read `process.env` directly

Details: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)

## 8. CI/CD Plan

| Workflow      | Trigger             | Jobs                                                                                        |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `e2e.yml`     | push / PR to `main` | lint → API contract (Newman) → smoke E2E (Chromium, sharded) → upload traces on failure     |
| `nightly.yml` | cron 01:00 UTC      | full E2E (3-browser matrix) → k6 load w/ thresholds → build Allure → deploy to GitHub Pages |

Quality gate: `e2e.yml` is a required status check on `main`. Details: [docs/CI-CD.md](docs/CI-CD.md)

## 9. Reporting

- **PR level**: Playwright HTML report + traces/screenshots/videos as artifacts (failures only)
- **Nightly**: Allure report published to GitHub Pages → linked from README badge
- **Defects**: real bugs found in the SUT documented in [docs/bug-reports/](docs/bug-reports/) using the standard template

Details: [docs/REPORTING.md](docs/REPORTING.md)

## 10. Test Data Management

- **Static reference data** (existing brands/categories): JSON in `fixtures/data/`
- **Dynamic data** (users, carts, orders): created via API in fixtures before test, deleted after — never through the UI ([ADR-002](docs/adr/ADR-002-api-based-data-seeding.md))
- **Auth**: login once via API in global setup, persist `storageState`, reuse across specs
- Faker for all generated values; no PII, no real personal data ever

Details: [docs/TEST-DATA.md](docs/TEST-DATA.md)

## 11. Fixtures

Custom Playwright fixtures (in `fixtures/`) compose capabilities into tests:

| Fixture             | Provides                                                      |
| ------------------- | ------------------------------------------------------------- |
| `authFixture`       | Pre-authenticated page via saved storage state                |
| `apiFixture`        | Authenticated `apiClient` bound to the current env            |
| `seededUserFixture` | Fresh user created via API, auto-cleaned in teardown          |
| `cartFixture`       | User + pre-filled cart (API-seeded), ready for checkout tests |

## 12. Utilities

| Util                   | Responsibility                                                               |
| ---------------------- | ---------------------------------------------------------------------------- |
| `utils/apiClient.ts`   | Typed wrapper over Playwright `request` — login → Bearer token, CRUD helpers |
| `utils/dataFactory.ts` | Faker-based builders: `buildUser()`, `buildAddress()`, `buildPayment()`      |
| `utils/waits.ts`       | Named timeout budgets (no magic numbers in specs)                            |

## 13. Roadmap & TODO

Live roadmap with milestones and checklists: [docs/ROADMAP.md](docs/ROADMAP.md)

**Phase snapshot:**

- [ ] **M1 — Foundation**: repo scaffold, Docker SUT, config, lint, 1 passing UI + 1 API test in CI
- [ ] **M2 — Core coverage**: POM for main journeys, API contract suite, auth reuse, data factory
- [ ] **M3 — Quality gates**: sharded PR pipeline, nightly matrix, Allure on Pages
- [ ] **M4 — Beyond functional**: k6 thresholds, a11y (axe-core), visual regression
- [ ] **M5 — Polish**: bug reports (3–5 real defects), ADR set complete, README case study

## Documentation map

| Doc                                                    | Answers                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| [README.md](README.md)                                 | What is this, how do I run it in 5 minutes         |
| [docs/TEST-PLAN.md](docs/TEST-PLAN.md)                 | What is tested, what is not, and why               |
| [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md)         | How testing is approached, gates, flakiness policy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)           | How the framework is layered and why               |
| [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md)   | How code must be written                           |
| [docs/NAMING-CONVENTION.md](docs/NAMING-CONVENTION.md) | How things must be named                           |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)             | How environments/config work                       |
| [docs/CI-CD.md](docs/CI-CD.md)                         | How pipelines are structured                       |
| [docs/REPORTING.md](docs/REPORTING.md)                 | How results are reported and published             |
| [docs/TEST-DATA.md](docs/TEST-DATA.md)                 | How test data is created and cleaned               |
| [docs/ROADMAP.md](docs/ROADMAP.md)                     | What's done, what's next                           |
| [docs/adr/](docs/adr/)                                 | Why key decisions were made                        |
| [docs/bug-reports/](docs/bug-reports/)                 | Real defects found in the SUT                      |
