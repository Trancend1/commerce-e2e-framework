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

/**
 * p95 budgets in ms — docs/TEST-STRATEGY.md §3a is the source of truth for these numbers.
 *
 * Smoke and load carry separate budgets because they measure different conditions. A single number
 * calibrated on 1 VU is either unreachable under load or toothless at rest: login observes ~134ms
 * on smoke and ~406ms at 20 VU, so one threshold would have to be wrong at one end. Journeys with
 * no `load` entry have no load profile by design.
 */
export const BUDGET_MS = Object.freeze({
  login: { smoke: 400, load: 550 },
  search: { smoke: 500, load: 600 },
  checkout: { smoke: 1200 },
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

function budgetFor(journey, profile) {
  const budget = BUDGET_MS[journey]?.[profile];
  if (budget === undefined) {
    throw new Error(
      `no ${profile} budget for journey "${journey}" — see docs/TEST-STRATEGY.md §3a`,
    );
  }
  return budget;
}

/** 1 VU sanity check — runs on the PR gate, so it has to stay cheap. */
export function smokeOptions(journey) {
  return { vus: 1, iterations: 5, thresholds: thresholds(journey, budgetFor(journey, 'smoke')) };
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
    thresholds: thresholds(journey, budgetFor(journey, 'load')),
  };
}

/** Distinct per VU and iteration, so no two requests carry an identical payload. */
export function uniqueSuffix() {
  return `${__VU}-${__ITER}`;
}
