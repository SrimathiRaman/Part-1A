# JavaScript Style Guide (feedforward)

1. Use ES modules (`import` / `export`). No CommonJS, no bundler, no framework.
2. No runtime dependencies. Development dependencies are limited to the lint, security and test tools in package.json.
3. Use `const` by default and `let` only when reassignment is required. Never `var`.
4. Use `===` and `!==` only.
5. Keep functions at 40 lines or fewer and cyclomatic complexity at 10 or lower.
6. `src/js/expense.js` and `src/js/summary.js` are pure: no `document`, `window` or `localStorage`.
7. `src/js/storage.js` is the only module that touches `localStorage`.
8. `src/js/app.js` wires the DOM and contains no business rules.
9. Money is an integer number of paise. Convert to rupees only when displaying.
10. Render user-entered text with `textContent`. Never use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` or `new Function`.
11. No `console.*` calls in `src/`. No inline event handlers in HTML.
12. Do not hard-code secrets, keys or machine-specific paths.
13. Validation functions return a result object; they do not throw for invalid user input.
