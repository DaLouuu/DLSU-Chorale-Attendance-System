"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"

export default function AttendanceExcusePage() {
  const router = useRouter()
  const { isAdmin, loading } = useUserRole()

  useEffect(() => {
    if (!loading) {
      // Redirect to the appropriate page based on user role
      if (isAdmin) {
        router.push("/manage-paalams")
      } else {
        router.push("/manage-paalams") // All users now go to the unified page
      }
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent"></div>
      </div>
    )
  }

  return null
}
