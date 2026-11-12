import { beforeEach, describe, expect, it } from 'vitest';
import { createExpenseRepository } from '../../src/storage/expense-repository.js';

const storageKey = 'expense-tracker:data';

const record = {
  id: 'expense-id',
  amount: 1250,
  category: 'Food',
  date: '2026-11-10',
  description: 'Lunch',
  createdAt: 1794312000000
};

const createStorage = (initialValue = null, writeError = null) => {
  let value = initialValue;

  return {
    getItem(key) {
      expect(key).toBe(storageKey);
      return value;
    },
    setItem(key, nextValue) {
      expect(key).toBe(storageKey);
      if (writeError !== null) {
        throw writeError;
      }
      value = nextValue;
    },
    get value() {
      return value;
    }
  };
};

const createRepository = (storage) => createExpenseRepository({
  getStorage: () => storage
});

const createLocalRepository = () => createRepository(localStorage);

const storedEnvelope = (records) => JSON.stringify({
  format: 'expense-tracker',
  schemaVersion: 1,
  records
});

describe('expense repository contract', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('FR-011: treats a missing key as an empty first-run collection', () => {
    const repository = createLocalRepository();

    expect(repository.load()).toStrictEqual({ ok: true, records: [] });
  });

  it('FR-012: saves and reloads a version-1 expense envelope', () => {
    const repository = createLocalRepository();

    expect(repository.save([record]).ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(storageKey))).toStrictEqual({
      format: 'expense-tracker',
      schemaVersion: 1,
      records: [record]
    });
    expect(createLocalRepository().load()).toStrictEqual({
      ok: true,
      records: [record]
    });
  });

  it('FR-002: rejects a stored decimal amount', () => {
    const raw = storedEnvelope([{ ...record, amount: 1.5 }]);
    localStorage.setItem(storageKey, raw);

    expect(createLocalRepository().load()).toStrictEqual({
      ok: false,
      code: 'corrupt-data'
    });
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it('FR-003: rejects a stored category outside the fixed list', () => {
    const raw = storedEnvelope([{ ...record, category: 'Pets' }]);
    localStorage.setItem(storageKey, raw);

    expect(createLocalRepository().load()).toStrictEqual({
      ok: false,
      code: 'corrupt-data'
    });
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it('FR-004: rejects a stored impossible calendar date', () => {
    const raw = storedEnvelope([{ ...record, date: '2026-02-30' }]);
    localStorage.setItem(storageKey, raw);

    expect(createLocalRepository().load()).toStrictEqual({
      ok: false,
      code: 'corrupt-data'
    });
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it('FR-005: rejects a stored description of 251 Unicode code points', () => {
    const raw = storedEnvelope([{ ...record, description: 'a'.repeat(251) }]);
    localStorage.setItem(storageKey, raw);

    expect(createLocalRepository().load()).toStrictEqual({
      ok: false,
      code: 'corrupt-data'
    });
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it.each([
    ['malformed JSON', '{'],
    ['unknown schema version', JSON.stringify({
      format: 'expense-tracker',
      schemaVersion: 2,
      records: []
    })],
    ['duplicate IDs', storedEnvelope([record, record])],
    ['empty ID', storedEnvelope([{ ...record, id: '' }])],
    ['negative creation time', storedEnvelope([{ ...record, createdAt: -1 }])]
  ])('FR-014: rejects %s without overwriting stored data', (_caseName, raw) => {
    localStorage.setItem(storageKey, raw);

    expect(createLocalRepository().load()).toStrictEqual({
      ok: false,
      code: 'corrupt-data'
    });
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it('FR-014: reports unavailable storage when obtaining storage fails', () => {
    const repository = createExpenseRepository({
      getStorage: () => {
        throw new Error('storage unavailable');
      }
    });

    expect(repository.load()).toStrictEqual({
      ok: false,
      code: 'storage-unavailable'
    });
  });

  it('FR-014: reports unavailable storage when reading fails', () => {
    const repository = createRepository({
      getItem() {
        throw new Error('read failed');
      }
    });

    expect(repository.load()).toStrictEqual({
      ok: false,
      code: 'storage-unavailable'
    });
  });

  it('FR-014: reports a failed write and preserves the previous stored value', () => {
    const previous = storedEnvelope([record]);
    const storage = createStorage(previous, new Error('quota exceeded'));
    const repository = createRepository(storage);
    const result = repository.save([{ ...record, amount: 1500 }]);

    expect(result.ok).toBe(false);
    expect(storage.value).toBe(previous);
  });
});
