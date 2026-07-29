#!/usr/bin/env node
/**
 * Assembles the published Pages site from a freshly generated Allure report plus the site the
 * previous nightly published.
 *
 * A Pages deploy replaces the whole site, so without carrying the old one forward only the latest
 * report would exist and every historical trend point would open someone else's results. The site
 * therefore keeps one report per run under `runs/<run>/`, with the newest also copied to the root
 * so the README link always lands on the latest.
 *
 * The root is rebuilt from scratch each time rather than copied over: Allure emits hashed asset
 * names, so overwriting in place would silently accumulate every past run's orphaned assets.
 *
 * Retention is bounded — see --keep. Old reports fall off the site; their trend points then link
 * to a run whose report is gone, which is the same failure the previous site had for every point,
 * only now deferred by `keep` nights.
 *
 * Usage: node scripts/assemble-report-site.mjs --report <dir> --site <dir> --run <n> [--keep 20]
 */
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (value === undefined) {
    console.error(`assemble-report-site: --${name} needs a value`);
    process.exit(1);
  }
  return value;
}

const reportDir = arg('report', 'allure-report');
const siteDir = arg('site', 'site');
const runNumber = arg('run');
const keep = Number(arg('keep', '20'));

if (!runNumber || !/^\d+$/.test(runNumber)) {
  console.error(`assemble-report-site: --run must be a positive integer, got ${runNumber}`);
  process.exit(1);
}
if (!Number.isInteger(keep) || keep < 1) {
  console.error(`assemble-report-site: --keep must be a positive integer, got ${arg('keep')}`);
  process.exit(1);
}
if (!existsSync(reportDir)) {
  console.error(`assemble-report-site: no report at ${reportDir} — nothing to publish`);
  process.exit(1);
}

// Park the previous runs/ outside the site while the root is rebuilt, then put it back. Anything
// else in the old site is a stale root report and is meant to go.
const parked = `${siteDir}-runs.tmp`;
rmSync(parked, { recursive: true, force: true });
if (existsSync(join(siteDir, 'runs'))) renameSync(join(siteDir, 'runs'), parked);

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });
cpSync(reportDir, siteDir, { recursive: true });

mkdirSync(join(siteDir, 'runs'), { recursive: true });
if (existsSync(parked)) {
  cpSync(parked, join(siteDir, 'runs'), { recursive: true });
  rmSync(parked, { recursive: true, force: true });
}

// Republishing the same run number has to overwrite rather than merge, or a re-dispatch would
// leave a report that is half one run and half another.
const runDir = join(siteDir, 'runs', runNumber);
rmSync(runDir, { recursive: true, force: true });
cpSync(reportDir, runDir, { recursive: true });

const runs = readdirSync(join(siteDir, 'runs'))
  .filter((name) => /^\d+$/.test(name))
  .sort((a, b) => Number(b) - Number(a));

const dropped = runs.slice(keep);
for (const name of dropped) rmSync(join(siteDir, 'runs', name), { recursive: true, force: true });

const retained = runs.slice(0, keep);
console.log(`assemble-report-site: root = run ${runNumber}`);
console.log(
  `assemble-report-site: keeping ${retained.length} run report(s): ${retained.join(', ')}`,
);
if (dropped.length > 0) {
  console.log(
    `assemble-report-site: pruned ${dropped.length} beyond --keep ${keep}: ${dropped.join(', ')}`,
  );
}
