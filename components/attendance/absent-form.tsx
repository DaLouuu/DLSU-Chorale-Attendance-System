"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { ExcuseReasonOptions } from "@/components/attendance/excuse-reason-options"
import { createClient } from "@/utils/supabase/client"

export function AbsentForm() {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [absentDate, setAbsentDate] = useState("")
  const [excuseType, setExcuseType] = useState("")
  const [absentReason, setAbsentReason] = useState("")
  const [absentDescription, setAbsentDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!absentDate || !absentReason || !excuseType) {
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
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to submit an excuse. Please login again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("account_id")
        .eq("auth_user_id", session.user.id)
        .single()

      if (accountError || !accountData) {
        console.error("Error fetching account_id:", accountError)
        toast({
          title: "Error",
          description: "Could not find your account information. Please ensure your account is fully set up or contact support.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const accountIdFk = accountData.account_id

      const { error: insertError } = await supabase.from("excuserequests").insert({
        account_id_fk: accountIdFk,
        date_of_absence: absentDate,
        reason: absentReason,
        status: "Pending",
        details: absentDescription,
        excuse_type: excuseType,
      })

      if (insertError) {
        console.error("Error inserting excuse request:", insertError)
        throw insertError
      }

      toast({
        title: "Success",
        description: `Your ${excuseType.toLowerCase()} excuse has been submitted successfully`,
      })

      setAbsentDate("")
      setExcuseType("")
      setAbsentReason("")
      setAbsentDescription("")
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
        <RadioGroup value={excuseType} onValueChange={setExcuseType} className="flex gap-4" required>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ABSENT" id="absent" />
            <Label htmlFor="absent" className="dark:text-white">
              Absent
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="LATE" id="late" />
            <Label htmlFor="late" className="dark:text-white">
              Late
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-date" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="absent-date"
          type="date"
          value={absentDate}
          onChange={(e) => setAbsentDate(e.target.value)}
          className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-reason" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Select value={absentReason} onValueChange={setAbsentReason} required>
          <SelectTrigger
            id="absent-reason"
            className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
            <ExcuseReasonOptions />
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-description" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Additional Details
        </Label>
        <Textarea
          id="absent-description"
          placeholder="Please provide more details about your excuse..."
          value={absentDescription}
          onChange={(e) => setAbsentDescription(e.target.value)}
          className="min-h-[120px] border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
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
