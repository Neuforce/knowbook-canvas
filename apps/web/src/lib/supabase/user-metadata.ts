/**
 * Supabase User Metadata Management
 * Handles storing and retrieving Knowbook API keys and other user data
 */

import { createClient } from './server';
import { createSupabaseClient } from './client';
import { User } from '@supabase/supabase-js';

interface KnowbookUserMetadata {
  knowbook_api_key?: string;
  knowbook_user_id?: string;
  knowbook_organization_id?: string;
  api_key_created_at?: string;
  api_key_last_validated?: string;
}

interface UserMetadata extends KnowbookUserMetadata {
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
}

/**
 * Store Knowbook API key in user metadata (server-side)
 */
export async function storeKnowbookApiKey(
  userId: string,
  apiKey: string,
  knowbookUserId?: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const metadata: KnowbookUserMetadata = {
      knowbook_api_key: apiKey,
      knowbook_user_id: knowbookUserId,
      knowbook_organization_id: organizationId,
      api_key_created_at: new Date().toISOString(),
      api_key_last_validated: new Date().toISOString(),
    };

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) {
      console.error('Failed to store Knowbook API key:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error storing Knowbook API key:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get Knowbook API key from user metadata (server-side)
 */
export async function getKnowbookApiKey(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !user) {
      console.error('Failed to get user:', error);
      return null;
    }

    const metadata = user.user_metadata as UserMetadata;
    return metadata.knowbook_api_key || null;
  } catch (error) {
    console.error('Error getting Knowbook API key:', error);
    return null;
  }
}

/**
 * Update API key last validated timestamp
 */
export async function updateApiKeyValidation(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !user) {
      console.error('Failed to get user for validation update:', getUserError);
      return;
    }

    const currentMetadata = user.user_metadata as UserMetadata;
    const updatedMetadata = {
      ...currentMetadata,
      api_key_last_validated: new Date().toISOString(),
    };

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata,
    });

    if (error) {
      console.error('Failed to update API key validation timestamp:', error);
    }
  } catch (error) {
    console.error('Error updating API key validation:', error);
  }
}

/**
 * Client-side utilities for getting user metadata
 */
export class ClientUserMetadata {
  private supabase = createSupabaseClient();

  /**
   * Get current user's Knowbook API key (client-side)
   */
  async getKnowbookApiKey(): Promise<string | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Failed to get current user:', error);
        return null;
      }

      const metadata = user.user_metadata as UserMetadata;
      return metadata.knowbook_api_key || null;
    } catch (error) {
      console.error('Error getting Knowbook API key (client):', error);
      return null;
    }
  }

  /**
   * Get all Knowbook-related metadata for current user
   */
  async getKnowbookMetadata(): Promise<KnowbookUserMetadata | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Failed to get current user:', error);
        return null;
      }

      const metadata = user.user_metadata as UserMetadata;
      
      return {
        knowbook_api_key: metadata.knowbook_api_key,
        knowbook_user_id: metadata.knowbook_user_id,
        knowbook_organization_id: metadata.knowbook_organization_id,
        api_key_created_at: metadata.api_key_created_at,
        api_key_last_validated: metadata.api_key_last_validated,
      };
    } catch (error) {
      console.error('Error getting Knowbook metadata (client):', error);
      return null;
    }
  }

  /**
   * Check if user has a valid Knowbook API key
   */
  async hasValidKnowbookApiKey(): Promise<boolean> {
    const apiKey = await this.getKnowbookApiKey();
    return !!apiKey;
  }

  /**
   * Listen for auth state changes and return user metadata
   */
  onAuthStateChange(callback: (metadata: KnowbookUserMetadata | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const metadata = session.user.user_metadata as UserMetadata;
          callback({
            knowbook_api_key: metadata.knowbook_api_key,
            knowbook_user_id: metadata.knowbook_user_id,
            knowbook_organization_id: metadata.knowbook_organization_id,
            api_key_created_at: metadata.api_key_created_at,
            api_key_last_validated: metadata.api_key_last_validated,
          });
        } else if (event === 'SIGNED_OUT') {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }
}

// Singleton instance for client-side usage
export const clientUserMetadata = new ClientUserMetadata();

// Utility function to check if API key needs refresh
export function shouldRefreshApiKey(metadata: KnowbookUserMetadata): boolean {
  if (!metadata.api_key_last_validated) return true;
  
  const lastValidated = new Date(metadata.api_key_last_validated);
  const now = new Date();
  const hoursSinceValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60);
  
  // Refresh if not validated in the last 24 hours
  return hoursSinceValidation > 24;
}

// Type exports
export type { KnowbookUserMetadata, UserMetadata };
