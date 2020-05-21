const NO_COVERAGE = process.env.NO_COVERAGE === '1';
const CLEAR_CONSOLE = process.env.CLEAR_CONSOLE === '1';

const notice = () => console.log('Using Jest config from `jest.config.js`');

if (CLEAR_CONSOLE) {
  require('clear')();
  console.log();
  notice();
  console.log('Clearing console due to CLEAR_CONSOLE=1');
} else {
  notice();
}

if (NO_COVERAGE) {
  console.log('Coverage not collected due to NO_COVERAGE=1');
}

console.log('Type checking is disabled during Jest for performance reasons, use `jest typecheck` when necessary.');

module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>'],
  cache: true,
  verbose: true,
  cacheDirectory: '<rootDir>/tmp/jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  // preset configs
  // preset: 'ts-jest/presets/js-with-ts',
  // which files to test and which to ignore
  testMatch: ['**/__tests__/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/tmp/', '/coverage/', '/stories/', '/\\.storybook/'],
  // don't watch for file changes in node_modules
  watchPathIgnorePatterns: ['/node_modules/'],
  // jest automock settings
  automock: false,
  unmockedModulePathPatterns: ['/node_modules/'],
  // test environment setup
  // setupFiles: [`${__dirname}/setup/setup.js`],
  // setupFilesAfterEnv: [`${__dirname}/setup/setupAfterEnv.ts`],
  // coverage settings
  collectCoverage: NO_COVERAGE === false,
  collectCoverageFrom: NO_COVERAGE ? [] : ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '\\.json$', '/__tests__/', '/stories/', '/\\.storybook/'],

  globals: {
    'ts-jest': {
      tsConfig: `${__dirname}/tsconfig.json`,

      // https://huafu.github.io/ts-jest/user/config/diagnostics
      diagnostics: false,

      // Makes jest test run much faster, BUT, without type checking.
      // Type checking in CI is done with `tsc --noEmit` or `yarn typecheck` command.
      // https://huafu.github.io/ts-jest/user/config/isolatedModules
      isolatedModules: true,
    },
  },

  transformIgnorePatterns: ['/node_modules/(?!(lodash-es|antd|[^/]+/es|rc-animate|rc-util)/).*'],
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
    '/node_modules/((lodash-es|[^/]+/es)|rc-animate|rc-util)/.*': 'ts-jest',
  },
};
