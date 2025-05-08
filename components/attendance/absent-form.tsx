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

export function AbsentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [absentDate, setAbsentDate] = useState("")
  const [excuseType, setExcuseType] = useState("")
  const [absentReason, setAbsentReason] = useState("")
  const [absentDescription, setAbsentDescription] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!absentDate || !absentReason || !excuseType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: `Your ${excuseType.toLowerCase()} excuse has been submitted successfully`,
      })

      // Reset form
      setAbsentDate("")
      setExcuseType("")
      setAbsentReason("")
      setAbsentDescription("")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="excuse-type" className="text-sm font-medium text-[#1B1B1B]">
          Type of Excuse <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={excuseType} onValueChange={setExcuseType} className="flex gap-4" required>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ABSENT" id="absent" />
            <Label htmlFor="absent">Absent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="LATE" id="late" />
            <Label htmlFor="late">Late</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-date" className="text-sm font-medium text-[#1B1B1B]">
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="absent-date"
          type="date"
          value={absentDate}
          onChange={(e) => setAbsentDate(e.target.value)}
          className="border-[#09331f]/30 focus:ring-[#09331f]/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-reason" className="text-sm font-medium text-[#1B1B1B]">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Select value={absentReason} onValueChange={setAbsentReason} required>
          <SelectTrigger id="absent-reason" className="border-[#09331f]/30 focus:ring-[#09331f]/30">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <ExcuseReasonOptions />
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="absent-description" className="text-sm font-medium text-[#1B1B1B]">
          Additional Details
        </Label>
        <Textarea
          id="absent-description"
          placeholder="Please provide more details about your excuse..."
          value={absentDescription}
          onChange={(e) => setAbsentDescription(e.target.value)}
          className="min-h-[120px] border-[#09331f]/30 focus:ring-[#09331f]/30"
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
