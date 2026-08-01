# Reporting

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md).

## Per-PR (fast feedback)

- Playwright HTML report generated on every run; uploaded as workflow artifact
- On failure: trace (`on-first-retry`), screenshot, video attached — a reviewer can open the trace viewer and replay the failure step-by-step without reproducing locally

## Nightly (published)

- **Allure** aggregates results from every nightly suite into one report: the UI matrix (chromium / firefox / webkit), the API suite, and the quarantine run. Each suite uploads an `allure-results-*` artifact; the `report` job downloads them with `merge-multiple`, which is collision-safe because Allure result files are uuid-named
- Deployed to **GitHub Pages** → <https://trancend1.github.io/commerce-e2e-framework/>, linked from the README
- Built with `if: always()`, so a red nightly still publishes — that is when the report is worth reading
- Including quarantine results here is what keeps quarantine honest: a parked test stays visible in the report instead of disappearing from view (see [TEST-STRATEGY.md §5](TEST-STRATEGY.md))
- The `setup` project is filtered out before generating by `scripts/drop-auth-setup-results.mjs`. It mints `storageState` rather than asserting anything, and it runs once per job — four identical executions share an Allure `historyId`, so they collapse into one entry showing three retries. A retry badge in the report that exists to make instability visible is worse than useless; a genuine setup failure is still loud, since every test in that job fails with it. The script selects on the `parentSuite` label, which carries the Playwright project name, so a result that merely mentions `auth.setup.ts` in a stack trace is never swept up with it, and it exits non-zero when it matches nothing rather than letting a renamed label quietly restore the retry badge
- History trend: the `report` job pulls the previous `history/` back off the published site before generating, so trends survive across runs without keeping a `gh-pages` branch. The first run has no history and simply starts the trend
- Every run's report stays browsable at `runs/<run_number>/`, with the newest also copied to the site root so the README link always lands on the latest. `executor.json` sets `reportUrl` to that run's own directory: Allure copies only `reportUrl` into `history-trend.json` (`buildUrl` never survives into history), so a trend point naming the site root would open whichever report is current rather than the one it represents. `buildUrl` still reaches the Actions run from the Executors widget
- A Pages deploy replaces the whole site, so the previous one is carried forward as a `published-site` workflow artifact, restored by the next run before it assembles. The restore walks back over the last few **completed** nightlies and takes the first that carries the artifact — deliberately not the last _successful_ one, which would undo the point above: a red night publishes its report, and selecting by run conclusion would drop it again the next night while its own trend point still pointed at it. An artifact rather than a `gh-pages` branch, so the nightly never writes to the repo's commit history. Assembly and retention live in `scripts/assemble-report-site.mjs`, which rebuilds the root from scratch each time — Allure emits hashed asset names, so overwriting in place would accumulate every past run's orphaned assets
- **Retention is bounded at the last 20 runs.** Beyond that the oldest reports are pruned and their trend points go stale, pointing at a directory that no longer exists. The same happens if the artifact chain breaks — a failed upload, or expired retention — in which case the site restarts from the current run alone. Both are recoverable: a run's `allure-results-*` artifacts can regenerate its report for as long as they are retained

## Generating Allure locally

The Allure reporter is off by default locally and opt-in via `ALLURE=1`, because its writer creates `allure-results` but never clears it — repeated runs would otherwise pile up stale results and produce a report describing tests that no longer exist. CI gets a fresh runner, so there it is always on.

```bash
rm -rf allure-results          # start from a clean slate
ALLURE=1 npm run test:ui       # PowerShell: $env:ALLURE=1; npm run test:ui
npm run report:allure          # generate + open (needs a JDK on PATH)
```

## Performance

- k6 outputs summary JSON; thresholds make pass/fail explicit in the workflow log
- p95 trends recorded per nightly run in the job summary

## Defects

Real bugs found in the SUT are written up in [bug-reports/](bug-reports/) using [BUG-TEMPLATE.md](bug-reports/BUG-TEMPLATE.md) — each report links the spec or exploratory session that found it, includes repro steps, expected vs actual, severity, and evidence (trace/screenshot/HTTP transcript).

## Reading order for a reviewer

1. README badge → is the gate green?
2. GitHub Pages → Allure: what ran, where, how stable?
3. [bug-reports/](bug-reports/) → what did this framework actually catch?
