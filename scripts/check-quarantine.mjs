#!/usr/bin/env node
/**
 * Enforces the quarantine policy (docs/TEST-STRATEGY.md).
 *
 * Quarantine without an exit is a graveyard: tests get parked, the suite quietly shrinks, and
 * nobody notices because the gate stays green. Two rules make that visible:
 *
 *   1. Every @quarantine test must carry an annotation
 *      { type: 'quarantine', description: '<reason>, YYYY-MM-DD' }
 *   2. Nothing may stay quarantined longer than QUARANTINE_MAX_DAYS (default 14).
 *
 * Reads `playwright test --list`, so it never boots the SUT and is cheap enough for the lint job.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const MAX_DAYS = Number(process.env.QUARANTINE_MAX_DAYS ?? 14);

let report;
try {
  // Resolve the CLI and run it under this Node binary. Spawning `npx` would need a shell on
  // Windows, where Node refuses to execFile a .cmd directly.
  const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
  const raw = execFileSync(process.execPath, [cli, 'test', '--list', '--reporter=json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  report = JSON.parse(raw);
} catch (error) {
  console.error('check-quarantine: could not list tests');
  console.error(error.stdout ?? String(error));
  process.exit(1);
}

const DATE = /(\d{4}-\d{2}-\d{2})/;
const quarantined = [];

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    // Playwright strips the leading @ when it parses tags out of the title; accept both spellings
    // so this keeps working if that ever changes.
    const tags = spec.tags ?? [];
    if (!tags.includes('quarantine') && !tags.includes('@quarantine')) continue;
    // A spec appears once per project; the annotation is identical across them.
    const annotations = spec.tests?.[0]?.annotations ?? [];
    const note = annotations.find((a) => a.type === 'quarantine');
    quarantined.push({
      where: `${spec.file}:${spec.line} › ${spec.title}`,
      description: note?.description,
    });
  }
  for (const child of suite.suites ?? []) walk(child);
}

for (const suite of report.suites ?? []) walk(suite);

if (quarantined.length === 0) {
  console.log('check-quarantine: nothing quarantined');
  process.exit(0);
}

const today = new Date();
const problems = [];

console.log(
  `check-quarantine: ${quarantined.length} quarantined test(s), max age ${MAX_DAYS} days`,
);
for (const entry of quarantined) {
  if (!entry.description) {
    problems.push(
      `${entry.where}\n      missing annotation { type: 'quarantine', description: '<reason>, YYYY-MM-DD' }`,
    );
    continue;
  }
  const match = DATE.exec(entry.description);
  if (!match) {
    problems.push(
      `${entry.where}\n      annotation has no YYYY-MM-DD date: "${entry.description}"`,
    );
    continue;
  }
  // Both sides in UTC: mixing a local "now" with a UTC-parsed date makes a same-day quarantine
  // read as -1d west of the line, which would let an expiry slip by for a day.
  const since = Date.parse(`${match[1]}T00:00:00Z`);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = Math.floor((todayUtc - since) / 86_400_000);

  if (days < 0) {
    console.log(`  [FUTURE] ${days}d  ${entry.where} — ${entry.description}`);
    problems.push(`${entry.where}\n      dated ${match[1]}, which is in the future`);
    continue;
  }

  const state = days > MAX_DAYS ? 'EXPIRED' : 'ok';
  console.log(`  [${state}] ${days}d  ${entry.where} — ${entry.description}`);
  if (days > MAX_DAYS) {
    problems.push(`${entry.where}\n      quarantined ${days} days ago, limit is ${MAX_DAYS}`);
  }
}

if (problems.length === 0) process.exit(0);

console.error('');
console.error(`check-quarantine: ${problems.length} policy violation(s):`);
for (const problem of problems) console.error(`  - ${problem}`);
console.error('');
console.error('Fix the test and drop the @quarantine tag, or make a deliberate decision to');
console.error('delete it. Extending the date without doing either is how a suite rots.');
process.exit(1);
