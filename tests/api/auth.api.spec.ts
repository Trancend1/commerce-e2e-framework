import { test, expect } from '@playwright/test';
import { buildUser } from '../../utils/dataFactory';
import { env } from '../../config/env';

test.describe('Auth API — integration', () => {
  test('register → login → /users/me chain works @smoke', async ({ request }) => {
    const user = buildUser();

    const registerRes = await request.post('/users/register', { data: user });
    expect(registerRes.status()).toBe(201);

    const loginRes = await request.post('/users/login', {
      data: { email: user.email, password: user.password },
    });
    expect(loginRes.status()).toBe(200);
    const { access_token } = (await loginRes.json()) as { access_token: string };
    expect(access_token).toBeTruthy();

    const meRes = await request.get('/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(meRes.status()).toBe(200);
    const me = (await meRes.json()) as { email: string };
    expect(me.email).toBe(user.email);
  });
});

test.describe('Auth API — negative', () => {
  test('login with a wrong password returns 401 @regression', async ({ request }) => {
    const res = await request.post('/users/login', {
      data: { email: env.customerEmail, password: 'definitely-wrong' },
    });

    expect(res.status()).toBe(401);
  });

  test('GET /users/me without a token returns 401 @regression', async ({ request }) => {
    const res = await request.get('/users/me');

    expect(res.status()).toBe(401);
  });

  test('registering the same email twice returns 409 @regression', async ({ request }) => {
    const user = buildUser();

    const first = await request.post('/users/register', { data: user });
    expect(first.status()).toBe(201);

    const second = await request.post('/users/register', { data: user });
    expect(second.status()).toBe(409);
  });
});
