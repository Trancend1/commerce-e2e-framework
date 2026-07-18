# Coding Standards

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md). Naming rules live in [NAMING-CONVENTION.md](NAMING-CONVENTION.md).

## Language & tooling

- TypeScript **strict** (`"strict": true`), no `any` without an inline justification comment
- ESLint + Prettier — enforced by the PR gate (`npm run lint`)
- Node 20 LTS; lockfile committed; `npm ci` in CI (never `npm install`)

## Test structure

- Arrange–Act–Assert, visually separated by blank lines
- One behavior per test. Multiple `expect`s are fine if they verify the same behavior
- No conditional logic (`if`/`try` for flow) inside specs — branching belongs in fixtures/utils
- Tags: `@smoke` (PR gate), `@regression` (nightly), `@quarantine` (excluded, see [TEST-STRATEGY.md §5](TEST-STRATEGY.md))

```ts
test('checkout with saved address completes and creates invoice @smoke', async ({
  cartPage,
  checkoutPage,
}) => {
  // Arrange — cart pre-seeded via cartFixture

  // Act
  await cartPage.proceedToCheckout();
  await checkoutPage.payWith('bank-transfer');

  // Assert
  await expect(checkoutPage.confirmationMessage).toBeVisible();
});
```

## Locators (strict priority)

1. `page.getByRole(...)` — accessible, resilient
2. `page.getByTestId(...)` — Toolshop exposes `data-test` attributes
3. `page.getByLabel / getByPlaceholder / getByText`
4. CSS — last resort, must carry a `// WHY:` comment
5. **XPath — never**

## Waiting

- Rely on Playwright auto-waiting + web-first assertions
- `waitForTimeout()` is banned. Named budgets live in `utils/waits.ts` if an explicit timeout is unavoidable

## Assertions

- Web-first (`await expect(locator).toBeVisible()`), not value-snapshots of `innerText`
- API: assert status, then schema/shape, then business values — in that order

## Page objects

- Constructor takes `page`; locators as `readonly` fields; actions as methods returning `void`/values, **no assertions on business outcomes**
- No page object may import another page object's locators

## Comments & docs

- Comments explain _why_, never _what_
- Every exported util has a one-line JSDoc
- New significant decision → new ADR ([adr/](adr/))

## Git hygiene

- Conventional Commits: `test:`, `feat:`, `fix:`, `docs:`, `ci:`, `chore:`
- PRs small and single-purpose; PR description links the roadmap item
