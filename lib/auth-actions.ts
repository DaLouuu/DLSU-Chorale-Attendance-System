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
  
  // Basic validation
  if (!schoolId || !password) {
    return { error: { message: "School ID and password are required.", code: "validation_error" } };
  }

  try {
    const supabase = await createClient();

    // Look up email from the directory table using school_id
    const { data: directoryEntry, error: directoryError } = await supabase
      .from('directory')
      .select('email')
      .eq('school_id', parseInt(schoolId))
      .single();

    if (directoryError) {
      // Check if it's an RLS policy issue
      if (directoryError.message.includes('policy') || directoryError.message.includes('permission')) {
        return { error: { message: "Access denied. This might be due to database permissions. Please contact support.", code: "rls_policy_error" } };
      }
      
      if (directoryError.code === 'PGRST116') {
        return { error: { message: "School ID not found. Please check your ID or contact support.", code: "school_id_not_found" } };
      }
      
      return { error: { message: `Directory lookup error: ${directoryError.message}`, code: "directory_error" } };
    }

    if (!directoryEntry || !directoryEntry.email) {
      return { error: { message: "No email associated with this school ID. Please contact support.", code: "no_email" } };
    }

    // Now authenticate using the email and password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: directoryEntry.email,
      password,
    });

    if (authError) {
      console.error("Authentication error:", authError);
      return { error: { message: authError.message || "Invalid password. Please try again.", code: authError.code } };
    }

    // On successful sign-in, redirect to dashboard
    // Note: redirect() throws a special error that Next.js catches internally
    redirect('/dashboard');
  } catch (error) {
    console.error("Sign in error:", error)
    
    // Handle Next.js redirects specially
    if (error && typeof error === 'object' && 'message' in error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw Next.js redirects
    }
    
    throw new Error("Failed to sign in")
  }
} 