module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'test/integration/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/types/**/*'
  ],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test', '<rootDir>/public/js'],
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^./services/(.*)$': '<rootDir>/public/js/services/$1',
    '^../../public/js/services/(.*)$': '<rootDir>/public/js/services/$1',
    '^../../../public/js/services/(.*)$': '<rootDir>/public/js/services/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  coverageReporters: ['text', 'lcov'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
    '^.+\.js$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(socket.io-client)/)'
  ]
};
