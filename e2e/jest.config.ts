import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!(env-paths|nanoid)/)'],
  testTimeout: 15000,
};

export default config;
