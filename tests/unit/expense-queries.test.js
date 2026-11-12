import { describe, expect, it } from 'vitest';
import {
  calculateTotals,
  filterExpenses,
  sortExpenses
} from '../../src/domain/expense-queries.js';

const expenses = [
  {
    id: 'food-november',
    amount: 1250,
    category: 'Food',
    date: '2026-11-10',
    description: 'Lunch',
    createdAt: 1794312000000
  },
  {
    id: 'food-october',
    amount: 400,
    category: 'Food',
    date: '2026-10-31',
    description: '',
    createdAt: 1793966400000
  },
  {
    id: 'transport-november',
    amount: 300,
    category: 'Transport',
    date: '2026-11-11',
    description: '',
    createdAt: 1794398400000
  }
];

describe('expense queries', () => {
  it('FR-006: sorts by date newest first and then by creation time', () => {
    const sameDateEarlier = { ...expenses[0], id: 'same-date-earlier', createdAt: 1 };
    const sameDateLater = { ...expenses[0], id: 'same-date-later', createdAt: 1794312000001 };
    const records = [expenses[0], sameDateEarlier, expenses[1], sameDateLater, expenses[2]];

    expect(sortExpenses(records)).toStrictEqual([
      expenses[2],
      sameDateLater,
      expenses[0],
      sameDateEarlier,
      expenses[1]
    ]);
  });

  it('FR-009: combines Food and November 2026 filters with AND semantics', () => {
    expect(filterExpenses(expenses, { category: 'Food', month: '2026-11' })).toStrictEqual([
      expenses[0]
    ]);
  });

  it('FR-009: clearing category retains the November 2026 filter', () => {
    expect(filterExpenses(expenses, { category: null, month: '2026-11' })).toStrictEqual([
      expenses[0],
      expenses[2]
    ]);
  });

  it('FR-010: calculates listed and per-category whole-rupee totals exactly', () => {
    expect(calculateTotals(expenses)).toStrictEqual({
      listed: 1950n,
      byCategory: {
        Food: 1650n,
        Transport: 300n
      }
    });
  });

  it('FR-010: returns zero for no listed expenses and preserves exact large sums', () => {
    expect(calculateTotals([])).toStrictEqual({
      listed: 0n,
      byCategory: {}
    });
    expect(calculateTotals([
      { ...expenses[0], amount: 9007199254740991 },
      { ...expenses[1], amount: 1 }
    ]).listed).toBe(9007199254740992n);
  });
});
