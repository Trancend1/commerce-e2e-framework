import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

/** Quarantined tests are excluded here, in config, rather than by adding --grep-invert to each
 *  CI command — a workflow that forgets the flag would leak them back into a gate silently.
 *  They still run nightly via the quarantine-* projects. See docs/TEST-STRATEGY.md. */
const QUARANTINE = /@quarantine/;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  // json is always on: scripts/check-flake.mjs reads it to enforce the zero-flaky budget, and a
  // reporter that only exists in CI cannot be verified locally before you push.
  //
  // Allure is opt-in locally via ALLURE=1 rather than always-on, because its writer only creates
  // `allure-results` and never clears it — repeated local runs would pile up stale results and
  // generate a report describing tests that no longer exist. CI gets a fresh runner every time,
  // so there it is safe to leave on.
  reporter: [
    ['html'],
    ['json', { outputFile: process.env.PW_JSON_REPORT ?? 'test-results/report.json' }],
    ...(process.env.CI || process.env.ALLURE
      ? [
          [
            'allure-playwright',
            {
              resultsDir: 'allure-results',
              // Which SUT produced this report — otherwise a published report cannot be told
              // apart from one run against a different environment.
              environmentInfo: { WEB_URL: env.baseUrl, API_URL: env.apiUrl },
            },
          ] as const,
        ]
      : []),
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  // Tolerance for visual comparison, per ADR-004. It absorbs anti-aliasing noise between runs on
  // the same platform — and, honestly, small real regressions too; the number is a starting point
  // to revisit if either failure mode shows up.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test', // Toolshop marks elements with data-test, not data-testid
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testDir: './tests/setup', testMatch: /.*\.setup\.ts/ },
    { name: 'api', testDir: './tests/api', grepInvert: QUARANTINE, use: { baseURL: env.apiUrl } },
    {
      name: 'chromium',
      testDir: './tests/ui',
      grepInvert: QUARANTINE,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      grepInvert: QUARANTINE,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      grepInvert: QUARANTINE,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    // Visual baselines are platform-specific — see ADR-004. Chromium only, and generated in CI,
    // because a screenshot taken on Windows never matches one taken on the Linux runner.
    {
      name: 'visual',
      testDir: './tests/visual',
      grepInvert: QUARANTINE,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    // Accessibility scans a page's rendered state, which does not vary by engine in ways axe
    // reports on, so one browser is enough — see ADR-003.
    {
      name: 'a11y',
      testDir: './tests/a11y',
      grepInvert: QUARANTINE,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    // Quarantine runs with retries: 0 — the point is to observe whether the test has healed, and
    // retries would hide exactly the instability that put it here.
    {
      name: 'quarantine-api',
      testDir: './tests/api',
      grep: QUARANTINE,
      retries: 0,
      use: { baseURL: env.apiUrl },
    },
    {
      name: 'quarantine-ui',
      testDir: './tests/ui',
      grep: QUARANTINE,
      retries: 0,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
