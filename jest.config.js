/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: ['<rootDir>/packages/*'],
  coveragePathIgnorePatterns: ['lib'],
  collectCoverageFrom: [
    'src/**/*.ts',
    // skip UI test
    '!src/pages/**/*',
    // skip type definition
    '!**/*.d.ts',
  ],
};
