import { CATEGORIES, isValidCalendarDate } from '../domain/expense-validation.js';

const STORAGE_KEY = 'expense-tracker:data';
const FORMAT = 'expense-tracker';
const SCHEMA_VERSION = 1;
const ENVELOPE_KEYS = ['format', 'schemaVersion', 'records'];
const RECORD_KEYS = ['id', 'amount', 'category', 'date', 'description', 'createdAt'];
function hasExactKeys(value, keys) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.hasOwn(value, key));
}

function isValidRecord(record, ids) {
  if (!hasExactKeys(record, RECORD_KEYS)) {
    return false;
  }

  if (typeof record.id !== 'string' || record.id.length === 0 || ids.has(record.id)) {
    return false;
  }

  if (!Number.isSafeInteger(record.amount) || record.amount < 1) {
    return false;
  }

  if (typeof record.category !== 'string' || !CATEGORIES.includes(record.category)) {
    return false;
  }

  if (!isValidCalendarDate(record.date)) {
    return false;
  }

  if (
    typeof record.description !== 'string'
    || record.description !== record.description.trim()
    || Array.from(record.description).length > 250
  ) {
    return false;
  }

  return Number.isSafeInteger(record.createdAt) && record.createdAt >= 0;
}

function isValidRecords(records) {
  if (!Array.isArray(records)) {
    return false;
  }

  const ids = new Set();
  for (const record of records) {
    if (!isValidRecord(record, ids)) {
      return false;
    }
    ids.add(record.id);
  }
  return true;
}

function isValidEnvelope(value) {
  return hasExactKeys(value, ENVELOPE_KEYS)
    && value.format === FORMAT
    && value.schemaVersion === SCHEMA_VERSION
    && isValidRecords(value.records);
}

function load(getStorage) {
  let raw;
  try {
    raw = getStorage().getItem(STORAGE_KEY);
  } catch {
    return { ok: false, code: 'storage-unavailable' };
  }
  if (raw === null) {
    return { ok: true, records: [] };
  }

  let envelope;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return { ok: false, code: 'corrupt-data' };
  }
  if (!isValidEnvelope(envelope)) {
    return { ok: false, code: 'corrupt-data' };
  }

  return { ok: true, records: envelope.records };
}

function save(getStorage, records) {
  if (!isValidRecords(records)) {
    return { ok: false, code: 'corrupt-data' };
  }

  try {
    const envelope = { format: FORMAT, schemaVersion: SCHEMA_VERSION, records };
    getStorage().setItem(STORAGE_KEY, JSON.stringify(envelope));
    return { ok: true };
  } catch {
    return { ok: false, code: 'storage-unavailable' };
  }
}

export function createExpenseRepository({ getStorage = () => globalThis.localStorage } = {}) {
  return {
    load: () => load(getStorage),
    save: (records) => save(getStorage, records)
  };
}
