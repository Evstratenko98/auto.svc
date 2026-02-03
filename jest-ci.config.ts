import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  coverageReporters: ['text', 'cobertura'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 0,
    },
  },
  passWithNoTests: true,
  detectOpenHandles: true,
  testRegex: '.spec.ts$',
  forceExit: true,
  testTimeout: 15000,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!**/*.d.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};

export default config;
