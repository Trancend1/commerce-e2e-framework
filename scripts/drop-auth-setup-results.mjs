#!/usr/bin/env node
/**
 * Removes the auth `setup` project's results from a merged allure-results directory.
 *
 * `setup` mints storageState; it is a fixture, not a test. It runs once per job that needs auth,
 * so the merged nightly results contain several identical executions sharing a historyId, which
 * Allure folds into one entry with retries — a retry badge in the very report meant to make
 * instability visible.
 *
 * Selection is by the `parentSuite` label, which allure-playwright sets to the Playwright project
 * name. Matching on the file path instead would also catch any unrelated result that merely
 * mentions `auth.setup.ts` somewhere in a stack trace or attachment.
 *
 * A real setup failure is still loud: every test in that job fails with it.
 *
 * Usage: node scripts/drop-auth-setup-results.mjs [allure-results-dir]
 */
import { readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const SETUP_PROJECT = 'setup';

const dir = process.argv[2] ?? 'allure-results';

let entries;
try {
  entries = readdirSync(dir).filter((name) => name.endsWith('-result.json'));
} catch (error) {
  console.error(`drop-auth-setup-results: cannot read ${dir}`);
  console.error(String(error));
  process.exit(1);
}

// No results at all means every suite died before reporting. The report is published anyway
// (see nightly.yml), so this is not the place to turn that into a second failure.
if (entries.length === 0) {
  console.warn(`drop-auth-setup-results: no result files in ${dir} — nothing to do`);
  process.exit(0);
}

const dropped = [];
const unreadable = [];

for (const name of entries) {
  const path = join(dir, name);
  let result;
  try {
    result = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    unreadable.push(`${name}: ${String(error)}`);
    continue;
  }
  const parentSuite = result.labels?.find((label) => label.name === 'parentSuite')?.value;
  if (parentSuite === SETUP_PROJECT) {
    unlinkSync(path);
    dropped.push(`${name} (${result.fullName ?? result.name ?? 'unnamed'})`);
  }
}

if (unreadable.length > 0) {
  console.error(`drop-auth-setup-results: ${unreadable.length} result file(s) failed to parse:`);
  for (const entry of unreadable) console.error(`  - ${entry}`);
  process.exit(1);
}

for (const entry of dropped) console.log(`  dropped ${entry}`);

// Every nightly runs at least one auth setup, so an empty match means the label scheme moved
// under us (an allure-playwright upgrade, a renamed project). Failing here is the only way that
// surfaces before the retry badges quietly come back.
if (dropped.length === 0) {
  console.error(
    `drop-auth-setup-results: found no result with parentSuite="${SETUP_PROJECT}" among ` +
      `${entries.length} result file(s) in ${dir}.`,
  );
  console.error('Either the project was renamed or allure-playwright changed its labels.');
  process.exit(1);
}

console.log(
  `drop-auth-setup-results: dropped ${dropped.length} of ${entries.length} result(s) from ${dir}`,
);
