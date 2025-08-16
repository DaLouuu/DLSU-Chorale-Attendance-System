'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateUserData {
  email: string
  password: string
  fullName: string
  userType: 'member' | 'admin'
}

export async function createUserAccount(userData: CreateUserData) {
  const supabase = await createAdminClient()
  
  try {
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: userData.fullName,
      },
    })

    if (authError) {
      console.error("Error creating user in auth:", authError)
      return { error: { message: authError.message, code: authError.code } }
    }

    if (!authData.user) {
      return { error: { message: "Failed to create user", code: "user_creation_failed" } }
    }

    // Then, create the profile record in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Error creating profile record:", profileError)
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: { message: profileError.message, code: profileError.code } }
    }

    revalidatePath('/admin/member-management')
    
    return { 
      data: { 
        user: authData.user, 
        profile: profileData 
      }, 
      error: null 
    }

  } catch (error) {
    console.error("Unexpected error in createUserAccount:", error)
    return { error: { message: "An unexpected error occurred", code: "unexpected_error" } }
  }
}

export async function updateUserAccount(userId: string, updates: Partial<CreateUserData>) {
  const supabase = await createAdminClient()
  
  try {
    // Update profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        user_type: updates.userType,
      })
      .eq('id', userId)
      .select()
      .single()

    if (profileError) {
      console.error("Error updating profile record:", profileError)
      return { error: { message: profileError.message, code: profileError.code } }
    }

    revalidatePath('/admin/member-management')
    
    return { data: profileData, error: null }

  } catch (error) {
    console.error("Unexpected error in updateUserAccount:", error)
    return { error: { message: "An unexpected error occurred", code: "unexpected_error" } }
  }
}

export async function deleteUserAccount(userId: string) {
  const supabase = await createAdminClient()
  
  try {
    // Delete profile record first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error("Error deleting profile record:", profileError)
      return { error: { message: profileError.message, code: profileError.code } }
    }

    revalidatePath('/admin/member-management')
    
    return { data: { success: true }, error: null }

  } catch (error) {
    console.error("Unexpected error in deleteUserAccount:", error)
    return { error: { message: "An unexpected error occurred", code: "unexpected_error" } }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = await createAdminClient()
  
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      console.error("Error resetting password:", error)
      return { error: { message: error.message, code: error.code } }
    }

    return { data: { success: true }, error: null }

  } catch (error) {
    console.error("Unexpected error in resetUserPassword:", error)
    return { error: { message: "An unexpected error occurred", code: "unexpected_error" } }
  }
}
