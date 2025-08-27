/**
 * Knowbook API Client
 * Handles integration with the Knowbook API for organization signup and API key operations
 */

interface KnowbookUser {
  id: string;
  name: string;
  email: string;
  type: string;
  is_active: boolean;
  created_at: string;
  api_key?: string; // Only present during creation
}

interface KnowbookOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  max_users: number;
  max_articles: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrganizationSignupRequest {
  name: string; // Organization name
  domain?: string; // Organization domain
  plan?: string; // Subscription plan (free, pro, enterprise)
  admin_name: string; // Admin user name
  admin_email: string; // Admin user email
  admin_type?: string; // Admin user type (default: "human")
}

interface OrganizationSignupResponse {
  organization: KnowbookOrganization;
  admin_user: KnowbookUser;
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
 * Knowbook API Client for organization signup and API key operations
 */
export class KnowbookApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_KNOWBOOK_API_URL || 'http://localhost:8000/api/v1';
  }

  /**
   * Create a new organization with admin user in Knowbook
   * This is the primary customer onboarding endpoint
   */
  async createOrganizationWithAdmin(signupData: OrganizationSignupRequest): Promise<OrganizationSignupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/organizations/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          domain: signupData.domain,
          plan: signupData.plan || 'free',
          admin_name: signupData.admin_name,
          admin_email: signupData.admin_email,
          admin_type: signupData.admin_type || 'human',
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Failed to create organization',
          status_code: response.status
        }));
        
        throw new KnowbookApiError(
          errorData.error || 'Failed to create organization',
          response.status,
          errorData.detail
        );
      }

      const result: OrganizationSignupResponse = await response.json();
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
   * Validate API key by making a test request
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
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
   * Check if Knowbook API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
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
export async function createKnowbookOrganization(
  organizationName: string,
  adminName: string,
  adminEmail: string,
  domain?: string,
  plan?: string
): Promise<OrganizationSignupResponse> {
  return knowbookApi.createOrganizationWithAdmin({
    name: organizationName,
    admin_name: adminName,
    admin_email: adminEmail,
    domain,
    plan,
  });
}

export async function validateKnowbookApiKey(apiKey: string): Promise<boolean> {
  return knowbookApi.validateApiKey(apiKey);
}

export async function isKnowbookApiAvailable(): Promise<boolean> {
  return knowbookApi.healthCheck();
}

// Type exports
export type { 
  KnowbookUser, 
  KnowbookOrganization,
  OrganizationSignupRequest, 
  OrganizationSignupResponse, 
  ApiError 
};
export { KnowbookApiError };
