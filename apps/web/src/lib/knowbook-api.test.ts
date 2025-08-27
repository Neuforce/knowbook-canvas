/**
 * Unit tests for Knowbook API client
 * Testing the core integration functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  KnowbookApiClient, 
  createKnowbookOrganization, 
  validateKnowbookApiKey,
  isKnowbookApiAvailable,
  KnowbookApiError 
} from './knowbook-api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('KnowbookApiClient', () => {
  let client: KnowbookApiClient;

  beforeEach(() => {
    client = new KnowbookApiClient('https://api.test.knowbook.ai/api/v1');
    mockFetch.mockClear();
  });

  describe('createOrganizationWithAdmin', () => {
    it('should create organization successfully', async () => {
      const mockResponse = {
        organization: {
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-organization',
          plan: 'free'
        },
        admin_user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          api_key: 'kb_test_key_123'
        },
        message: 'Organization created successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.createOrganizationWithAdmin({
        name: 'Test Organization',
        admin_name: 'Test User',
        admin_email: 'test@example.com',
        plan: 'free'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.knowbook.ai/api/v1/organizations/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Organization')
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Email already exists',
          detail: 'User with this email already registered'
        })
      });

      await expect(
        client.createOrganizationWithAdmin({
          name: 'Test Organization',
          admin_name: 'Test User',
          admin_email: 'existing@example.com'
        })
      ).rejects.toThrow(KnowbookApiError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        client.createOrganizationWithAdmin({
          name: 'Test Organization',
          admin_name: 'Test User',
          admin_email: 'test@example.com'
        })
      ).rejects.toThrow(KnowbookApiError);
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: 'user-123' } })
      });

      const result = await client.validateApiKey('kb_valid_key');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.knowbook.ai/api/v1/me',
        expect.objectContaining({
          method: 'GET',
          headers: { 'X-API-Key': 'kb_valid_key' }
        })
      );

      expect(result).toBe(true);
    });

    it('should return false for invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await client.validateApiKey('kb_invalid_key');
      expect(result).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.validateApiKey('kb_test_key');
      expect(result).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const result = await client.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await client.healthCheck();
      expect(result).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('createKnowbookOrganization', () => {
    it('should create organization with correct parameters', async () => {
      const mockResponse = {
        organization: { id: 'org-123', name: 'Test Org' },
        admin_user: { id: 'user-123', api_key: 'kb_key_123' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await createKnowbookOrganization(
        'Test Organization',
        'John Doe',
        'john@example.com',
        'example.com',
        'pro'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/organizations/signup'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Organization')
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateKnowbookApiKey', () => {
    it('should validate API key', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await validateKnowbookApiKey('kb_test_key');
      expect(result).toBe(true);
    });
  });

  describe('isKnowbookApiAvailable', () => {
    it('should check API availability', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await isKnowbookApiAvailable();
      expect(result).toBe(true);
    });
  });
});

describe('KnowbookApiError', () => {
  it('should create error with correct properties', () => {
    const error = new KnowbookApiError('Test error', 400, 'Test details');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBe('Test details');
    expect(error.name).toBe('KnowbookApiError');
  });
});
