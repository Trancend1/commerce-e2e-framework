# Architecture Decision Records

Significant, hard-to-reverse decisions for [commerce-e2e-framework](../../commerce-e2e-framework.md). Format: context → decision → consequences. New ADRs are numbered sequentially and never edited after acceptance (superseded instead).

| ADR                                                               | Decision                                                                | Status                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| [001](ADR-001-playwright-over-cypress.md)                         | Playwright over Cypress as primary framework                            | Accepted                                      |
| [002](ADR-002-api-based-data-seeding.md)                          | API-based data seeding over UI-based setup                              | Accepted                                      |
| [003](ADR-003-accessibility-scope-and-budget.md)                  | Accessibility budget is zero serious/critical on four pages             | Accepted                                      |
| [004](ADR-004-visual-baselines-are-ci-generated.md)               | Visual baselines are generated in CI only, updated through a PR         | Accepted · update mechanism superseded by 005 |
| [005](ADR-005-baseline-updates-are-handed-back-as-an-artifact.md) | Baseline updates are handed back as an artifact, not committed by a bot | Accepted                                      |

**"Complete" means:** every decision that is significant _and_ hard to reverse has an ADR. Choices
that are documented with their rationale but cheap to change — the zero-flaky budget, quarantine
mechanics, report retention — live in [TEST-STRATEGY.md](../TEST-STRATEGY.md) and
[REPORTING.md](../REPORTING.md) instead, and that is deliberate. An ADR set padded with reversible
decisions stops signalling which ones actually matter.
