"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import { Home, ClipboardCheck, FileText, User, Settings, ChevronDown } from "lucide-react"
import { signOutUser } from "@/lib/auth-actions"
import { useUserRole } from "@/hooks/use-user-role"

export function AuthenticatedHeader({ 
  currentPage = "dashboard"
}: { 
  currentPage?: string
}) {
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [expandedAttendance, setExpandedAttendance] = useState(false)
  const [expandedExcuses, setExpandedExcuses] = useState(false)
  const { isAdmin, loading } = useUserRole()
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleSignOut = async () => {
    await signOutUser()
  }

  // Don't render navigation until we know the user's role
  if (loading) {
    return (
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#09331f] shadow-lg' 
          : 'bg-white/80 backdrop-blur-md shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Text Image Group */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10">
                <Image
                  src={isDarkMode ? "/images/dlsu-chorale-logo-dm.png" : "/images/dlsu-chorale-logo.png"}
                  alt="DLSU Chorale Logo"
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <div className="relative w-32 h-8">
                <Image
                  src={isDarkMode ? "/images/DLSU-chorale-text-white.png" : "/images/DLSU-chorale-text-green.png"}
                  alt="DLSU Chorale"
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>

            {/* Loading state */}
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded"></div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-[#09331f] shadow-lg' 
        : 'bg-white/80 backdrop-blur-md shadow-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Text Image Group */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10">
              <Image
                src={isDarkMode ? "/images/dlsu-chorale-logo-dm.png" : "/images/dlsu-chorale-logo.png"}
                alt="DLSU Chorale Logo"
                fill
                className="object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <div className="relative w-32 h-8">
              <Image
                src={isDarkMode ? "/images/DLSU-chorale-text-white.png" : "/images/DLSU-chorale-text-green.png"}
                alt="DLSU Chorale"
                fill
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden xl:flex items-center space-x-6">
                          <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  className={`relative transition-all duration-200 ${
                    currentPage === "dashboard"
                      ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                        : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    currentPage === "dashboard" 
                      ? 'w-full bg-[#136c37] dark:bg-white' 
                      : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                  }`}></div>
                </Button>
              </Link>

            {/* Desktop Attendance Menu */}
            {isAdmin ? (
              <div 
                className="relative"
                onMouseEnter={() => setHoveredDropdown('attendance')}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Button
                  variant="ghost"
                  className={`relative transition-all duration-200 ${
                    currentPage === "attendance"
                      ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                        : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                  } ${hoveredDropdown === 'attendance' ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' : ''}`}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Attendance
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    currentPage === "attendance" 
                      ? 'w-full bg-[#136c37] dark:bg-white' 
                      : hoveredDropdown === 'attendance' 
                        ? 'w-full bg-[#136c37] dark:bg-white'
                        : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                  }`}></div>
                </Button>
                
                {/* Hover Dropdown */}
                {hoveredDropdown === 'attendance' && (
                  <div 
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-48 rounded-md shadow-lg z-50 ${
                      isDarkMode 
                        ? 'bg-[#09331f]' 
                        : 'bg-white'
                    }`}
                    onMouseEnter={() => setHoveredDropdown('attendance')}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    <div className="py-1">
                      <Link href="/admin/attendance-overview">
                        <div className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-white hover:bg-[#0a4429]' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                          <ClipboardCheck className="h-4 w-4" />
                          View Group Attendance
                        </div>
                      </Link>
                      <Link href="/attendance-overview">
                        <div className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-white hover:bg-[#0a4429]' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                          <ClipboardCheck className="h-4 w-4" />
                          View Individual Attendance
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/attendance-overview">
                <Button 
                  variant="ghost"
                  className={`relative transition-all duration-200 ${
                    currentPage === "attendance"
                      ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                        : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                  }`}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Attendance
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    currentPage === "attendance" 
                      ? 'w-full bg-[#136c37] dark:bg-white' 
                      : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                  }`}></div>
                </Button>
              </Link>
            )}

            {/* Desktop Excuse Menu */}
            {isAdmin ? (
              <div 
                className="relative"
                onMouseEnter={() => setHoveredDropdown('excuses')}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Button
                  variant="ghost"
                  className={`relative transition-all duration-200 ${
                    currentPage === "excuse-form"
                      ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                        : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                  } ${hoveredDropdown === 'excuses' ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' : ''}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Excuses
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    currentPage === "excuse-form" 
                      ? 'w-full bg-[#136c37] dark:bg-white' 
                      : hoveredDropdown === 'excuses' 
                        ? 'w-full bg-[#136c37] dark:bg-white'
                        : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                  }`}></div>
                </Button>
                
                {/* Hover Dropdown */}
                {hoveredDropdown === 'excuses' && (
                  <div 
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-48 rounded-md shadow-lg z-50 ${
                      isDarkMode 
                        ? 'bg-[#09331f]' 
                        : 'bg-white'
                    }`}
                    onMouseEnter={() => setHoveredDropdown('excuses')}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    <div className="py-1">
                      <Link href="/attendance-form">
                        <div className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-white hover:bg-[#0a4429]' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                          <FileText className="h-4 w-4" />
                          Submit a Paalam
                        </div>
                      </Link>
                      <Link href="/admin/excuse-approval">
                        <div className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-white hover:bg-[#0a4429]' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                          <FileText className="h-4 w-4" />
                          Approve Paalams
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/attendance-form">
                <Button 
                  variant="ghost"
                  className={`relative transition-all duration-200 ${
                    currentPage === "excuse-form"
                      ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                        : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Excuse Form
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    currentPage === "excuse-form" 
                      ? 'w-full bg-[#136c37] dark:bg-white' 
                      : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                  }`}></div>
                </Button>
              </Link>
            )}

            <Link href="/profile">
              <Button 
                variant="ghost"
                className={`relative transition-all duration-200 ${
                  currentPage === "profile"
                    ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                      : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                  currentPage === "profile" 
                    ? 'w-full bg-[#136c37] dark:bg-white' 
                    : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                }`}></div>
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant="ghost"
                className={`relative transition-all duration-200 ${
                  currentPage === "settings"
                    ? 'text-[#136c37] dark:text-white hover:text-[#136c37] dark:hover:text-white hover:bg-transparent' 
                    : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-transparent group' 
                      : 'text-gray-700 hover:text-[#136c37] hover:bg-transparent group'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                  currentPage === "settings" 
                    ? 'w-full bg-[#136c37] dark:bg-white' 
                    : 'w-0 group-hover:w-full bg-[#136c37] dark:group-hover:bg-white'
                }`}></div>
              </Button>
            </Link>
            <Button 
              onClick={handleSignOut}
              className={`font-medium px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-red-800 hover:bg-red-700 text-red-100 hover:text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Log Out
            </Button>
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="xl:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button 
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    currentPage === "dashboard"
                      ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              {/* Mobile Attendance Menu */}
              {isAdmin ? (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-200 ${
                      currentPage === "attendance"
                        ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setExpandedAttendance(!expandedAttendance)}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Attendance
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                      expandedAttendance ? 'rotate-180' : ''
                    }`} />
                  </Button>
                  
                  {expandedAttendance && (
                    <div className="ml-6 space-y-1">
                      <Link href="/admin/attendance-overview">
                        <Button 
                          variant="ghost"
                          className={`w-full justify-start transition-all duration-200 ${
                            currentPage === "attendance" && window.location.pathname === "/admin/attendance-overview"
                              ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                              : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          View Group Attendance
                        </Button>
                      </Link>
                      <Link href="/attendance-overview">
                        <Button 
                          variant="ghost"
                          className={`w-full justify-start transition-all duration-200 ${
                            currentPage === "attendance" && window.location.pathname === "/attendance-overview"
                              ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                              : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          View Individual Attendance
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/attendance-overview">
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-200 ${
                      currentPage === "attendance"
                        ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Attendance
                  </Button>
                </Link>
              )}

              {/* Mobile Excuse Menu */}
              {isAdmin ? (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-200 ${
                      currentPage === "excuse-form"
                        ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setExpandedExcuses(!expandedExcuses)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Excuses
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                      expandedExcuses ? 'rotate-180' : ''
                    }`} />
                  </Button>
                  
                  {expandedExcuses && (
                    <div className="ml-6 space-y-1">
                      <Link href="/attendance-form">
                        <Button 
                          variant="ghost"
                          className={`w-full justify-start transition-all duration-200 ${
                            currentPage === "excuse-form" && window.location.pathname === "/attendance-form"
                              ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                              : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Submit a Paalam
                        </Button>
                      </Link>
                      <Link href="/admin/excuse-approval">
                        <Button 
                          variant="ghost"
                          className={`w-full justify-start transition-all duration-200 ${
                            currentPage === "excuse-form" && window.location.pathname === "/admin/excuse-approval"
                              ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                              : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Approve Paalams
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/attendance-form">
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start transition-all duration-200 ${
                      currentPage === "excuse-form"
                        ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Excuse Form
                  </Button>
                </Link>
              )}

              <Link href="/profile">
                <Button 
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    currentPage === "profile"
                      ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    currentPage === "settings"
                      ? 'text-[#136c37] dark:text-green-500 bg-gray-100 dark:bg-gray-800' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-[#136c37] dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                onClick={handleSignOut}
                className={`w-full font-medium px-4 py-2 rounded-md transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-red-800 hover:bg-red-700 text-red-100 hover:text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Log Out
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}