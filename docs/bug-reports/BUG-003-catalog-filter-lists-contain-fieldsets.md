# BUG-003: Catalog filter lists wrap `<fieldset>` elements directly inside `<ul>`

|                 |                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity**    | Low                                                                                                                                                     |
| **Priority**    | P3                                                                                                                                                      |
| **Environment** | local Docker SUT @ `testsmith/practice-software-testing-sprint5-{api,ui}:2.3` · axe-core 4.12.1 via `@axe-core/playwright`, Chromium through Playwright |
| **Found by**    | `tests/a11y/accessibility.spec.ts` — nightly [run 30462989730](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30462989730)            |
| **Status**      | Open                                                                                                                                                    |

## Severity definitions

- **Critical**: blocks a revenue-path journey or corrupts data
- **High**: core feature broken, workaround exists
- **Medium**: incorrect behavior off the critical path
- **Low**: cosmetic / minor UX

axe rates this rule `serious`; this report rates it **Low**. The filters remain fully operable —
each checkbox is labelled and reachable by keyboard — and the catalog is browsable without them.
The cost is that list semantics are announced incorrectly, so a screen reader user gets a
misleading structure (item counts and list boundaries) for a control set that still works. Rated
above cosmetic would overstate it; rated as nothing at all would ignore a Level A failure.

## Steps to reproduce

1. Start the local SUT (`bash scripts/sut-up.sh`) and open `/` (the catalog).
2. Run an axe scan, or inspect the filter sidebar under "Sort" and "Price Range" — the brand and
   category checkbox groups.
3. Observe the DOM: each group is a `<ul>` whose direct children are `<fieldset>` elements.

## Expected result

`<ul>` and `<ol>` contain only `<li>`, `<script>` or `<template>` as direct children. Either wrap
each `<fieldset>` in an `<li>`, or drop the list element and let the `<fieldset>`/`<legend>`
grouping carry the structure on its own.

## Actual result

axe reports rule `list`, impact `serious`, 3 nodes:

> List element has direct children that are not allowed: fieldset

Targets: `.checkbox:nth-child(2) > ul`, `.checkbox:nth-child(3) > ul`, `.checkbox:nth-child(4) > ul`

```html
<ul _ngcontent-ng-c670033506=""></ul>
```

WCAG mapping: 1.3.1 Info and Relationships (Level A), tags `wcag2a`, `wcag131`.

## Evidence

Screenshot and axe JSON in artifacts `results-a11y` and `allure-results-a11y` of
[run 30462989730](https://github.com/Trancend1/commerce-e2e-framework/actions/runs/30462989730).

## Notes

Three nodes, one per filter group, which points at a single repeated component template rather
than three separate mistakes — one fix would close all three.

Upstream markup in a third-party practice application, so it will not be fixed here. Waived by rule
id in `utils/a11y.ts` under the ADR-003 process. The waiver is scoped to the rule, not the page, so
if the same pattern appears on a page added to the scan later it will also pass unnoticed — worth
revisiting if the scanned page set grows.
