import { test, expect } from '@playwright/test';

test.describe('Brands API — contract', () => {
  test('GET /brands returns 200 with the brand list @smoke', async ({ request }) => {
    const res = await request.get('/brands');

    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const brand of body) {
      expect(brand).toMatchObject({
        id: expect.anything(),
        name: expect.any(String),
        slug: expect.any(String),
      });
    }
  });

  test('GET /brands/{id} with unknown id returns 404 @regression', async ({ request }) => {
    const res = await request.get('/brands/does-not-exist-999999');

    expect(res.status()).toBe(404);
  });

  // NOTE: POST /brands intentionally requires no auth in the upstream Swagger spec,
  // so the negative case here is payload validation, not authorization.
  test('POST /brands with an empty payload returns 422 @regression', async ({ request }) => {
    const res = await request.post('/brands', { data: {} });

    expect(res.status()).toBe(422);
  });
});
