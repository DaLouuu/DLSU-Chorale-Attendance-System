'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut()
  redirect('/login')
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
    return { error: { message: error.message || "Invalid login credentials. Please try again.", code: error.code } };
  }

  // On successful sign-in, redirect to dashboard
  redirect('/dashboard');
}

export async function signInWithSchoolIdPassword(formData: FormData) {
  const schoolId = formData.get('schoolId') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  // Basic validation
  if (!schoolId || !password) {
    return { error: { message: "School ID and password are required.", code: "validation_error" } };
  }

  try {
    // First, fetch the profile to get the email associated with the school ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, auth_user_id')
      .eq('school_id', schoolId)
      .single();

    if (profileError || !profile) {
      return { error: { message: "School ID not found. Please check your ID or contact support.", code: "profile_not_found" } };
    }

    if (!profile.email) {
      return { error: { message: "No email associated with this school ID. Please contact support.", code: "no_email" } };
    }

    // Now authenticate using the email and password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (authError) {
      console.error("Sign in error:", authError);
      return { error: { message: authError.message || "Invalid password. Please try again.", code: authError.code } };
    }

    // On successful sign-in, redirect to dashboard
    redirect('/dashboard');
  } catch (error) {
    console.error("Unexpected error during school ID authentication:", error);
    return { error: { message: "An unexpected error occurred. Please try again.", code: "unknown_error" } };
  }
} 