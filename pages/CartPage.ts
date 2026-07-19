import { type Page, type Locator } from '@playwright/test';

/** POM for step 1 (cart contents) of the /checkout wizard. Locators only — assertions live in specs. */
export class CartPage {
  readonly itemTitles: Locator;
  readonly quantityInputs: Locator;
  readonly linePrices: Locator;
  readonly cartTotal: Locator;
  readonly proceedButton: Locator;

  constructor(private readonly page: Page) {
    this.itemTitles = page.getByTestId('product-title');
    this.quantityInputs = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  async setQuantity(row: number, quantity: number): Promise<void> {
    const input = this.quantityInputs.nth(row);
    await input.fill(String(quantity));
    // blur commits the change so the cart refetches totals
    await input.blur();
  }

  async proceedToSignIn(): Promise<void> {
    await this.proceedButton.click();
  }
}
