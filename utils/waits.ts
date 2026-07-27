import { type Page, type Request } from '@playwright/test';

/** Named wait budgets — no magic timeout numbers in specs or page objects (CLAUDE.md §4.2). */
export const WAIT_BUDGET = Object.freeze({
  /** Upper bound for a form auto-complete request cascade to go quiet. */
  formAutoComplete: 10_000,
  /** How long a matched endpoint must be idle before it counts as settled. */
  networkQuiet: 250,
});

/**
 * Resolves once no request whose URL contains `urlPart` has started or finished for `quietMs`
 * — i.e. the request cascade triggered by a form interaction has come to rest.
 *
 * Event-driven, never a fixed sleep: each matching request re-arms the quiet window, so this
 * handles cascades of unknown length (one response patching a form and triggering the next).
 * If the endpoint is never hit at all it settles after `quietMs` rather than hanging.
 */
export function waitForRequestsToSettle(
  page: Page,
  urlPart: string,
  { quietMs = WAIT_BUDGET.networkQuiet, timeout = WAIT_BUDGET.formAutoComplete } = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let quietTimer: ReturnType<typeof setTimeout>;
    let deadlineTimer: ReturnType<typeof setTimeout>;

    const cleanup = (): void => {
      clearTimeout(quietTimer);
      clearTimeout(deadlineTimer);
      page.off('request', onActivity);
      page.off('requestfinished', onActivity);
      page.off('requestfailed', onActivity);
    };

    const armQuietWindow = (): void => {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(() => {
        cleanup();
        resolve();
      }, quietMs);
    };

    function onActivity(request: Request): void {
      if (request.url().includes(urlPart)) armQuietWindow();
    }

    deadlineTimer = setTimeout(() => {
      cleanup();
      reject(new Error(`Requests matching "${urlPart}" did not settle within ${timeout}ms`));
    }, timeout);

    page.on('request', onActivity);
    page.on('requestfinished', onActivity);
    page.on('requestfailed', onActivity);
    armQuietWindow();
  });
}
