"use client"

import { ExcuseCard } from "@/components/excuse/excuse-card"
import type { ExcuseItem } from "@/types/excuse"

interface ExcuseListProps {
  excuses: ExcuseItem[]
  onApprove: (id: string) => void
  onDecline: (id: string) => void
}

export function ExcuseList({ excuses, onApprove, onDecline }: ExcuseListProps) {
  if (excuses.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No excuses to display.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {excuses.map((excuse) => (
        <ExcuseCard
          key={excuse.id}
          excuse={excuse}
          onApprove={() => onApprove(excuse.id)}
          onDecline={() => onDecline(excuse.id)}
        />
      ))}
    </div>
  )
}
