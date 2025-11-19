const nextJest = require("next/jest");

/** @type {import('next/jest').NextJestConfig} */
const createJestConfig = nextJest({
  // Path to the Next.js app
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Use jsdom so RTL can pretend there's a browser
  testEnvironment: "jest-environment-jsdom",

  // Load extra matchers like toBeInTheDocument()
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // So imports like "@/components/Button" work in tests
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Tells Jest how to handle TS/TSX files
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

module.exports = createJestConfig(customJestConfig);
