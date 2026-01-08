import { type Config } from 'jest';

const config: Config = {
  verbose: false,
  transform: {
    '^.+\\.(js|ts)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  forceExit: true,
  detectOpenHandles: true,
};

module.exports = config;
