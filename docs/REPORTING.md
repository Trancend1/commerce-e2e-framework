# Reporting

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md).

## Per-PR (fast feedback)

- Playwright HTML report generated on every run; uploaded as workflow artifact
- On failure: trace (`on-first-retry`), screenshot, video attached — a reviewer can open the trace viewer and replay the failure step-by-step without reproducing locally

## Nightly (published)

- **Allure** aggregates UI + API results across the browser matrix
- Deployed to **GitHub Pages** — the README badge links to the latest run
- History trend kept (last 20 runs) to make flake patterns visible

## Performance

- k6 outputs summary JSON; thresholds make pass/fail explicit in the workflow log
- p95 trends recorded per nightly run in the job summary

## Defects

Real bugs found in the SUT are written up in [bug-reports/](bug-reports/) using [BUG-TEMPLATE.md](bug-reports/BUG-TEMPLATE.md) — each report links the spec or exploratory session that found it, includes repro steps, expected vs actual, severity, and evidence (trace/screenshot/HTTP transcript).

## Reading order for a reviewer

1. README badge → is the gate green?
2. GitHub Pages → Allure: what ran, where, how stable?
3. [bug-reports/](bug-reports/) → what did this framework actually catch?
