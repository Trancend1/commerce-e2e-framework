# BUG-001: Checkout "Proceed to checkout" silently discards the click while the postcode lookup is in flight

|                 |                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**    | Medium                                                                                                                                                                       |
| **Priority**    | P2                                                                                                                                                                           |
| **Environment** | local Docker SUT @ `testsmith/practice-software-testing-sprint5-{api,ui}:2.3` · WebKit 26.5 via Playwright 1.61.1 (also reproducible in principle on any engine — see Notes) |
| **Found by**    | `tests/ui/checkout.spec.ts` — surfaced as a flaky failure in nightly [run 30283340404](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30283340404)         |
| **Status**      | Open                                                                                                                                                                         |

## Severity definitions

- **Critical**: blocks a revenue-path journey or corrupts data
- **Medium**: incorrect behavior off the critical path
- **Low**: cosmetic / minor UX

Rated **Medium**, not Critical: the checkout journey is the revenue path, but the block is
transient — a second click after the lookup lands proceeds normally, so a human user recovers
without noticing. What makes it worth filing is that the app gives no feedback at all, so the
user has no way to tell the click was ignored rather than slow.

## Steps to reproduce

1. Log in as a customer and add any product to the cart.
2. Go to `/checkout`, proceed past the cart and sign-in steps to **Billing Address**.
3. Fill **Country**, **Postal code** and **House number** — this triggers `GET /postcode-lookup`.
4. Click **Proceed to checkout** within ~50 ms of the last keystroke, while the lookup is still
   in flight. (Automation hits this naturally; by hand it needs a throttled connection or a
   breakpoint on the lookup response.)

## Expected result

One of the following — any of them is defensible, and the app does none:

- the click is queued and the wizard advances once the lookup resolves; **or**
- the button is disabled / shows a busy state while the lookup is pending; **or**
- the wizard advances immediately and the lookup patch applies to the already-advanced form.

## Actual result

The wizard stays on the **Billing Address** step indefinitely. The click is accepted by the
button (it takes focus) but produces no state change, no validation message, no spinner, and no
console error. The **Payment** step's `<select data-test="payment-method">` remains in the DOM
but hidden, so anything waiting on it waits forever.

From the failing run, the accessibility snapshot at +30 s still shows step 3 active with every
field populated and the button focused:

```
- listitem: Billing Address / "3"
- listitem: Payment / "4"
- button "Proceed to checkout" [active] [ref=e95]
```

## Evidence

Artifact `results-webkit` from [run 30283340404](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30283340404)
(screenshot, video, `error-context.md`, and the trace from the passing retry).

Action timeline extracted from the trace — the click lands inside the lookup cascade:

```
51.632ms +97ms   fill      house_number
51.752ms +162ms  click     proceed-3          <- cascade resolves inside this window
51.920ms +44ms   selectOption payment-method
```

Network transcript for the same step — the lookup fires **twice**, because the first response
patches the form and that patch re-triggers it:

```
GET /postcode-lookup?country=ID&postcode=91524&house_number=69   200   25ms
GET /postcode-lookup?country=ID&postcode=91524&house_number=69   200   29ms
```

Failure signature when the click is swallowed:

```
locator.selectOption: Test timeout of 30000ms exceeded.
  - waiting for getByTestId('payment-method')
    - locator resolved to <select id="payment-method" data-test="payment-method"
        formcontrolname="payment_method" class="form-select ng-untouched ng-pristine ng-invalid">
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
      - waiting 100ms
    53 × waiting for element to be visible and enabled
       - element is not visible
```

## Notes

**Root-cause hypothesis.** The billing form's auto-complete (`Enter country, postal code and
house number. We will fill in the rest automatically.`) runs as an async patch on the reactive
form. While that patch is pending the form is not in a submittable state, and the step-advance
handler appears to return early instead of surfacing why. The duplicate lookup suggests the
patch writes back into fields that are themselves watched, i.e. a feedback loop rather than a
deliberate second request — worth checking independently of this bug.

**Not WebKit-specific.** WebKit only widens the window. The race is between a user click and an
XHR round trip, so any engine can lose it on a slow enough connection; the chromium and firefox
shards simply never landed inside the ~54 ms window during these runs.

**Regression risk if fixed.** Disabling the button during the lookup is the smallest fix but
would need a visible busy state, otherwise it trades a silent no-op for an unexplained
disabled control.

**Impact on this framework.** Worked around in `pages/CheckoutPage.ts` by filling the three
lookup fields first and waiting for the cascade to settle before the caller clicks (see
`utils/waits.ts`). That removes the race from our suite but does not fix the SUT — the swallowed
click is still reachable by a real user. The workaround is deliberately a wait on the app's own
network activity, not a retried click, so if this defect ever regresses in a different form the
suite will fail rather than mask it.
