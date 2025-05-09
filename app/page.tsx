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

// Attendance status types
type AttendanceStatus = "recorded" | "pending-retry" | "pending-down"
type UserRole = "member" | "admin"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("recorded")
  const [userRole, setUserRole] = useState<UserRole>("member")

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

  // Render attendance status box based on current status
  const renderAttendanceStatus = () => {
    switch (attendanceStatus) {
      case "recorded":
        return (
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-3 flex items-center gap-3 flex-1">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-green-800">Attendance recorded at</div>
              <div className="text-green-700 text-lg font-semibold">6:00 PM</div>
            </div>
          </div>
        )
      case "pending-retry":
        return (
          <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-3 flex items-center gap-3 flex-1">
            <div className="bg-amber-100 rounded-full p-2">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-amber-800">Attendance pending</div>
              <div className="text-amber-700 text-sm">
                Retry scanning your ID. If it fails again, log attendance manually.
              </div>
            </div>
          </div>
        )
      case "pending-down":
        return (
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-3 flex items-center gap-3 flex-1">
            <div className="bg-red-100 rounded-full p-2">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="font-medium text-red-800">Attendance pending</div>
              <div className="text-red-700 text-sm">ID Scanner down. Please use Manual Attendance Logging.</div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#09331f] text-white shadow-md">
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
            <SheetContent className="p-0 border-none w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                <div className="p-4 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 px-4">
                  <div className="space-y-1 mb-8">
                    <Link
                      href="/"
                      className="block py-3 font-medium text-[#09331f] border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/attendance"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Attendance
                    </Link>
                    <Link
                      href="/performances"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Performances
                    </Link>
                    <Link
                      href="/events"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Events
                    </Link>
                    <Link
                      href="/notifications"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/members"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Members
                    </Link>
                    <Link
                      href="/resources"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Resources
                    </Link>
                  </div>

                  <div className="space-y-1 mt-auto">
                    <Link
                      href="/profile"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/settings"
                      className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      href="/logout"
                      className="block py-3 font-medium text-red-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Out
                    </Link>
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
              <span className="text-sm text-gray-500">You have administrative privileges</span>
            </div>
          </div>
        )}

        {/* Date and Attendance Status */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center w-full sm:w-auto">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">TODAY</div>
            <div className="text-2xl font-bold">{dayName}</div>
            <div className="text-lg font-medium">{monthDay}</div>
          </div>

          {renderAttendanceStatus()}
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

        {/* Admin Actions Section - Only visible for admin users */}
        {userRole === "admin" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#09331f]" />
              Admin Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Excuse Approval */}
              <Link href="/excuse-approval" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Excuse Approval</h3>
                      <p className="text-sm text-gray-600">Review and approve member attendance excuses</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Attendance Overview */}
              <Link href="/admin/attendance-overview" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Attendance Overview</h3>
                      <p className="text-sm text-gray-600">View and manage member attendance records</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Coming Soon */}
              <div className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-lg p-3 text-gray-400">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Coming Soon</h3>
                      <p className="text-sm text-gray-500">Additional admin features will be available soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manual Attendance Logging */}
            <Link href="/attendance/manual" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                    <Edit3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Manual Attendance Logging</h3>
                    <p className="text-sm text-gray-600">Record your attendance manually with Word of the Day</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Submit Absence/Late Excuse */}
            <Link href="/attendance-form" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Submit Attendance Excuse</h3>
                    <p className="text-sm text-gray-600">Submit an excuse for absence, tardiness, or stepping out</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Sign Up for Performance Requests */}
            <Link href="/performances/requests" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                    <Music className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">PR Sign-Ups</h3>
                    <p className="text-sm text-gray-600">Sign up for upcoming performances</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* My Profile */}
            <Link href="/profile" className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-[#09331f]/30 hover:bg-[#09331f]/5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] group-hover:bg-[#09331f]/20">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">My Profile</h3>
                    <p className="text-sm text-gray-600">View and edit your profile information</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Coming Soon 1 */}
            <div className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 rounded-lg p-3 text-gray-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Coming Soon</h3>
                    <p className="text-sm text-gray-500">New features will be available soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon 2 */}
            <div className="group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 rounded-lg p-3 text-gray-400">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Coming Soon</h3>
                    <p className="text-sm text-gray-500">New features will be available soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Preview */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            <Link href="/events" className="text-sm font-medium text-[#09331f] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex gap-4">
              <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] h-fit">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Weekly Rehearsal</h3>
                <p className="text-sm text-gray-600 mb-2">Regular practice session</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Tomorrow, 5:00 PM</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Br. Andrew Gonzalez Hall</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="bg-[#09331f]/10 rounded-lg p-3 text-[#09331f] h-fit">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Christmas Concert</h3>
                <p className="text-sm text-gray-600 mb-2">Annual holiday performance</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Dec 15, 7:00 PM</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Teresa Yuchengco Auditorium</span>
                </div>
              </div>
            </div>
          </div>
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
