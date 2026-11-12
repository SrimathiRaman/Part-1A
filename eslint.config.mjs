// Gate 1 — Syntax & Lint Guard configuration (ESLint flat config)
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'evidence/', 'specs/', '.specify/', '.github/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.browser },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'error',
      'no-unused-vars': 'error',
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }]
    }
  },
  {
    files: ['tests/**/*.js', '.harness/**/*.mjs', '*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser }
    }
  }
];
