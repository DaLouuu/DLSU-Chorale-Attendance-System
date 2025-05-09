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
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Attendance status types
type AttendanceStatus = "recorded" | "pending-retry" | "pending-down"
type UserRole = "member" | "admin"

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("recorded")
  const [userRole, setUserRole] = useState<UserRole>("member")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check user verification status
  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Get user data from Users table
        const { data: userData, error } = await supabase
          .from("Users")
          .select("verification, is_admin")
          .eq("id", session.user.id)
          .single()

        if (error || !userData) {
          console.error("Error fetching user data:", error)
          router.push("/pending-verification")
          return
        }

        // Check verification status
        if (!userData.verification) {
          router.push("/pending-verification")
          return
        }

        // Set user role based on admin status
        setUserRole(userData.is_admin ? "admin" : "member")
        setLoading(false)
      } catch (error) {
        console.error("Error checking verification:", error)
        setLoading(false)
      }
    }

    checkUserVerification()
  }, [router])

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
    setUserRole(userRole === "member" ? "admin" : "member")
  }

  // Function to handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09331f] dark:border-[#0a4429] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
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
                      href="/attendance"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Attendance
                    </Link>
                    <Link
                      href="/performances"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Performances
                    </Link>
                    <Link
                      href="/events"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Events
                    </Link>
                    <Link
                      href="/notifications"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/members"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Members
                    </Link>
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
                      My Account
                    </Link>
                    <Link
                      href="/settings"
                      className="block py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleSignOut()
                      }}
                      className="block w-full text-left py-3 font-medium text-red-600 dark:text-red-400"
                    >
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Admin Indicator */}
        {userRole === "admin" && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#09331f] text-white px-3 py-1">Admin Dashboard</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">You have administrative privileges</span>
            </div>
          </div>
        )}

        {/* Date and Attendance Status */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Mobile date display (3-line format like desktop) */}
          <div className="flex sm:hidden w-full gap-3 items-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 text-center w-[80px] h-[80px] flex flex-col justify-center flex-shrink-0">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">TODAY</div>
              <div className="text-xl font-bold dark:text-white">{dayName}</div>
              <div className="text-sm font-medium dark:text-gray-300">{monthDay}</div>
            </div>
            <div className="flex-1">{renderAttendanceStatus()}</div>
          </div>

          {/* Desktop date display (original 3-line format) */}
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center w-full sm:w-auto">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              TODAY
            </div>
            <div className="text-2xl font-bold dark:text-white">{dayName}</div>
            <div className="text-lg font-medium dark:text-gray-300">{monthDay}</div>
          </div>

          {/* Desktop attendance status */}
          <div className="hidden sm:block flex-1">{renderAttendanceStatus()}</div>
        </div>

        {/* Admin Actions Section - Only visible for admin users */}
        {userRole === "admin" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#09331f] dark:text-[#0a4429]" />
              Admin Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Excuse Approval */}
              <Link href="/admin/excuse-approval" className="group">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Excuse Approval</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Review and approve member attendance excuses
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Attendance Overview */}
              <Link href="/admin/attendance-overview" className="group">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Attendance Overview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        View and manage member attendance records
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Coming Soon */}
              <div className="group">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-400 dark:text-gray-500">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Coming Soon</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Additional admin features will be available soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manual Attendance Logging */}
            <Link href="/attendance/manual" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                    <Edit3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Manual Attendance Logging</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Record your attendance manually with Word of the Day
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Submit Absence/Late Excuse */}
            <Link href="/attendance-form" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Submit Attendance Excuse</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Submit an excuse for absence, tardiness, or stepping out
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Sign Up for Performance Requests */}
            <Link href="/performances/requests" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                    <Music className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">PR Sign-Ups</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Sign up for upcoming performances</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* My Profile */}
            <Link href="/profile" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5 dark:hover:bg-[#09331f]/10">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] group-hover:bg-[#09331f]/20 dark:group-hover:bg-[#09331f]/30">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">My Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">View and edit your profile information</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Coming Soon 1 */}
            <div className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-400 dark:text-gray-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Coming Soon</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">New features will be available soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon 2 */}
            <div className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-400 dark:text-gray-500">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Coming Soon</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">New features will be available soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Preview */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upcoming Events</h2>
            <Link href="/events" className="text-sm font-medium text-[#09331f] dark:text-[#0a4429] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="flex gap-4">
              <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] h-fit">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Rehearsal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Regular practice session</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    Tomorrow, 5:00 PM
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    Br. Andrew Gonzalez Hall
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-4">
              <div className="bg-[#09331f]/10 dark:bg-[#09331f]/20 rounded-lg p-3 text-[#09331f] dark:text-[#0a4429] h-fit">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Christmas Concert</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Annual holiday performance</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    Dec 15, 7:00 PM
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    Teresa Yuchengco Auditorium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button onClick={cycleAttendanceStatus} variant="outline" className="text-sm">
            Toggle Attendance Status (Demo)
          </Button>
          <Button onClick={toggleUserRole} variant="outline" className="text-sm">
            Toggle User Role (Demo): {userRole === "admin" ? "Admin" : "Member"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B1B1B] py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-white text-sm">
          &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
