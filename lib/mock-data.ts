import { addDays, subDays } from "date-fns"
import type { AttendanceRecord } from "@/types/attendance"

// Generate dates relative to current date
const today = new Date()
const yesterday = subDays(today, 1)
const twoDaysAgo = subDays(today, 2)
const threeDaysAgo = subDays(today, 3)
const fourDaysAgo = subDays(today, 4)
const fiveDaysAgo = subDays(today, 5)
const sixDaysAgo = subDays(today, 6)
const oneWeekAgo = subDays(today, 7)
const twoWeeksAgo = subDays(today, 14)
const threeWeeksAgo = subDays(today, 21)
const tomorrow = addDays(today, 1)
const dayAfterTomorrow = addDays(today, 2)

export const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    date: threeWeeksAgo,
    type: "rehearsal",
    status: "present",
    notes: "Regular weekly rehearsal",
  },
  {
    id: "2",
    date: twoWeeksAgo,
    type: "rehearsal",
    status: "late",
    notes: "Arrived 15 minutes late due to traffic",
  },
  {
    id: "3",
    date: oneWeekAgo,
    type: "performance",
    status: "present",
    notes: "University event performance",
  },
  {
    id: "4",
    date: sixDaysAgo,
    type: "rehearsal",
    status: "absent",
    notes: "Sick leave",
  },
  {
    id: "5",
    date: fiveDaysAgo,
    type: "rehearsal",
    status: "present",
    notes: "Regular weekly rehearsal",
  },
  {
    id: "6",
    date: fourDaysAgo,
    type: "performance",
    status: "present",
    notes: "Community outreach performance",
  },
  {
    id: "7",
    date: threeDaysAgo,
    type: "rehearsal",
    status: "late",
    notes: "Arrived 10 minutes late",
  },
  {
    id: "8",
    date: twoDaysAgo,
    type: "rehearsal",
    status: "present",
    notes: "Regular weekly rehearsal",
  },
  {
    id: "9",
    date: yesterday,
    type: "rehearsal",
    status: "present",
    notes: "Sectional practice",
  },
  {
    id: "10",
    date: today,
    type: "performance",
    status: "present",
    notes: "University event performance",
  },
  {
    id: "11",
    date: tomorrow,
    type: "rehearsal",
    status: "absent",
    notes: "Excused absence - academic conflict",
  },
  {
    id: "12",
    date: dayAfterTomorrow,
    type: "rehearsal",
    status: "present",
    notes: "Regular weekly rehearsal",
  },
]
