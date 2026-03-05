export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/*.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};
