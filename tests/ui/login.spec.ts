import { test, expect } from '../../fixtures/pages.fixture';
import { env } from '../../config/env';

test.describe('Authentication', () => {
  test('logs in with valid customer credentials @smoke', async ({ loginPage, page }) => {
    await loginPage.goto();

    await loginPage.loginAs(env.customerEmail, env.customerPassword);

    await expect(page).toHaveURL(/\/account/);
  });

  test('rejects login with invalid password @regression', async ({ loginPage }) => {
    await loginPage.goto();

    await loginPage.loginAs(env.customerEmail, 'definitely-wrong');

    await expect(loginPage.errorAlert).toBeVisible();
  });
});
