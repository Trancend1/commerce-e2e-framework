#!/usr/bin/env node
/**
 * Fails the run if Playwright recorded a flaky test — one that failed, then passed on retry.
 *
 * Playwright exits 0 for a flaky pass, so without this the gate reports green on an unreliable
 * signal. That is not hypothetical: the webkit checkout race in run 30283340404 sat behind a
 * green nightly for exactly this reason.
 *
 * The budget is binary ("zero flaky tests"), not a percentage — see docs/TEST-STRATEGY.md. On a
 * suite this size one flaky test is already 5%, so a rate would be noise rather than a signal.
 *
 * Usage: node scripts/check-flake.mjs [path-to-json-report]
 */
import { readFileSync } from 'node:fs';

const reportPath = process.argv[2] ?? 'test-results/report.json';

let report;
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error(`check-flake: cannot read ${reportPath}`);
  console.error('The Playwright run must emit the json reporter for this check to mean anything.');
  console.error(String(error));
  process.exit(1);
}

const flaky = [];

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.status === 'flaky') {
        const attempts = test.results?.length ?? 0;
        flaky.push(
          `${spec.file}:${spec.line} › ${spec.title} [${test.projectName}] (${attempts} attempts)`,
        );
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}

for (const suite of report.suites ?? []) walk(suite);

if (flaky.length === 0) {
  console.log(`check-flake: no flaky tests in ${reportPath}`);
  process.exit(0);
}

console.error(`check-flake: ${flaky.length} flaky test(s) — passed only on retry:`);
for (const entry of flaky) console.error(`  - ${entry}`);
console.error('');
console.error('Fix the underlying race, or quarantine the test: tag it @quarantine and add');
console.error("an annotation { type: 'quarantine', description: '<reason>, YYYY-MM-DD' }.");
process.exit(1);
