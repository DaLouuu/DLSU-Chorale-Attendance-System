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

    // Then, create the account record in the accounts table
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert({
        auth_user_id: authData.user.id,
        email: userData.email,
        name: userData.fullName,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (accountError) {
      console.error("Error creating account record:", accountError)
      // If account creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: { message: accountError.message, code: accountError.code } }
    }

    revalidatePath('/admin/member-management')
    
    return { 
      data: { 
        user: authData.user, 
        account: accountData 
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
    // Update account record
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .update({
        name: updates.fullName,
        user_type: updates.userType,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', userId)
      .select()
      .single()

    if (accountError) {
      console.error("Error updating account record:", accountError)
      return { error: { message: accountError.message, code: accountError.code } }
    }

    // Update user metadata if name changed
    if (updates.fullName) {
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            full_name: updates.fullName,
          },
        }
      )

      if (metadataError) {
        console.error("Error updating user metadata:", metadataError)
        return { error: { message: metadataError.message, code: metadataError.code } }
      }
    }

    revalidatePath('/admin/member-management')
    
    return { data: accountData, error: null }

  } catch (error) {
    console.error("Unexpected error in updateUserAccount:", error)
    return { error: { message: "An unexpected error occurred", code: "unexpected_error" } }
  }
}

export async function deleteUserAccount(userId: string) {
  const supabase = await createAdminClient()
  
  try {
    // Delete account record first
    const { error: accountError } = await supabase
      .from('accounts')
      .delete()
      .eq('auth_user_id', userId)

    if (accountError) {
      console.error("Error deleting account record:", accountError)
      return { error: { message: accountError.message, code: accountError.code } }
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      return { error: { message: authError.message, code: authError.code } }
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
