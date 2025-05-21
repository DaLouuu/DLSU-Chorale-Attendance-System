"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GalleryBackground } from "@/components/ui/gallery-background"
import { WhiteLogo } from "@/components/ui/white-logo"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const handleEmailSignIn = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsEmailLoading(true)

    try {
      // In a real implementation, you would authenticate the user here
      // For now, we'll just simulate a successful login
      toast.success("Sign in successful!")

      // Redirect to homepage after a brief delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error during sign in:", error)
      toast.error("Failed to sign in with email")
      setIsEmailLoading(false)
    }
  }

  /*
  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-login`,
        },
      })

      if (error) {
        throw error
      }

      // Redirect to the OAuth URL
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error("Error during sign in:", error)
      if (error?.message?.includes("provider is not enabled")) {
        toast.error("Google sign-in is not properly configured. Please contact the administrator.")
      } else {
        toast.error("Failed to sign in with Google")
      }
      setIsLoading(false)
    }
  }*/

  return (
    <div className="min-h-screen">
      <GalleryBackground />
      <div className="flex min-h-screen flex-col relative z-10">
        {/* Header with DLSU Chorale branding */}
        <header className="bg-[#09331f] py-8 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">DLSU Chorale</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-6 text-center mb-8">
              <WhiteLogo className="mb-2" />
              <h1 className="text-3xl font-bold tracking-tight text-white">Sign in to your account</h1>
              <p className="text-sm text-white/80">Access the DLSU Chorale Attendance System</p>
            </div>

            <Card className="border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Email input and sign in button */}
                <div className="space-y-4 mb-6">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#09331f]/20 focus:border-[#09331f] focus:ring-[#09331f]"
                  />
                  <Button
                    onClick={handleEmailSignIn}
                    disabled={isEmailLoading || !email}
                    className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white"
                  >
                    {isEmailLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-mail"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>Sign in with Email</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google sign in button */}
                <Button
                  //onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-google"
                      >
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                        <path d="M12 16V8" />
                        <path d="M8 12h8" />
                      </svg>
                      <span>Sign in with Google</span>
                    </div>
                  )}
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-700">Don't have an account?</span>{" "}
                  <Link href="/register" className="text-[#09331f] hover:underline font-medium">
                    Register
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#1B1B1B] py-6 shadow-inner">
          <div className="container mx-auto px-4 text-center text-white text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
