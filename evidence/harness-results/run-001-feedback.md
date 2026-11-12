# Harness feedback — run 001 — FAIL

Checked at: 2026-11-12T09:04:39.514Z

## G1-lint FAILED

- Rule/test: complexity (src/storage/expense-repository.js:16)
  - Expected: No violation of complexity
  - Observed: Function 'isValidRecord' has a complexity of 14. Maximum allowed is 10.

## G2-security FAILED

- Rule/test: security/detect-object-injection (src/application/expense-controller.js:199)
  - Expected: No violation of security/detect-object-injection
  - Observed: Generic Object Injection Sink
- Rule/test: security/detect-object-injection (src/application/expense-controller.js:209)
  - Expected: No violation of security/detect-object-injection
  - Observed: Generic Object Injection Sink

## G3-tests FAILED

- Rule/test: expense queries FR-006: sorts by date newest first and then by creation time (tests/unit/expense-queries.test.js)
  - Expected: Assertion holds (see test title for the requirement ID)
  - Observed: AssertionError: expected [ …(5) ] to strictly equal [ …(5) ]
        at C:/Users/Ramprasath/Documents/VSCode Project/Assignment-1/Part-1A/tests/unit/expense-queries.test.js:41:35
- Rule/test: expense queries FR-009: clearing category retains the November 2026 filter (tests/unit/expense-queries.test.js)
  - Expected: Assertion holds (see test title for the requirement ID)
  - Observed: AssertionError: expected [] to strictly equal [ { id: 'food-november', …(5) }, …(1) ]
        at C:/Users/Ramprasath/Documents/VSCode Project/Assignment-1/Part-1A/tests/unit/expense-queries.test.js:57:76
- Rule/test: expense queries FR-010: calculates listed and per-category whole-rupee totals exactly (tests/unit/expense-queries.test.js)
  - Expected: Assertion holds (see test title for the requirement ID)
  - Observed: AssertionError: expected { total: 1950n, byCategory: { …(2) } } to strictly equal { listed: 1950n, byCategory: { …(2) } }
        at C:/Users/Ramprasath/Documents/VSCode Project/Assignment-1/Part-1A/tests/unit/expense-queries.test.js:64:39
- Rule/test: expense queries FR-010: returns zero for no listed expenses and preserves exact large sums (tests/unit/expense-queries.test.js)
  - Expected: Assertion holds (see test title for the requirement ID)
  - Observed: AssertionError: expected { total: 0n, byCategory: {} } to strictly equal { listed: 0n, byCategory: {} }
        at C:/Users/Ramprasath/Documents/VSCode Project/Assignment-1/Part-1A/tests/unit/expense-queries.test.js:74:33
