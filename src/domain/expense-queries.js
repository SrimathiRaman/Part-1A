export function sortExpenses(records) {
  return records
    .map((record, index) => ({ record, index }))
    .sort((left, right) => {
      const dateOrder = right.record.date.localeCompare(left.record.date);
      if (dateOrder !== 0) {
        return dateOrder;
      }

      const createdOrder = right.record.createdAt - left.record.createdAt;
      return createdOrder || right.index - left.index;
    })
    .map(({ record }) => record);
}

export function filterExpenses(records, filters = {}) {
  const category = filters.category ?? '';
  const month = filters.month ?? '';
  return records.filter((record) => (
    (category === '' || record.category === category)
    && (month === '' || record.date.startsWith(month))
  ));
}

export function calculateTotals(records) {
  const categoryTotals = new Map();
  let total = 0n;

  for (const record of records) {
    const amount = BigInt(record.amount);
    total += amount;
    categoryTotals.set(record.category, (categoryTotals.get(record.category) ?? 0n) + amount);
  }

  return { listed: total, byCategory: Object.fromEntries(categoryTotals) };
}
