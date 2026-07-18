import { test, expect } from '@playwright/test';

test.describe('Products API — contract', () => {
  test('GET /products returns 200 with paginated product list @smoke', async ({ request }) => {
    const res = await request.get('/products');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    // contract: every product exposes the fields the UI depends on
    for (const product of body.data) {
      expect(product).toMatchObject({
        id: expect.anything(),
        name: expect.any(String),
        price: expect.any(Number),
      });
    }
  });

  test('GET /products/{id} with unknown id returns 404 @regression', async ({ request }) => {
    const res = await request.get('/products/does-not-exist-999999');

    expect(res.status()).toBe(404);
  });
});
