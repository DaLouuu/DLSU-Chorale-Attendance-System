"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import {
  Menu,
  Edit3,
  FileText,
  Music,
  User,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  X,
  Shield,
  ClipboardList,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { signOutUser } from "@/lib/auth-actions"

// Attendance status types
type AttendanceStatus = "recorded" | "pending-retry" | "pending-down"
type UserRole = "member" | "admin" | "unknown"

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("recorded")
  const [userRole, setUserRole] = useState<UserRole>("unknown")
  const [loadingUserRole, setLoadingUserRole] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoadingUserRole(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[DashboardPage] Session error:", sessionError)
          setUserRole("unknown")
          router.push("/login?error=session_error_dashboard")
          return
        }
        if (!session) {
          setUserRole("unknown")
          router.push("/login?error=no_session_dashboard")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("auth_user_id", session.user.id)
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

  // Function to cycle through attendance statuses
  const cycleAttendanceStatus = () => {
    if (attendanceStatus === "recorded") {
      setAttendanceStatus("pending-retry")
    } else if (attendanceStatus === "pending-retry") {
      setAttendanceStatus("pending-down")
    } else {
      setAttendanceStatus("recorded")
    }
  }

  // Function to toggle user role
  const toggleUserRole = () => {
    setUserRole(userRole === "member" ? "admin" : userRole === "admin" ? "member" : "unknown")
  }

  // Function to handle sign out
  const handleSignOut = async () => {
    await signOutUser()
  }

  // Render attendance status box based on current status
  const renderAttendanceStatus = () => {
    switch (attendanceStatus) {
      case "recorded":
        return (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800 p-3 flex items-center gap-3 flex-1">
            <div className="bg-green-100 dark:bg-green-800/30 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-medium text-green-800 dark:text-green-300">Attendance recorded at</div>
              <div className="text-green-700 dark:text-green-200 text-lg font-semibold">6:00 PM</div>
            </div>
          </div>
        )
      case "pending-retry":
        return (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 p-3 flex items-center gap-3 flex-1">
            <div className="bg-amber-100 dark:bg-amber-800/30 rounded-full p-2">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="font-medium text-amber-800 dark:text-amber-300">Attendance pending</div>
              <div className="text-amber-700 dark:text-amber-200 text-sm">
                Retry scanning your ID. If it fails again, log attendance manually.
              </div>
            </div>
          </div>
        )
      case "pending-down":
        return (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-3 flex items-center gap-3 flex-1">
            <div className="bg-red-100 dark:bg-red-800/30 rounded-full p-2">
              <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="font-medium text-red-800 dark:text-red-300">Attendance pending</div>
              <div className="text-red-700 dark:text-red-200 text-sm">
                ID Scanner down. Please use Manual Attendance Logging.
              </div>
            </div>
          </div>
        )
    }
  }

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
      <header className="bg-[#09331f] dark:bg-[#09331f] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/images/dlsu-chorale-logo.png"
              alt="DLSU Chorale Logo"
              width={36}
              height={48}
              className="hidden sm:block"
            />
            <h1 className="text-xl font-bold tracking-tight">DLSU CHORALE</h1>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#0a4429]">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 border-none w-[280px] sm:w-[320px] dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-col h-full">
                <div className="p-4 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 px-4">
                  <div className="space-y-1 mb-8">
                    <Link
                      href="/dashboard"
                      className="block py-3 font-medium text-[#09331f] dark:text-white border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={userRole === "admin" ? "/admin/attendance-overview" : "/attendance-overview"}
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Attendance Overview
                    </Link>
                     <Link
                      href={userRole === "admin" ? "/admin/all-events" : "/performances"}
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {userRole === "admin" ? "All Events (Admin)" : "Performances & Events"}
                    </Link>
                    <Link
                      href="/notifications"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    {userRole === "admin" && (
                      <>
                        <Link
                          href="/admin/member-management"
                          className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Member Management
                        </Link>
                        <Link
                          href="/admin/excuse-management"
                          className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Excuse Management
                        </Link>
                        <Link
                          href="/admin/directory-management"
                          className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Directory Management
                        </Link>
                      </>
                    )}
                    <Link
                      href="/resources"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Resources
                    </Link>
                  </div>

                  <div className="space-y-1 mt-auto">
                    <Link
                      href="/profile"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left py-3 font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </nav>
                <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  DLSU Chorale Attendance v1.0
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

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
                <div className="text-sm text-gray-500 dark:text-gray-400">Good day, Chorale member!</div>
              </div>
            </div>

            {/* Conditional Welcome or Attendance Action Card */}
            {userRole === "member" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Attendance</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Ready to mark your attendance for today's rehearsal?
                    </p>
                    <Link href="/attendance-form" passHref>
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
                      New Repertoire Added: "Bohemian Rhapsody"
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
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
