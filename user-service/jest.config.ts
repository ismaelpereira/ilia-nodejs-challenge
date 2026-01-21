import type { Config } from 'jest';

const config: Config = {
  watchman: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  clearMocks: true,
  silent: false,
  maxWorkers: '50%',
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker)',
    '<rootDir>/src/generated/',
  ],
  moduleNameMapper: {
    '^@prisma/user-client$': '<rootDir>/node_modules/@prisma/user-client',
    '^@prisma/wallet-client$': '<rootDir>/node_modules/@prisma/wallet-client',
    
    '^src/(.*)$': '<rootDir>/src/$1', 
  },
};

export default config;
