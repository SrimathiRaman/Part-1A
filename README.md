# Personal Expense Tracker

Single-page, browser-local expense tracker built with native HTML, CSS, and JavaScript
modules. There is no application build step.

## Prerequisites

- Node.js and npm
- A terminal opened at the repository root

## Install

Install the exact dependencies recorded in the lockfile:

```powershell
npm ci
```

## Run the deterministic harness

From the repository root, run all four required gates:

```powershell
npm run harness
```

The harness checks:

- **G0** — protected-file integrity against `.harness/integrity.lock.json`
- **G1** — ESLint
- **G2** — security scan and `npm audit` at the high severity threshold
- **G3** — unit and contract tests

The command exits with code `0` when all gates pass and `1` when any gate fails. It writes
the machine-readable report and feedback summary to `evidence/harness-results/`.

Do not run `npm run harness:lock` during ordinary evaluation. That command creates a new
integrity baseline rather than checking the existing one. G0 is expected to fail if any
locked test, harness, or test/lint configuration file has changed.

## Run tests separately

To run the Vitest suite without the other harness gates:

```powershell
npm test
```

For browser launch and manual acceptance checks, see
[the feature quickstart](specs/001-expense-tracker/quickstart.md).
