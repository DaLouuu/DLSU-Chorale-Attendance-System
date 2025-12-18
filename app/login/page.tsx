"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { GalleryBackground } from "@/components/ui/gallery-background"
import { PageHeader } from "@/components/layout/page-header"
import { useTheme } from "@/components/theme-provider"
import { useUserRole } from "@/hooks/use-user-role"

export default function LoginPage() {
  const { theme } = useTheme()
  const { isAuthenticated, loading } = useUserRole()
  const router = useRouter()
  
  // Check if we're in dark mode (either manual dark or system dark)
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent"></div>
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <GalleryBackground />
      <div className="flex min-h-screen flex-col relative z-10 pt-16">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-6 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back, Cho-sama!</h1>
              <p className="text-sm text-white/80">Enter your school ID number and password to access your account.</p>
            </div>
            <LoginForm />
          </div>
        </main>

        <footer className={`footer-compact ${!isDarkMode ? 'light' : ''} mt-auto`}>
          <div className="container mx-auto px-4 text-center text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
