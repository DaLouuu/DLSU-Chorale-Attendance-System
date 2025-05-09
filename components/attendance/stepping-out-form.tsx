"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ExcuseReasonOptions } from "@/components/attendance/excuse-reason-options"

export function SteppingOutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState("")
  const [leaveTime, setLeaveTime] = useState("")
  const [returnTime, setReturnTime] = useState("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!date || !leaveTime || !returnTime || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate that return time is after leave time
    if (leaveTime >= returnTime) {
      toast({
        title: "Error",
        description: "Return time must be after leave time",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your stepping out excuse has been submitted successfully",
      })

      // Reset form
      setDate("")
      setLeaveTime("")
      setReturnTime("")
      setReason("")
      setDescription("")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stepping-out-date" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="stepping-out-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leave-time" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
            Leave Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="leave-time"
            type="time"
            value={leaveTime}
            onChange={(e) => setLeaveTime(e.target.value)}
            className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="return-time" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
            Return Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="return-time"
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="border-[#09331f]/30 focus:ring-[#09331f]/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stepping-out-reason" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Select value={reason} onValueChange={setReason} required>
          <SelectTrigger
            id="stepping-out-reason"
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
        <Label htmlFor="stepping-out-description" className="text-sm font-medium text-[#1B1B1B] dark:text-white">
          Additional Details
        </Label>
        <Textarea
          id="stepping-out-description"
          placeholder="Please provide more details about your stepping out excuse..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
