# Feature Specification: Personal Expense Tracker

**Feature Branch**: Not set

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "Build a single page personal Expense Tracker for one user on one browser. User can add an expense with amount, category, date and optional description, see all expenses with newest first, edit an expense, delete an expense after confirmation, filter by category and by month, and see the total of listed expenses and total per category. Data should still be there after reload or browser restart. Invalid input is rejected with a message next to the field and nothing is saved. Show an empty state when there are no expenses. Out of scope: login, sync across devices, multiple currencies, budgets, charts, recurring expenses, import and export. Define user stories, numbered functional requirements, non functional requirements and acceptance criteria in Given/When/Then form with example values so each one can become a pass/fail test. Include the exact validation rules as requirements. Identify assumptions and unresolved questions as [Need Clarification]."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record and review expenses (Priority: P1)

As the sole user, I want to record my expenses and see them in date order so I can review
where my money went.

**Why this priority**: Recording and reviewing expenses is the core value of the tracker.

**Independent Test**: Add an expense with valid sample values and verify it appears in the
list and contributes to the total.

**Acceptance Scenarios**:

1. **Given** there are no expenses, **When** I add an expense of 1250 rupees in Food dated
   2026-11-10 with description "Lunch", **Then** the expense appears in the list and the
   listed total is 1250 rupees.
2. **Given** the list contains Food dated 2026-11-10 and Transport dated 2026-11-11,
   **When** I view all expenses, **Then** Transport dated 2026-11-11 appears before Food
   dated 2026-11-10.

---

### User Story 2 - Correct or remove an expense (Priority: P1)

As the sole user, I want to edit an incorrect expense or confirm its deletion so that my
records remain accurate.

**Why this priority**: Corrections and deliberate deletion are necessary to maintain useful
records.

**Independent Test**: Edit one saved expense, verify its updated values and totals, then test
both confirming and canceling deletion.

**Acceptance Scenarios**:

1. **Given** an expense of 1250 rupees in Food, **When** I edit its amount to 1500 rupees,
   **Then** the expense shows 1500 rupees and totals reflect 1500 rather than 1250.
2. **Given** an expense is selected for deletion, **When** I cancel the confirmation,
   **Then** the expense remains unchanged.
3. **Given** an expense is selected for deletion, **When** I confirm the deletion,
   **Then** the expense is removed and totals no longer include it.

---

### User Story 3 - Find expenses and compare totals (Priority: P2)

As the sole user, I want to filter expenses by category and month and see totals for the
visible results so I can review a subset of my spending.

**Why this priority**: Filters and category totals make accumulated records easier to analyze.

**Independent Test**: Add expenses in two categories and months, apply both filters, and
compare the visible records and totals with the expected subset.

**Acceptance Scenarios**:

1. **Given** Food expenses of 1250 rupees on 2026-11-10 and 400 rupees on 2026-10-31,
   plus a Transport expense of 300 rupees on 2026-11-11, **When** I filter to Food and
   November 2026, **Then** only the 1250-rupee Food expense is listed and the listed total
   and Food total are each 1250 rupees.
2. **Given** no expenses match the selected filters, **When** I view the filtered results,
   **Then** I see a message that no expenses match the filters and the listed total is zero.

---

### User Story 4 - Return to saved records (Priority: P1)

As the sole user, I want my expenses to remain available after closing and reopening the
browser so I do not have to enter them again.

**Why this priority**: Records that disappear after a session cannot serve as a personal
expense tracker.

**Independent Test**: Add an expense, reload or restart the browser in the same browser
profile, and verify the expense and totals remain.

**Acceptance Scenarios**:

1. **Given** I saved a 1250-rupee Food expense dated 2026-11-10, **When** I reload the
   application in the same browser profile, **Then** the expense and its 1250-rupee total
   remain visible.
2. **Given** I saved an expense in the same browser profile, **When** I close and reopen the
   browser without clearing its stored site data, **Then** the expense remains available.

### Edge Cases

- The first launch has no records and shows a helpful empty state.
- A filter combination can produce no matching records; the empty result state and zero
  total are shown without deleting or changing saved expenses.
- Two expenses on the same date are both shown; the more recently added expense appears
  first among same-date records.
- Invalid edits leave the previously saved expense and all totals unchanged.
- Canceling a delete confirmation leaves the selected expense and totals unchanged.
- Clearing browser site data is outside the persistence guarantee.
- Future-dated expenses are rejected; the user's current local calendar date is allowed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The user MUST be able to add an expense with a required amount, category, and
  date, plus an optional description. A successful add MUST display the saved values and
  update the list and totals.
- **FR-002**: The amount MUST be present, contain only decimal digits after surrounding
  whitespace is trimmed, and represent an integer greater than zero in whole rupees.
  Decimal notation, signs, separators, blank input, zero, and negative values MUST be
  rejected. Leading zeroes MUST be accepted and the displayed amount MUST be normalized
  (for example, `0012` is saved and displayed as 12 rupees). Invalid input MUST show a
  message beside the amount field and MUST NOT create or modify a saved expense.
- **FR-003**: The category MUST be present and MUST be one of the categories offered by
  the application. The fixed categories MUST be Food, Transport, Housing, Utilities,
  Healthcare, Shopping, Education, Entertainment, Travel, and Other. The category value
  MUST exactly match one of these labels; whitespace-only, differently-cased, or other
  values MUST be rejected. Users MUST NOT create or manage categories. Invalid or
  missing category input MUST show a message beside the category field and MUST NOT
  create or modify a saved expense.
- **FR-004**: The date MUST be present, MUST identify a real calendar date, and MUST be
  today or earlier according to the user's current local calendar date. A date such as
  2026-02-30 or a date later than today MUST be rejected with a message beside the date
  field and MUST NOT create or modify a saved expense.
- **FR-005**: The description MUST be optional. An absent or whitespace-only description
  MUST be treated as empty. A supplied description MUST be displayed as user-entered text,
  not interpreted as markup or executable content.
- **FR-006**: The user MUST be able to view all saved expenses ordered by date, newest
  first. Expenses with the same date MUST be ordered with the most recently added first.
- **FR-007**: The user MUST be able to edit a saved expense's amount, category, date, and
  description. The same validation rules as adding an expense MUST apply; a rejected edit
  MUST leave the saved expense unchanged.
- **FR-008**: The user MUST be asked to confirm before a selected expense is deleted.
  Confirming MUST delete it; canceling MUST leave it unchanged.
- **FR-009**: The user MUST be able to filter expenses by category and by calendar month.
  When both filters are set, only expenses matching both MUST be listed. The month is the
  year and month of the expense date. Clearing a filter MUST remove only that filter.
- **FR-010**: The application MUST show the sum of the currently listed expenses and a sum
  for each category represented in the listed results. Totals MUST use whole rupees.
  With no matching expenses, the listed total MUST be zero and no nonzero category total
  may be shown.
- **FR-011**: When there are no saved expenses, the application MUST show an empty state
  that explains that there are no expenses yet. When filters yield no results, it MUST
  distinguish the no-match state from the no-expenses-yet state.
- **FR-012**: Saved expenses MUST remain available after reload and browser restart in the
  same browser profile, unless the user or browser clears the application's stored data.
- **FR-013**: Invalid add or edit input MUST be rejected with a field-associated message;
  no invalid values may be saved and all prior saved values and totals MUST remain
  unchanged.

#### Functional Acceptance Tests

Each test title includes its requirement ID for traceability.

##### FR-001-AT-01 - Add a valid expense

**Given** no saved expenses, **When** I submit amount `1250`, category `Food`, date
`2026-11-10`, and description `Lunch`, **Then** one expense with those values is listed
and the listed total is 1250 rupees.

##### FR-002-AT-01 - Enforce whole positive rupee amounts

**Given** an amount field, **When** I submit `1250`, **Then** it is accepted as 1250 rupees.
**When** I submit `0012`, **Then** it is accepted and normalized to 12 rupees.
**When** I submit each of blank, `0`, `-1`, `1.5`, `1,000`, or `+10`, **Then** each is
rejected with a message beside the amount field and no expense is saved.

##### FR-003-AT-01 - Require a fixed-list category

**Given** the category list includes `Food` and does not include `Pets`, **When** I submit
`Food`, **Then** it is accepted; **When** I omit the category or submit `Pets`, **Then**
it is rejected with a message beside the category field and nothing is saved.

##### FR-004-AT-01 - Require a real calendar date

**Given** a date field, **When** I submit `2026-11-10`, **Then** it is accepted; **When**
I submit `2026-02-30`, omit the date, or submit `2026-11-13` while today's date is
`2026-11-12`, **Then** it is rejected with a message beside the date field and nothing
is saved.

##### FR-005-AT-01 - Keep description optional and safe

**Given** a valid expense with no description or a whitespace-only description, **When**
I save it, **Then** it is accepted with an empty description. **Given** the description
`<img src=x onerror=alert(1)>`, **When** I save and view it, **Then** it appears only as
literal text and does not execute or create markup.

##### FR-006-AT-01 - List newest expenses first

**Given** expenses dated 2026-11-10 and 2026-11-11, **When** I view all expenses,
**Then** the 2026-11-11 expense appears first. **Given** two expenses dated 2026-11-11,
**Then** the one added later appears first.

##### FR-007-AT-01 - Edit an expense and validate changes

**Given** a saved Food expense of 1250 rupees, **When** I edit it to 1500 rupees and save,
**Then** the existing expense shows 1500 rupees and the total is updated. **When** I then
attempt to edit its amount to `1.5`, **Then** the edit is rejected and the saved amount
remains 1500 rupees.

##### FR-008-AT-01 - Confirm or cancel deletion

**Given** a saved expense, **When** I request deletion and cancel, **Then** it remains
listed. **When** I request deletion again and confirm, **Then** it is removed and no
longer contributes to totals.

##### FR-009-AT-01 - Combine category and month filters

**Given** Food expenses of 1250 rupees on 2026-11-10 and 400 rupees on 2026-10-31, and a
Transport expense of 300 rupees on 2026-11-11, **When** I select Food and November 2026,
**Then** only the 1250-rupee expense is listed. **When** I clear the category filter,
**Then** both November expenses are listed.

##### FR-010-AT-01 - Calculate listed and category totals

**Given** listed Food expenses of 1250 and 400 rupees and a listed Transport expense of
300 rupees, **When** I view totals, **Then** the listed total is 1950 rupees, Food is
1650 rupees, and Transport is 300 rupees. **Given** no listed expenses, **Then** the
listed total is zero.

##### FR-011-AT-01 - Show the appropriate empty state

**Given** no saved expenses, **When** I open the application, **Then** I see a no-expenses-yet
message. **Given** saved expenses but filters matching none, **When** I apply those
filters, **Then** I see a no-matching-expenses message instead.

##### FR-012-AT-01 - Retain expenses across browser sessions

**Given** I saved the 1250-rupee Food expense dated 2026-11-10, **When** I reload and then
reopen the application in the same browser profile without clearing its stored data,
**Then** the expense and 1250-rupee total remain available.

##### FR-013-AT-01 - Reject invalid input without changing saved data

**Given** a saved 1250-rupee expense, **When** I submit an invalid amount, category, or
date while adding another expense, **Then** a message appears beside each invalid field,
no new expense is saved, and the original expense and total remain unchanged. **When** I
submit the same invalid values while editing, **Then** the original expense remains
unchanged.

### Non-Functional Requirements

- **NFR-001**: The application MUST remain usable at viewport widths from 320 to 1920
  CSS pixels without horizontal page scrolling for the primary expense workflow.
- **NFR-002**: All primary tasks MUST be operable using a keyboard, and each form control
  and validation message MUST have a programmatically associated accessible name or
  description.
- **NFR-003**: User-entered text MUST be presented as text and MUST NOT execute as markup
  or code.
- **NFR-004**: For a data set of 1,000 expenses, adding an expense, applying or clearing
  filters, and updating totals MUST complete within one second on the same device under
  ordinary use.

#### Non-Functional Acceptance Tests

##### NFR-001-AT-01 - Use the primary workflow on narrow and wide screens

**Given** viewport widths of 320 and 1920 CSS pixels, **When** I add, view, edit, filter,
and delete an expense, **Then** the primary controls remain visible and operable without
horizontal page scrolling.

##### NFR-002-AT-01 - Operate and identify controls accessibly

**Given** the application, **When** I use only the keyboard to add and filter an expense,
**Then** I can reach and operate every primary control and each field's purpose and
validation message are programmatically associated with that field.

##### NFR-003-AT-01 - Render user text without execution

**Given** a description containing `<script>alert(1)</script>`, **When** I save and view
the expense, **Then** the description is displayed literally and no script executes.

##### NFR-004-AT-01 - Update a 1,000-expense list promptly

**Given** 1,000 saved expenses, **When** I add an expense, apply or clear a filter, or
update an expense, **Then** the affected list and totals update within one second on the
same device under ordinary use.

### Key Entities

- **Expense**: One personal spending record, including a positive whole-rupee amount,
  category, calendar date, and optional description.
- **Category**: One of Food, Transport, Housing, Utilities, Healthcare, Shopping,
  Education, Entertainment, Travel, or Other; used to classify, group, and filter expenses.
- **Month filter**: A selected calendar year and month used to narrow the listed expenses
  by expense date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All FR-001 through FR-013 acceptance tests pass, including the invalid-input
  cases and all corresponding no-save/no-change checks.
- **SC-002**: In a 1,000-expense data set, add, edit, filter, and total updates each finish
  within one second on the same device under ordinary use.
- **SC-003**: After a reload or browser restart in the same browser profile, 100% of
  previously saved expenses and their totals remain available unless stored site data was
  cleared.
- **SC-004**: A user can complete the primary add-and-review flow using only a keyboard
  at both 320-pixel and 1920-pixel viewport widths.

## Assumptions

- The application serves one user in one browser profile; it does not provide sign-in or
  synchronize data between browsers or devices.
- All amounts are in rupees. Multiple currencies and decimal amounts are out of scope.
- An amount is valid only when it is a positive integer; surrounding whitespace is
  ignored, and leading zeroes are normalized.
- The available categories are Food, Transport, Housing, Utilities, Healthcare, Shopping,
  Education, Entertainment, Travel, and Other; the user cannot add or manage categories.
- Expense dates later than the user's current local calendar date are invalid.
- Descriptions are optional, and whitespace-only descriptions are equivalent to an
  omitted description.
- Category and month filters combine using AND semantics, and totals are calculated over
  the currently listed results.
- Expenses sharing a date are ordered by creation time, newest first.
- Data persistence is guaranteed only while the same browser profile retains the
  application's stored data.
- Budgets, charts, recurring expenses, import/export, login, and cross-device sync are
  outside the feature scope.

