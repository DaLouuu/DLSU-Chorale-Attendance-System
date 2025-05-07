"use client"

import { HistoryCard } from "@/components/excuse/history-card"
import type { HistoryItem } from "@/types/excuse"

interface HistoryListProps {
  historyItems: HistoryItem[]
  onEditApproval: (id: string) => void
}

export function HistoryList({ historyItems, onEditApproval }: HistoryListProps) {
  if (historyItems.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No history items to display.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {historyItems.map((item) => (
        <HistoryCard key={item.id} historyItem={item} onEditApproval={() => onEditApproval(item.id)} />
      ))}
    </div>
  )
}
