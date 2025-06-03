"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client" // Import the browser client
import { signInWithEmailPassword } from "@/lib/auth-actions" // Import the server action

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient() // Instantiate the browser client

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailPasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      toast.error("Please enter both email and password.")
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await signInWithEmailPassword(formData)

      if (result?.error) { // Server action will redirect on success, so only handle error here
        toast.error(result.error.message || "Failed to login. Please try again.")
        console.error("Login error from server action:", result.error)
      }
      // No toast.success here, as successful login redirects from server action.
      // router.refresh() or router.push() are also not strictly needed here due to server-side redirect.

    } catch (error: any) {
      // This catch block is for unexpected errors during the client-side part 
      // or if the server action itself throws an unhandled exception (not a returned error object).
      console.error("Unexpected login error:", error)
      toast.error("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-login`,
        },
      })
      if (error) throw error
      if (data.url) window.location.href = data.url // Redirect to Google's OAuth page
    } catch (error: any) {
      console.error("Error during Google sign in:", error)
      toast.error(error.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
    // setIsLoading(false) should not be here if redirect happens
  }

  return (
    <Card className="w-full max-w-md border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="space-y-1 text-center p-8">
        <CardTitle className="text-2xl font-bold text-[#09331f] dark:text-white">Welcome Back!</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleEmailPasswordLogin}>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-[#1B1B1B] dark:text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-[#1B1B1B] dark:text-white">Password</Label>
              <Link
                href="/forgot-password" // Placeholder for forgot password page
                className="text-xs text-[#09331f] hover:underline dark:text-green-400"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </Button>
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            type="button" // Important: type="button" to prevent form submission
            variant="outline"
            className="w-full border-[#09331f]/50 text-[#09331f] hover:bg-[#09331f]/5 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {/* You can add a Google SVG icon here */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Login with Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm flex flex-col gap-2">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?
            <Link
              href="/register"
              className="ml-1 font-medium text-[#09331f] hover:underline dark:text-green-400"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 