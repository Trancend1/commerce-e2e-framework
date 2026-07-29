// Shared k6 configuration: budgets, profiles, and SUT coordinates.
//
// These scripts run in the k6 runtime, not Node, so they read `__ENV` directly rather than going
// through config/env.ts (CLAUDE.md §4.2 governs the Playwright layer).

export const API = __ENV.SUT_API_URL || 'http://localhost:8091';

export const CUSTOMER = {
  email: __ENV.SUT_CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
  password: __ENV.SUT_CUSTOMER_PASSWORD || 'welcome01',
};

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** p95 budgets in ms — docs/TEST-STRATEGY.md §3a is the source of truth for these numbers. */
export const BUDGET_MS = Object.freeze({
  login: 400,
  search: 500,
  checkout: 1200,
});

/**
 * Thresholds are scoped to a `journey` tag rather than applied to `http_req_duration` as a whole.
 * The checkout scenario mints a token before it can post an invoice, and that login call would
 * otherwise drag the checkout p95 toward login's much faster numbers — the budget would then pass
 * for the wrong reason. `http_req_failed` stays global: a fast error is still an error.
 *
 * A tag typo makes the submetric empty, which k6 reports rather than silently passing.
 */
function thresholds(journey, budgetMs) {
  return {
    http_req_failed: ['rate==0'],
    [`http_req_duration{journey:${journey}}`]: [`p(95)<${budgetMs}`],
  };
}

/** 1 VU sanity check — runs on the PR gate, so it has to stay cheap. */
export function smokeOptions(journey) {
  return { vus: 1, iterations: 5, thresholds: thresholds(journey, BUDGET_MS[journey]) };
}

/**
 * Nightly load profile — ramp to 20 VU, hold, ramp down (docs/TEST-STRATEGY.md §3a).
 *
 * 20 is well under the 50 VU ceiling in TEST-PLAN.md §4 because the runner hosts the SUT next to
 * k6 on 2 vCPUs; past roughly this point the p95 measures runner saturation, not the application.
 */
export function loadOptions(journey) {
  return {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '1m', target: 20 },
      { duration: '30s', target: 0 },
    ],
    thresholds: thresholds(journey, BUDGET_MS[journey]),
  };
}

/** Distinct per VU and iteration, so no two requests carry an identical payload. */
export function uniqueSuffix() {
  return `${__VU}-${__ITER}`;
}
