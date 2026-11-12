# Functional Requirements Traceability

This table maps each functional requirement to its implemented source files/functions and
the exact test file/title found in the current `tests/` suite. `NO TEST` means no matching
requirement test was found. `PARTIAL` marks known acceptance coverage gaps.

Every FR currently has an implementation reference; none was found without an
implementation.

The last recorded `npm test` run passed 39 tests across 3 files. That result does not fill
the test coverage gaps identified below.

| Requirement | Source file and function | Test file and exact title | Coverage flag |
|---|---|---|---|
| FR-001 | `src/application/expense-controller.js` — `submit()`, `addExpense()`, `saveCandidate()`; `src/storage/expense-repository.js` — `save()`; `src/ui/render.js` — `createExpenseRow()`, `renderTotals()` | None found | **NO TEST** |
| FR-002 | `src/domain/expense-validation.js` — `validateExpenseInput()`, `validateAmount()`; `src/ui/render.js` — `renderErrors()` | `tests/unit/expense-validation.test.js` — `FR-002: accepts 1250 whole rupees and normalizes leading zeroes`; `FR-002: accepts the maximum safe integer and rejects the next integer`<br>`tests/contract/expense-repository.test.js` — `FR-002: rejects a stored decimal amount` | Implemented; tested |
| FR-003 | `src/domain/expense-validation.js` — `CATEGORIES`, `validateCategory()`; `src/ui/render.js` — `categoryControl()`, `renderErrors()` | `tests/unit/expense-validation.test.js` — `FR-003: accepts the fixed categories with exact labels`<br>`tests/contract/expense-repository.test.js` — `FR-003: rejects a stored category outside the fixed list` | Implemented; tested |
| FR-004 | `src/domain/expense-validation.js` — `isValidCalendarDate()`, `validateDate()`; `src/application/expense-controller.js` — `submit()` | `tests/unit/expense-validation.test.js` — `FR-004: accepts 2026-11-10 as a real date no later than today`<br>`tests/contract/expense-repository.test.js` — `FR-004: rejects a stored impossible calendar date` | **PARTIAL** — no future-date rejection test found |
| FR-005 | `src/domain/expense-validation.js` — `validateDescription()`; `src/ui/render.js` — `textElement()`, `createExpenseRow()` | `tests/unit/expense-validation.test.js` — `FR-005: treats omitted and whitespace-only descriptions as empty`; `FR-005: accepts 250 Unicode code points and rejects 251`; `FR-005: preserves markup-like description text as user text`<br>`tests/contract/expense-repository.test.js` — `FR-005: rejects a stored description of 251 Unicode code points` | Implemented; tested |
| FR-006 | `src/domain/expense-queries.js` — `sortExpenses()`; `src/application/expense-controller.js` — `getViewState()`; `src/ui/render.js` — `renderRows()` | `tests/unit/expense-queries.test.js` — `FR-006: sorts by date newest first and then by creation time` | Implemented; tested |
| FR-007 | `src/application/expense-controller.js` — `beginEdit()`, `submit()`, `updateExpense()`, `saveCandidate()`; `src/ui/render.js` — `syncEditForm()`; `src/storage/expense-repository.js` — `save()` | None found | **NO TEST** |
| FR-008 | `src/application/expense-controller.js` — `removeExpense()`, `saveCandidate()`; `src/ui/bind-events.js` — `handleAction()`; `src/storage/expense-repository.js` — `save()` | None found | **NO TEST** |
| FR-009 | `src/domain/expense-queries.js` — `filterExpenses()`; `src/application/expense-controller.js` — `setFilter()`, `clearFilter()`; `src/ui/bind-events.js` — `bindEvents()` | `tests/unit/expense-queries.test.js` — `FR-009: combines Food and November 2026 filters with AND semantics`; `FR-009: clearing category retains the November 2026 filter` | Implemented; tested |
| FR-010 | `src/domain/expense-queries.js` — `calculateTotals()`; `src/ui/render.js` — `renderTotals()` | `tests/unit/expense-queries.test.js` — `FR-010: calculates listed and per-category whole-rupee totals exactly`; `FR-010: returns zero for no listed expenses and preserves exact large sums` | Implemented; tested |
| FR-011 | `src/storage/expense-repository.js` — `load()`; `src/application/expense-controller.js` — `initialize()`; `src/ui/render.js` — `renderRows()` | `tests/contract/expense-repository.test.js` — `FR-011: treats a missing key as an empty first-run collection` | **PARTIAL** — no no-match-state test found |
| FR-012 | `src/storage/expense-repository.js` — `load()`, `save()`; `src/application/expense-controller.js` — `initialize()`; `src/main.js` — composition and initialization | `tests/contract/expense-repository.test.js` — `FR-012: saves and reloads a version-1 expense envelope` | **PARTIAL** — browser restart is not covered |
| FR-013 | `src/domain/expense-validation.js` — `validateExpenseInput()`; `src/application/expense-controller.js` — `submit()`, `updateExpense()`; `src/ui/render.js` — `renderErrors()` | None found | **NO TEST** — validation unit tests do not test add/edit state preservation |
| FR-014 | `src/storage/expense-repository.js` — `load()`, `save()`; `src/application/expense-controller.js` — `initialize()`, `saveCandidate()`; `src/ui/render.js` — global error and mutation controls | `tests/contract/expense-repository.test.js` — `FR-014: reports unavailable storage when obtaining storage fails`; `FR-014: reports unavailable storage when reading fails`; `FR-014: reports a failed write and preserves the previous stored value` | **PARTIAL** — no corrupt-data recovery/blocking test found |
