# Roadmap & TODO

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Checked = merged to `main` with green CI.

## M1 — Foundation

- [x] Repo scaffold, lint config, strict tsconfig
- [x] `docker-compose.yml` boots pinned Toolshop + healthcheck
- [x] `config/env.ts` typed env loading
- [x] 1 passing UI spec (login) + 1 passing API spec (products contract)
- [x] `e2e.yml` PR gate green end-to-end ([run 29644067807](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/29644067807))

## M2 — Core coverage

- [ ] POM: Login, Catalog, Product, Cart, Checkout pages
- [ ] Journeys: register, search/filter, cart ops, checkout happy path (`@smoke` set defined)
- [ ] API suite: contract (products/brands/categories) + integration (auth chain, cart→checkout) + negative pack
- [ ] Newman collection mirrored from Swagger
- [ ] `apiClient`, `dataFactory`, auth `storageState` reuse

## M3 — Quality gates

- [ ] PR gate sharded (2×), budget < 10 min enforced
- [ ] `nightly.yml` 3-browser matrix
- [ ] Allure build + GitHub Pages deploy + README badge/link
- [ ] Quarantine mechanism (`@quarantine` tag excluded from gates)

## M4 — Beyond functional

- [ ] k6: login/search/checkout — smoke on PR, load nightly, p95 thresholds
- [ ] Accessibility scan (axe-core) on key pages
- [ ] Visual regression on catalog + checkout (Playwright snapshots)

## M5 — Polish (portfolio-ready)

- [ ] 3–5 real defects documented in [bug-reports/](bug-reports/)
- [ ] ADR set complete (001–00N)
- [ ] README case-study section: what this framework caught & what I learned
- [ ] Repo topics/description set; fresh-clone quick start verified on a clean machine

## Icebox

- [ ] Cypress comparison mini-suite (separate repo) + PLAYWRIGHT-VS-CYPRESS write-up
- [ ] Contract testing with schema validation lib (zod) instead of manual shape checks
- [ ] Grafana Cloud output for k6 trends
