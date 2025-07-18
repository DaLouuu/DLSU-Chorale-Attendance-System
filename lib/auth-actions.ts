'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signUpWithEmailPassword(formData: FormData) {
  // Ensure NEXT_PUBLIC_SITE_URL is set in your environment variables
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error('NEXT_PUBLIC_SITE_URL is not set. Cannot determine emailRedirectTo path.');
    return { error: { message: "Server configuration error: Site URL not set.", code: "config_error" } };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string; // This will come from the form data
  const supabase = await createClient();

  // Validate inputs (basic example, add more robust validation as needed)
  if (!email || !password || password.length < 6 || !fullName) {
    return { error: { message: "Invalid input. Please check your details.", code: "validation_error" } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    return { error: { message: error.message, code: error.code } };
  }

  // data.user?.identities?.length === 0 means the user already exists but is not confirmed (e.g., email change request for an existing but unconfirmed email)
  // data.user !== null && data.user.identities && data.user.identities.length > 0 means a new user was created and needs confirmation.
  // For a brand new sign-up, a confirmation email is sent.
  // If the user already exists and is confirmed, Supabase returns an error (handled above).
  // If the user exists but is not confirmed, Supabase resends the confirmation email.

  // The generic message covers both new unconfirmed users and existing unconfirmed users.
  return { data, error: null, message: "Registration process initiated. Please check your email to verify your account." };
}

export async function signInWithEmailPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  // Basic validation
  if (!email || !password) {
    return { error: { message: "Email and password are required.", code: "validation_error" } };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    // Specific error messages can be tailored based on error.code if needed
    return { error: { message: error.message || "Invalid login credentials. Please try again.", code: error.code } };
  }

  // On successful sign-in, Supabase automatically handles setting the session cookie.
  // We can then redirect the user to the dashboard or a protected page.
  // The middleware should pick up the new session.
  // Note: redirect() must be called outside of a try/catch block if it's the final action.
  // However, since we want to return an error object on failure, we handle the redirect explicitly after checking the error.
  
  // No explicit return needed here if redirecting, but to be consistent with signUp regarding return structure:
  // return { error: null, message: "Sign in successful. Redirecting..." }; 
  // The redirect itself will handle navigation.
  redirect('/dashboard'); // Or your desired protected route
} 