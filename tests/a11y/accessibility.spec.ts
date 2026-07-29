import { test, expect } from '../../fixtures/pages.fixture';
import { CUSTOMER_STORAGE_STATE } from '../../fixtures/auth.fixture';
import { buildAddress } from '../../utils/dataFactory';
import { expectNoBlockingViolations } from '../../utils/a11y';

// Pages follow the risk ranking in docs/TEST-PLAN.md §3 — the revenue path and what guards it.
test.describe('Accessibility', () => {
  test('login page has no serious or critical violations @regression', async ({
    loginPage,
    page,
  }, testInfo) => {
    await loginPage.goto();

    await expectNoBlockingViolations(page, testInfo);
  });

  test('catalog page has no serious or critical violations @regression', async ({
    catalogPage,
    page,
  }, testInfo) => {
    await catalogPage.goto();

    await expectNoBlockingViolations(page, testInfo);
  });

  test('product detail has no serious or critical violations @regression', async ({
    catalogPage,
    page,
  }, testInfo) => {
    await catalogPage.goto();
    await catalogPage.openFirstProduct();

    await expectNoBlockingViolations(page, testInfo);
  });
});

// Checkout is only reachable with a signed-in customer and a filled cart, so it gets its own
// describe: `test.use` applies per file or per describe, not per test.
test.describe('Accessibility — checkout', () => {
  test.use({ storageState: CUSTOMER_STORAGE_STATE });

  test('checkout has no serious or critical violations @regression', async ({
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
    page,
  }, testInfo) => {
    await catalogPage.goto();
    await catalogPage.openFirstProduct();
    await productPage.addToCart();
    // The badge is the signal that the cart request landed. Navigating straight to the cart races
    // it, and an empty cart never renders the proceed button — which is how this first appeared,
    // as a 30s timeout on `proceed-1` rather than as anything to do with accessibility.
    await expect(productPage.cartQuantityBadge).toHaveText('1');

    await cartPage.goto();
    await cartPage.proceedToSignIn();
    await checkoutPage.proceedFromSignIn();
    await checkoutPage.fillBillingAddress(buildAddress());

    await expectNoBlockingViolations(page, testInfo);
  });
});
