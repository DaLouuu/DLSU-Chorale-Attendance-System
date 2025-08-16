"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { signInWithSchoolIdPassword } from "@/lib/auth-actions"
import { useTheme } from "@/components/theme-provider"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [schoolId, setSchoolId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const handleSchoolIdPasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!schoolId || !password) {
      toast({
        title: "Error",
        description: "Please enter both school ID and password.",
        variant: "destructive"
      })
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("schoolId", schoolId)
      formData.append("password", password)
      
      const result = await signInWithSchoolIdPassword(formData)

      if (result?.error) { // Server action will redirect on success, so only handle error here
        toast({
          title: "Error",
          description: result.error.message || "Failed to login. Please try again.",
          variant: "destructive"
        })
        console.error("Login error from server action:", result.error)
      }
      // No toast.success here, as successful login redirects from server action.
      // router.refresh() or router.push() are also not strictly needed here due to server-side redirect.

    } catch (error) {
      // Check if this is a Next.js redirect (which is not an actual error)
      const errorObj = error as { message?: string; digest?: string }
      if (errorObj?.message?.includes('NEXT_REDIRECT') || errorObj?.digest?.includes('NEXT_REDIRECT')) {
        // This is a successful redirect, not an error - do nothing
        return
      }
      
      // This catch block is for unexpected errors during the client-side part 
      // or if the server action itself throws an unhandled exception (not a returned error object).
      console.error("Unexpected login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`w-full max-w-md border-2 shadow-lg backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-[#09331f]/90 border-[#052015]/60' 
        : 'bg-white/90 border-[#09331f]/20'
    }`}>
      <form onSubmit={handleSchoolIdPasswordLogin}>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-3">
            <Label htmlFor="schoolId" className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-[#09331f]'
            }`}>School ID Number</Label>
            <Input
              id="schoolId"
              name="schoolId"
              type="text"
              placeholder="Enter your school ID number"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              disabled={isLoading}
              required
              className={`border-2 transition-colors ${
                isDarkMode 
                  ? 'bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-white' 
                  : 'bg-white/50 border-[#09331f]/30 text-[#09331f] placeholder-[#09331f]/60 focus:border-[#09331f]'
              }`}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={`text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-[#09331f]'
              }`}>Password</Label>
              <Link
                href="/forgot-password"
                className={`text-xs hover:underline ${
                  isDarkMode ? 'text-white/80 hover:text-white' : 'text-[#09331f] hover:underline'
                }`}
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className={`border-2 transition-colors pr-10 ${
                  isDarkMode 
                    ? 'bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-white' 
                    : 'bg-white/50 border-[#09331f]/30 text-[#09331f] placeholder-[#09331f]/60 focus:border-[#09331f]'
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent ${
                  isDarkMode 
                    ? 'text-white/60 hover:text-white' 
                    : 'text-[#09331f]/60 hover:text-[#09331f]'
                }`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
          </div>
          <Button type="submit" className={`w-full text-white transition-colors ${
            isDarkMode 
              ? 'bg-white text-[#09331f] hover:bg-white/90' 
              : 'bg-[#09331f] hover:bg-[#09331f]/90'
          }`} disabled={isLoading}>
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
        <CardFooter className="text-center text-sm flex flex-col gap-2 p-6">
          <p className={`${
            isDarkMode ? 'text-white/80' : 'text-gray-600'
          }`}>
            Need access? Contact your administrator to get an account.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 