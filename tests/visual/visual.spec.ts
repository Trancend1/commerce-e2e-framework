import { test, expect } from '../../fixtures/pages.fixture';
import { CUSTOMER_STORAGE_STATE } from '../../fixtures/auth.fixture';

// Two pages, chosen in ADR-004 for visual stability. Anything driven by generated data is left
// out on purpose: a screenshot of a form filled from faker would differ on every run, which is a
// broken test rather than a caught regression.
test.describe('Visual regression', () => {
  test('catalog list matches its baseline @regression', async ({ catalogPage, page }) => {
    await catalogPage.goto();
    // The grid renders progressively as product images arrive. Waiting on the first card means the
    // comparison starts from a page that has content, and toHaveScreenshot's own stability check
    // (two identical consecutive frames, animations disabled) covers the rest.
    await expect(catalogPage.productCards.first()).toBeVisible();

    await expect(page).toHaveScreenshot('catalog-list.png', { fullPage: true });
  });
});

test.describe('Visual regression — checkout', () => {
  test.use({ storageState: CUSTOMER_STORAGE_STATE });

  test('checkout billing step matches its baseline @regression', async ({
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await catalogPage.goto();
    await catalogPage.openFirstProduct();
    await productPage.addToCart();
    await expect(productPage.cartQuantityBadge).toHaveText('1');

    await cartPage.goto();
    await cartPage.proceedToSignIn();
    await checkoutPage.proceedFromSignIn();

    // Captured before `fillBillingAddress`, deliberately. The address comes from faker, so a
    // screenshot taken after filling would diff against its own baseline every single night.
    await expect(checkoutPage.streetInput).toBeVisible();

    await expect(page).toHaveScreenshot('checkout-billing-step.png', { fullPage: true });
  });
});
