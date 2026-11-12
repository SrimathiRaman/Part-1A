import { CATEGORIES, validateExpenseInput } from '../domain/expense-validation.js';
import { calculateTotals, filterExpenses, sortExpenses } from '../domain/expense-queries.js';

let fallbackIdSequence = 0;

function getLocalToday() {
  const now = new Date();
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function defaultCreateId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return `expense-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }
  fallbackIdSequence += 1;
  return `expense-${Date.now()}-${fallbackIdSequence}`;
}

function isValidMonth(month) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && Number(month.slice(0, 4)) > 0;
}

function loadErrorMessage(code) {
  return code === 'corrupt-data'
    ? 'Saved expenses could not be read. Your stored data was left untouched.'
    : 'Browser storage is unavailable. Saved expenses could not be loaded.';
}

function saveErrorMessage(code) {
  return code === 'corrupt-data'
    ? 'Expense data failed validation. Your changes were not saved.'
    : 'Browser storage is unavailable or full. Your changes were not saved.';
}

function getViewState(context) {
  const records = sortExpenses(context.state.records);
  const visibleRecords = filterExpenses(records, context.state.filters);
  return {
    records,
    visibleRecords,
    totals: calculateTotals(visibleRecords),
    filters: { ...context.state.filters },
    fieldErrors: { ...context.state.fieldErrors },
    globalError: context.state.globalError,
    statusMessage: context.state.statusMessage,
    editingId: context.state.editingId,
    editingRecord: context.state.records.find((record) => record.id === context.state.editingId) ?? null,
    hasRecords: context.state.records.length > 0,
    canMutate: context.state.loadStatus === 'ready'
  };
}

function updateView(context) {
  context.render(getViewState(context));
}

function saveCandidate(context, records, successMessage) {
  const result = context.repository.save(records);
  if (!result.ok) {
    context.state.globalError = saveErrorMessage(result.code);
    context.state.statusMessage = '';
    updateView(context);
    return result;
  }

  context.state.records = records;
  context.state.editingId = null;
  context.state.fieldErrors = {};
  context.state.globalError = '';
  context.state.statusMessage = successMessage;
  updateView(context);
  return { ok: true };
}

function initialize(context) {
  const result = context.repository.load();
  if (!result.ok) {
    context.state.loadStatus = 'blocked';
    context.state.globalError = loadErrorMessage(result.code);
    updateView(context);
    return result;
  }

  context.state.records = result.records;
  context.state.loadStatus = 'ready';
  context.state.globalError = '';
  updateView(context);
  return { ok: true };
}

function submit(context, input) {
  if (context.state.loadStatus !== 'ready') {
    return { ok: false, code: 'storage-unavailable' };
  }

  const today = typeof context.today === 'function' ? context.today() : context.today;
  const validation = validateExpenseInput(input, { today });
  if (!validation.ok) {
    context.state.fieldErrors = validation.errors;
    context.state.globalError = '';
    context.state.statusMessage = '';
    updateView(context);
    return validation;
  }

  return context.state.editingId === null
    ? addExpense(context, validation.value)
    : updateExpense(context, validation.value);
}

function getUniqueId(context) {
  let id = context.createId();
  let attempts = 0;
  while (context.state.records.some((record) => record.id === id) && attempts < 10) {
    id = context.createId();
    attempts += 1;
  }
  const exists = context.state.records.some((record) => record.id === id);
  return typeof id === 'string' && id.length > 0 && !exists ? id : null;
}

function addExpense(context, value) {
  const id = getUniqueId(context);
  if (id === null) {
    context.state.globalError = 'A unique expense ID could not be generated. Your changes were not saved.';
    updateView(context);
    return { ok: false, code: 'id-generation-failed' };
  }

  const record = { ...value, id, createdAt: context.now() };
  return saveCandidate(context, [...context.state.records, record], 'Expense saved.');
}

function updateExpense(context, value) {
  const current = context.state.records.find((record) => record.id === context.state.editingId);
  if (!current) {
    context.state.globalError = 'This expense is no longer available to edit.';
    updateView(context);
    return { ok: false, code: 'not-found' };
  }

  const replacement = { ...value, id: current.id, createdAt: current.createdAt };
  const records = context.state.records.map((record) => (
    record.id === current.id ? replacement : record
  ));
  return saveCandidate(context, records, 'Expense updated.');
}

function beginEdit(context, id) {
  if (context.state.loadStatus !== 'ready') {
    return { ok: false, code: 'storage-unavailable' };
  }
  if (!context.state.records.some((record) => record.id === id)) {
    return { ok: false, code: 'not-found' };
  }

  context.state.editingId = id;
  context.state.fieldErrors = {};
  context.state.globalError = '';
  context.state.statusMessage = 'Editing expense.';
  updateView(context);
  return { ok: true };
}

function cancelEdit(context) {
  context.state.editingId = null;
  context.state.fieldErrors = {};
  context.state.globalError = '';
  context.state.statusMessage = '';
  updateView(context);
}

function removeExpense(context, id, confirmed) {
  if (context.state.loadStatus !== 'ready') {
    return { ok: false, code: 'storage-unavailable' };
  }
  if (!confirmed) {
    return { ok: true, cancelled: true };
  }

  const records = context.state.records.filter((record) => record.id !== id);
  if (records.length === context.state.records.length) {
    return { ok: false, code: 'not-found' };
  }
  return saveCandidate(context, records, 'Expense deleted.');
}

function setFilter(context, name, value) {
  const validCategory = name === 'category' && (value === '' || CATEGORIES.includes(value));
  const validMonth = name === 'month' && (value === '' || isValidMonth(value));
  if (!validCategory && !validMonth) {
    return { ok: false, code: 'invalid-filter' };
  }

  if (validCategory) {
    context.state.filters.category = value;
  } else {
    context.state.filters.month = value;
  }
  context.state.statusMessage = 'Filters updated.';
  updateView(context);
  return { ok: true };
}

function clearFilter(context, name) {
  if (name === 'category') {
    context.state.filters.category = '';
  } else if (name === 'month') {
    context.state.filters.month = '';
  } else {
    return { ok: false, code: 'invalid-filter' };
  }
  context.state.statusMessage = 'Filter cleared.';
  updateView(context);
  return { ok: true };
}

export function createExpenseController({
  repository,
  render,
  today = getLocalToday,
  now = Date.now,
  createId = defaultCreateId
}) {
  const context = {
    repository,
    render,
    today,
    now,
    createId,
    state: {
      records: [],
      filters: { category: '', month: '' },
      fieldErrors: {},
      globalError: '',
      statusMessage: '',
      editingId: null,
      loadStatus: 'loading'
    }
  };

  return {
    initialize: () => initialize(context),
    submit: (input) => submit(context, input),
    beginEdit: (id) => beginEdit(context, id),
    cancelEdit: () => cancelEdit(context),
    remove: (id, confirmed) => removeExpense(context, id, confirmed),
    setFilter: (name, value) => setFilter(context, name, value),
    clearFilter: (name) => clearFilter(context, name)
  };
}
