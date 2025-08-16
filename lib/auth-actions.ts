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