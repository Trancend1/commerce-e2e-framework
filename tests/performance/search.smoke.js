// k6 smoke: 1 VU sanity on product search. Load profile lives in search.load.js (nightly).
// Run: k6 run tests/performance/search.smoke.js  (requires local SUT — docs/ENVIRONMENT.md)
import { smokeOptions } from './options.js';
import { searchOnce } from './search.scenario.js';

export const options = smokeOptions('search');

export default searchOnce;
