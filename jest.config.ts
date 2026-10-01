import nextJest from 'next/jest.js';

import type { Config } from 'jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  // jest-fixed-jsdom restores Node's fetch/Request/Response globals that plain jsdom hides.
  // MSW needs them to intercept requests made by RTK Query.
  testEnvironment: 'jest-fixed-jsdom',
  setupFiles: ['<rootDir>/tests/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^server-only$': '<rootDir>/tests/mocks/empty.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/template.tsx',
  ],
};

/**
 * MSW 3 and several of its dependencies ship only ES modules. next/jest skips
 * transforming node_modules, so we let its SWC transform compile these packages.
 */
const ESM_PACKAGES = [
  'msw',
  '@msw',
  '@mswjs',
  '@open-draft',
  'cookie',
  'headers-polyfill',
  'rettime',
  'set-cookie-parser',
  'tough-cookie',
  'until-async',
];

const jestConfig = async (): Promise<Config> => {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(${ESM_PACKAGES.join('|')})/)`,
      '^.+\.module\.(css|sass|scss)$',
    ],
  };
};

export default jestConfig;
