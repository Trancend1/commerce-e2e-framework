// TEMPORARY probe used to validate the quarantine mechanism. Deleted before merge.
import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Quarantine probe', () => {
  test(
    'probe test that should never reach a gate @quarantine',
    { annotation: { type: 'quarantine', description: 'mechanism probe, 2026-07-27' } },
    async ({ catalogPage }) => {
      await catalogPage.goto();
      await expect(catalogPage.productCards.first()).toBeVisible();
    },
  );
});
