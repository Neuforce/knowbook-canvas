"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SignupWithEmailInput } from "./Signup";
import { createKnowbookUser, KnowbookApiError } from "@/lib/knowbook-api";
import { storeKnowbookApiKey } from "@/lib/supabase/user-metadata";

export async function signup(input: SignupWithEmailInput, baseUrl: string) {
  const supabase = createClient();

  // Step 1: Create user in Supabase
  const data = {
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
      data: {
        full_name: input.email.split('@')[0], // Use email prefix as default name
      },
    },
  };

  const { data: authData, error: authError } = await supabase.auth.signUp(data);

  if (authError) {
    console.error('Supabase signup error:', authError);
    redirect("/auth/signup?error=supabase_error");
  }

  // Step 2: Create user in Knowbook API (if Supabase signup successful)
  if (authData.user) {
    try {
      const knowbookResponse = await createKnowbookUser(
        input.email,
        input.email.split('@')[0]
      );

      // Step 3: Store Knowbook API key in Supabase user metadata
      const storeResult = await storeKnowbookApiKey(
        authData.user.id,
        knowbookResponse.api_key,
        knowbookResponse.user.id,
        knowbookResponse.user.organization_id
      );

      if (!storeResult.success) {
        console.error('Failed to store Knowbook API key:', storeResult.error);
        // Don't fail the signup, but log the issue
      }

      console.log('Successfully created Knowbook user and stored API key');
    } catch (error) {
      if (error instanceof KnowbookApiError) {
        console.error('Knowbook API error during signup:', error.message, error.details);
        
        // If Knowbook API fails, we still allow the Supabase signup to proceed
        // The user can manually connect their Knowbook account later
        console.warn('Proceeding with Supabase-only signup due to Knowbook API error');
      } else {
        console.error('Unexpected error during Knowbook user creation:', error);
      }
    }
  }

  // Users still need to confirm their email address.
  // This page will show a message to check their email.
  redirect("/auth/signup/success");
}
