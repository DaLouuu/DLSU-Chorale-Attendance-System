"use client"

import { LoginForm } from "@/components/auth/login-form"
import { GalleryBackground } from "@/components/ui/gallery-background"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <GalleryBackground />
      <div className="flex min-h-screen flex-col relative z-10">
        <header className="bg-[#09331f] py-8 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">DLSU Chorale Portal</h1>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-6 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back!</h1>
              <p className="text-sm text-white/80">Sign in to access the Attendance System.</p>
            </div>
            <LoginForm />
          </div>
        </main>

        <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 py-6 shadow-inner mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-700 text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
