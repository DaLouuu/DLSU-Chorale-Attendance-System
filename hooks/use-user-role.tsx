"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "Not Applicable" | "Executive Board" | "Company Manager" | "Associate Company Manager" | "Conductor" | "member" | "unknown"

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>("unknown")
  const [userCommittee, setUserCommittee] = useState<string | null>(null)
  const [userSecheadType, setUserSecheadType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  
  // Define public routes where we don't need to check auth
  const publicRoutes = ['/', '/login', '/about', '/events', '/contact', '/unauthorized']
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith('/auth')

  useEffect(() => {
    // Don't run auth checks on public routes
    if (isPublicRoute) {
      setLoading(false)
      setUserRole("unknown")
      setUserCommittee(null)
      setUserSecheadType(null)
      setError(null)
      return
    }

    const supabase = createClient()
    let isMounted = true

    const fetchUserRole = async () => {
      try {
        if (!isMounted) return
        
        setLoading(true)
        setError(null)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (!isMounted) return

        if (userError) {
          console.error("[useUserRole] User error:", userError)
          setError("User error")
          setUserRole("unknown")
          setLoading(false)
          return
        }

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role, committee, sechead_type")
          .eq("id", user.id)
          .single()

        if (!isMounted) return

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
          setUserCommittee(profileData.committee)
          setUserSecheadType(profileData.sechead_type)
        } else {
          setUserRole("unknown")
          setUserCommittee(null)
          setUserSecheadType(null)
        }
      } catch (error) {
        if (!isMounted) return
        
        console.error("[useUserRole] Unexpected error:", error)
        setError("Unexpected error")
        setUserRole("unknown")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUserRole()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [router, pathname, isPublicRoute])

  const isAdmin = userRole === "Executive Board"
  const isMember = userRole === "member"
  const isAuthenticated = userRole !== "unknown"
  const isHRMember = userCommittee === "Human Resources"
  const hasSecheadType = userSecheadType && userSecheadType !== "Not Applicable"

  return {
    userRole,
    userCommittee,
    userSecheadType,
    isAdmin,
    isMember,
    isAuthenticated,
    isHRMember,
    hasSecheadType,
    loading,
    error
  }
}
