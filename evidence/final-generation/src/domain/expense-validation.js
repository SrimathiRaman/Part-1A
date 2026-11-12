export const CATEGORIES = Object.freeze([
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
]);

const AMOUNT_MAX = Number.MAX_SAFE_INTEGER;

export function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

function getLocalToday() {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateAmount(value, errors) {
  const amountText = String(value ?? '').trim();
  const amount = Number(amountText);
  if (!/^[0-9]+$/.test(amountText) || !Number.isSafeInteger(amount) || amount < 1 || amount > AMOUNT_MAX) {
    errors.amount = 'Enter a whole-rupee amount from 1 to 9,007,199,254,740,991.';
    return null;
  }
  return amount;
}

function validateCategory(category, errors) {
  if (typeof category !== 'string' || !CATEGORIES.includes(category)) {
    errors.category = 'Choose a category from the list.';
  }
}

function validateDate(date, today, errors) {
  if (!isValidCalendarDate(date)) {
    errors.date = 'Enter a real date in YYYY-MM-DD format.';
  } else if (typeof today !== 'string' || !isValidCalendarDate(today) || date > today) {
    errors.date = 'Date must be today or earlier.';
  }
}

function validateDescription(value, errors) {
  const description = value === null || value === undefined ? '' : value;
  if (typeof description !== 'string') {
    errors.description = 'Description must be text.';
  } else if (Array.from(description.trim()).length > 250) {
    errors.description = 'Description must be 250 characters or fewer.';
  }
  return typeof description === 'string' ? description.trim() : '';
}

export function validateExpenseInput(input, options = {}) {
  const values = input && typeof input === 'object' ? input : {};
  const today = options.today ?? getLocalToday();
  const errors = {};
  const amount = validateAmount(values.amount, errors);
  validateCategory(values.category, errors);
  validateDate(values.date, today, errors);
  const description = validateDescription(values.description, errors);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      amount,
      category: values.category,
      date: values.date,
      description
    }
  };
}
