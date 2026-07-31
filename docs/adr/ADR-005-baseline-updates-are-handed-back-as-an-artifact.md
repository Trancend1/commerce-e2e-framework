# ADR-005: Baseline updates are handed back as an artifact, not committed by a bot

**Status:** Accepted · **Date:** 2026-07 · **Supersedes:** the update mechanism in [ADR-004](ADR-004-visual-baselines-are-ci-generated.md)

## Context

[ADR-004](ADR-004-visual-baselines-are-ci-generated.md) decided that visual baselines are generated in CI only, and that updating one is an explicit act: "a `workflow_dispatch` job regenerates the screenshots and opens a pull request containing them."

That mechanism cannot be built in this repository. `CLAUDE.md` §4.6 states that repository accountability remains with the human owner: no commits under a bot identity, nothing that makes automation appear in the contributor graph. A workflow that commits regenerated PNGs and opens its own pull request does exactly what §4.6 forbids, and §4.6 is a project-wide rule while ADR-004 governs one workflow.

The collision surfaced during implementation in [#12](https://github.com/Trancend1/commerce-e2e-framework/pull/12) and [#13](https://github.com/Trancend1/commerce-e2e-framework/pull/13). What shipped was the artifact route, recorded until now only as a note in `CLAUDE.md` §2.5 — a deviation from an accepted ADR living outside the ADR set, which is the specific situation ADRs exist to prevent.

Three options were considered: grant §4.6 an exception for this one workflow; hand the baselines back as an artifact for a human to commit; or drop the dispatch workflow entirely and regenerate baselines by pushing a throwaway branch and letting the nightly write them.

## Decision

The `Visual Baselines` workflow regenerates screenshots on the runner and **uploads them as a `visual-baselines` artifact**. A human downloads the artifact, commits the PNGs under their own identity, and opens the pull request.

§4.6 wins over ADR-004's mechanism. ADR-004's _property_ — baseline changes arrive as a reviewable diff, never as a silent overwrite — is preserved in full; only the actor who creates the commit changes.

Everything else in ADR-004 stands: CI-only generation, chromium, nightly-only execution, `maxDiffPixelRatio: 0.01`, two pages.

## Rationale

1. **A project-wide identity rule outranks a single workflow's convenience.** §4.6 is the reason this repository's history is usable as portfolio evidence at all. Trading that for saving one manual download is a bad exchange.
2. **The reviewable-diff property survives intact.** ADR-004's real fear was baselines being overwritten silently, so that every failure gets "fixed" by accepting the new image. A human committing the artifact still produces a diff that must be reviewed and merged — the failure mode is blocked either way.
3. **An exception to §4.6 would not stay contained.** Granting a bot commit rights for baselines invites the same argument for changelogs, dependency bumps, and report publishing. The rule is worth more than any one of those.
4. **The throwaway-branch route is worse than the manual step it saves.** Letting the nightly write baselines on a scratch branch means baselines land without anyone looking at the images, which is the silent overwrite wearing a different hat.
5. **The cost is small and lands on the right person.** Baseline updates are rare and always intentional. Whoever decided the UI legitimately changed is the right person to sign the commit that says so.

## Consequences

- Updating a baseline is a manual, multi-step act: dispatch the workflow, download the artifact, unzip into `tests/visual/`, commit, open a PR. This is friction by design, but it is friction, and a contributor who does not know the sequence will be stuck until they read [docs/CI-CD.md](../CI-CD.md)
- The workflow cannot verify that the artifact it produced was ever committed. A regenerated baseline that nobody downloads simply expires with the artifact, and the nightly keeps failing until someone acts
- `continue-on-error: true` on the regeneration step means a genuinely broken visual project still produces a green workflow run; the `Verify baselines were produced` step guards only against an empty artifact, not against wrong images
- If the manual step proves to be the reason baselines go stale in practice, the honest response is to revisit §4.6 deliberately in a new ADR — not to quietly add a bot token to this workflow
