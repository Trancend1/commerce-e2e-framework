import { test, expect } from '../../fixtures/pages.fixture';
import { CUSTOMER_STORAGE_STATE } from '../../fixtures/auth.fixture';
import { buildAddress } from '../../utils/dataFactory';

test.use({ storageState: CUSTOMER_STORAGE_STATE });

test.describe('Checkout', () => {
  test('completes the happy path with cash on delivery @smoke', async ({
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await catalogPage.goto();
    await catalogPage.openFirstProduct();
    await productPage.addToCart();
    await expect(productPage.cartQuantityBadge).toHaveText('1');

    await cartPage.goto();
    await cartPage.proceedToSignIn();
    await checkoutPage.proceedFromSignIn();
    await checkoutPage.fillBillingAddress(buildAddress());
    await checkoutPage.proceedToPayment();
    await checkoutPage.payWith('cash-on-delivery');

    await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
  });
});
