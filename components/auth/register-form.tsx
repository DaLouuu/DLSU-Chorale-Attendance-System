"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const [userType, setUserType] = useState<"admin" | "member" | "">("")
  const [adminRole, setAdminRole] = useState("")
  const [memberType, setMemberType] = useState<"performing" | "non-performing" | "">("")
  const [voiceSection, setVoiceSection] = useState("")
  const [committee, setCommittee] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // This is just a mock function for the frontend design
  const handleGoogleSignIn = () => {
    setIsLoading(true)
    // Simulate loading for 1 second then redirect
    setTimeout(() => {
      // For demo purposes, just redirect to the pending verification page
      window.location.href = "/pending-verification"
    }, 1000)
  }

  // Check if form is valid based on selections
  const isFormValid = () => {
    if (userType === "admin") return !!adminRole
    if (userType === "member") {
      if (memberType === "performing") return !!voiceSection
      if (memberType === "non-performing") return !!committee
    }
    return false
  }

  // Reset dependent fields when user type changes
  const handleUserTypeChange = (value: string) => {
    setUserType(value as "admin" | "member" | "")
    setAdminRole("")
    setMemberType("")
    setVoiceSection("")
    setCommittee("")
  }

  return (
    <Card className="border-2 border-[#09331f]/20 shadow-lg bg-white">
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {/* User Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1B1B1B]">I am registering as:</Label>
            <RadioGroup value={userType} onValueChange={handleUserTypeChange} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Admin Role Selection - Only show if admin is selected */}
          {userType === "admin" && (
            <div className="space-y-2">
              <Label htmlFor="admin-role" className="text-sm font-medium text-[#1B1B1B]">
                Admin Role:
              </Label>
              <Select value={adminRole} onValueChange={setAdminRole} disabled={isLoading}>
                <SelectTrigger id="admin-role" className="border-[#09331f]/30 focus:ring-[#09331f]/30">
                  <SelectValue placeholder="Select your admin role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conductor">Conductor</SelectItem>
                  <SelectItem value="executive-board">Executive Board</SelectItem>
                  <SelectItem value="talent-manager">Talent Manager</SelectItem>
                  <SelectItem value="section-head">Section Head</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Member Type Selection - Only show if member is selected */}
          {userType === "member" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1B1B1B]">Member Type:</Label>
              <RadioGroup
                value={memberType}
                onValueChange={(value) => {
                  setMemberType(value as "performing" | "non-performing" | "")
                  // Reset selections when changing member type
                  setVoiceSection("")
                  setCommittee("")
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performing" id="performing" />
                  <Label htmlFor="performing">Performing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-performing" id="non-performing" />
                  <Label htmlFor="non-performing">Non-Performing</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Voice Section - Only show if performing member is selected */}
          {userType === "member" && memberType === "performing" && (
            <div className="space-y-2">
              <Label htmlFor="voice-section" className="text-sm font-medium text-[#1B1B1B]">
                Voice Section:
              </Label>
              <Select value={voiceSection} onValueChange={setVoiceSection} disabled={isLoading}>
                <SelectTrigger id="voice-section" className="border-[#09331f]/30 focus:ring-[#09331f]/30">
                  <SelectValue placeholder="Select your voice section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soprano">Soprano</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="tenor">Tenor</SelectItem>
                  <SelectItem value="bass">Bass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Committee Selection - Only show if non-performing member is selected */}
          {userType === "member" && memberType === "non-performing" && (
            <div className="space-y-2">
              <Label htmlFor="committee" className="text-sm font-medium text-[#1B1B1B]">
                Committee:
              </Label>
              <Select value={committee} onValueChange={setCommittee} disabled={isLoading}>
                <SelectTrigger id="committee" className="border-[#09331f]/30 focus:ring-[#09331f]/30">
                  <SelectValue placeholder="Select your committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="publications">Publications & Marketing</SelectItem>
                  <SelectItem value="documentations">Documentations</SelectItem>
                  <SelectItem value="production">Production & Logistics</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={!isFormValid() || isLoading}
          className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white"
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

        <div className="pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            After registration, an admin will verify your membership before you can access the system.
          </p>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account?</span>{" "}
          <Link href="#" className="text-[#09331f] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  )
}
