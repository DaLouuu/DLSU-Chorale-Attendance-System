"use client"

import { Button } from "@/components/ui/button"
import type { AttendanceType } from "@/types/attendance"

interface AttendanceFilterProps {
  currentFilter: AttendanceType | "all"
  onFilterChange: (filter: AttendanceType | "all") => void
}

export function AttendanceFilter({ currentFilter, onFilterChange }: AttendanceFilterProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Filter by Type</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentFilter === "all" ? "default" : "outline"}
          onClick={() => onFilterChange("all")}
          className={currentFilter === "all" ? "bg-primary text-white" : ""}
        >
          All
        </Button>
        <Button
          variant={currentFilter === "rehearsal" ? "default" : "outline"}
          onClick={() => onFilterChange("rehearsal")}
          className={currentFilter === "rehearsal" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
        >
          Rehearsals Only
        </Button>
        <Button
          variant={currentFilter === "performance" ? "default" : "outline"}
          onClick={() => onFilterChange("performance")}
          className={currentFilter === "performance" ? "bg-purple-600 text-white hover:bg-purple-700" : ""}
        >
          Performances Only
        </Button>
      </div>
    </div>
  )
}
