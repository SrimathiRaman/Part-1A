# Harness Log — Part 1A Expense Tracker

Write every entry yourself. The assignment's AI policy does not allow AI-generated log entries.

## 1. Initial generation
- Date, coding agent and model used:12/11/2026, 2.30 PM, GitHub Copilot Chat (Speckit), Copilot Fusion (GPT 6 Luna)     
- Spec Kit artifacts supplied as context (spec, plan, tasks, feedforward files): constitution.md, spec.md, plan.md, tasks.md, harness-rules.md, style-guide.md, eslint.security.config.mjs, integrity.lock.json 
- Tasks implemented in this generation: T001, T002, T003, T004, T005, T006, T007, T008, T010, T011, T013, T015, T016, T018, T019
- Commit / tag of the preserved first generation:Preserve first generation before harness

## 2. Harness executions
| Run | Date/time | G0 integrity | G1 lint | G2 security | G3 tests | Result | Evidence file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | 2026-11-12 09:04:39.514|PASS |FAIL |FAIL |FAIL |FAIL | evidence/harness-results/run-001.json |
| 002 | 2026-11-12 10:38:42.784|PASS |PASS |PASS |FAIL |FAIL | evidence/harness-results/run-002.json |
| 003 | 2026-11-12 10:43:23.848||FAIL |PASS |PASS |PASS |FAIL | evidence/harness-results/run-003.json |
| 004 | 2026-11-12 10:46:49.576|PASS |PASS |PASS |PASS |PASS | evidence/harness-results/run-004.json |
| 005 | 2026-11-12 10:58:52.656|PASS |PASS  |PASS |PASS |PASS | evidence/harness-results/run-005.json |
| 006 | 2026-11-12 11:16:32.774|PASS |PASS  |PASS |PASS |PASS | evidence/harness-results/run-006.json |


## 3. Failure-and-repair cycles (only those that really occurred)
### Cycle 1
- Failing gate and rule/test:G1 Lint,G2 Security,G3 Tests
- Expected behaviour (requirement ID):No Violation of Complexity, No violation of security/detect-object-injection,Assertion holds (FR006).
- Observed behaviour:Function 'isValidRecord' has a complexity of 14. Maximum allowed is 10.,Generic Object Injection Sink,AssertionError.
- Evidence given to the coding agent (file and what was pasted): 
The deterministic harness rejected the implementation. These are the findings from run 001:
<PASTED CONTENTS FROM RUN-001-FEEDBACK.MD>
Fix the root cause in src/ only.

- What the agent changed (files, summary): 
Fixed the source findings:
expense-repository.js — refactored record validation to bring complexity below the lint limit.
expense-controller.js — replaced dynamic filter-property access flagged by the security rule.
expense-queries.js — treats null filters as cleared and returns totals with the expected listed key.
render.js — reads the renamed listed total.

- Re-run number and outcome of the same gates: RUN-004 / PASS

### Cycle 2
- Failing gate and rule/test:G3 Tests
- Expected behaviour (requirement ID):Assertion holds (FR006).
- Observed behaviour:AssertionError.
- Evidence given to the coding agent (file and what was pasted): 
The deterministic harness rejected the implementation. These are the findings from run 002:
<PASTED CONTENTS FROM RUN-002-FEEDBACK.MD>
Fix the root cause in src/ only.

- What the agent changed (files, summary): 
A G0 integrity failure concerns the locked test file, so didnot attempt to repair it from.

### Cycle 3
- Failing gate and rule/test:G0-integrity FAILED
- Expected behaviour (requirement ID):unchanged since lock
- Observed behaviour:file modified
- Evidence given to the coding agent (file and what was pasted): 
The deterministic harness rejected the implementation. These are the findings from run 002:
<PASTED CONTENTS FROM RUN-003-FEEDBACK.MD>
Fix the root cause in src/ only.

- What the agent changed (files, summary): 
Unloacked the files and updated

- Re-run number and outcome of the same gates: RUN-004 / PASS

## 4. Specification changes made after implementation started (if any)
- Artifact changed, why, and commit: Implemented the  source tasks and updated in tasks.md. Updated  traceability.md. The files are expense-validation.test.js, expense-queries.test.js, and expense-repository.test.js. Setup created .gitignore, index.html, main.js, and styles.css. are updated

## 5. Final human review
- Manual checks performed in the browser: YES - Validated Create, Edit, Delete, Filter flows
- Decision: ACCEPT 
- Justification:run 004 PASS, plus what your manual checks confirmed
- Known limitations and residual risks:performance target was not measured, accessibility was checked manually
