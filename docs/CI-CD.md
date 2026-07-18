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
full UI matrix (chromium │ firefox │ webkit)
        +
full API suite
        +
k6 load (thresholds: p95 budgets — fail = red run)
        │
        ▼
merge results ──► build Allure ──► deploy to GitHub Pages
```

## Conventions

- `npm ci` + `npx playwright install --with-deps` with browser cache
- Artifacts retained 14 days; traces only on failure (storage discipline)
- Failing nightly auto-opens a GitHub issue labeled `nightly-failure`
- Workflow files live in [.github/workflows/](../.github/workflows/) — they are the executable version of this document; if the two disagree, fix one in the same PR

## Roadmap hooks

Sharding count, browser matrix, and Allure history retention are revisited at each milestone — tracked in [ROADMAP.md](ROADMAP.md).
