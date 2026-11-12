# Implementation Plan: Personal Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Approved feature specification and user-provided technology and quality constraints.

## Summary

Build a single-page personal expense tracker using browser-native HTML, CSS, and JavaScript
ES modules. Keep validation and calculations in pure domain modules, localStorage access in
a repository module, and DOM events/rendering in UI modules coordinated by an application
controller. Persist a versioned expense envelope in localStorage. Do not add a framework,
backend, database, API, or build step.

Use the supplied Vitest/jsdom setup for pure-module, storage-contract, and DOM workflow
tests. Keep all user-provided package, lint, test, and harness configuration under user
ownership; this plan does not generate or change it.

## Technical Context

**Language/Version**: Browser JavaScript ES modules, with HTML and CSS; no build step.

**Primary Dependencies**: Browser built-ins for the application. Vitest and jsdom for tests,
and the user-supplied ESLint configuration and security rules for quality checks. No new
production dependencies are planned.

**Storage**: Browser `localStorage` only. Persist a versioned JSON envelope and validate
its version and every record when loading.

**Testing**: Vitest with jsdom as configured by the user. Unit tests cover pure validation
and calculations; contract tests cover the stored record format and storage failures;
jsdom workflow tests cover UI behavior. Responsive behavior and keyboard accessibility
also receive the manual review required by the constitution.

**Target Platform**: A current browser supporting native ES modules, localStorage, and
standard DOM APIs, running in one browser profile.

**Project Type**: Single-page, client-only web application.

**Performance Goals**: Adding or editing an expense, applying or clearing filters, and
updating totals complete within one second for 1,000 expenses on the same device.

**Constraints**: No framework, bundler, backend, database, API, or cross-device sync.
Amounts are positive whole rupees no greater than 9,007,199,254,740,991 per expense;
aggregated totals remain exact. User text is rendered as text, never executable markup.
Data errors and failed writes are surfaced without silently replacing or losing saved data.

**Scale/Scope**: One user and one browser profile; ten fixed categories; add, list, edit,
confirmed delete, category/month filters, and totals; performance target is 1,000 records.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle or gate | Plan compliance |
|---|---|
| Client-only browser-local architecture | Pass: native HTML/CSS/ES modules and localStorage only; no application backend or build step. |
| Separation of concerns | Pass: pure domain, application coordination, storage repository, and UI modules are distinct. |
| Whole-rupee data integrity | Pass: validate positive safe integers; do not store decimals; calculate aggregates exactly. |
| Safe user-input handling | Pass: dynamic text is inserted as text nodes or `textContent`; do not use `innerHTML` or `eval`; no secrets. |
| Requirement-linked automated tests | Pass: tests use FR/NFR IDs in test titles; unit and storage-contract tests are planned. |
| Accessibility and responsive design | Pass: keyboard-operable controls and responsive layout are included; manual review is planned. |
| Quality gates and harness ownership | Pass: run supplied lint, security, audit, and Vitest gates; do not edit tests or supplied configuration. |
| Human approval | Pass: implementation completion remains subject to explicit human `ACCEPT` or `REJECT`. |

No constitution violations or exceptions are required.

**Post-design recheck**: PASS. The Phase 1 artifacts preserve the client-only architecture,
module boundaries, exact amount and safe-text rules, requirement-linked testing, manual
accessibility/responsive review, and user-owned quality gates. No exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── storage-format.md
│   └── user-interactions.md
└── tasks.md                 # Created by /speckit-tasks, not by this plan
```

### Source Code (repository root)

```text
index.html
src/
├── main.js
├── application/
│   └── expense-controller.js
├── domain/
│   ├── expense-validation.js
│   └── expense-queries.js
├── storage/
│   └── expense-repository.js
├── ui/
│   ├── bind-events.js
│   └── render.js
└── styles.css
tests/
├── unit/
│   ├── expense-validation.test.js
│   └── expense-queries.test.js
├── contract/
│   └── expense-repository.test.js
└── integration/
    └── expense-workflow.test.js
```

The user will supply `package.json`, `eslint.config.mjs`, `vitest.config.mjs`, and `.harness/`.
They are prerequisites for running the planned gates and are not generated or modified by
this plan.

**Structure Decision**: Use one browser application with native ES module boundaries.
`main.js` composes the repository, controller, and UI. The controller coordinates use
cases and commits state only after persistence succeeds. Pure domain modules own all
validation, filtering, sorting, and total calculations. The repository owns the local
storage key and record-envelope checks. The UI owns DOM interaction and rendering only.
This is the smallest structure that preserves the required separation of concerns and
test boundaries.

## Key Decisions and Dependencies

- Use a versioned JSON envelope with a schema version and expense array. A missing key
  means an empty first-run store; malformed data, unsupported versions, or invalid records
  produce an explicit recovery state and are never overwritten automatically.
- Inject the storage object, current date, and ID/time providers into the repository,
  validator, and controller where needed. Production uses browser built-ins; tests use
  deterministic values and a controlled Storage double.
- Validate the candidate expense and construct a candidate full state before saving.
  Update in-memory state and rerender only after a successful storage write. On a write
  exception, preserve the prior state and display an explicit error.
- Store each amount as an integer no greater than JavaScript's maximum safe integer.
  Compute aggregate totals with exact integer arithmetic so totals can exceed that
  per-expense maximum without rounding.
- Sort by expense date descending, then creation time descending; preserve stored append
  order as a final tie-break when timestamps match. Editing does not change creation order.
- Combine active category and month filters with AND semantics. Calculate both listed and
  per-category totals from the filtered list.
- Render all untrusted descriptions and validation/error text using DOM text APIs. Use
  native confirmation for deletion to avoid an extra modal component; cancel is a no-op.
- Use only browser-native runtime APIs. Vitest, jsdom, ESLint, its configured security
  rules, and the harness are supplied project tooling, not additional production
  dependencies.

## Phase 0: Research

See [research.md](./research.md) for the resolved localStorage, ES-module, and
Vitest/jsdom decisions and their rationale.

## Phase 1: Design

- [data-model.md](./data-model.md) defines the expense entity, validation, sorting, and
  derived totals.
- [contracts/storage-format.md](./contracts/storage-format.md) defines the persisted
  envelope and failure behavior for contract tests.
- [contracts/user-interactions.md](./contracts/user-interactions.md) records the user
  interaction and validation contract; there is no network API.
- [quickstart.md](./quickstart.md) gives local run and gate-validation steps.

## Complexity Tracking

No constitution violations or unnecessary architectural layers are introduced.
