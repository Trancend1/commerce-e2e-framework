# BUG-002: Login password reveal button has no accessible name

|                 |                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**    | Medium                                                                                                                                                  |
| **Priority**    | P2                                                                                                                                                      |
| **Environment** | local Docker SUT @ `testsmith/practice-software-testing-sprint5-{api,ui}:2.3` · axe-core 4.12.1 via `@axe-core/playwright`, Chromium through Playwright |
| **Found by**    | `tests/a11y/accessibility.spec.ts` — nightly [run 30462989730](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30462989730)            |
| **Status**      | Open                                                                                                                                                    |

## Severity definitions

- **Critical**: blocks a revenue-path journey or corrupts data
- **High**: core feature broken, workaround exists
- **Medium**: incorrect behavior off the critical path
- **Low**: cosmetic / minor UX

axe rates this rule `critical`, this report rates it **Medium**, and the difference is deliberate.
axe's impact describes how severely the rule breaks assistive technology in general; the severity
here describes what it costs a user of this application. Someone using a screen reader can still
sign in — the email and password fields are labelled correctly and the Login button is named — so
nothing on the auth path is blocked. What they cannot do is discover what the unlabelled control
next to the password field is for, or tell whether their password is currently revealed.

## Steps to reproduce

1. Start the local SUT (`bash scripts/sut-up.sh`) and open `/auth/login`.
2. Run an axe scan against the page, or inspect the button to the right of the password input.
3. Observe the rendered control: an eye icon that toggles password visibility.

## Expected result

The toggle exposes an accessible name — `aria-label="Show password"`, visually hidden text, or an
equivalent — and ideally reflects its state with `aria-pressed`, so assistive technology can
announce both what the control does and whether the password is currently visible.

## Actual result

The button carries no accessible name at all:

```html
<button type="button" class="btn btn-outline-secondary"></button>
```

axe reports rule `button-name`, impact `critical`, 1 node, with every naming route ruled out:

> Element does not have inner text that is visible to screen readers · aria-label attribute does
> not exist or is empty · aria-labelledby attribute does not exist... · Element has no title
> attribute · Element does not have an implicit (wrapped) `<label>` · Element does not have an
> explicit `<label>` · Element's default semantics were not overridden with `role="none"`

A screen reader announces it as an unnamed "button".

WCAG mapping: 4.1.2 Name, Role, Value (Level A). Also tagged `section508.22.a`, `EN-9.4.1.2`,
`RGAA-11.9.1`.

## Evidence

Screenshot and axe JSON in artifacts `results-a11y` and `allure-results-a11y` of
[run 30462989730](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30462989730).
The screenshot shows the eye icon sitting immediately right of the "Your password" field.

## Notes

The icon is rendered as a glyph with no text node, which is the usual cause: the visual meaning
lives entirely in the icon, so nothing survives for the accessibility tree. Fixing it is a
one-attribute change in the login template and carries no regression risk to the auth flow.

This is upstream markup in a third-party practice application, so it will not be fixed here. It is
waived by rule id in `utils/a11y.ts` under the ADR-003 process — waived meaning known and
documented, not tolerated silently. Should the login page ever be rebuilt, the waiver should go
before the rebuild lands.
