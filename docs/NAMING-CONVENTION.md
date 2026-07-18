# Naming Convention

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Applies together with [CODING-STANDARDS.md](CODING-STANDARDS.md).

## Files

| Thing       | Pattern                      | Example                              |
| ----------- | ---------------------------- | ------------------------------------ |
| UI spec     | `<journey>.spec.ts`          | `checkout.spec.ts`                   |
| API spec    | `<resource>.api.spec.ts`     | `products.api.spec.ts`               |
| Page object | `<Name>Page.ts` (PascalCase) | `CheckoutPage.ts`                    |
| Fixture     | `<name>.fixture.ts`          | `auth.fixture.ts`                    |
| k6 script   | `<scenario>.<type>.js`       | `checkout.load.js`, `login.smoke.js` |
| Util        | camelCase noun               | `apiClient.ts`, `dataFactory.ts`     |
| Static data | `<resource>.json`            | `fixtures/data/products.json`        |
| ADR         | `ADR-NNN-<kebab-slug>.md`    | `ADR-001-playwright-over-cypress.md` |
| Bug report  | `BUG-NNN-<kebab-slug>.md`    | `BUG-001-related-products-500.md`    |

## Inside code

- Test titles: behavior sentences, present tense, tag suffix — `'rejects login with invalid password @regression'`
- `describe` blocks: the feature under test — `describe('Cart', ...)`
- Locator fields: role/intent, not implementation — `submitOrderButton`, never `btnBlue`
- Env vars: `SCREAMING_SNAKE` with prefix — `SUT_BASE_URL`, `SUT_API_URL`
- Faker builders: `build<Entity>()` — `buildUser()`, `buildAddress()`

## Branches

`<type>/<scope>-<short-desc>` → `test/checkout-happy-path`, `ci/nightly-allure-deploy`, `docs/adr-003`

## Why this matters

Consistent names make the repo greppable: `git grep '@smoke'` lists the PR gate; `ls tests/api` reads like an API inventory. Reviewers (and interviewers) can navigate without a guide.
