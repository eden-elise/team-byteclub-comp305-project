module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.js'],
    testPathIgnorePatterns: ['sceneLoader.test.js'],
    transform: {},
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/assets/**',
    ],
};