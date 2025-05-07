"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeclineReasonDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  excuseName: string
  excuseType: string
  excuseDate: string
}

export function DeclineReasonDialog({
  isOpen,
  onClose,
  onConfirm,
  excuseName,
  excuseType,
  excuseDate,
}: DeclineReasonDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = () => {
    setIsSubmitting(true)
    // Simulate a short delay for the submission
    setTimeout(() => {
      onConfirm(reason)
      setReason("")
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-[#09331f]">Decline Excuse</DialogTitle>
          <DialogDescription className="text-center">
            Please provide a reason for declining this excuse request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">{excuseName}</p>
            <p className="text-gray-700">
              {excuseType} - {excuseDate}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="decline-reason" className="text-sm font-medium text-gray-700">
              Reason for declining (optional)
            </label>
            <Textarea
              id="decline-reason"
              placeholder="Enter your reason for declining this excuse..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] border-[#09331f]/30 focus:ring-[#09331f]/30"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              "Confirm Decline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
