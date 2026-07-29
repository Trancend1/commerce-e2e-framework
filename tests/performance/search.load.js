// k6 load: ramping VUs against product search. Nightly only — see docs/TEST-STRATEGY.md §3a.
// Run: k6 run tests/performance/search.load.js  (requires local SUT — docs/ENVIRONMENT.md)
import { loadOptions } from './options.js';
import { searchOnce } from './search.scenario.js';

export const options = loadOptions('search');

export default searchOnce;
