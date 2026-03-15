import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import dotenv from 'dotenv';

// Loads local environment variables for tests that access database settings.
dotenv.config({ path: '.env.development.local' });

// Reuses Next.js Jest presets (transform, TS handling, etc.).
const createJestConfig = nextJest({
  dir: '.',
});

const config: Config = {
  // Tests run in Node environment (API handlers, server-side code).
  testEnvironment: 'node',
  // Allows absolute imports from project root in addition to node_modules.
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Keeps TypeScript alias "@/..." working in Jest.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  // Test file convention used in this project.
  testMatch: ['**/tests/**/*.test.ts']
};

export default createJestConfig(config);
