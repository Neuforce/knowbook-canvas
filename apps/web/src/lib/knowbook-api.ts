/**
 * Knowbook API Client
 * Handles integration with the Knowbook API for user management and API key operations
 */

interface KnowbookUser {
  id: string;
  email: string;
  api_key: string;
  organization_id: string;
  is_active: boolean;
  created_at: string;
}

interface CreateUserRequest {
  email: string;
  password?: string;
  full_name?: string;
}

interface CreateUserResponse {
  user: KnowbookUser;
  api_key: string;
  message: string;
}

interface ApiError {
  error: string;
  detail?: string;
  status_code: number;
}

class KnowbookApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'KnowbookApiError';
  }
}

/**
 * Knowbook API Client for user management and API key operations
 */
export class KnowbookApiClient {
  private baseUrl: string;
  private adminApiKey: string;

  constructor(baseUrl?: string, adminApiKey?: string) {
    this.baseUrl = baseUrl || process.env.KNOWBOOK_API_URL || 'http://localhost:8000/api/v1';
    this.adminApiKey = adminApiKey || process.env.KNOWBOOK_ADMIN_API_KEY || '';
    
    if (!this.adminApiKey) {
      console.warn('KNOWBOOK_ADMIN_API_KEY not configured - Knowbook API integration will not work');
    }
  }

  /**
   * Create a new user account in Knowbook
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.adminApiKey,
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || this.generateTemporaryPassword(),
          full_name: userData.full_name || userData.email.split('@')[0],
          is_active: true,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new KnowbookApiError(
          errorData.error || 'Failed to create user',
          response.status,
          errorData.detail
        );
      }

      const result: CreateUserResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof KnowbookApiError) {
        throw error;
      }
      
      console.error('Knowbook API error:', error);
      throw new KnowbookApiError(
        'Network error connecting to Knowbook API',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get user information by email
   */
  async getUserByEmail(email: string): Promise<KnowbookUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/by-email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.adminApiKey,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new KnowbookApiError(
          errorData.error || 'Failed to get user',
          response.status,
          errorData.detail
        );
      }

      const user: KnowbookUser = await response.json();
      return user;
    } catch (error) {
      if (error instanceof KnowbookApiError) {
        throw error;
      }
      
      console.error('Knowbook API error:', error);
      return null;
    }
  }

  /**
   * Regenerate API key for a user
   */
  async regenerateApiKey(userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/regenerate-api-key`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.adminApiKey,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new KnowbookApiError(
          errorData.error || 'Failed to regenerate API key',
          response.status,
          errorData.detail
        );
      }

      const result = await response.json();
      return result.api_key;
    } catch (error) {
      if (error instanceof KnowbookApiError) {
        throw error;
      }
      
      console.error('Knowbook API error:', error);
      throw new KnowbookApiError(
        'Network error connecting to Knowbook API',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    }
  }

  /**
   * Generate a temporary password for users who sign up via Supabase
   * In production, consider using a more sophisticated approach
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Check if Knowbook API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      return response.ok;
    } catch (error) {
      console.error('Knowbook API health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const knowbookApi = new KnowbookApiClient();

// Utility functions for easier usage
export async function createKnowbookUser(email: string, fullName?: string): Promise<CreateUserResponse> {
  return knowbookApi.createUser({ email, full_name: fullName });
}

export async function getKnowbookUserByEmail(email: string): Promise<KnowbookUser | null> {
  return knowbookApi.getUserByEmail(email);
}

export async function validateKnowbookApiKey(apiKey: string): Promise<boolean> {
  return knowbookApi.validateApiKey(apiKey);
}

// Type exports
export type { KnowbookUser, CreateUserRequest, CreateUserResponse, ApiError };
export { KnowbookApiError };
