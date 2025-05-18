"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar"
import { AttendanceFilter } from "@/components/attendance/attendance-filter"
import { AttendanceSummary } from "@/components/attendance/attendance-summary"
import { mockAttendanceData } from "@/lib/mock-data"
import type { AttendanceRecord, AttendanceType } from "@/types/attendance"

export function AttendanceDashboard() {
  const [filter, setFilter] = useState<AttendanceType | "all">("all")
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(mockAttendanceData)

  // Filter attendance data based on selected filter
  const filteredData = attendanceData.filter((record) => {
    if (filter === "all") return true
    return record.type === filter
  })

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <div className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Attendance</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
            <AttendanceFilter currentFilter={filter} onFilterChange={setFilter} />
            <AttendanceCalendar attendanceData={filteredData} />
            <AttendanceSummary attendanceData={filteredData} />
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  )
}
