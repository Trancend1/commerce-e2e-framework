import { type Page, type Locator } from '@playwright/test';

/** POM for the catalog/home page (/). Locators only — assertions live in specs. */
export class CatalogPage {
  readonly searchInput: Locator;
  readonly searchSubmitButton: Locator;
  readonly searchResetButton: Locator;
  /** Rendered only after a search completes — reliable "search applied" markers. */
  readonly searchTermCaption: Locator;
  readonly searchResultCount: Locator;
  readonly sortSelect: Locator;
  /** Product card links carry data-test="product-<ulid>" — prefix CSS match is the only option. */
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmitButton = page.getByTestId('search-submit');
    this.searchResetButton = page.getByTestId('search-reset');
    this.searchTermCaption = page.getByTestId('search-term');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.sortSelect = page.getByTestId('sort');
    this.productCards = page.locator('a[data-test^="product-01"]');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmitButton.click();
  }

  async filterByCategory(label: string): Promise<void> {
    await this.page.getByLabel(label).check();
  }

  async openFirstProduct(): Promise<void> {
    await this.productCards.first().click();
  }
}
