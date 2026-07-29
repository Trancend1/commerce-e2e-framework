// k6 load: ramping VUs against the login endpoint. Nightly only — see docs/TEST-STRATEGY.md §3a.
// Run: k6 run tests/performance/login.load.js  (requires local SUT — docs/ENVIRONMENT.md)
import http from 'k6/http';
import { check } from 'k6';
import { API, CUSTOMER, JSON_HEADERS, loadOptions } from './options.js';

export const options = loadOptions('login');

export default function () {
  const res = http.post(`${API}/users/login`, JSON.stringify(CUSTOMER), {
    headers: JSON_HEADERS,
    tags: { journey: 'login' },
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns access_token': (r) => JSON.parse(r.body).access_token !== undefined,
  });
}
