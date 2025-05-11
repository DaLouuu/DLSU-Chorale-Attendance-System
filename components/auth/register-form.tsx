"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export function RegisterForm() {
  const router = useRouter()
  const [userType, setUserType] = useState<"admin" | "member" | "">("")
  const [adminRole, setAdminRole] = useState("")
  const [isExecutiveBoard, setIsExecutiveBoard] = useState(false)
  const [memberType, setMemberType] = useState("")
  const [committee, setCommittee] = useState("")
  const [voiceSection, setVoiceSection] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check if form is valid based on selections
  const isFormValid = () => {
    if (userType === "admin") {
      if (!adminRole) return false
      if (adminRole === "conductor") return true
      if (adminRole === "performing") {
        return !!voiceSection && !!committee
      } else {
        return !!committee
      }
    }

    if (userType === "member") {
      if (!memberType) return false
      if (memberType === "performing") {
        return !!voiceSection && !!committee
      } else {
        return !!committee
      }
    }

    return false
  }

  // Reset dependent fields when user type changes
  const handleUserTypeChange = (value: string) => {
    setUserType(value as "admin" | "member" | "")
    setAdminRole("")
    setMemberType("")
    setIsExecutiveBoard(false)
    setVoiceSection("")
    setCommittee("")
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Proceed with Google sign in
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-login`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // Store registration data in localStorage to retrieve after OAuth
      localStorage.setItem(
        "registrationData",
        JSON.stringify({
          userType,
          adminRole,
          isExecutiveBoard,
          committee,
          voiceSection,
          isPerforming: userType === "admin" ? adminRole === "performing" : memberType === "performing",
        }),
      )

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
  }

  return (
    <Card className="border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="p-8 space-y-7">
        <div className="space-y-5">
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#1B1B1B] dark:text-white">I am registering as:</Label>
            <RadioGroup value={userType} onValueChange={handleUserTypeChange} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" disabled={isLoading} />
                <Label htmlFor="admin" className="dark:text-white">
                  Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" disabled={isLoading} />
                <Label htmlFor="member" className="dark:text-white">
                  Member
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Admin Role Selection - Only show if admin is selected */}
          {userType === "admin" && (
            <div className="space-y-3">
              <Label htmlFor="admin-role" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Admin Role:
              </Label>
              <Select
                value={adminRole}
                onValueChange={(value) => {
                  setAdminRole(value)
                  // Reset performing status if conductor is selected
                  if (value === "conductor") {
                    setIsExecutiveBoard(false)
                    setVoiceSection("")
                    setCommittee("")
                  } else if (value === "performing") {
                    // Do nothing, keep other fields
                  } else {
                    setVoiceSection("")
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="admin-role"
                  className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <SelectValue placeholder="Select your admin role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="conductor">Conductor</SelectItem>
                  <SelectItem value="performing">Performing</SelectItem>
                  <SelectItem value="non-performing">Non-Performing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Executive Board Option - For admin only */}
          {userType === "admin" && adminRole !== "conductor" && adminRole !== "" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-executive-board"
                  checked={isExecutiveBoard}
                  onCheckedChange={(checked) => setIsExecutiveBoard(checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="is-executive-board" className="dark:text-white">
                  Executive Board
                </Label>
              </div>
            </div>
          )}

          {/* Member Type Selection - Only for regular members */}
          {userType === "member" && (
            <div className="space-y-3">
              <Label htmlFor="member-type" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Member Type: <span className="text-red-500">*</span>
              </Label>
              <Select
                value={memberType}
                onValueChange={(value) => {
                  setMemberType(value)
                  if (value !== "performing") {
                    setVoiceSection("")
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="member-type"
                  className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <SelectValue placeholder="Select your member type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectItem value="performing">Performing</SelectItem>
                  <SelectItem value="non-performing">Non-Performing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Voice Section - Show if performing member or performing admin */}
          {((userType === "member" && memberType === "performing") ||
            (userType === "admin" && adminRole === "performing")) && (
            <div className="space-y-3">
              <Label htmlFor="voice-section" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Voice Section: <span className="text-red-500">*</span>
              </Label>
              <Select value={voiceSection} onValueChange={setVoiceSection} disabled={isLoading}>
                <SelectTrigger
                  id="voice-section"
                  className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
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

          {/* Committee Selection - Show for all members and admins except conductor */}
          {(userType === "member" || (userType === "admin" && adminRole !== "conductor" && adminRole !== "")) && (
            <div className="space-y-3">
              <Label htmlFor="committee" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                Committee: <span className="text-red-500">*</span>
              </Label>
              <Select value={committee} onValueChange={setCommittee} disabled={isLoading}>
                <SelectTrigger
                  id="committee"
                  className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <SelectValue placeholder="Select your committee" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  {userType === "member" ? (
                    <>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="publications">Publications & Marketing</SelectItem>
                      <SelectItem value="production">Production & Logistics</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="publications">Publications & Marketing</SelectItem>
                      <SelectItem value="production">Production & Logistics</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="n/a">N/A</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={!isFormValid() || isLoading}
          className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white mt-6"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Processing...</span>
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

        <div className="pt-5 border-t border-gray-200 dark:border-gray-700 mt-4">
          <p className="text-center text-xs text-gray-700 dark:text-gray-300">
            After registration, an admin will verify your membership before you can access the system.
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
