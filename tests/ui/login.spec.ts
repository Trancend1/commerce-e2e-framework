import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { env } from '../../config/env';

test.describe('Authentication', () => {
  test('logs in with valid customer credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.loginAs(env.customerEmail, env.customerPassword);

    await expect(page).toHaveURL(/\/account/);
  });

  test('rejects login with invalid password @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.loginAs(env.customerEmail, 'definitely-wrong');

    await expect(loginPage.errorAlert).toBeVisible();
  });
});
