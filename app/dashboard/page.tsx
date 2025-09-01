"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Link from "next/link"
import {
  FileText,
  Music,
  User,
  Calendar,
  Bell,
  ClipboardList,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { useTheme } from "@/components/theme-provider"

// Attendance status types
type UserRole = "member" | "admin" | "unknown"

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [userRole, setUserRole] = useState<UserRole>("unknown")
  const [loadingUserRole, setLoadingUserRole] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoadingUserRole(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("[DashboardPage] User error:", userError)
          setUserRole("unknown")
          router.push("/login?error=user_error_dashboard")
          return
        }
        if (!user) {
          setUserRole("unknown")
          router.push("/login?error=no_user_dashboard")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("[DashboardPage] Error fetching user profile data:", profileError)
          setUserRole("unknown")
          if (profileError.code === 'PGRST116') { // No rows found
            router.push("/auth/setup?from=dashboard_no_profile")
            return
          } else {
            // For other DB errors, maybe don't redirect to setup, could show an error or redirect to login
            console.error("[DashboardPage] Other DB error fetching profile, redirecting to login.")
            router.push("/login?error=db_error_dashboard")
          }
          return
        }

        if (!profileData) {
            // This case should ideally be caught by PGRST116, but as a fallback
            setUserRole("unknown")
            router.push("/auth/setup?from=dashboard_no_profile_fallback")
            return
        }

        setUserRole(profileData.role === "Executive Board" ? "admin" : "member")
        // Potentially set user name here if you want to display it from profileData.full_name
      } catch (error) {
        console.error("[DashboardPage] Outer catch error in fetchUserRole:", error)
        setUserRole("unknown")
        // Redirect to a generic error page or login
        router.push("/login?error=unknown_dashboard_error")
      } finally {
        setLoadingUserRole(false)
      }
    }

    fetchUserRole()
  }, [router, supabase]) // Dependencies are router and supabase instance

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const dayName = format(currentDate, "EEE")
  const monthDay = format(currentDate, "MMM d")

  if (loadingUserRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09331f] dark:border-[#0a4429] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <AuthenticatedHeader currentPage="dashboard" />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Date and Attendance Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center gap-4">
              <div className="text-center flex-shrink-0 w-20">
                <div className="text-3xl font-bold text-[#09331f] dark:text-green-400">{dayName}</div>
                <div className="text-lg text-gray-600 dark:text-gray-300">{monthDay}</div>
              </div>
              <div className="border-l border-gray-200 dark:border-gray-700 pl-4 flex-1 flex flex-col justify-center">
                <div className="font-semibold text-lg text-gray-800 dark:text-white">Today</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back! Here&apos;s what&apos;s happening today.
                </p>
              </div>
            </div>

            {/* Conditional Welcome or Attendance Action Card */}
            {userRole === "member" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Attendance</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Ready to mark your attendance for today&apos;s rehearsal?
                    </p>
                                         <Link href="/manage-paalams" passHref>
                        <Button className="w-full bg-[#09331f] hover:bg-[#0a4429] text-white">
                            Go to Attendance Form
                        </Button>
                     </Link>
                </div>
            )}

            {userRole === "admin" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Admin Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Access admin functionalities and manage attendance records.
                    </p>
                    <Link href="/admin/attendance-overview" passHref>
                         <Button className="w-full bg-[#b28900] hover:bg-[#c59a00] text-white">
                            Go to Admin Overview
                        </Button>
                    </Link>
                </div>
            )}
          </div>

          {/* Right Column: Quick Links and Notifications (simplified) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-[#09331f] dark:text-green-400" />
                Recent Notifications
              </h2>
              <div className="space-y-3">
                {/* Example Notification */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md flex items-start gap-2">
                  <Music className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      New Repertoire Added: &ldquo;Bohemian Rhapsody&rdquo;
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">2 hours ago</p>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Upcoming Event: Annual Concert Rehearsal
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Tomorrow, 6 PM</p>
                  </div>
                </div>
                <Link href="/notifications" className="text-sm text-[#09331f] dark:text-green-400 hover:underline font-medium">
                  View all notifications
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-[#09331f] dark:text-green-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href={userRole === "admin" ? "/admin/excuse-management" : "/attendance/excuse-form"} passHref>
                  <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <FileText className="h-4 w-4 mr-2" />
                    {userRole === "admin" ? "Manage Excuses" : "Submit Excuse Letter"}
                  </Button>
                </Link>
                <Link href="/performances" passHref>
                  <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Music className="h-4 w-4 mr-2" />
                    View Performances
                  </Button>
                </Link>
                <Link href="/profile" passHref>
                   <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                {userRole === "admin" && (
                  <Link href="/admin/member-management" passHref>
                     <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className={`mt-auto ${
        isDarkMode 
          ? 'bg-[#09331f] shadow-lg' 
          : 'bg-white border-t border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
