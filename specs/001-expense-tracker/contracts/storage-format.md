# Storage Format Contract

## Location and Envelope

- Store the entire collection as one string under `expense-tracker:data`.
- The string MUST parse to an object with exactly the supported `format` identifier
  (`expense-tracker`), `schemaVersion` (`1`), and `records` array.
- Each record MUST conform to the [Expense data model](../data-model.md#expense).
- IDs MUST be unique in the envelope. Duplicate expense values are allowed.
- A missing key means no expenses. Malformed JSON, unknown versions, invalid envelope
  fields, or any invalid record make the whole stored document unreadable.
- Do not silently drop records, default corrupt content to an empty list, or overwrite
  unreadable content. Do not migrate unknown versions.

## Read Contract

`load()` returns one of:

- `{ ok: true, records: [] }` for a missing key or a valid envelope.
- `{ ok: false, code: "corrupt-data" }` for invalid JSON or a contract violation.
- `{ ok: false, code: "storage-unavailable" }` if obtaining or reading localStorage fails.

The UI MUST show a recovery error and block add, edit, and delete when load fails. It MUST
not show the ordinary first-run empty state for corrupt or inaccessible data. The raw
stored value is left untouched.

## Write Contract

- Serialize a complete candidate envelope and write it with one `setItem` call.
- Report success only when the storage write completes.
- If obtaining storage, serialization, or `setItem` fails, return an explicit failure.
  The controller MUST keep the previous committed records and the UI MUST show that the
  action was not saved.
- Do not clear records or retry by silently removing data to work around quota failures.
- A failed delete remains visible; a failed add or edit does not alter existing records.

## Contract Test Cases

Test titles MUST include the relevant requirement ID:

- `FR-011-AT-01`: a missing key returns an empty collection for the first-run empty state.
- `FR-012-AT-01`: a valid version-1 envelope round-trips and retains records after reload.
- `FR-014-AT-01` (corrupt-data cases): malformed JSON, unknown version, invalid field,
  and duplicate ID return `corrupt-data`, retain the raw stored string, and prevent
  mutations.
- `FR-014-AT-01` (storage-failure cases): storage getter/read failure returns
  `storage-unavailable`; a simulated quota/write failure returns failure, leaves the
  previous stored string unchanged, and does not publish candidate UI state.
- `FR-002-AT-01` / `FR-003-AT-01` / `FR-004-AT-01` / `FR-005-AT-01`: record-contract
  validation rejects invalid amount, category, date, or description values.

Use jsdom localStorage with a non-opaque origin for normal string/round-trip contract
checks. Use an injected Storage-compatible test double to simulate thrown getter/read/write
operations deterministically. Keep the production adapter limited to browser localStorage.
