/**
 * KnowbookStatus Component
 * Displays the current Knowbook API connection status and provides management options
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useKnowbookAuth } from '@/hooks/useKnowbookAuth';
import { KnowbookLogo } from '@/components/ui/knowbook-logo';

interface KnowbookStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function KnowbookStatus({ showDetails = true, className }: KnowbookStatusProps) {
  const { 
    apiKey, 
    isLoading, 
    isValidated, 
    metadata, 
    error, 
    validateApiKey, 
    clearError 
  } = useKnowbookAuth();

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader className="h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    }

    if (!apiKey) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Not Connected
        </Badge>
      );
    }

    if (isValidated) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Needs Validation
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (isLoading) return "Checking Knowbook connection...";
    if (error) return error;
    if (!apiKey) return "No Knowbook API key found. Please contact support.";
    if (isValidated) return "Successfully connected to Knowbook";
    return "API key needs validation";
  };

  const handleValidateKey = async () => {
    clearError();
    await validateApiKey();
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <KnowbookLogo variant="light" size={20} showText={false} />
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KnowbookLogo variant="light" size={24} showText={true} />
          Connection Status
        </CardTitle>
        <CardDescription>
          Your connection to the Knowbook knowledge management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        <Alert variant={error ? "destructive" : isValidated ? "default" : "default"}>
          <AlertDescription>{getStatusMessage()}</AlertDescription>
        </Alert>

        {metadata && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {metadata.knowbook_user_id && (
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-muted-foreground font-mono text-xs">
                    {metadata.knowbook_user_id}
                  </p>
                </div>
              )}
              {metadata.knowbook_organization_id && (
                <div>
                  <span className="font-medium">Organization:</span>
                  <p className="text-muted-foreground font-mono text-xs">
                    {metadata.knowbook_organization_id}
                  </p>
                </div>
              )}
            </div>
            
            {metadata.api_key_created_at && (
              <div>
                <span className="font-medium">API Key Created:</span>
                <p className="text-muted-foreground text-xs">
                  {new Date(metadata.api_key_created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {metadata.api_key_last_validated && (
              <div>
                <span className="font-medium">Last Validated:</span>
                <p className="text-muted-foreground text-xs">
                  {new Date(metadata.api_key_last_validated).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {apiKey && !isValidated && (
            <Button 
              onClick={handleValidateKey} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Validate Connection
            </Button>
          )}
          
          {error && (
            <Button 
              onClick={clearError} 
              variant="outline" 
              size="sm"
            >
              Clear Error
            </Button>
          )}
        </div>

        {!apiKey && (
          <Alert>
            <AlertDescription>
              If you&apos;re missing a Knowbook API key, please contact support or try signing up again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for use in headers/navbars
export function KnowbookStatusIndicator({ className }: { className?: string }) {
  return <KnowbookStatus showDetails={false} className={className} />;
}
