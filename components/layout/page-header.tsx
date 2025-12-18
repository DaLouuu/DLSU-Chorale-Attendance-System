"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"

export function PageHeader() {
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Check if we're in dark mode (either manual dark or system dark)
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-[#09331f] shadow-lg' 
        : 'bg-white/80 backdrop-blur-md shadow-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Text Image Group */}
          <Link href="/" className="flex items-center space-x-3 group">
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
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button 
                variant="ghost" 
                className={`relative group transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'text-white hover:text-white hover:bg-transparent' 
                    : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                }`}
              >
                Home
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                  isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                }`}></div>
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                variant="ghost" 
                className={`relative group transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'text-white hover:text-white hover:bg-transparent' 
                    : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                }`}
              >
                About
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                  isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                }`}></div>
              </Button>
            </Link>
            <Link href="/events">
              <Button 
                variant="ghost" 
                className={`relative group transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'text-white hover:text-white hover:bg-transparent' 
                    : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                }`}
              >
                Events
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                  isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                }`}></div>
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="ghost" 
                className={`relative group transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'text-white hover:text-white hover:bg-transparent' 
                    : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                }`}
              >
                Contact
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                  isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                }`}></div>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                className={`transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-white text-[#09331f] hover:bg-white/90' 
                    : 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                }`}
              >
                Login
              </Button>
            </Link>
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
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start relative group transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                    isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                  }`}></div>
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start relative group transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                    isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                  }`}></div>
                </Button>
              </Link>
              <Link href="/events">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start relative group transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                    isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                  }`}></div>
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start relative group transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-white hover:text-white hover:bg-transparent' 
                      : 'text-gray-700 hover:text-[#09331f] hover:bg-transparent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-200 group-hover:w-full ${
                    isDarkMode ? 'bg-white' : 'bg-[#09331f]'
                  }`}></div>
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  className={`w-full justify-start transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-white text-[#09331f] hover:bg-white/90' 
                      : 'bg-[#09331f] text-white hover:bg-[#09331f]/90'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
