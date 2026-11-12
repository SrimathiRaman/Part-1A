<!--
Sync Impact Report
Version change: none -> 1.0.0 (initial constitution)
Modified principles: none
Added sections: Core Principles; Product and Accessibility Constraints; Quality Gates and Change Controls; Governance
Removed sections: none
Follow-up TODOs: Confirm the original ratification date and replace TODO(RATIFICATION_DATE).
-->

# Expense Tracker Constitution

## Core Principles

### I. Client-Only, Browser-Local Architecture
The Expense Tracker MUST be a single-page web application implemented with plain HTML, CSS,
and JavaScript. It MUST NOT use a backend, database, API, or application framework. Expense
data MUST be saved only in the browser's localStorage. This keeps the application self-contained
and its data under the user's browser storage.

### II. Separation of Concerns
The application MUST use a modular architecture. Business logic, user interface code, and
storage access MUST remain separate, with clear responsibilities and interfaces. Changes MUST
preserve these boundaries rather than introducing unnecessary layers.

### III. Whole-Rupee Data Integrity
Expense amounts MUST be represented and stored as integer whole rupees. Decimal values MUST
NOT be accepted as valid expense amounts. Validation MUST enforce this rule before an expense
is saved.

### IV. Safe Handling of User Input
The application MUST NOT expose secrets in source code. User-entered text MUST be rendered
safely as text; application code MUST NOT use `innerHTML` or `eval` to handle or display it.

### V. Simplicity and Verifiable Requirements
The application MUST favor simple, maintainable solutions over unnecessary complexity. Every
functional requirement MUST have at least one automated test, and each such test title MUST
include its requirement ID so coverage can be traced and reviewed.

## Product and Accessibility Constraints

The interface MUST follow accessibility and responsive design principles. Accessibility and
responsive behavior are subject to manual review; automated tests do not replace that review.

## Quality Gates and Change Controls

Every change MUST pass all harness gates before it is considered done. The harness MUST report
pass for all gates. Required quality thresholds are:

- Lint: zero errors and zero warnings.
- Security scan: zero findings.
- Automated tests: all pass.
- `npm audit`: zero high or critical vulnerabilities.

Coding agents MUST NOT edit, delete, or skip tests, and MUST NOT change the test harness or its
configuration. If a gate cannot pass without violating these controls, the change MUST remain
incomplete pending an authorized resolution.

## Governance

This constitution governs application design and change review. Amendments MUST be documented
in this file and MUST update the version and last-amended date. Versioning MUST follow semantic
versioning: MAJOR for backward-incompatible governance changes, MINOR for new or materially
expanded principles or sections, and PATCH for clarifications and non-semantic wording changes.

Every change MUST be reviewed for compliance with this constitution and the applicable
requirements. Final approval MUST be an explicit human `ACCEPT` or `REJECT`; automated gate
results do not substitute for that decision.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-11-12
