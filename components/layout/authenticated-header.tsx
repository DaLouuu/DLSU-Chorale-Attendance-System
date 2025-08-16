"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import { Home, ClipboardCheck, FileText, User, Settings, LogOut } from "lucide-react"
import { signOutUser } from "@/lib/auth-actions"

export function AuthenticatedHeader({ currentPage = "dashboard" }: { currentPage?: string }) {
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleSignOut = async () => {
    await signOutUser()
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
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button 
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                className={`transition-all duration-200 hover:scale-105 ${
                  currentPage === "dashboard"
                    ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                    : isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/attendance-overview">
              <Button 
                variant={currentPage === "attendance" ? "default" : "ghost"}
                className={`transition-all duration-200 hover:scale-105 ${
                  currentPage === "attendance"
                    ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                    : isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                }`}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Attendance
              </Button>
            </Link>
            <Link href="/attendance-form">
              <Button 
                variant={currentPage === "excuse-form" ? "default" : "ghost"}
                className={`transition-all duration-200 hover:scale-105 ${
                  currentPage === "excuse-form"
                    ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                    : isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Excuse Form
              </Button>
            </Link>
            <Link href="/profile">
              <Button 
                variant={currentPage === "profile" ? "default" : "ghost"}
                className={`transition-all duration-200 hover:scale-105 ${
                  currentPage === "profile"
                    ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                    : isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant={currentPage === "settings" ? "default" : "ghost"}
                className={`transition-all duration-200 hover:scale-105 ${
                  currentPage === "settings"
                    ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                    : isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className={`transition-all duration-200 hover:scale-105 text-red-600 hover:text-red-700 hover:bg-red-50 ${
                isDarkMode 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
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
            className="md:hidden"
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
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button 
                  variant={currentPage === "dashboard" ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    currentPage === "dashboard"
                      ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                      : isDarkMode 
                        ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                        : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/attendance-overview">
                <Button 
                  variant={currentPage === "attendance" ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    currentPage === "attendance"
                      ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                      : isDarkMode 
                        ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                        : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Attendance
                </Button>
              </Link>
              <Link href="/attendance-form">
                <Button 
                  variant={currentPage === "excuse-form" ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    currentPage === "excuse-form"
                      ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                      : isDarkMode 
                        ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                        : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Excuse Form
                </Button>
              </Link>
              <Link href="/profile">
                <Button 
                  variant={currentPage === "profile" ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    currentPage === "profile"
                      ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                      : isDarkMode 
                        ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                        : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant={currentPage === "settings" ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    currentPage === "settings"
                      ? 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                      : isDarkMode 
                        ? 'text-white hover:text-white hover:bg-transparent border-b-2 border-transparent hover:border-white' 
                        : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent border-b-2 border-transparent hover:border-[#09331f]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className={`w-full justify-start transition-all duration-200 hover:scale-105 text-red-600 hover:text-red-700 hover:bg-red-50 ${
                  isDarkMode 
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
