# ADR-003: Accessibility budget is zero serious/critical on four pages

**Status:** Accepted · **Date:** 2026-07

## Context

M4 adds an axe-core scan. Toolshop is a third-party SUT, so its accessibility state is inherited, not authored — a scan will almost certainly find violations on the first run. That makes the budget the real decision: too strict and the gate is permanently red and gets ignored, too loose and it passes by accident, which is the failure mode M2 already produced with a matrix that never ran.

Three budgets were considered: zero violations of any severity; zero `serious` and `critical` only; or a captured baseline where only new violations fail.

## Decision

The scan fails on any `serious` or `critical` violation. `moderate` and `minor` are reported but do not block.

Scanned pages, following the risk ranking in [TEST-PLAN.md](../TEST-PLAN.md) §3: login, catalog, product detail, checkout. Page objects for all four already exist.

The scan is implemented with `@axe-core/playwright`, the one new dependency M4 introduces.

## Rationale

1. **A budget nobody can meet is not a budget.** Zero-of-all-severities on an application this project does not own would produce a permanent red gate and a growing exception list, which reads as noise rather than a standard.
2. **Baseline-and-ratchet freezes the bad state as normal.** It is the right tool for a legacy codebase being improved; here nobody is going to fix Toolshop, so the baseline would never shrink and the gate would only ever say "no worse than before".
3. **`serious`/`critical` is a defensible line.** These are the severities that map to actual blockers for assistive technology, and axe's classification is stable enough to cite in a report.
4. **Violations found are an asset, not an obstacle.** They become entries in [bug-reports/](../bug-reports/), which M5 needs anyway. A red first run is a finding, not a failed milestone.

## Consequences

- If the first scan is red on `serious`/`critical`, the gate stays red until the violations are written up and explicitly waived per rule with a documented reason — waiving silently is not allowed
- `moderate`/`minor` findings are recorded in the report but nobody is obliged to act on them, so they will accumulate
- Coverage is four pages, not the whole app; a regression on an unscanned page is invisible
- Adds `@axe-core/playwright` to the stack (approved as part of the M4 decision set)
