/**
 * Vitest Setup File
 *
 * Configures the testing environment
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.AI_PROVIDER = 'gemini';
process.env.AI_MODEL_NAME = 'gemini-2.5-flash';
