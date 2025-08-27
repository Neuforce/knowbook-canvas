import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createKnowbookOrganization, 
  isKnowbookApiAvailable,
  KnowbookApiError 
} from '@/lib/knowbook-api';
import { storeKnowbookApiKey } from '@/lib/supabase/user-metadata';

export async function POST(request: NextRequest) {
  try {
    // Get current user from Supabase
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has a Knowbook API key
    const existingMetadata = user.user_metadata;
    if (existingMetadata?.knowbook_api_key) {
      return NextResponse.json(
        { 
          error: 'User already has a Knowbook API key',
          hasApiKey: true 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { organizationName, fullName } = body;

    // Validate required fields
    if (!user.email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Check if Knowbook API is available
    const isApiAvailable = await isKnowbookApiAvailable();
    if (!isApiAvailable) {
      return NextResponse.json(
        { error: 'Knowbook API is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Generate organization name if not provided
    const emailDomain = user.email.split('@')[1];
    const orgName = organizationName || 
      (fullName ? `${fullName}'s Workspace` : `${emailDomain} Workspace`);

    // Create Knowbook organization
    const knowbookResult = await createKnowbookOrganization(
      orgName,
      fullName || user.email.split('@')[0],
      user.email,
      emailDomain,
      'free'
    );

    // Store API key in user metadata
    if (knowbookResult.admin_user.api_key) {
      const storeResult = await storeKnowbookApiKey(
        user.id,
        knowbookResult.admin_user.api_key,
        knowbookResult.admin_user.id,
        knowbookResult.organization.id
      );

      if (!storeResult.success) {
        console.error('Failed to store API key:', storeResult.error);
        return NextResponse.json(
          { error: 'Failed to store API key in user profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: knowbookResult.organization.id,
        name: knowbookResult.organization.name,
        slug: knowbookResult.organization.slug,
        plan: knowbookResult.organization.plan,
      },
      user: {
        id: knowbookResult.admin_user.id,
        name: knowbookResult.admin_user.name,
        email: knowbookResult.admin_user.email,
      },
      message: 'Successfully connected to Knowbook!'
    });

  } catch (error) {
    console.error('Knowbook connection error:', error);

    if (error instanceof KnowbookApiError) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          statusCode: error.statusCode 
        },
        { status: error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check connection status
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metadata = user.user_metadata;
    const hasApiKey = !!metadata?.knowbook_api_key;

    return NextResponse.json({
      connected: hasApiKey,
      metadata: hasApiKey ? {
        knowbook_user_id: metadata.knowbook_user_id,
        knowbook_organization_id: metadata.knowbook_organization_id,
        api_key_created_at: metadata.api_key_created_at,
        api_key_last_validated: metadata.api_key_last_validated,
      } : null
    });

  } catch (error) {
    console.error('Connection status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
