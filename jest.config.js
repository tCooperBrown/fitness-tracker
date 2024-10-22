/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  globalSetup: "./migrateDatabases.js",
  setupFilesAfterEnv: [
    "<rootDir>/truncateTables.js",
    "<rootDir>/seedUser.js",
    "<rootDir>/disconnectFromDb.js",
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  // If you're using ES6 modules in your project files:
  transformIgnorePatterns: [
    "node_modules/(?!(module-that-needs-to-be-transformed)/)",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/__tests__/setup",
    "<rootDir>/__tests__/goalRoute.test.js",
  ],
};

export default config;
