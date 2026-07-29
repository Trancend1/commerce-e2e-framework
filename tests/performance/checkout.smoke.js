// k6 smoke: 1 VU sanity on the full checkout chain — browse → cart → add item → invoice.
//
// Smoke only, deliberately: a load profile here would write hundreds of orders into the very
// database whose response times are being measured (docs/TEST-STRATEGY.md §3a, ADR decision D3).
//
// Run: k6 run tests/performance/checkout.smoke.js  (requires local SUT — docs/ENVIRONMENT.md)
import http from 'k6/http';
import { check, fail } from 'k6';
import { API, CUSTOMER, JSON_HEADERS, smokeOptions, uniqueSuffix } from './options.js';

export const options = smokeOptions('checkout');

const TAGS = { journey: 'checkout' };

// The token is minted once, outside the measured journey. Login is fast enough that folding it
// into every iteration would pull the checkout p95 down and let the budget pass for the wrong
// reason — login has its own budget and its own script.
export function setup() {
  const res = http.post(`${API}/users/login`, JSON.stringify(CUSTOMER), { headers: JSON_HEADERS });
  if (res.status !== 200) fail(`login failed with ${res.status} — cannot exercise checkout`);
  return { token: JSON.parse(res.body).access_token };
}

export default function (data) {
  const authHeaders = { ...JSON_HEADERS, Authorization: `Bearer ${data.token}` };

  const products = http.get(`${API}/products`, { tags: TAGS });
  const productId = JSON.parse(products.body).data[0].id;

  const cart = http.post(`${API}/carts`, '{}', { headers: JSON_HEADERS, tags: TAGS });
  const cartId = JSON.parse(cart.body).id;

  const added = http.post(
    `${API}/carts/${cartId}`,
    JSON.stringify({ product_id: productId, quantity: 1 }),
    { headers: JSON_HEADERS, tags: TAGS },
  );

  const suffix = uniqueSuffix();
  const invoice = http.post(
    `${API}/invoices`,
    JSON.stringify({
      billing_street: `${suffix} Load Test Street`,
      billing_city: 'Rotterdam',
      billing_state: 'Zuid-Holland',
      billing_country: 'Netherlands',
      billing_postal_code: '3011',
      payment_method: 'cash-on-delivery',
      payment_details: {},
      cart_id: cartId,
    }),
    { headers: authHeaders, tags: TAGS },
  );

  check(products, { 'products listed': (r) => r.status === 200 });
  check(cart, { 'cart created': (r) => r.status === 201 });
  check(added, { 'item added to cart': (r) => r.status >= 200 && r.status < 300 });
  check(invoice, {
    'invoice created': (r) => r.status === 201,
    'invoice number issued': (r) => /^INV/.test(JSON.parse(r.body).invoice_number),
  });
}
