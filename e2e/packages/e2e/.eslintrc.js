module.exports = {
  root: true,
  extends: ['react-app'],
  parserOptions: {
    ecmaVersion: 2020,
    project: ['tsconfig.json', 'tsconfig.test.json'],
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: '*.{ts,tsx}',
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        'no-console': 'warn',
        '@typescript-eslint/no-throw-literal': 'error',
      },
    },
  ],
};
