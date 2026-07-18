# Test Data Management

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Decision record: [ADR-002](adr/ADR-002-api-based-data-seeding.md).

## Categories

| Category                                        | Source                                        | Lifecycle                                     |
| ----------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| Reference data (brands, categories, catalog)    | SUT's own DB seed (via `docker compose up`)   | Reset with the container                      |
| Generated entities (users, addresses, payments) | `utils/dataFactory.ts` (faker)                | Created per test via API, deleted in teardown |
| Auth state                                      | Global setup: API login → `storageState.json` | Regenerated per run, gitignored               |
| Static expectation data                         | `fixtures/data/*.json`                        | Versioned in git                              |

## Rules

1. **Create via API, never via UI.** UI-based setup is slow and couples every test to the registration flow.
2. **Every test owns its data.** No test reads another test's leftovers; parallel-safe by construction.
3. **Unique by generation.** Faker + timestamp suffix on emails prevents collisions across shards.
4. **Clean up in teardown**, tolerating failure (a failed cleanup logs a warning, doesn't fail the test — the container reset is the backstop).
5. **No PII.** All person-like data is faker-generated. Never enter real names/emails, and never seed the public hosted demo ([ENVIRONMENT.md](ENVIRONMENT.md)).

## Flow example (checkout test)

```
cartFixture
  ├─ apiClient.login(seededUser)           # token
  ├─ apiClient.createCart() + addItems()   # arrange, ~200ms
  ├─ inject storageState → browser starts authenticated
  ├─ [test drives UI checkout]
  └─ teardown: apiClient.deleteUser()      # leave no trace
```
