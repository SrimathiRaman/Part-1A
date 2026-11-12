function getFormInput(form) {
  return {
    amount: form.querySelector('#expense-amount').value,
    category: form.querySelector('#expense-category').value,
    date: form.querySelector('#expense-date').value,
    description: form.querySelector('#expense-description').value
  };
}

function focusFirstError(form, errors) {
  const firstField = Object.keys(errors)[0];
  if (firstField) {
    form.querySelector(`#expense-${firstField}`).focus();
  }
}

function handleAction(button, controller, form) {
  const { action, id } = button.dataset;
  if (action === 'edit') {
    const result = controller.beginEdit(id);
    if (result.ok) {
      form.querySelector('#expense-amount').focus();
    }
  } else if (action === 'delete') {
    const confirmed = window.confirm('Delete this expense? This action cannot be undone.');
    controller.remove(id, confirmed);
  } else if (action === 'cancel-edit') {
    controller.cancelEdit();
    form.querySelector('#expense-amount').focus();
  } else if (action === 'clear-category') {
    controller.clearFilter('category');
  } else if (action === 'clear-month') {
    controller.clearFilter('month');
  }
}

export function bindEvents({ root, controller, form }) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = controller.submit(getFormInput(form));
    if (result.ok) {
      form.reset();
    } else if (result.errors) {
      focusFirstError(form, result.errors);
    }
  });

  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (button) {
      handleAction(button, controller, form);
    }
  });

  root.querySelector('#filter-category').addEventListener('change', (event) => {
    controller.setFilter('category', event.currentTarget.value);
  });
  root.querySelector('#filter-month').addEventListener('change', (event) => {
    controller.setFilter('month', event.currentTarget.value);
  });
}
