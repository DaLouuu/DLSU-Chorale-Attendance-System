"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export type UserRole = "Executive Board" | "member" | "unknown"

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>("unknown")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[useUserRole] Session error:", sessionError)
          setError("Session error")
          setUserRole("unknown")
          setLoading(false)
          return
        }

        if (!session) {
          console.error("[useUserRole] No session")
          setError("No session")
          setUserRole("unknown")
          setLoading(false)
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("[useUserRole] Error fetching profile:", profileError)
          if (profileError.code === 'PGRST116') {
            // No profile found, redirect to setup
            router.push("/auth/setup?from=useUserRole_no_profile")
            return
          } else {
            setError("Failed to fetch profile")
            setUserRole("unknown")
          }
        } else if (profileData) {
          setUserRole(profileData.role as UserRole)
        } else {
          setUserRole("unknown")
        }
      } catch (error) {
        console.error("[useUserRole] Unexpected error:", error)
        setError("Unexpected error")
        setUserRole("unknown")
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [supabase, router])

  const isAdmin = userRole === "Executive Board"
  const isMember = userRole === "member"
  const isAuthenticated = userRole !== "unknown"

  return {
    userRole,
    isAdmin,
    isMember,
    isAuthenticated,
    loading,
    error
  }
}
