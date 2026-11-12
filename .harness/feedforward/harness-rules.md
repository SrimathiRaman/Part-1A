# Harness Rules (feedforward)

1. `spec.md` and the files in `contracts/` are the single source of truth for behaviour.
2. Generated code is untrusted until every harness gate passes and a human has reviewed it.
3. The harness has four gates, all mandatory: G0 integrity, G1 lint, G2 security, G3 unit and contract tests.
4. The coding agent must not create, edit, rename or delete anything in `tests/`, `.harness/`, `eslint.config.mjs` or `vitest.config.mjs` after they are locked.
5. The coding agent must not weaken or remove acceptance criteria, add `eslint-disable` comments, or mark tests as skip, only or todo.
6. Every test title starts with the requirement or acceptance-scenario ID it verifies, for example `FR-003:`.
7. Tests use exact assertions (`toBe`, `toEqual`, `toStrictEqual`). Broad assertions such as `toBeTruthy()` on a result object are not acceptable for acceptance criteria.
8. A repair changes only `src/` and addresses only the reported findings, without removing valid behaviour.
9. If a finding shows the specification is wrong or ambiguous, the agent stops and reports it. The specification is changed through the Spec Kit artifacts by the human, never silently in code or tests.
10. The repair loop stops after three attempts for the same finding; the human then decides.
11. Files under `evidence/harness-results/` are written only by the harness runner and are never edited by hand or by the agent.
12. No secrets, API keys or `.env` files in the repository.
