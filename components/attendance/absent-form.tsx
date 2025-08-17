"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { ExcuseReasonOptions } from "@/components/attendance/excuse-reason-options"
import { createClient } from "@/utils/supabase/client"
import type { ExcuseType } from "@/types/excuse"

export function AbsentForm() {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestDate, setRequestDate] = useState("")
  const [excuseType, setExcuseType] = useState<ExcuseType | "">("")
  const [excuseReason, setExcuseReason] = useState("")
  const [requestTime, setRequestTime] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!requestDate || !excuseReason || !excuseType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields: Date, Reason, and Type of Excuse.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to submit an excuse. Please login again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError)
        toast({
          title: "Error",
          description: "Could not find your profile information. Please ensure your account is fully set up or contact support.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from("excuse_requests").insert({
        profile_id_fk: profileData.id,
        request_date: requestDate,
        excuse_type: excuseType,
        excuse_reason: excuseReason,
        request_time: requestTime || null,
        status: "Pending",
      })

      if (insertError) {
        console.error("Error inserting excuse request:", insertError)
        throw insertError
      }

      toast({
        title: "Success",
        description: `Your ${excuseType.toLowerCase()} excuse has been submitted successfully`,
      })

      setRequestDate("")
      setExcuseType("")
      setExcuseReason("")
      setRequestTime("")
    } catch (error) {
      console.error("Error submitting excuse in catch block:", error)
      toast({
        title: "Error",
        description: `Failed to submit excuse: ${(error as Error).message || "Please try again."}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="excuse-type" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Type of Excuse <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={excuseType} onValueChange={(value) => setExcuseType(value as ExcuseType)} className="flex gap-4" required>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Absence" id="absence" />
            <Label htmlFor="absence" className="dark:text-white">
              Absent
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Late" id="late" />
            <Label htmlFor="late" className="dark:text-white">
              Late
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-date" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="request-date"
          type="date"
          value={requestDate}
          onChange={(e) => setRequestDate(e.target.value)}
          className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-time" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Time (Optional)
        </Label>
        <Input
          id="request-time"
          type="time"
          value={requestTime}
          onChange={(e) => setRequestTime(e.target.value)}
          className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excuse-reason" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Select value={excuseReason} onValueChange={setExcuseReason} required>
          <SelectTrigger
            id="excuse-reason"
            className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
            <ExcuseReasonOptions />
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-[#09331f] hover:bg-[#09331f]/90 text-white">
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Submitting...</span>
          </div>
        ) : (
          "Submit Excuse"
        )}
      </Button>
    </form>
  )
}
