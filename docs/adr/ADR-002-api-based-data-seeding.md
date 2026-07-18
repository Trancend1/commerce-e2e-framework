# ADR-002: API-based data seeding over UI-based setup

**Status:** Accepted · **Date:** 2026-07

## Context

Most specs need preconditions: an existing user, a filled cart, an order. Two options: (a) create them by driving the UI (register form, add-to-cart clicks) or (b) create them via the SUT's REST API before the browser opens.

## Decision

All test preconditions are created **via the API** (`utils/apiClient.ts`), injected into the browser via `storageState`/fixtures. The UI is only exercised by the behavior actually under test. Registration and login UIs are each covered by exactly one dedicated spec.

## Rationale

1. **Speed**: API setup is ~100–300ms vs multi-second UI flows; across a suite this is minutes per run.
2. **Determinism**: UI-based setup couples every test to the registration flow — one CSS change breaks the whole suite. API setup fails only when the contract breaks (which is itself a finding).
3. **Parallel safety**: each test creates isolated data; no shared "test user" mutations across shards.
4. **Layer honesty**: a checkout test should fail because checkout broke — not because registration broke.

## Consequences

- Requires maintaining `apiClient` against the Toolshop Swagger (acceptable: it doubles as the API test layer's foundation)
- Auth token/role handling (customer vs admin Bearer tokens) is centralized in the client
- Teardown deletes created entities; Docker DB reset is the backstop ([TEST-DATA.md](../TEST-DATA.md))
