module.exports = {
  extends: ['react-app'],
  parserOptions: {
    ecmaVersion: 2020,
    project: ['tsconfig.json'],
    sourceType: 'module',
  },
  overrides: [
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
  ],
};
