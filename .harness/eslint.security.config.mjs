// Gate 2 — Security / SAST Guard configuration.
// Risks that matter for a browser-only localStorage app: DOM XSS, code injection,
// unsafe regular expressions and prototype pollution through object keys.
import globals from 'globals';
import security from 'eslint-plugin-security';
import noUnsanitized from 'eslint-plugin-no-unsanitized';

export default [
  security.configs.recommended,
  noUnsanitized.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.browser },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-restricted-properties': ['error',
        { property: 'insertAdjacentHTML', message: 'Build DOM nodes and use textContent instead.' },
        { object: 'document', property: 'write', message: 'document.write is not allowed.' }
      ],
      'no-restricted-syntax': ['error',
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message: 'Do not assign innerHTML. Use textContent or createElement.'
        },
        {
          selector: "AssignmentExpression[left.property.name='outerHTML']",
          message: 'Do not assign outerHTML. Use textContent or createElement.'
        }
      ]
    }
  }
];
