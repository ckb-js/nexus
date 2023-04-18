import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 15000,
};

export default config;
