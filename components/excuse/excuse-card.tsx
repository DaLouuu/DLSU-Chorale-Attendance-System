"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import type { ExcuseItem } from "@/types/excuse"

interface ExcuseCardProps {
  excuse: ExcuseItem
  onApprove: () => void
  onDecline: () => void
}

export function ExcuseCard({ excuse, onApprove, onDecline }: ExcuseCardProps) {
  // Voice section colors for the small badge
  const voiceSectionColors = {
    soprano: "bg-pink-100 text-pink-800",
    alto: "bg-purple-100 text-purple-800",
    tenor: "bg-blue-100 text-blue-800",
    bass: "bg-green-100 text-green-800",
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-3 p-4">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src={excuse.profileImage || "/placeholder.svg?height=48&width=48"}
            alt={excuse.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900">{excuse.name}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${voiceSectionColors[excuse.voiceSection]}`}
                >
                  {excuse.voiceSection.charAt(0).toUpperCase() + excuse.voiceSection.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {excuse.voiceSection.charAt(0).toUpperCase() + excuse.voiceSection.slice(1)} {excuse.voiceNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 rounded-md bg-white p-3 text-sm">
            <p className="font-medium text-gray-900">
              {excuse.type} - {excuse.date}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Reason:</span> {excuse.reason}
            </p>
            {excuse.notes && (
              <p className="text-gray-700">
                <span className="font-medium">Notes:</span> {excuse.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-t border-gray-200">
        <Button
          onClick={onApprove}
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg border-r border-gray-200 py-3 text-green-600 hover:bg-green-50 hover:text-green-700"
        >
          <Check className="mr-1 h-4 w-4" />
          Approve
        </Button>
        <Button
          onClick={onDecline}
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg py-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <X className="mr-1 h-4 w-4" />
          Decline
        </Button>
      </div>
    </div>
  )
}
