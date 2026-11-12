import { CATEGORIES } from '../domain/expense-validation.js';

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function textElement(tag, text = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function fieldControl(labelText, id, type) {
  const group = document.createElement('div');
  group.className = 'form-field';
  const label = textElement('label', labelText);
  label.htmlFor = id;
  const control = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  control.id = id;
  if (type !== 'textarea') {
    control.type = type;
  }
  const error = textElement('span');
  error.className = 'field-error';
  error.id = `${id}-error`;
  error.hidden = true;
  control.setAttribute('aria-describedby', error.id);
  group.append(label, control, error);
  return { group, control, error };
}

function categoryControl(labelText, id, includeAll) {
  const group = document.createElement('div');
  group.className = 'form-field';
  const label = textElement('label', labelText);
  label.htmlFor = id;
  const control = document.createElement('select');
  control.id = id;
  const firstOption = textElement('option', includeAll ? 'All categories' : 'Choose a category');
  firstOption.value = '';
  firstOption.disabled = !includeAll;
  control.append(firstOption);
  for (const category of CATEGORIES) {
    const option = textElement('option', category);
    option.value = category;
    control.append(option);
  }
  const error = textElement('span');
  error.className = 'field-error';
  error.id = `${id}-error`;
  error.hidden = true;
  control.setAttribute('aria-describedby', error.id);
  group.append(label, control, error);
  return { group, control, error };
}

function actionButton(text, action, className = '') {
  const button = textElement('button', text);
  button.type = 'button';
  button.dataset.action = action;
  if (className) {
    button.className = className;
  }
  return button;
}

function buildForm() {
  const section = document.createElement('section');
  section.className = 'panel';
  section.setAttribute('aria-labelledby', 'expense-form-title');
  const heading = textElement('h2', 'Add an expense');
  heading.id = 'expense-form-title';
  const form = document.createElement('form');
  form.noValidate = true;
  const amount = fieldControl('Amount (rupees)', 'expense-amount', 'text');
  amount.control.inputMode = 'numeric';
  amount.control.required = true;
  const category = categoryControl('Category', 'expense-category', false);
  category.control.required = true;
  const date = fieldControl('Date', 'expense-date', 'date');
  date.control.required = true;
  const description = fieldControl('Description (optional)', 'expense-description', 'textarea');
  description.control.maxLength = 1000;
  description.control.rows = 3;
  const submit = textElement('button', 'Add expense');
  submit.type = 'submit';
  const cancel = actionButton('Cancel edit', 'cancel-edit');
  cancel.hidden = true;
  const actions = document.createElement('div');
  actions.className = 'form-actions';
  actions.append(submit, cancel);
  form.append(amount.group, category.group, date.group, description.group, actions);
  section.append(heading, form);
  return { section, heading, form, amount, category, date, description, submit, cancel };
}

function buildFilters() {
  const section = document.createElement('section');
  section.className = 'panel filter-panel';
  section.setAttribute('aria-labelledby', 'filters-title');
  const heading = textElement('h2', 'Filter expenses');
  heading.id = 'filters-title';
  const category = categoryControl('Category filter', 'filter-category', true);
  const month = fieldControl('Month', 'filter-month', 'month');
  const clearCategory = actionButton('Clear category', 'clear-category');
  const clearMonth = actionButton('Clear month', 'clear-month');
  const controls = document.createElement('div');
  controls.className = 'filter-controls';
  controls.append(category.group, month.group, clearCategory, clearMonth);
  section.append(heading, controls);
  return { section, category, month, clearCategory, clearMonth };
}

function buildResults() {
  const section = document.createElement('section');
  section.className = 'panel';
  section.setAttribute('aria-labelledby', 'expenses-title');
  const heading = textElement('h2', 'Expenses');
  heading.id = 'expenses-title';
  const total = textElement('p');
  total.className = 'listed-total';
  const categoryTotals = document.createElement('ul');
  categoryTotals.className = 'category-totals';
  const empty = textElement('p');
  empty.className = 'empty-state';
  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const label of ['Date', 'Category', 'Description', 'Amount', 'Actions']) {
    const header = textElement('th', label);
    header.scope = 'col';
    headerRow.append(header);
  }
  tableHead.append(headerRow);
  const body = document.createElement('tbody');
  table.append(tableHead, body);
  section.append(heading, total, categoryTotals, empty, table);
  return { section, total, categoryTotals, empty, table, body };
}

function formatAmount(amount) {
  return `₹${amountFormatter.format(amount)}`;
}

function setFieldError(field, message) {
  const hasError = typeof message === 'string' && message.length > 0;
  field.control.setAttribute('aria-invalid', String(hasError));
  field.error.hidden = !hasError;
  field.error.textContent = hasError ? message : '';
}

function createExpenseRow(record) {
  const row = document.createElement('tr');
  const cells = [
    ['Date', record.date],
    ['Category', record.category],
    ['Description', record.description || '—'],
    ['Amount', formatAmount(record.amount)]
  ];
  for (const [label, value] of cells) {
    const cell = textElement('td', value);
    cell.dataset.label = label;
    row.append(cell);
  }
  const actions = document.createElement('td');
  actions.dataset.label = 'Actions';
  const edit = actionButton('Edit', 'edit');
  const remove = actionButton('Delete', 'delete', 'danger-button');
  edit.dataset.id = record.id;
  remove.dataset.id = record.id;
  edit.setAttribute('aria-label', `Edit expense on ${record.date}, ${record.category}`);
  remove.setAttribute('aria-label', `Delete expense on ${record.date}, ${record.category}`);
  actions.append(edit, remove);
  row.append(actions);
  return row;
}

function renderErrors(context, errors) {
  setFieldError(context.form.amount, errors.amount);
  setFieldError(context.form.category, errors.category);
  setFieldError(context.form.date, errors.date);
  setFieldError(context.form.description, errors.description);
}

function renderTotals(context, totals) {
  context.results.total.textContent = `Listed total: ${formatAmount(totals.total)}`;
  context.results.categoryTotals.replaceChildren();
  for (const [category, total] of Object.entries(totals.byCategory)) {
    context.results.categoryTotals.append(textElement('li', `${category}: ${formatAmount(total)}`));
  }
}

function renderRows(context, state) {
  context.results.body.replaceChildren(...state.visibleRecords.map(createExpenseRow));
  context.results.table.hidden = !state.canMutate || state.visibleRecords.length === 0;
  context.results.total.hidden = !state.canMutate;
  context.results.categoryTotals.hidden = !state.canMutate;
  context.results.empty.hidden = !state.canMutate || state.visibleRecords.length > 0;
  context.results.empty.textContent = state.hasRecords
    ? 'No expenses match these filters.'
    : 'No expenses yet. Add your first expense above.';
}

function syncEditForm(context, state) {
  const nextId = state.editingId ?? '';
  if (context.form.form.dataset.editingId === nextId) {
    return;
  }
  context.form.form.dataset.editingId = nextId;
  if (state.editingRecord) {
    context.form.amount.control.value = String(state.editingRecord.amount);
    context.form.category.control.value = state.editingRecord.category;
    context.form.date.control.value = state.editingRecord.date;
    context.form.description.control.value = state.editingRecord.description;
  } else {
    context.form.form.reset();
  }
}

function setMutationControls(context, canMutate) {
  context.form.form.querySelectorAll('input, select, textarea, button').forEach((control) => {
    control.disabled = !canMutate;
  });
  context.filters.category.control.disabled = !canMutate;
  context.filters.month.control.disabled = !canMutate;
  context.filters.clearCategory.disabled = !canMutate;
  context.filters.clearMonth.disabled = !canMutate;
}

function render(context, state) {
  renderErrors(context, state.fieldErrors);
  syncEditForm(context, state);
  context.form.heading.textContent = state.editingId === null ? 'Add an expense' : 'Edit an expense';
  context.form.submit.textContent = state.editingId === null ? 'Add expense' : 'Save changes';
  context.form.cancel.hidden = state.editingId === null;
  setMutationControls(context, state.canMutate);
  context.filters.category.control.value = state.filters.category;
  context.filters.month.control.value = state.filters.month;
  context.status.textContent = state.statusMessage;
  context.error.textContent = state.globalError;
  renderTotals(context, state.totals);
  renderRows(context, state);
}

export function createRenderer(root) {
  const form = buildForm();
  const filters = buildFilters();
  const results = buildResults();
  const status = textElement('p');
  status.className = 'status-message';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const error = textElement('p');
  error.className = 'global-error';
  error.setAttribute('role', 'alert');
  root.append(status, error, form.section, filters.section, results.section);

  const context = { form, filters, results, status, error };
  return {
    render: (state) => render(context, state),
    form: form.form
  };
}
