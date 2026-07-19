import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { buildAddress } from '../../utils/dataFactory';
import { env } from '../../config/env';

test.describe('Cart → checkout API — integration', () => {
  test('cart is created, filled, and converted into an invoice @smoke', async ({ request }) => {
    const productsRes = await request.get('/products');
    expect(productsRes.status()).toBe(200);
    const firstProduct = ((await productsRes.json()) as { data: Array<{ id: string }> }).data[0];

    const cartRes = await request.post('/carts', { data: {} });
    expect(cartRes.status()).toBe(201);
    const { id: cartId } = (await cartRes.json()) as { id: string };
    expect(cartId).toBeTruthy();

    const addRes = await request.post(`/carts/${cartId}`, {
      data: { product_id: firstProduct.id, quantity: 2 },
    });
    expect(addRes.ok()).toBe(true);

    const cart = (await (await request.get(`/carts/${cartId}`)).json()) as {
      cart_items: Array<{ quantity: number }>;
    };
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0].quantity).toBe(2);

    const client = await ApiClient.loginAs(env.customerEmail, env.customerPassword);
    try {
      const address = buildAddress();
      const invoiceRes = await client.post('/invoices', {
        billing_street: address.street,
        billing_city: address.city,
        billing_state: address.state,
        billing_country: address.country,
        billing_postal_code: address.postal_code,
        payment_method: 'cash-on-delivery',
        payment_details: {},
        cart_id: cartId,
      });
      expect(invoiceRes.status()).toBe(201);
      const invoice = (await invoiceRes.json()) as { invoice_number: string };
      expect(invoice.invoice_number).toMatch(/^INV/);
    } finally {
      await client.dispose();
    }
  });

  test('POST /invoices without a token is rejected as unauthorized @regression', async ({
    request,
  }) => {
    const res = await request.post('/invoices', { data: { cart_id: 'x' } });

    expect(res.status()).toBe(401);
  });
});
