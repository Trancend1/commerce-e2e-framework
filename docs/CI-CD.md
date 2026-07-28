# CI/CD Plan

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Gates are defined in [TEST-STRATEGY.md §3](TEST-STRATEGY.md).

## Workflows

### `e2e.yml` — PR quality gate (blocking)

Trigger: push / pull_request → `main`

```
lint ──► contract (Newman) ──► smoke UI (Chromium, 2 shards)
                                      │
                              on failure: upload traces,
                              screenshots, videos as artifacts
```

- Boots the SUT with the same `docker-compose.yml` used locally
- Runs only `@smoke`-tagged UI specs + full API layer — budget **< 10 minutes**
- Marked as a **required status check** on `main`

### `nightly.yml` — full regression (scheduled)

Trigger: cron `0 1 * * *` + manual `workflow_dispatch`

```
full UI matrix (chromium │ firefox │ webkit)   ─┐
full API suite                                  ├─► merge allure-results
quarantine run (non-blocking, retries: 0)      ─┘        │
                                                         ▼
k6 load (thresholds: p95 budgets — fail = red run)   build Allure ──► deploy to GitHub Pages
```

The report job runs `if: always()` and does not gate on the suites passing — a red nightly is exactly when someone needs to read it. `perf` is deliberately outside the report path: k6 does not emit Allure results.

## Conventions

- `npm ci` + `npx playwright install --with-deps` with browser cache
- Artifacts retained 14 days; traces only on failure (storage discipline)
- Failing nightly auto-opens a GitHub issue labeled `nightly-failure` — **planned, not implemented**; today a failure is visible via the badge and the published report
- Workflow files live in [.github/workflows/](../.github/workflows/) — they are the executable version of this document; if the two disagree, fix one in the same PR

## Roadmap hooks

Sharding count, browser matrix, and Allure history retention are revisited at each milestone — tracked in [ROADMAP.md](ROADMAP.md).
