module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*Test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 20000,
};
