/**
 * useKnowbookAuth Hook
 * Manages Knowbook API authentication and user metadata
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { 
  clientUserMetadata, 
  type KnowbookUserMetadata,
  shouldRefreshApiKey 
} from '@/lib/supabase/user-metadata';
import { validateKnowbookApiKey } from '@/lib/knowbook-api';

interface KnowbookAuthState {
  apiKey: string | null;
  isLoading: boolean;
  isValidated: boolean;
  metadata: KnowbookUserMetadata | null;
  error: string | null;
}

interface KnowbookAuthActions {
  refreshApiKey: () => Promise<void>;
  validateApiKey: () => Promise<boolean>;
  clearError: () => void;
}

export function useKnowbookAuth(): KnowbookAuthState & KnowbookAuthActions {
  const { user } = useUserContext();
  const [state, setState] = useState<KnowbookAuthState>({
    apiKey: null,
    isLoading: true,
    isValidated: false,
    metadata: null,
    error: null,
  });

  // Load Knowbook metadata when user changes
  const loadKnowbookMetadata = useCallback(async () => {
    if (!user) {
      setState(prev => ({
        ...prev,
        apiKey: null,
        isLoading: false,
        isValidated: false,
        metadata: null,
        error: null,
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const metadata = await clientUserMetadata.getKnowbookMetadata();
      
      if (metadata?.knowbook_api_key) {
        setState(prev => ({
          ...prev,
          apiKey: metadata.knowbook_api_key!,
          metadata,
          isLoading: false,
        }));

        // Validate API key if it needs refresh
        if (shouldRefreshApiKey(metadata)) {
          await validateApiKeyInternal(metadata.knowbook_api_key!);
        } else {
          setState(prev => ({ ...prev, isValidated: true }));
        }
      } else {
        setState(prev => ({
          ...prev,
          apiKey: null,
          metadata,
          isLoading: false,
          error: 'No Knowbook API key found. Please contact support.',
        }));
      }
    } catch (error) {
      console.error('Error loading Knowbook metadata:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load Knowbook data',
      }));
    }
  }, [user]);

  // Validate API key
  const validateApiKeyInternal = useCallback(async (apiKey: string): Promise<boolean> => {
    try {
      const isValid = await validateKnowbookApiKey(apiKey);
      
      setState(prev => ({
        ...prev,
        isValidated: isValid,
        error: isValid ? null : 'Invalid Knowbook API key',
      }));

      return isValid;
    } catch (error) {
      console.error('Error validating API key:', error);
      setState(prev => ({
        ...prev,
        isValidated: false,
        error: 'Failed to validate API key',
      }));
      return false;
    }
  }, []);

  // Public validate function
  const validateApiKey = useCallback(async (): Promise<boolean> => {
    if (!state.apiKey) return false;
    return validateApiKeyInternal(state.apiKey);
  }, [state.apiKey, validateApiKeyInternal]);

  // Refresh API key (placeholder for future implementation)
  const refreshApiKey = useCallback(async (): Promise<void> => {
    // TODO: Implement API key refresh functionality
    // This would involve calling the Knowbook API to regenerate the key
    // and updating the user metadata in Supabase
    console.warn('API key refresh not yet implemented');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load metadata on mount and user change
  useEffect(() => {
    loadKnowbookMetadata();
  }, [loadKnowbookMetadata]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = clientUserMetadata.onAuthStateChange((metadata) => {
      if (metadata?.knowbook_api_key) {
        setState(prev => ({
          ...prev,
          apiKey: metadata.knowbook_api_key!,
          metadata,
          isValidated: !shouldRefreshApiKey(metadata),
        }));
      } else {
        setState(prev => ({
          ...prev,
          apiKey: null,
          metadata: null,
          isValidated: false,
        }));
      }
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    refreshApiKey,
    validateApiKey,
    clearError,
  };
}

// Utility hook for checking if user has Knowbook access
export function useHasKnowbookAccess(): boolean {
  const { apiKey, isValidated } = useKnowbookAuth();
  return !!(apiKey && isValidated);
}

// Utility hook for getting validated API key
export function useKnowbookApiKey(): string | null {
  const { apiKey, isValidated } = useKnowbookAuth();
  return isValidated ? apiKey : null;
}
