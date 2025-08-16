"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ExcuseRequestWithProfile } from "@/types/excuse"

interface HistoryListProps {
  historyItems: ExcuseRequestWithProfile[]
  onEditApproval: (excuse: ExcuseRequestWithProfile) => void
}

export function HistoryList({ historyItems, onEditApproval }: HistoryListProps) {
  if (historyItems.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No history found.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {historyItems.map((item) => (
        <div key={item.request_id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt={item.profiles?.full_name || "Unknown"} />
                <AvatarFallback>{(item.profiles?.full_name || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{item.profiles?.full_name || "Unknown"}</h3>
                <div className="text-sm text-gray-500 capitalize">
                  {item.profiles?.section || "Unknown"} • {item.profiles?.committee || "No Committee"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`${
                  item.excuse_type === "Absence"
                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                    : item.excuse_type === "Late"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                }`}
              >
                {item.excuse_type}
              </Badge>
              <Badge className={`${item.status === "Approved" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {item.status}
              </Badge>
            </div>
          </div>

          <div className="mt-3 rounded-md bg-gray-50 p-3">
            <div className="mb-2 text-sm">
              <span className="font-medium">Date:</span> {item.request_date ? new Date(item.request_date).toLocaleDateString() : "Not specified"}
            </div>
            {item.request_time && (
              <div className="mb-2 text-sm">
                <span className="font-medium">Time:</span> {item.request_time}
              </div>
            )}
            {item.excuse_reason && (
              <div className="mb-2 text-sm">
                <span className="font-medium">Reason:</span> {item.excuse_reason}
              </div>
            )}
            {item.status === "Rejected" && item.admin_notes && (
              <div className="text-sm">
                <span className="font-medium">Decline Reason:</span> {item.admin_notes}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => onEditApproval(item)}
              variant="outline"
              size="sm"
              className={`text-sm ${
                item.status === "Approved"
                  ? "border-red-600 text-red-600 hover:bg-red-50"
                  : "border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              {item.status === "Approved" ? "Mark as Rejected" : "Mark as Approved"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
