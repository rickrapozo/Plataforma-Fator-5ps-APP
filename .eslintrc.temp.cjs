module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: [
    '**/*.d.ts',
    '**/vite-env.d.ts'
  ],
  rules: {
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    'no-unreachable': 'error',
    'no-console': 'warn',
    'no-undef': 'off',
    'no-redeclare': 'error',
    'no-duplicate-imports': 'error'
  }
};