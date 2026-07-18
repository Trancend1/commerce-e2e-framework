# Architecture

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md).

## Context & goals

One framework, three test layers, one CI pipeline. Goals: maintainability (selectors in one place), determinism (data seeded via API), reviewability (any engineer can run it with `docker compose up` + `npm ci`).

## Layer diagram

```
┌─────────────────────────────────────────────────────┐
│                  CI (GitHub Actions)                │
│   e2e.yml (PR gate)         nightly.yml (full run) │
└───────────────┬─────────────────────┬───────────────┘
                │                     │
   ┌────────────▼───────────┐  ┌──────▼───────────────┐
   │ Playwright Test Runner │  │ Newman        k6     │
   │  tests/ui  tests/api   │  │ (contract)   (perf)  │
   └───────┬────────┬───────┘  └──────┬───────┬───────┘
           │        │                 │       │
   ┌───────▼──┐ ┌───▼────────────────▼───┐   │
   │  pages/  │ │   utils/apiClient      │   │
   │  (POM)   │ │ (login→token, CRUD)    │   │
   └───────┬──┘ └───┬────────────────────┘   │
           │        │                        │
        ┌──▼────────▼────────────────────────▼──┐
        │        Toolshop SUT (Docker)          │
        │   Angular UI :4200 · Laravel API :8091│
        └───────────────────────────────────────┘
```

## Key rules

1. **Specs → Pages → Locators.** A spec never contains a selector. A page object never contains an assertion about business outcome (it returns state; the spec asserts).
2. **Data flows through the API.** UI is for testing UI, not for creating test data ([ADR-002](adr/ADR-002-api-based-data-seeding.md)).
3. **Auth once.** Global setup logs in via API, saves `storageState`; specs start authenticated. Login UI itself is covered by exactly one dedicated spec.
4. **Config is centralized.** `config/env.ts` is the only file reading `process.env`.
5. **Every layer runs standalone.** `npm run test:api` must work without ever installing browsers; k6 needs only the k6 binary.

## Data flow of a typical UI test

1. Fixture calls `apiClient` → creates user + cart via REST (fast, deterministic)
2. Fixture injects `storageState` → browser starts logged-in
3. Spec drives POM through checkout
4. Spec asserts UI outcome + (optionally) API state (`GET /invoices`)
5. Teardown deletes created entities via API

## Trade-offs accepted

- POM adds indirection for tiny suites — accepted because the suite is designed to grow.
- Newman duplicates some Playwright API coverage — accepted deliberately: collection format demonstrates a second industry-standard toolchain, and contract vs integration concerns stay separated.
