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
import { signInWithSchoolIdPassword } from "@/lib/auth-actions" // Import the server action

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient() // Instantiate the browser client

  const [schoolId, setSchoolId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSchoolIdPasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!schoolId || !password) {
      toast.error("Please enter both school ID and password.")
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("schoolId", schoolId)
      formData.append("password", password)

      const result = await signInWithSchoolIdPassword(formData)

      if (result?.error) { // Server action will redirect on success, so only handle error here
        toast.error(result.error.message || "Failed to login. Please try again.")
        console.error("Login error from server action:", result.error)
      }
      // No toast.success here, as successful login redirects from server action.
      // router.refresh() or router.push() are also not strictly needed here due to server-side redirect.

    } catch (error: any) {
      // Check if this is a Next.js redirect (which is not an actual error)
      if (error?.digest?.includes('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
        // This is a successful redirect, not an error - do nothing
        console.log("Login successful, redirecting...")
        return
      }
      
      // This catch block is for unexpected errors during the client-side part 
      // or if the server action itself throws an unhandled exception (not a returned error object).
      console.error("Unexpected login error:", error)
      toast.error("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="space-y-1 text-center p-8">
        <CardTitle className="text-2xl font-bold text-[#09331f] dark:text-white">Welcome Back!</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Enter your school ID and password to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSchoolIdPasswordLogin}>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="schoolId" className="text-sm font-medium text-[#09331f] dark:text-white">School ID</Label>
            <Input
              id="schoolId"
              name="schoolId"
              type="text"
              placeholder="Enter your school ID"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              disabled={isLoading}
              required
              className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-[#09331f] dark:text-white">Password</Label>
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
        </CardContent>
        <CardFooter className="text-center text-sm flex flex-col gap-2">
          <p className="text-gray-600 dark:text-gray-300">
            Need access? Contact your administrator to get an account.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 