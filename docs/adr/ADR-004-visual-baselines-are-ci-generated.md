# ADR-004: Visual baselines are generated in CI only, updated through a PR

**Status:** Accepted · **Date:** 2026-07

## Context

M4 adds visual regression via Playwright's `toHaveScreenshot`. Screenshots are not portable: font rasterization differs between the Windows machine this repo is developed on and the Linux runner that executes CI, so a baseline captured locally fails in CI for reasons that have nothing to do with the application.

Three ways out were considered: generate baselines only in CI; run Playwright inside the official Playwright container locally so local matches CI; or drop pixel comparison and assert DOM structure instead.

## Decision

Baselines are generated **in CI only**, on chromium, and the visual project runs **nightly only** — it is not part of the blocking PR gate.

Updating a baseline is an explicit act: a `workflow_dispatch` job regenerates the screenshots and opens a pull request containing them. Baseline changes are therefore reviewed as a diff, like any other change.

Tolerance is `maxDiffPixelRatio: 0.01`. Scope is two pages chosen for visual stability: the catalog list and checkout step 1.

## Rationale

1. **A baseline that only one machine can produce is a trap.** CI-only generation makes the rule simple and identical for everyone, at the cost of not being able to refresh a baseline from a laptop.
2. **The container option solves the same problem more expensively.** It would make local runs match CI, but every contributor then needs Docker in the loop for an ordinary test run — a heavy price for a project whose local story is already `docker compose` for the SUT alone.
3. **DOM assertions are not visual regression.** They would dodge the platform problem entirely while adding almost nothing over the existing E2E specs, which already assert structure and content.
4. **Nightly, not PR-blocking, because visual diffs are the most flake-prone check here.** A rendering difference should open an investigation, not block an unrelated pull request. This can be promoted to the PR gate later if it proves stable.
5. **A PR for baseline updates keeps the reviewable trail.** Silently overwriting baselines is how visual suites die: every failure gets "fixed" by accepting the new image, including the real regressions.

## Consequences

- Baselines cannot be created or refreshed locally; a developer sees visual failures only after CI runs
- The first nightly after adding a page produces no comparison — it creates the baseline, so the check is meaningful from the second run onward
- `maxDiffPixelRatio: 0.01` will absorb small anti-aliasing differences and also small real regressions; the number is a starting point, to be revisited if either failure mode shows up
- Two pages is narrow coverage by design — chosen because dynamic content elsewhere (prices, product ordering) would make the diff meaningless without extensive masking
- If nightly visual diffs prove unstable in practice, the honest move is demoting this to the Icebox with the evidence, not raising the tolerance until it passes
