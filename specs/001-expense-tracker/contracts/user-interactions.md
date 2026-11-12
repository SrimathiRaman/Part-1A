# User Interaction Contract

This is the visible interface contract for the single-page application. There are no
network endpoints or external APIs.

## Expense Form

- Amount, category, and date are required. Description is optional.
- Amount accepts surrounding whitespace and digits only; value must be a positive safe
  integer rupee amount. Decimal notation, signs, separators, zero, negative values, and
  values above 9,007,199,254,740,991 are rejected.
- Category must exactly match a fixed category label.
- Date must be a real `YYYY-MM-DD` calendar date and no later than the user's local today.
- Description is trimmed; blank becomes empty; at most 250 Unicode code points are
  accepted.
- Invalid fields show an associated message beside the field. Invalid add/edit does not
  save and does not change an existing record or any totals.
- User-provided descriptions are rendered as text, never interpreted as markup or code.

## List, Filters, and Totals

- List all expenses by date descending; for equal dates, show later-created records first.
- The category filter and month filter combine with AND semantics. Clearing one filter
  leaves the other active.
- Show the sum and per-category sums for the filtered list, using exact whole-rupee
  arithmetic.
- Distinguish the no-expenses-yet state from a no-matching-expenses state.

## Edit and Delete

- Editing applies the same validation rules as adding; failed edits preserve the old
  record.
- Ask for confirmation before deleting. Cancel leaves the record unchanged. Confirm
  removes it only after successful persistence.
- If persistence fails, show an error and retain the prior displayed and stored state.

## Storage Error State

- If stored data is unreadable, show a recovery error instead of an empty-list state, do
  not overwrite the data, and block add/edit/delete until data is readable again.
- If storage access or a write fails, explicitly report that the operation was not saved.

## Accessibility and Responsiveness

- Every form control has a visible label and accessible name. Associate field errors with
  their controls and expose changing status/errors to assistive technology.
- All primary operations are keyboard-operable.
- The primary workflow remains usable at 320px and 1920px viewport widths without
  horizontal page scrolling; verify visually in a browser.
