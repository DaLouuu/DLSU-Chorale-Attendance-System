"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { DeclineReasonDialog } from "@/components/excuse/decline-reason-dialog"

interface ExcuseDetailViewProps {
  excuse: {
    id: string
    name: string
    date: string
    reason: string
    status: 'PENDING' | 'APPROVED' | 'DECLINED'
    notes?: string
    voiceSection?: string
    voiceNumber?: string
    type?: string
  }
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onDecline: (id: string, reason: string) => void
}

export function ExcuseDetailView({ excuse, onClose, onApprove, onDecline }: Omit<ExcuseDetailViewProps, 'isOpen'>) {
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  const handleDeclineConfirm = (reason: string) => {
    onDecline(excuse.id, reason)
    setShowDeclineForm(false)
    onClose()
  }

  // Status colors
  const statusColors = {
    PENDING: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      badge: "bg-yellow-500 text-white",
    },
    APPROVED: {
      bg: "bg-green-100",
      text: "text-green-800",
      badge: "bg-green-500 text-white",
    },
    DECLINED: {
      bg: "bg-red-100",
      text: "text-red-800",
      badge: "bg-red-500 text-white",
    },
  }

  const colors = statusColors[excuse.status]

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border border-gray-200">
          <AvatarImage src="/images/profile-1.jpg" alt={excuse.name} />
          <AvatarFallback>{excuse.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{excuse.name}</h3>
          <p className="text-sm text-gray-500 capitalize">
            {excuse.voiceSection} {excuse.voiceNumber}
          </p>
        </div>
      </div>

      <div className="rounded-md bg-gray-50 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <Badge
              className={`
                ${excuse.type === "ABSENT" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}
                font-medium py-1 px-3
              `}
            >
              {excuse.type}
            </Badge>
          </div>
          <Badge className={`${colors.badge} py-1 px-3`}>{excuse.status}</Badge>
        </div>

        <p className="text-sm">
          <span className="font-medium">Date:</span> {format(excuse.date, "MMMM d, yyyy")}
        </p>

        {excuse.status === "DECLINED" && excuse.reason && (
          <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">Decline Reason:</p>
            <p>{excuse.reason}</p>
          </div>
        )}
      </div>

      {excuse.status === "PENDING" && (
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onApprove(excuse.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={false} // isSubmitting is removed
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            onClick={() => setShowDeclineForm(true)}
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
            disabled={false} // isSubmitting is removed
          >
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>
      )}

      {/* Decline Reason Dialog */}
      <DeclineReasonDialog
        isOpen={showDeclineForm}
        onClose={() => setShowDeclineForm(false)}
        onConfirm={handleDeclineConfirm}
        excuseName={excuse.name}
        excuseType={excuse.type || 'Unknown'}
        excuseDate={excuse.date}
      />
    </div>
  )
}
