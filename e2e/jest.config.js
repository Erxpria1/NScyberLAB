module.exports = {
  preset: 'detox/runners/jest',
  testEnvironment: 'node',
  testTimeout: 120000,
  testRegex: '\\.e2e\\.js$',
  reporters: [
    'detox/runners/jest/streamlineReporter',
    ['jest-junit', { outputDirectory: 'e2e/reports', outputName: 'junit.xml' }],
  ],
};
