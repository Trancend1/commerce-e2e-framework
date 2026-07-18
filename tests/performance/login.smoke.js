// k6 smoke: 1 VU sanity on the login endpoint. Load profiles live in *.load.js (nightly).
// Run: k6 run tests/performance/login.smoke.js  (requires local SUT — docs/ENVIRONMENT.md)
import http from 'k6/http';
import { check } from 'k6';

const API = __ENV.SUT_API_URL || 'http://localhost:8091';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<800'], // budget: p95 under 800ms even on cold local runs
  },
};

export default function () {
  const res = http.post(
    `${API}/users/login`,
    JSON.stringify({
      email: __ENV.SUT_CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
      password: __ENV.SUT_CUSTOMER_PASSWORD || 'welcome01',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns access_token': (r) => JSON.parse(r.body).access_token !== undefined,
  });
}
