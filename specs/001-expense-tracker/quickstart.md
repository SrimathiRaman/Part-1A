# Quickstart and Validation Guide

## Prerequisites

- The user-provided `package.json`, `eslint.config.mjs`, `vitest.config.mjs`, and `.harness/`
  are present and unchanged.
- Dependencies declared by the supplied package manifest are installed.
- A current browser is available for module-loading, responsive, and keyboard checks.
- No application build is required.

## Run the Page

Serve the repository root with an approved static file server so native ES modules load
with a valid origin. For example, from PowerShell when Python is available:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000/` in the browser. Do not open the page through `file://`.
Stop the static server after validation.

## Automated Gates

Run the commands supported by the supplied package scripts/harness; the equivalent direct
tool invocations are:

```powershell
npm exec -- vitest run
npm exec -- eslint src tests
npm audit --audit-level=high
```

The configured ESLint run must include its supplied security rules and report zero
findings, errors, or warnings. The audit must report no high or critical vulnerabilities.
Run the supplied harness gates as well; completion requires every gate to pass. Do not
edit tests, package scripts, test/lint configuration, or harness files to obtain a pass.

## Acceptance Scenarios

1. **FR-001/FR-002/FR-003/FR-004/FR-005**: Add a valid expense (1250 rupees, Food,
   2026-11-10, `Lunch`). Verify it appears and totals 1250. Check each amount boundary,
   invalid category, impossible/future date, and description lengths 250/251; verify
   field-level errors and no save for rejected input.
2. **FR-006/FR-009/FR-010**: Add entries across two dates, categories, and months. Verify
   date-descending order and newest-created tie order; apply category plus month filters
   and verify only matching rows and exact filtered totals remain.
3. **FR-007/FR-008**: Edit valid and invalid values. Confirm an invalid edit preserves the
   old record. Cancel a delete and verify no change; confirm another delete and verify
   the record and totals update.
4. **FR-011**: Verify the first-run message differs from the no-matching-results message.
5. **FR-012**: Add a record, reload, then restart the browser in the same profile without
   clearing site data. Verify the record and totals remain.
6. **FR-014**: Seed malformed JSON or a version/record violation. Verify the recovery
   error appears, the empty state is not shown, and the stored value is not overwritten.
   Simulate unavailable storage and a quota/write exception; verify an explicit error and
   unchanged saved records, list, and totals.
7. **NFR-001/NFR-002**: At 320px and 1920px widths, complete the primary workflow without
   horizontal page scrolling. Use only a keyboard to add, filter, edit, and delete; verify
   labels, focus, and associated field errors.
8. **NFR-003**: Enter text resembling HTML/script in the description and verify it is
   displayed literally with no execution.
9. **NFR-004**: With 1,000 records, measure add, edit, filter, and total refresh on the
   same device; each must complete within one second. Keep an automated performance smoke
   test for the pure calculations and DOM update path.

## Expected Result

All automated tests and configured lint/security/audit gates pass with zero warnings or
findings at the specified thresholds. Manual accessibility and responsive checks pass.
The final change still requires explicit human `ACCEPT` or `REJECT`.
