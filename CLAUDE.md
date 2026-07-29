# commerce-e2e-framework

Layered QA automation portfolio project (Playwright UI E2E + API, Newman contract, k6 performance) against the Toolshop commerce app — built to demonstrate QA automation as an engineering discipline for a QA internship portfolio. It is NOT a product, a Toolshop fork, or an exhaustive test suite: coverage is risk-based, and the framework itself is the deliverable.

> **Current Orchestrator:** Farhan ([@Trancend1](https://github.com/Trancend1))
> **Active Sprint/Phase:** M2 — Core coverage

---

## 1. Documentation Map

| Topic                                              | Source of Truth                                          |
| -------------------------------------------------- | -------------------------------------------------------- |
| Master blueprint (purpose, scope, stack, strategy) | `commerce-e2e-framework.md`                              |
| Project workflow and current phase                 | `CLAUDE.md` (this file)                                  |
| Roadmap of record                                  | `docs/ROADMAP.md`                                        |
| Test plan (what / what not / why)                  | `docs/TEST-PLAN.md`                                      |
| Test strategy, gates, flakiness policy             | `docs/TEST-STRATEGY.md`                                  |
| Framework layering                                 | `docs/ARCHITECTURE.md`                                   |
| Coding standards & naming                          | `docs/CODING-STANDARDS.md` · `docs/NAMING-CONVENTION.md` |
| Environments & config                              | `docs/ENVIRONMENT.md`                                    |
| CI/CD pipelines                                    | `docs/CI-CD.md`                                          |
| Reporting                                          | `docs/REPORTING.md`                                      |
| Test data management                               | `docs/TEST-DATA.md`                                      |
| Architecture decisions                             | `docs/adr/` (ADRs)                                       |
| Real defects found in the SUT                      | `docs/bug-reports/`                                      |
| RTK shell tooling rule                             | `C:\Users\transcend\.claude\RTK.md`                      |
| Global workflow template                           | `C:\Users\transcend\.claude\WORKFLOW.md`                 |

**Rule:** This file cites and coordinates these documents. Read mapped docs before making test-design or implementation decisions. Do not duplicate full strategy content here. `commerce-e2e-framework.md` is the single source of truth; if this file and the blueprint disagree, flag it — do not silently follow either.

---

## 2. Progress — Phase Schedule

### 2.1 Roadmap

```txt
M1: Foundation
  → M2: Core coverage
  → M3: Quality gates
  → M4: Beyond functional
  → M5: Polish (portfolio-ready)
```

Live checklists per milestone: `docs/ROADMAP.md` (roadmap of record — update checkboxes there, not here).

**M1 — Foundation**

- Repo scaffold, lint config, strict tsconfig
- `docker-compose.yml` boots pinned Toolshop + healthcheck
- 1 passing UI spec (login) + 1 passing API spec (products contract)
- `e2e.yml` PR gate green end-to-end

**M2 — Core coverage**

- POM for main journeys (Login, Catalog, Product, Cart, Checkout)
- API contract + integration + negative suites; Newman collection from Swagger
- `apiClient`, `dataFactory`, auth `storageState` reuse, custom fixtures

**M3 — Quality gates**

- Sharded PR pipeline (< 10 min budget), nightly 3-browser matrix
- Allure report on GitHub Pages; quarantine mechanism for flaky tests

**M4 — Beyond functional**

- k6 thresholds (smoke on PR, load nightly), axe-core a11y, visual regression

**M5 — Polish (portfolio-ready)**

- 3–5 real defect reports, complete ADR set, README case study, fresh-clone quick start verified

### 2.2 Reusable Phase Gate

Universal checklist — must pass before any milestone is considered exited:

- [ ] **Scope:** all deliverables for this milestone done; scope creep documented as "carry-forward"
- [ ] **Build:** `npx tsc --noEmit` clean; `npm run lint` zero error
- [ ] **Tests:** relevant suites pass locally AND in CI; regressions documented
- [ ] **Docs:** `docs/ROADMAP.md` checkboxes updated; this file's §2.3 updated; new ADR if a decision was made
- [ ] **Critic review:** Devil's Advocate pass done (over-engineering, flaky patterns, coverage gaps)
- [ ] **Phase log:** entry written in §2.5 with lesson + carry-forward

### 2.3 Active Phase

**Active phase:** M4 — Beyond functional

**Sprint focus:** M3 closed 2026-07-29 (§2.5) — all four gates in, the last being the merged Allure report on GitHub Pages ([#4](https://github.com/Trancend1/commerce-e2e-framework/pull/4)). M4 starts partially done: the nightly `perf` job already runs `k6 run tests/performance/login.smoke.js`, but with no p95 thresholds and no load profile, and nothing on PRs. Next up: real k6 thresholds, then axe-core, then visual regression.

**Orchestrator:** Farhan

**Next:** After M4 exits, start M5 (defect reports, ADR set, README case study).

### 2.4 Exit Criteria — M3 (closed 2026-07-29)

M3 exited when:

- [x] PR gate sharded (2×) with the < 10 min budget enforced, not merely observed (run 30287558238)
- [x] `nightly.yml` runs all three browsers green, verified at shard level rather than by job conclusion (run 30286717667)
- [x] Allure report builds from merged shard results, deploys to GitHub Pages, linked from README. Merge proven by `widgets/suites.json` on the published site listing four suites (`api` 14, `chromium` 7, `firefox` 7, `webkit` 7 = 35), not one shard's worth; trend retention proven by `widgets/history-trend.json` carrying four builds after a second consecutive publish (runs 30435539302 → 30436058761)
- [x] Quarantine mechanism: `@quarantine` excluded via `grepInvert` in `playwright.config.ts` (config, so no CI command can forget it), still executed by the nightly `quarantine` job, expiry enforced by `scripts/check-quarantine.mjs`. Exclusion proven by nightly `tests/ui` counting 8 tests instead of 9 with a probe present (run 30298837346), gates clean once the probe was deleted (run 30391082024)
- [x] Flake observable — `scripts/check-flake.mjs` reads the json report and fails on any `flaky` status in both gates, since Playwright itself exits 0 on a retry pass. The `< 2%` budget was replaced with a binary zero, because on a suite this size one flaky test is already 5%

**M4 (active) — provisional, pending orchestrator confirmation.** Mirrors the M4 items in `docs/ROADMAP.md`; the threshold numbers are not decided yet:

- [ ] k6 login/search/checkout with p95 thresholds that actually fail the job — smoke on PR, load nightly. Today's `perf` job runs a login smoke with no threshold, so it cannot fail on a regression
- [ ] axe-core scan on key pages, with the violation budget stated rather than "no serious violations" by accident
- [ ] Visual regression on catalog + checkout, with a documented answer for how snapshots are updated and reviewed

### 2.5 Phase Log

| Phase | Status                | Lesson                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Carry-forward                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1    | Complete (2026-07-19) | Skeleton scaffolded before git init — verify repo hygiene first. Upstream prebuilt images can be single-arch (web was arm64-only) — always verify architecture before pinning                                                                                                                                                                                                                                                                                                                                                     | Playwright `testIdAttribute` must stay `data-test` (Toolshop convention); `test:contract` script dangling until M2 delivers the Newman collection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| M2    | Complete (2026-07-28) | A green pipeline is not evidence the suite ran. The nightly matrix was red for 5 straight nights with only chromium ever executing, and `retries: 2` reported a real race as a green pass — both invisible unless you read shard-level test counts instead of job conclusions                                                                                                                                                                                                                                                     | Six critic findings, all closed during M3 — `cart.spec.ts` substring total in 7d82881 (mutation-checked: run 30293504240 fails on a mutated expectation), the rest in [#2](https://github.com/Trancend1/commerce-e2e-framework/pull/2): `ApiClient.get()` dead code removed, `login.spec.ts` moved onto the fixture, `catalog.spec.ts` decoupled from seeded product naming, `categories` unknown-id case added. **Still open:** the ADR-002 seeding entry point remains unbuilt — deliberately, since no test needs it yet. Also learned: categories has no `GET /categories/{id}` (documented PUT/DELETE only), so it is not symmetric with brands/products                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| M3    | Complete (2026-07-29) | A published report is not automatically an honest one. The `setup` fixture runs once per job, and four executions sharing a historyId got folded by Allure into one entry with three retries — a retry badge sitting in the very report built to make instability visible, fixed by dropping auth-setup results before `allure generate`. Second lesson: verify a deploy by its deployment record and a live fetch, not by `GET /repos/../pages` `status`, which stays `null` for `build_type: workflow` and reads like a failure | Four critic findings; (1) and (2) closed in [#5](https://github.com/Trancend1/commerce-e2e-framework/pull/5) — trend points now carry the Actions run URL in `reportUrl`, since Allure never propagates `buildUrl` into history and only one report is published at a time, and the auth-setup filter selects on the `parentSuite` label instead of grepping `auth.setup.ts` as a substring, which had also matched any result merely mentioning that path in a stack trace. Both proven in run 30442831597: the drop step logged `dropped 4 of 39`, and the published `history-trend.json` shows the newest point under `/actions/runs/` while the four older ones keep the Pages base. **Still open:** (3) all actions emit Node 20 deprecation warnings and are already forced onto Node 24; (4) only the latest report is browsable — old trend points reach their run, not their report. Also: nightly already runs `k6 run tests/performance/login.smoke.js`, so the M4 k6 item starts partially done, and the quarantine job is currently empty (mechanism last exercised by the probe in run 30298837346) |

---

## 3. Stack (Locked)

- **Core:** Playwright + TypeScript (strict), Node.js 20 LTS
- **Contract:** Postman + Newman
- **Performance:** k6
- **CI/CD:** GitHub Actions (matrix sharding, Pages deploy)
- **Reporting:** Playwright HTML + Allure
- **Test data:** @faker-js/faker + API seeding (ADR-002)
- **SUT:** Toolshop via Docker Compose (local only)

Stack changes require an ADR or user approval. Do not add libraries silently.

**Deferred (not in scope):** native mobile testing, security pentesting, full localization, zod schema validation, Grafana Cloud k6 output (icebox).

**Banned unless explicitly overridden:** Cypress (see ADR-001), XPath locators, hardcoded test data in specs, hardcoded waits/`waitForTimeout`, reading `process.env` outside `config/env.ts`, seeding data against the public hosted demo (practicesoftwaretesting.com).

---

## 4. AI Instructions

### 4.1 Before Coding

1. Read this file first, then the relevant documents from §1 (blueprint before anything else).
2. Check active phase in §2.3 before starting any work — do not build M3/M4 features during M1.
3. Run `rtk git status --short --branch`. If WIP overlaps the relevant area, tell the orchestrator before editing.
4. Confirm whether code scaffolding is actually requested. If the user asks only for docs/strategy, do not scaffold.
5. Check the file tree before creating new files or folders.

### 4.2 Code Rules (Non-Negotiable)

- Use `rtk` prefix for shell commands when a wrapper exists.
- POM only: specs never touch selectors directly. Locators live in `pages/`, assertions live in specs.
- Locator priority: `getByRole` > `getByTestId` > CSS (last resort). Never XPath.
- Test data: generated (faker) or API-seeded — never hardcoded, never created through the UI (ADR-002). No PII ever.
- All config flows through `config/env.ts`; specs never read `process.env` directly.
- One assertion concern per test; arrange-act-assert structure; tag with `@smoke` / `@regression`.
- Naming: specs `<feature>.spec.ts`, pages `<Name>Page.ts`, fixtures `<name>.fixture.ts`.
- Conventional Commits with scope (`feat:`, `fix:`, `test:`, `docs:`, `ci:`).
- TypeScript strict; no `any` without an inline justification.
- No magic timeout numbers in specs — named budgets in `utils/waits.ts`.

### 4.3 Anti-Slop

- Do not claim a test passes without running it against the SUT — "it compiles" is not validation.
- Do not add flaky patterns: no `waitForTimeout`, no retry-until-green loops hiding real bugs.
- Do not point automation at the public hosted demo (shared DB) — local Docker SUT only.
- Do not mark a milestone checkbox in `docs/ROADMAP.md` without green CI evidence.
- Do not add new architectural layers, dependencies, or parallel systems without orchestrator approval.
- Do not write tests for features Toolshop doesn't have — verify the SUT surface first (Swagger / UI).

### 4.4 Scope Discipline

Build vertically, not horizontally. One polished journey with CI evidence beats five half-finished specs.

Build order for this project:

1. M1 blockers (§2.3) — make the skeleton run
2. One complete vertical slice: login journey UI + API + CI green
3. Expand journeys per M2, then gates (M3), then beyond-functional (M4), then polish (M5)

When in doubt between coverage breadth and reliability, prioritize reliability — a flaky suite is worse than a small one for a QA portfolio.

### 4.5 Communication

- Use concise Indonesian by default when the user writes in Indonesian; repo files and commit messages stay in English.
- Refer to exact files and rules when explaining decisions.
- When uncertain, present 2–3 concrete options with trade-offs instead of improvising.
- Flag conflicts early: locked stack changes, phase jumps, scope creep, blueprint contradictions.
- During debugging: state what is happening, what was expected, and what evidence supports the conclusion.

### 4.6 Contribution Identity

> **Copy this section verbatim into every project AGENTS.md / CLAUDE.md. Do not modify.**

AI is a ghostwriter. Repository accountability remains with the human owner.

- Do not add `Co-Authored-By: Claude` or any AI/model co-author trailer to commits.
- Do not add "Generated with Claude Code" or equivalent tags to commit messages or PR bodies.
- Do not push commits with AI or bot author identity.
- Do not make AI appear in the GitHub contributor graph.
- Author and committer identity must be the repo owner's human identity configured for the project.
- If AI assistance needs to be disclosed, mention it only in normal prose in a PR description or changelog, never in git metadata.

---

## 5–12. Agent Team, Tracks, Gates, Decision Rules

This project follows the global template at `C:\Users\transcend\.claude\WORKFLOW.md` §5–§12 (agent roles, implementation tracks T0–T9, handoff protocol, review gates A–D, decision rules) without modification. Single-developer note: Farhan acts as orchestrator; AI agents take implementation tracks and must still produce §8 handoff notes and pass Gate C (validation) — validation evidence is the core of a QA portfolio.
