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

    // Armed before the submit, not after: the app only routes to /auth/login once POST
    // /users/register comes back, and on webkit that round trip has outlasted the 5s URL
    // assertion (run 30452593269, passed on retry). Waiting for the response makes the
    // precondition explicit instead of hoping the redirect wins a race against a timeout.
    const registered = page.waitForResponse(
      (response) =>
        response.url().includes('/users/register') && response.request().method() === 'POST',
    );
    await registerPage.registerAs(user);
    expect((await registered).status()).toBe(201);

    await expect(page).toHaveURL(/\/auth\/login/);

    await loginPage.loginAs(user.email, user.password);
    await expect(page).toHaveURL(/\/account/);
  });
});
