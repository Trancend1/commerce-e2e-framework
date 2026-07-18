# ADR-001: Playwright over Cypress as the primary E2E framework

**Status:** Accepted · **Date:** 2026-07

## Context

The framework needs one primary UI E2E tool. Realistic candidates: Playwright and Cypress (Selenium excluded — declining adoption, no compelling fit for a greenfield TypeScript project). Constraints: cross-browser coverage incl. WebKit, CI parallelism on free GitHub runners, API testing in the same toolchain (needed for data seeding, ADR-002), and my existing TypeScript + pytest background.

## Decision

**Playwright** is the primary framework for UI E2E and API-layer tests.

## Rationale

1. **Cross-browser**: native Chromium/Firefox/WebKit under one API. Cypress's WebKit support remains incomplete — a real gap for commerce checkout flows on Safari users.
2. **Parallelism is free**: built-in sharding works on free CI runners; Cypress parallelization is a paid Cypress Cloud feature. This framework's nightly matrix depends on it.
3. **API testing built-in**: `request` context enables login-once + data seeding in the same toolchain — no extra library.
4. **Debuggability in CI**: trace viewer (DOM snapshots + network + console per step) turns red CI runs into replayable sessions.
5. **Ecosystem direction**: Playwright leads 2026 adoption (~45% of QA professionals vs ~14% Cypress) and job-market growth — relevant for a portfolio project meant to reflect industry reality.

## Trade-offs accepted

- Cypress has arguably better interactive DX (time-travel runner) for local debugging — mitigated by Playwright's UI mode.
- Team familiarity in some companies still favors Cypress — addressed by a planned comparison mini-suite (Roadmap: Icebox) demonstrating both.

## Consequences

- All UI/API specs in TypeScript on `@playwright/test`
- Cypress knowledge is still demonstrated, but in a separate comparison repo, keeping this framework single-toolchain
