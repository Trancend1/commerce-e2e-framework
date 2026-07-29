import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import type { Result } from 'axe-core';

/**
 * Accessibility scanning against the budget in ADR-003: zero `serious` or `critical` violations.
 *
 * `moderate` and `minor` are attached to the report rather than enforced. Toolshop is a third-party
 * SUT whose accessibility state this project inherits, so a budget covering every severity would
 * produce a permanently red gate and a growing exception list — noise instead of a standard.
 */
const BLOCKING_IMPACTS: ReadonlySet<string> = new Set(['serious', 'critical']);

/**
 * Rule IDs that stay red on purpose, each with a reason, a bug report, and the date it was waived.
 *
 * A waiver is a decision on the record, not a way to make the gate quiet: ADR-003 requires the
 * violation to be written up in docs/bug-reports/ before it lands here. Empty is the healthy state.
 *
 * Waivers are keyed by rule, not by page, so the same rule breaking on a page added to the scan
 * later would also pass. The attachment is the backstop — every violation, waived or not, is still
 * written into the report, so a waived rule spreading is visible to anyone who opens it.
 */
export const WAIVED_RULES: Readonly<Record<string, string>> = Object.freeze({
  'button-name':
    'BUG-002 — login password reveal toggle has no accessible name. Upstream markup in a ' +
    'third-party practice app, not ours to fix. Waived 2026-07-29.',
  list:
    'BUG-003 — catalog filter groups put <fieldset> directly inside <ul>. Upstream markup, one ' +
    'repeated component. Waived 2026-07-29.',
});

function describe(violation: Result): string {
  const nodes = violation.nodes.length;
  return `${violation.id} (${violation.impact}) — ${nodes} node(s) — ${violation.help}`;
}

/**
 * Scans the current page and fails when a non-waived `serious` or `critical` violation is present.
 *
 * The full violation list is attached to the report first, so a failing run still shows the
 * moderate and minor findings alongside the blocking ones rather than only what broke the gate.
 */
export async function expectNoBlockingViolations(page: Page, testInfo: TestInfo): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();

  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  });

  const blocking = violations
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
    .filter((violation) => !(violation.id in WAIVED_RULES))
    .map(describe);

  expect(blocking, 'serious or critical accessibility violations (ADR-003)').toEqual([]);
}
