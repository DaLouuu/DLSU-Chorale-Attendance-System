"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import type { HistoryItem } from "@/types/excuse"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface HistoryCardProps {
  historyItem: HistoryItem
  onEditApproval: () => void
}

export function HistoryCard({ historyItem, onEditApproval }: HistoryCardProps) {
  // Status colors
  const statusColors = {
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

  const colors = statusColors[historyItem.status]

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${colors.bg} shadow-sm transition-all`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src={historyItem.profileImage || "/placeholder.svg?height=40&width=40"}
              alt={historyItem.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{historyItem.name}</h3>
            <p className="text-xs text-gray-600">
              {historyItem.voiceSection.charAt(0).toUpperCase() + historyItem.voiceSection.slice(1)}{" "}
              {historyItem.voiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${colors.badge}`}>{historyItem.status}</span>
        </div>
      </div>

      <div className={`border-t border-gray-200 px-3 py-2 text-sm ${colors.text}`}>
        <p>
          {historyItem.type} - {historyItem.date}
        </p>
      </div>

      <div className="flex border-t border-gray-200">
        <Button
          onClick={onEditApproval}
          variant="ghost"
          size="sm"
          className="flex-1 rounded-none border-r border-gray-200 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Edit className="mr-1 h-3.5 w-3.5" />
          Edit Approval
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 rounded-none py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excuse Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={historyItem.profileImage || "/placeholder.svg?height=48&width=48"}
                    alt={historyItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{historyItem.name}</h3>
                  <p className="text-sm text-gray-500">
                    {historyItem.voiceSection.charAt(0).toUpperCase() + historyItem.voiceSection.slice(1)}{" "}
                    {historyItem.voiceNumber}
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-gray-50 p-3">
                <p className="mb-2 font-medium">
                  {historyItem.type} - {historyItem.date}
                </p>
                <p className="mb-1 text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors.badge}`}>
                    {historyItem.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Processed on:</span> {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={onEditApproval}>
                  <Edit className="mr-2 h-4 w-4" />
                  Change Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
