# Roadmap & TODO

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Checked = merged to `main` with green CI.

## M1 — Foundation

- [x] Repo scaffold, lint config, strict tsconfig
- [x] `docker-compose.yml` boots pinned Toolshop + healthcheck
- [x] `config/env.ts` typed env loading
- [x] 1 passing UI spec (login) + 1 passing API spec (products contract)
- [x] `e2e.yml` PR gate green end-to-end ([run 29644067807](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/29644067807))

## M2 — Core coverage

- [x] POM: Login, Catalog, Product, Cart, Checkout pages
- [x] Journeys: register, search/filter, cart ops, checkout happy path (`@smoke` set defined)
- [x] API suite: contract (products/brands/categories) + integration (auth chain, cart→checkout) + negative pack
- [x] Newman collection mirrored from Swagger ([run 29688379856](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/29688379856))
- [x] `apiClient`, `dataFactory`, auth `storageState` reuse

## M3 — Quality gates

- [x] PR gate sharded (2×), budget < 10 min enforced ([run 30287558238](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30287558238))
- [x] `nightly.yml` 3-browser matrix ([run 30286717667](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30286717667))
- [x] Allure build + GitHub Pages deploy + README badge/link ([run 30436058761](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30436058761))
- [x] Quarantine mechanism (`@quarantine` excluded in config, not per CI command) + zero-flaky gate ([run 30391082024](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30391082024))

## M4 — Beyond functional

- [x] k6: login/search/checkout — smoke on PR, load nightly, p95 thresholds ([run 30459015349](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30459015349))
- [x] Accessibility scan (axe-core) on key pages ([run 30467771299](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30467771299)) — found [BUG-002](bug-reports/BUG-002-login-password-reveal-button-has-no-accessible-name.md) and [BUG-003](bug-reports/BUG-003-catalog-filter-lists-contain-fieldsets.md)
- [x] Visual regression on catalog + checkout (Playwright snapshots) ([run 30480555355](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30480555355))

## M5 — Polish (portfolio-ready)

- [x] 3–5 real defects documented in [bug-reports/](bug-reports/) — [BUG-001](bug-reports/BUG-001-checkout-proceed-swallowed-during-postcode-lookup.md) (checkout race, from the M2 flake), [BUG-002](bug-reports/BUG-002-login-password-reveal-button-has-no-accessible-name.md) and [BUG-003](bug-reports/BUG-003-catalog-filter-lists-contain-fieldsets.md) (first a11y scan). Target met at three; none will be manufactured to pad the count
- [x] ADR set complete (001–005) — "complete" defined in [adr/README.md](adr/README.md): every significant _and_ hard-to-reverse decision has an ADR; reversible ones stay in the strategy docs. Audit closed the one real gap with [ADR-005](adr/ADR-005-baseline-updates-are-handed-back-as-an-artifact.md), which supersedes ADR-004's update mechanism
- [x] README case-study section: what this framework caught & what I learned
- [ ] Repo topics/description set; fresh-clone quick start verified on a clean machine — topics and description **set**; fresh-clone verification still open

## Icebox

- [ ] Cypress comparison mini-suite (separate repo) + PLAYWRIGHT-VS-CYPRESS write-up
- [ ] Contract testing with schema validation lib (zod) instead of manual shape checks
- [ ] Grafana Cloud output for k6 trends
