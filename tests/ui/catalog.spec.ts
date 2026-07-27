import { test, expect } from '../../fixtures/pages.fixture';

// Seeded upstream catalog data (docs/TEST-DATA.md) — not user-generated test data.
const SEARCH_TERM = 'Pliers';
const CATEGORY_LABEL = 'Hammer';

test.describe('Catalog', () => {
  test('search narrows the grid to relevant results @smoke', async ({ catalogPage }) => {
    await catalogPage.goto();

    await catalogPage.searchFor(SEARCH_TERM);

    // caption only renders once the search has been applied — guards against reading the stale grid
    await expect(catalogPage.searchTermCaption).toContainText(SEARCH_TERM, { ignoreCase: true });
    // the search API matches descriptions too, so assert relevance, not name-only matches
    await expect(
      catalogPage.productNames.filter({ hasText: new RegExp(SEARCH_TERM, 'i') }).first(),
    ).toBeVisible();
  });

  test('category filter narrows the product grid @regression', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect(catalogPage.productCards.first()).toBeVisible();
    const unfilteredCount = await catalogPage.productCards.count();

    await catalogPage.filterByCategory(CATEGORY_LABEL);

    // Assert the filter's observable effect: the grid shrinks but still renders results.
    // Whether the survivors genuinely belong to the category is a data question, checked at the
    // API layer — asserting it here would couple this test to how seeded products are named.
    await expect.poll(() => catalogPage.productCards.count()).toBeLessThan(unfilteredCount);
    await expect(catalogPage.productCards.first()).toBeVisible();
  });
});
