# Prompt Record — Personal Expense Tracker
/speckit.constitution Establish the constitution for a single page Expense Tracker web application:

Client side only using plain HTML, CSS and JavaScript. No backend, no database, no API and no framework.
Data is saved only in browser localStorage.
Follow modular architecture and separation of concerns. Business logic must be separate from the UI code and from the storage code.
Amount is in whole rupees and stored as an integer. Decimal values are not allowed.
Never expose secrets in source code. User entered text must be shown safely, no innerHTML or eval.
Every functional requirement must have at least one automated test, with the requirement ID in the test title.
Follow accessibility and responsive design principles. These are checked manually during review.
Prefer simple, maintainable solutions over unnecessary complexity.
Quality standards: lint with 0 errors and 0 warnings, security scan with 0 findings, all tests pass, npm audit 0 high or critical vulnerabilities.
The coding agent must not edit, delete or skip tests and must not change the harness or its configuration.
A change is not done until harness reports pass on all gates
Final approval needs an explicit human ACCEPT or REJECT.

/speckit.specify Build a single page personal Expense Tracker for one user on one browser.
User can add an expense with amount, category, date and optional description, see all expenses with newest first, edit an expense, delete an expense after confirmation, filter by category and by month, and see the total of listed expenses and total per category.
Data should still be there after reload or browser restart.
Invalid input is rejected with a message next to the field and nothing is saved.
Show an empty state when there are no expenses.
Out of scope: login, sync across devices, multiple currencies, budgets, charts, recurring expenses, import and export.
Define user stories, numbered functional requirements, non functional requirements and acceptance criteria in Given/When/Then form with example values so each one can become a pass/fail test.
Include the exact validation rules as requirements. Identify assumptions and unresolved questions as [Need Clarification].

/speckit.clarify Ask about things that affect the tests like amount limits, categories, date rules, description length, sort order, how filters combine, delete behaviour, and what happens if stored data is corrupt or storage is full.

/speckit.plan 
Technology constraints:
- Frontend: HTML, CSS and JavaScript ES modules. No framework and no build step.
- No backend, no database, no API. Storage is browser localStorage.
- Keep validation and calculation logic, storage access and UI code in separate modules.
- Tests: Vitest with jsdom in tests/. Unit tests for the pure modules and contract tests for the stored record format.
- Quality gates run locally: ESLint for lint, ESLint security rules plus npm audit for security, Vitest for tests. package.json, eslint.config.mjs, vitest.config.mjs and .harness/ will be supplied by me; do not plan to generate them
Describe architecture, project structure, data model, module functions, error handling and testing including failure cases.
Explain key decisions and dependencies. Ensure the plan complies with the constitution and approved specification.

/speckit-checklist

/speckit.tasks 
Each task should mention the FR IDs it covers. Do not create tasks that edit anything under .harness/.
Application tasks must not change the harness or the tests.

Create a traceability table in the feature folder with one row per functional requirement showing acceptance scenario, task IDs, source file and function, and test name. Write pending where not yet known. Do not write any code.

/speckit.analyze

save the final report text as
evidence/analyze-report.md

/speckit.implement 
Implement only the setup tasks and the test tasks from tasks.md. Follow the attached style guide and harness rules.
- Derive every assertion from an acceptance criterion or validation rule in spec.md and use its exact example values.
- Write required unit tests and contract tests
- Use exact assertions (toBe, toEqual, toStrictEqual). Include the failure cases.
- Do not create any file under src/js. Do not modify package.json, eslint.config.mjs, vitest.config.mjs or anything under .harness/.
Mark the completed tasks in tasks.md, list which FR IDs have tests and which do not, then stop

/speckit.implement Implement the remaining tasks.Do not change the tests or the harness.
Do not run the harness and do not change code to make tests pass in this step, I will run the harness.
Do not add dependencies.
Mark completed tasks, update the traceability table, tell me any requirement you could not implement, and stop.

The deterministic harness rejected the implementation. These are the findings from run 001:

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

Fix the root cause in src/ only.
- Do not modify tests/, .harness/, eslint.config.mjs, vitest.config.mjs, spec.md or any acceptance criterion.
- Do not add eslint-disable comments and do not skip tests.
- Make only the changes needed for these findings and keep all valid behaviour.
- If a finding shows that the specification is wrong or ambiguous, stop and tell me instead of changing code.
List each file you changed and the finding it resolves.

The deterministic harness rejected the implementation. These are the findings from run 002:

### G3-tests FAILED

- Rule/test: expense queries FR-006: sorts by date newest first and then by creation time (tests/unit/expense-queries.test.js)
  - Expected: Assertion holds (see test title for the requirement ID)
  - Observed: AssertionError: expected [ …(5) ] to strictly equal [ …(5) ]
        at C:/Users/Ramprasath/Documents/VSCode Project/Assignment-1/Part-1A/tests/unit/expense-queries.test.js:41:35

Fix the root cause in src/ only.
- Do not modify tests/, .harness/, eslint.config.mjs, vitest.config.mjs, spec.md or any acceptance criterion.
- Do not add eslint-disable comments and do not skip tests.
- Make only the changes needed for these findings and keep all valid behaviour.
- If a finding shows that the specification is wrong or ambiguous, stop and tell me instead of changing code.
List each file you changed and the finding it resolves.

npm test

move it to evidence

Update traceability.md so every row has the final source file and function and the exact test file and test title. Flag any FR that has no test or no implementation. Do not change code or tests.

Create top-level README.md which must let an evaluator run the harness
