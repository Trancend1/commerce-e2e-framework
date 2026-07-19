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

    const expectedTotal = (unitPrice * 3).toFixed(2);
    await expect(cartPage.cartTotal).toContainText(expectedTotal);
  });
});
