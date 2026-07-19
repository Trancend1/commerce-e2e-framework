import { test, expect } from '../../fixtures/pages.fixture';
import { buildUser } from '../../utils/dataFactory';

test.describe('Registration', () => {
  test('registers a new customer who can then sign in @smoke', async ({
    registerPage,
    loginPage,
    page,
  }) => {
    const user = buildUser();

    await registerPage.goto();
    await registerPage.registerAs(user);
    await expect(page).toHaveURL(/\/auth\/login/);

    await loginPage.loginAs(user.email, user.password);
    await expect(page).toHaveURL(/\/account/);
  });
});
