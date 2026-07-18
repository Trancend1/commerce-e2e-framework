# commerce-e2e-framework

[![E2E Tests](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/e2e.yml/badge.svg)](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/e2e.yml)
[![Nightly Regression](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/nightly.yml/badge.svg)](https://github.com/Trancend1/commerce-e2e-framework/actions/workflows/nightly.yml)

Layered QA automation framework for an e-commerce application — **Playwright + TypeScript (UI E2E & API) · Postman/Newman (contract) · k6 (performance) · GitHub Actions (CI/CD)**.

📐 **Start here → [Master Blueprint](commerce-e2e-framework.md)** — purpose, scope, strategy, and full documentation map.

📊 **Live test report:** _(published to GitHub Pages after first nightly run)_

## System Under Test

[Toolshop](https://github.com/testsmith-io/practice-software-testing) — a realistic Angular + Laravel REST API commerce app with Swagger docs, role-based auth (customer/admin), and intentionally seeded defects. Runs locally via Docker.

## Quick start (< 5 minutes)

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
npm run test:perf      # k6 smoke
```

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
