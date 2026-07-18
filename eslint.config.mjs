import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'allure-results/',
      'allure-report/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // the TS compiler owns undefined-identifier checks for .ts files
      'no-undef': 'off',
    },
  },
  {
    // k6 scripts run inside the k6 runtime, not Node
    files: ['tests/performance/**/*.js'],
    languageOptions: { sourceType: 'module', globals: { __ENV: 'readonly' } },
  },
];
