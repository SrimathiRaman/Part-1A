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
  const { category = '', month = '' } = filters;
  return records.filter((record) => (
    (category === '' || record.category === category)
    && (month === '' || record.date.startsWith(month))
  ));
}

export function calculateTotals(records) {
  const byCategory = {};
  let total = 0n;

  for (const record of records) {
    const amount = BigInt(record.amount);
    total += amount;
    byCategory[record.category] = (byCategory[record.category] ?? 0n) + amount;
  }

  return { total, byCategory };
}
