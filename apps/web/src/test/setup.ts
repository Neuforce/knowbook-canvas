/**
 * Test setup file for Vitest
 * Minimal setup for testing Knowbook integration
 */

import { vi, beforeEach } from 'vitest';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_KNOWBOOK_API_URL = 'https://api.test.knowbook.ai/api/v1';

// Mock fetch globally for API tests
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
