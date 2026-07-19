import { test, expect } from '@playwright/test';

test.describe('Categories API — contract', () => {
  test('GET /categories/tree returns 200 with nested categories @smoke', async ({ request }) => {
    const res = await request.get('/categories/tree');

    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const category of body) {
      expect(category).toMatchObject({
        id: expect.anything(),
        name: expect.any(String),
        slug: expect.any(String),
      });
      expect(Array.isArray(category.sub_categories)).toBe(true);
    }
  });

  // NOTE: POST /categories intentionally requires no auth in the upstream Swagger spec,
  // so the negative case here is payload validation, not authorization.
  test('POST /categories with an empty payload returns 422 @regression', async ({ request }) => {
    const res = await request.post('/categories', { data: {} });

    expect(res.status()).toBe(422);
  });
});
