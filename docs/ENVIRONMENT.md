# Environment & Configuration

> Part of [commerce-e2e-framework](../commerce-e2e-framework.md).

## Targets

| Target              | URL                                                      | Used by                 | Seeding allowed?                |
| ------------------- | -------------------------------------------------------- | ----------------------- | ------------------------------- |
| **local** (default) | UI `http://localhost:4200` · API `http://localhost:8091` | all automation, CI      | ✅ yes — isolated Docker DB     |
| **hosted demo**     | practicesoftwaretesting.com                              | manual exploratory only | ❌ **never** — shared public DB |

Rule: automation and data seeding run **only** against the local Docker SUT. The hosted demo's database is shared with the public; polluting it is both rude and nondeterministic.

## Setup

```bash
cp .env.example .env
bash scripts/sut-up.sh    # boots Toolshop (images pinned to upstream 2.3), waits, migrates + seeds DB
curl -s http://localhost:8091/status   # healthcheck → expect 200
```

## Variables

All variables are documented in [.env.example](../.env.example). Never commit `.env`. Test credentials for the local seeded DB are demo-only values published by the SUT project — they are not secrets, but the pattern (env vars, not literals) is enforced anyway because that is the correct production habit.

## Access in code

Only `config/env.ts` reads `process.env`. It validates required vars at startup and exports a typed, frozen `env` object. Specs and pages import from there — this makes misconfiguration fail fast with a clear message instead of a cryptic timeout mid-run.

## CI configuration

CI recreates `.env` from repository variables/secrets (see [CI-CD.md](CI-CD.md)). The same `scripts/sut-up.sh` used locally runs in the workflow — one environment definition, zero drift.
