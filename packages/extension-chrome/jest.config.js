/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '@vespaiach/axios-fetch-adapter': '<rootDir>/__mocks__/axiosAdapter.js',
  },
};
