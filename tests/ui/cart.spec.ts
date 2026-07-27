import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Cart operations', () => {
  test('adding a product and raising quantity updates the cart total @regression', async ({
    catalogPage,
    productPage,
    cartPage,
  }) => {
    await catalogPage.goto();
    await catalogPage.openFirstProduct();
    await expect(productPage.addToCartButton).toBeVisible();
    const unitPrice = parseFloat((await productPage.unitPrice.innerText()).replace(/[^\d.]/g, ''));

    await productPage.addToCart();
    await expect(productPage.cartQuantityBadge).toHaveText('1');

    await cartPage.goto();
    await cartPage.setQuantity(0, 3);

    // Compare numerically, not as a substring: toContainText('19.50') also passes on '119.50'.
    // expect.poll keeps the retrying behaviour the total needs while the cart refetches.
    await expect
      .poll(async () => parseFloat((await cartPage.cartTotal.innerText()).replace(/[^\d.]/g, '')))
      .toBeCloseTo(unitPrice * 3, 2);
  });
});
