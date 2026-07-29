// The search request itself, shared by search.smoke.js and search.load.js so the smoke and the
// load profile can never drift into measuring different things.
import http from 'k6/http';
import { check } from 'k6';
import { API } from './options.js';

// Rotated so consecutive requests are not identical, which would measure the cache rather than the
// search. Terms are ordinary catalog words; `pliers` is the one the Swagger-derived Postman
// collection uses, so it is known to match the seeded data.
const TERMS = ['pliers', 'hammer', 'saw', 'wrench', 'drill'];

export function searchOnce() {
  const term = TERMS[(__ITER + __VU) % TERMS.length];
  const res = http.get(`${API}/products/search?q=${term}`, { tags: { journey: 'search' } });

  check(res, {
    'status is 200': (r) => r.status === 200,
    // Shape, not hit count: a term with no matches is still a correct, fast response, and
    // asserting on results would make the perf gate fail for a seed-data reason.
    'returns a data array': (r) => Array.isArray(JSON.parse(r.body).data),
  });
}
