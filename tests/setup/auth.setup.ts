import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { env } from '../../config/env';
import { CUSTOMER_STORAGE_STATE } from '../../fixtures/auth.fixture';

setup('authenticate as customer', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs(env.customerEmail, env.customerPassword);
  await expect(page).toHaveURL(/\/account/);
  await page.context().storageState({ path: CUSTOMER_STORAGE_STATE });
});
