import { type Page, type Locator } from '@playwright/test';

/** POM for the product detail page (/product/:id). Locators only — assertions live in specs. */
export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantityInput: Locator;
  readonly increaseQuantityButton: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly addToCartButton: Locator;
  /** Navbar cart entry — rendered on every page, but journeys reach it from here. */
  readonly navCartLink: Locator;
  readonly cartQuantityBadge: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantityInput = page.getByTestId('quantity');
    this.increaseQuantityButton = page.getByTestId('increase-quantity');
    this.decreaseQuantityButton = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.navCartLink = page.getByTestId('nav-cart');
    this.cartQuantityBadge = page.getByTestId('cart-quantity');
  }

  /**
   * Adds the product and returns only once the server has recorded it.
   *
   * The click fires a two-request cascade — `POST /carts` creates the cart, then
   * `POST /carts/{id}` adds the product — and the quantity badge only renders after the second
   * one responds. A bare click therefore hands every caller a race against an unbounded round
   * trip, covered by nothing but the default 5s expect timeout on whatever they assert next.
   * That race has now surfaced three times: the register flake, the a11y checkout scan, and a
   * fresh-clone run of `cart.spec.ts`. Fixing it at the two call sites left the source intact.
   *
   * Waiting on the *response* rather than a request-quiet window is deliberate: a single
   * in-flight request emits no events while it hangs, so a quiet window cannot tell "still
   * waiting" apart from "finished" and settles early. Registered before the click so a fast
   * round trip cannot land before the listener is attached.
   */
  async addToCart(): Promise<void> {
    const itemAdded = this.page.waitForResponse(
      (r) => /\/carts\/[^/]+$/.test(r.url()) && r.request().method() === 'POST',
    );
    await this.addToCartButton.click();
    await itemAdded;
  }
}
