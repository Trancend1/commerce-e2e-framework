# commerce-e2e-framework

Layered QA automation portfolio project (Playwright UI E2E + API, Newman contract, k6 performance) against the Toolshop commerce app — built to demonstrate QA automation as an engineering discipline for a QA internship portfolio. It is NOT a product, a Toolshop fork, or an exhaustive test suite: coverage is risk-based, and the framework itself is the deliverable.

> **Current Orchestrator:** Farhan ([@Trancend1](https://github.com/Trancend1))
> **Active Sprint/Phase:** M1 — Foundation

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

**Active phase:** M1 — Foundation

**Sprint focus:** Local foundation is done (2026-07-18): pinned compose + `scripts/sut-up.sh` boots and seeds the SUT, lockfile + ESLint/Prettier configs committed, and both M1 specs (login UI, products API) pass locally. Remaining: push to GitHub and get `e2e.yml` green on a real PR.

**Cleared blockers (2026-07-18):**

1. ~~Placeholder docker-compose~~ → images pinned to upstream release 2.3 (`web` vendored in `docker/web/` — upstream's prebuilt web image is arm64-only); `scripts/sut-up.sh` boots, waits, and runs `migrate:fresh --seed`. Verified locally: API `/status` 200, UI on :4200.
2. ~~No lockfile~~ → `npm install` run, `package-lock.json` committed.
3. ~~No lint config~~ → `eslint.config.mjs` (flat, ESLint 9) + `.prettierrc`; `tsc --noEmit`, `eslint .`, `prettier --check .` all clean.

**Still open:**

4. `test:contract` references `tests/api/toolshop.postman_collection.json` which does not exist (M2 deliverable — the script will fail until then).
5. Repo not yet pushed to GitHub → `e2e.yml` never exercised in CI.

**Orchestrator:** Farhan

**Next:** After M1 exits, start M2 with the Catalog/Cart POMs and the register + checkout journeys.

### 2.4 Exit Criteria

M1 exits only when:

- [ ] `docker compose up -d` boots a working Toolshop (UI :4200, API :8091) with pinned image tags
- [ ] `npm ci && npm run lint` passes locally (lockfile + lint config committed)
- [ ] `tests/ui/login.spec.ts` and `tests/api/products.api.spec.ts` pass against the local SUT
- [ ] `e2e.yml` green on GitHub Actions for a real PR
- [ ] Repo pushed to `github.com/Trancend1/commerce-e2e-framework` with badges resolving

### 2.5 Phase Log

| Phase | Status | Lesson                                                                                                                                                                        | Carry-forward                                                                                                  |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| M1    | Active | Skeleton scaffolded before git init — verify repo hygiene first. Upstream prebuilt images can be single-arch (web was arm64-only) — always verify architecture before pinning | Push to GitHub + green `e2e.yml` run; Playwright `testIdAttribute` must stay `data-test` (Toolshop convention) |

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
