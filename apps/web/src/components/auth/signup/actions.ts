"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SignupWithEmailInput } from "./Signup";
import { 
  createKnowbookOrganization, 
  isKnowbookApiAvailable,
  KnowbookApiError 
} from "@/lib/knowbook-api";
import { storeKnowbookApiKey } from "@/lib/supabase/user-metadata";

export async function signup(input: SignupWithEmailInput, baseUrl: string) {
  const supabase = createClient();

  // Step 1: Create Supabase user account
  const data = {
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
      data: {
        full_name: input.fullName || input.email.split('@')[0],
      }
    },
  };

  const { data: authData, error: authError } = await supabase.auth.signUp(data);

  if (authError) {
    console.error('Supabase signup error:', authError);
    redirect("/auth/signup?error=supabase");
  }

  // Step 2: Create Knowbook organization (if API is available)
  if (authData.user) {
    try {
      // Check if Knowbook API is available
      const isApiAvailable = await isKnowbookApiAvailable();
      
      if (isApiAvailable) {
        console.log('Creating Knowbook organization for user:', input.email);
        
        // Generate organization name from user input or email
        const emailDomain = input.email.split('@')[1];
        const organizationName = input.organizationName || 
          (input.fullName ? input.fullName : input.email.split('@')[0]);
        
        // Create organization with admin user
        const knowbookResult = await createKnowbookOrganization(
          organizationName,
          input.fullName || input.email.split('@')[0],
          input.email,
          emailDomain,
          input.plan || 'free'
        );

        // Store Knowbook API key in user metadata
        if (knowbookResult.admin_user.api_key) {
          await storeKnowbookApiKey(
            authData.user.id,
            knowbookResult.admin_user.api_key,
            knowbookResult.admin_user.id,
            knowbookResult.organization.id
          );
          
          console.log('Successfully created Knowbook organization:', knowbookResult.organization.slug);
        }
      } else {
        console.warn('Knowbook API not available during signup - user can connect later');
      }
    } catch (error) {
      // Don't fail the entire signup if Knowbook integration fails
      console.error('Knowbook integration error during signup:', error);
      
      if (error instanceof KnowbookApiError) {
        console.error('Knowbook API error details:', {
          message: error.message,
          statusCode: error.statusCode,
          details: error.details
        });
      }
      
      // Continue with signup - user can connect to Knowbook later
      console.log('Continuing with Supabase-only signup - Knowbook integration can be completed later');
    }
  }

  // Users still need to confirm their email address.
  // This page will show a message to check their email.
  redirect("/auth/signup/success");
}
