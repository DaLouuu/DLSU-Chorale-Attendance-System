"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { signUpWithEmailPassword } from "@/lib/auth-actions"

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()

  const [registrationMethod, setRegistrationMethod] = useState<"google" | "email">("google")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [userType, setUserType] = useState<"admin" | "member" | "">("")
  const [adminRole, setAdminRole] = useState("")
  const [isExecutiveBoard, setIsExecutiveBoard] = useState(false)
  const [memberType, setMemberType] = useState("")
  const [committee, setCommittee] = useState("")
  const [voiceSection, setVoiceSection] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = () => {
    if (!userType) return false

    if (registrationMethod === "email") {
      if (!fullName.trim() || !email.trim() || password.length < 6) return false
    }

    if (userType === "admin") {
      if (!adminRole) return false
      if (adminRole === "conductor") return true
      if (adminRole === "performing") return !!voiceSection && !!committee
      return !!committee
    }

    if (userType === "member") {
      if (!memberType) return false
      if (memberType === "performing") return !!voiceSection && !!committee
      return !!committee
    }
    return false
  }

  const handleUserTypeChange = (value: string) => {
    setUserType(value as "admin" | "member" | "")
    setAdminRole("")
    setMemberType("")
    setIsExecutiveBoard(false)
    setVoiceSection("")
    setCommittee("")
  }

  const storeRegistrationData = () => {
    localStorage.setItem(
      "registrationData",
      JSON.stringify({
        user_type: userType,
        adminRole: userType === "admin" ? adminRole : null,
        is_execboard: userType === "admin" ? isExecutiveBoard : false,
        committee: committee || "N/A",
        voiceSection: voiceSection || null,
      }),
    )
  }

  const handleGoogleSignIn = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields for your role.")
      return
    }
    setIsLoading(true)
    try {
      storeRegistrationData()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      })
      if (error) throw error
      if (data.url) window.location.href = data.url
    } catch (error: any) {
      console.error("Error during Google sign in:", error)
      toast.error(error.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleEmailPasswordSignUp = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields, including email and password (min 6 chars).")
      return
    }
    setIsLoading(true)
    try {
      storeRegistrationData()

      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("fullName", fullName)

      const result = await signUpWithEmailPassword(formData)

      if (result.error) {
        toast.error(result.error.message || "Failed to sign up. Please try again.")
        console.error("Sign up error from server action:", result.error)
      } else {
        toast.success(result.message || "Registration successful! Please check your email.")
        setEmail("")
        setPassword("")
        setFullName("")
      }
    } catch (error: any) {
      console.error("Unexpected error during Email/Password sign up:", error)
      toast.error(error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="p-8 space-y-7">
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={registrationMethod === "google" ? "default" : "outline"}
            onClick={() => setRegistrationMethod("google")}
            className={registrationMethod === "google" ? "bg-[#09331f] text-white" : "border-[#09331f] text-[#09331f]"}
            disabled={isLoading}
          >
            Sign up with Google
          </Button>
          <Button
            variant={registrationMethod === "email" ? "default" : "outline"}
            onClick={() => setRegistrationMethod("email")}
            className={registrationMethod === "email" ? "bg-[#09331f] text-white" : "border-[#09331f] text-[#09331f]"}
            disabled={isLoading}
          >
            Sign up with Email
          </Button>
        </div>

        {registrationMethod === "email" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="full-name" className="text-sm font-medium text-[#1B1B1B] dark:text-white">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="full-name"
                type="text"
                placeholder="Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-[#1B1B1B] dark:text-white">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-[#1B1B1B] dark:text-white">Password (min. 6 characters) <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#1B1B1B] dark:text-white">I am registering as: <span className="text-red-500">*</span></Label>
            <RadioGroup value={userType} onValueChange={handleUserTypeChange} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" disabled={isLoading} />
                <Label htmlFor="admin" className="dark:text-white">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" disabled={isLoading} />
                <Label htmlFor="member" className="dark:text-white">Member</Label>
              </div>
            </RadioGroup>
          </div>

          {userType === "admin" && (
            <div className="space-y-3">
              <Label htmlFor="admin-role" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Admin Role: <span className="text-red-500">*</span>
              </Label>
              <Select
                value={adminRole}
                onValueChange={(value) => {
                  setAdminRole(value)
                  if (value === "conductor") {
                    setIsExecutiveBoard(false)
                    setVoiceSection("")
                    setCommittee("")
                  } else if (value === "performing") {
                  } else {
                    setVoiceSection("")
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="admin-role" className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select your admin role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="conductor">Conductor</SelectItem>
                  <SelectItem value="performing">Performing Admin</SelectItem>
                  <SelectItem value="non-performing">Non-Performing Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {userType === "admin" && adminRole !== "conductor" && adminRole !== "" && (
            <div className="flex items-center space-x-2 pt-3">
              <Checkbox
                id="is-executive-board"
                checked={isExecutiveBoard}
                onCheckedChange={(checked) => setIsExecutiveBoard(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="is-executive-board" className="dark:text-white">Executive Board Member</Label>
            </div>
          )}

          {userType === "member" && (
            <div className="space-y-3">
              <Label htmlFor="member-type" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Member Type: <span className="text-red-500">*</span>
              </Label>
              <Select
                value={memberType}
                onValueChange={(value) => {
                  setMemberType(value)
                  if (value !== "performing") setVoiceSection("")
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="member-type" className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select your member type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="performing">Performing Member</SelectItem>
                  <SelectItem value="non-performing">Non-Performing Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {((userType === "member" && memberType === "performing") ||
            (userType === "admin" && adminRole === "performing")) && (
            <div className="space-y-3">
              <Label htmlFor="voice-section" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Voice Section: <span className="text-red-500">*</span>
              </Label>
              <Select value={voiceSection} onValueChange={setVoiceSection} disabled={isLoading}>
                <SelectTrigger id="voice-section" className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select your voice section" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="soprano">Soprano</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="tenor">Tenor</SelectItem>
                  <SelectItem value="bass">Bass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(userType === "member" || (userType === "admin" && adminRole !== "conductor" && adminRole !== "")) && (
            <div className="space-y-3">
              <Label htmlFor="committee" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Committee: <span className="text-red-500">*</span>
              </Label>
              <Select value={committee} onValueChange={setCommittee} disabled={isLoading}>
                <SelectTrigger id="committee" className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select your committee" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="publications">Publications & Marketing</SelectItem>
                  <SelectItem value="production">Production & Logistics</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  {userType === "admin" && <SelectItem value="n/a">N/A (Admin)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={registrationMethod === "google" ? handleGoogleSignIn : handleEmailPasswordSignUp}
          disabled={!isFormValid() || isLoading}
          variant={registrationMethod === "google" ? "outline" : "default"}
          className={`w-full mt-6 ${
            registrationMethod === "google"
              ? "border-[#09331f]/50 text-[#09331f] hover:bg-[#09331f]/5 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              : "bg-[#09331f] hover:bg-[#09331f]/90 text-white"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Processing...</span>
            </div>
          ) : registrationMethod === "google" ? (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Sign up with Google
            </>
          ) : (
            <span>Sign up with Email</span>
          )}
        </Button>

        <div className="pt-5 border-t border-gray-200 dark:border-gray-700 mt-4">
          <p className="text-center text-xs text-gray-700 dark:text-gray-300">
            {registrationMethod === "email" 
              ? "After sign up, please check your email to verify your account before proceeding." 
              : "After registration, your details will be linked to your account."}
          </p>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-700 dark:text-gray-300">Already have an account?</span>{" "}
          <Link href="/login" className="text-[#09331f] hover:underline font-medium dark:text-green-400">
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  )
}
