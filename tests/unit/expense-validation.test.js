import { describe, expect, it } from 'vitest';
import { validateExpenseInput } from '../../src/domain/expense-validation.js';

const today = '2026-11-12';

const validInput = (overrides = {}) => ({
  amount: '1250',
  category: 'Food',
  date: '2026-11-10',
  description: 'Lunch',
  ...overrides
});

const expectFieldError = (input, field) => {
  const result = validateExpenseInput(input, { today });

  expect(result.ok).toBe(false);
  expect(Object.keys(result.errors)).toEqual([field]);
  expect(typeof result.errors[field]).toBe('string');
};

describe('expense validation', () => {
  it('FR-002: accepts 1250 whole rupees and normalizes leading zeroes', () => {
    const regular = validateExpenseInput(validInput(), { today });
    const leadingZeroes = validateExpenseInput(validInput({ amount: '0012' }), { today });

    expect(regular).toStrictEqual({
      ok: true,
      value: {
        amount: 1250,
        category: 'Food',
        date: '2026-11-10',
        description: 'Lunch'
      }
    });
    expect(leadingZeroes.value.amount).toBe(12);
  });

  it.each(['', '0', '-1', '1.5', '1,000', '+10'])(
    'FR-002: rejects invalid amount %j',
    (amount) => {
      expectFieldError(validInput({ amount }), 'amount');
    }
  );

  it('FR-002: accepts the maximum safe integer and rejects the next integer', () => {
    const maximum = validateExpenseInput(
      validInput({ amount: '9007199254740991' }),
      { today }
    );

    expect(maximum.ok).toBe(true);
    expect(maximum.value.amount).toBe(9007199254740991);
    expectFieldError(validInput({ amount: '9007199254740992' }), 'amount');
  });

  it('FR-003: accepts the fixed categories with exact labels', () => {
    const categories = [
      'Food',
      'Transport',
      'Housing',
      'Utilities',
      'Healthcare',
      'Shopping',
      'Education',
      'Entertainment',
      'Travel',
      'Other'
    ];

    for (const category of categories) {
      const result = validateExpenseInput(validInput({ category }), { today });
      expect(result.ok).toBe(true);
      expect(result.value.category).toBe(category);
    }
  });

  it.each(['', 'Pets', 'food', ' Food '])(
    'FR-003: rejects category %j',
    (category) => {
      expectFieldError(validInput({ category }), 'category');
    }
  );

  it('FR-004: accepts 2026-11-10 as a real date no later than today', () => {
    const result = validateExpenseInput(validInput(), { today });

    expect(result.ok).toBe(true);
    expect(result.value.date).toBe('2026-11-10');
  });

  it.each(['', '2026-02-30', '2026-11-13'])(
    'FR-004: rejects missing, impossible, or future date %j',
    (date) => {
      expectFieldError(validInput({ date }), 'date');
    }
  );

  it('FR-005: treats omitted and whitespace-only descriptions as empty', () => {
    const omitted = validateExpenseInput(validInput({ description: undefined }), { today });
    const whitespace = validateExpenseInput(validInput({ description: '   ' }), { today });

    expect(omitted.value.description).toBe('');
    expect(whitespace.value.description).toBe('');
  });

  it('FR-005: accepts 250 Unicode code points and rejects 251', () => {
    const character = String.fromCodePoint(0x1f600);
    const accepted = validateExpenseInput(
      validInput({ description: character.repeat(250) }),
      { today }
    );

    expect(Array.from(accepted.value.description).length).toBe(250);
    expectFieldError(validInput({ description: character.repeat(251) }), 'description');
  });

  it('FR-005: preserves markup-like description text as user text', () => {
    const description = '<img src=x onerror=alert(1)>';
    const result = validateExpenseInput(validInput({ description }), { today });

    expect(result.value.description).toBe(description);
  });
});
