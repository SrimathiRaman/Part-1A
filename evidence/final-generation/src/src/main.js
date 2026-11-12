import { createExpenseController } from './application/expense-controller.js';
import { createExpenseRepository } from './storage/expense-repository.js';
import { bindEvents } from './ui/bind-events.js';
import { createRenderer } from './ui/render.js';

const app = document.querySelector('#app');

if (app === null) {
  throw new Error('The Expense Tracker application root is missing.');
}

const renderer = createRenderer(app);
const repository = createExpenseRepository();
const controller = createExpenseController({
  repository,
  render: renderer.render
});

bindEvents({ root: app, controller, form: renderer.form });
controller.initialize();
