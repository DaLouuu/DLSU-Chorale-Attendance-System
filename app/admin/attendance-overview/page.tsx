"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, ClipboardCheck, Clock, UserCheck, UserX, AlertCircle, List, Grid3X3, ChevronDown } from "lucide-react"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function AttendanceOverviewPage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch attendance and excuse data from Supabase
  useEffect(() => {
    async function fetchAttendanceData() {
      setLoading(true);
      const supabase = (await import("@/utils/supabase/client")).createClient();

      // Fetch attendance logs with profile info
      const { data: logs, error: logsError } = await supabase
        .from("attendance_logs")
        .select("*, profiles(first_name, last_name, section)");

      // Fetch excuse requests with profile info
      const { data: excuses, error: excusesError } = await supabase
        .from("excuse_requests")
        .select("*, profiles(first_name, last_name, section)");

      if (logsError || excusesError) {
        setAttendanceData([]);
        setErrorMessage(
          logsError?.message || excusesError?.message || "Failed to retrieve attendance data from the database."
        );
        setLoading(false);
        return;
      }

      // Present: attendance_logs with log_status On-time/Late
      const present = logs
        .filter(log => log.log_status === "On-time" || log.log_status === "Late")
        .map(log => ({
          id: log.account_id_fk,
          name: `${log.profiles?.first_name || ""} ${log.profiles?.last_name || ""}`.trim(),
          voiceSection: log.profiles?.section || "",
          status: "present",
          attendanceType: log.log_status === "Late" ? "late" : "on-time",
          time: log.created_at,
          notes: ""
        }));

      // Present: excuse_requests with excuse_type "Step Out"
      const stepOut = excuses
        .filter(excuse => excuse.excuse_type === "Step Out")
        .map(excuse => ({
          id: excuse.account_id_fk,
          name: `${excuse.profiles?.first_name || ""} ${excuse.profiles?.last_name || ""}`.trim(),
          voiceSection: excuse.profiles?.section || "",
          status: "present",
          attendanceType: "stepping-out",
          time: excuse.request_time,
          notes: excuse.excuse_reason || excuse.admin_notes || ""
        }));

      // Excused absences: excuse_requests with excuse_type "Absence"
      const excused = excuses
        .filter(excuse => excuse.excuse_type === "Absence")
        .map(excuse => ({
          id: excuse.account_id_fk,
          name: `${excuse.profiles?.first_name || ""} ${excuse.profiles?.last_name || ""}`.trim(),
          voiceSection: excuse.profiles?.section || "",
          status: "absent",
          attendanceType: "excused",
          reason: excuse.excuse_reason || excuse.admin_notes || "",
          notes: excuse.admin_notes || ""
        }));

      // Unexcused: attendance_logs with no excuse and log time after 18:30
      const unexcused = logs
        .filter(log => {
          // Check if member has no excuse for this date
          const hasExcuse = excuses.some(excuse => excuse.account_id_fk === log.account_id_fk && excuse.request_date === log.created_at?.slice(0, 10));
          // Parse created_at time and check if later than 18:30
          const logTime = log.created_at ? parseInt(log.created_at.slice(11, 16).replace(":", "")) : 0;
          return !hasExcuse && logTime > 1830;
        })
        .map(log => ({
          id: log.account_id_fk,
          name: `${log.profiles?.first_name || ""} ${log.profiles?.last_name || ""}`.trim(),
          voiceSection: log.profiles?.section || "",
          status: "absent",
          attendanceType: "unexcused",
          reason: "No valid excuse",
          notes: ""
        }));

      setAttendanceData([...present, ...stepOut, ...excused, ...unexcused]);
      setLoading(false);
    }
    fetchAttendanceData();
  }, []);
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentWeek, setCurrentWeek] = useState(
    eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
    }),
  )
  const [activeVoice, setActiveVoice] = useState("all")
  const [activeTab, setActiveTab] = useState("present")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)

  // Update week when navigating
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(prev => {
        const newStartDate = new Date(prev[0])
        newStartDate.setDate(newStartDate.getDate() - 7)
        const newEndDate = new Date(prev[6])
        newEndDate.setDate(newEndDate.getDate() - 7)
        return eachDayOfInterval({
          start: newStartDate,
          end: newEndDate,
        })
      })
    } else {
      setCurrentWeek(prev => {
        const newStartDate = new Date(prev[0])
        newStartDate.setDate(newStartDate.getDate() + 7)
        const newEndDate = new Date(prev[6])
        newEndDate.setDate(newEndDate.getDate() + 7)
        return eachDayOfInterval({
          start: newStartDate,
          end: newEndDate,
        })
      })
    }
  }

  // Sort members by voice section (SATB order) then by section number, then by surname
  const sortMembers = (members: typeof attendanceData) => {
    const voiceOrder = { soprano: 1, alto: 2, tenor: 3, bass: 4 }
    
    return members.sort((a, b) => {
      // First sort by voice section (SATB order)
      const voiceDiff = voiceOrder[a.voiceSection as keyof typeof voiceOrder] - voiceOrder[b.voiceSection as keyof typeof voiceOrder]
      if (voiceDiff !== 0) return voiceDiff
      
      // Then sort by section number (1 comes before 2)
      const aSectionNum = parseInt(a.voiceNumber) || 0
      const bSectionNum = parseInt(b.voiceNumber) || 0
      if (aSectionNum !== bSectionNum) return aSectionNum - bSectionNum
      
      // Finally sort by surname (last name)
      const aSurname = a.name.split(' ').pop() || ''
      const bSurname = b.name.split(' ').pop() || ''
      return aSurname.localeCompare(bSurname)
    })
  }

  // Get attendance data for the selected date and filter by voice section
  const getFilteredAttendance = () => {
    const filtered = attendanceData.filter(
      (member) => activeVoice === "all" || member.voiceSection === activeVoice
    )
    return sortMembers(filtered)
  }

  // Get attendance data by status
  const getAttendanceByStatus = (status: string) => {
    const filtered = getFilteredAttendance()
    if (status === "present") {
      return sortMembers(filtered.filter(member => member.status === "present"))
    } else if (status === "excused") {
      return sortMembers(filtered.filter(member => member.status === "absent" && member.attendanceType === "excused"))
    } else if (status === "unexcused") {
      return sortMembers(filtered.filter(member => member.status === "absent" && member.attendanceType === "unexcused"))
    }
    return []
  }

  // Get actual attendance count for a given day
  const getAttendanceCountForDay = (day: Date) => {
    // Only count present members for the given day
    const dayStr = format(day, "yyyy-MM-dd");
    return attendanceData.filter(
      (member) => member.status === "present" && member.time && member.time.slice(0, 10) === dayStr
    ).length;
  }

  // Get status badge color and text
  const getStatusBadge = (attendanceType: string) => {
    switch (attendanceType) {
      case "on-time":
        return { color: "bg-green-500", text: "On Time" }
      case "late":
        return { color: "bg-yellow-500", text: "Late" }
      case "stepping-out":
        return { color: "bg-blue-500", text: "Stepping Out" }
      case "left-early":
        return { color: "bg-orange-500", text: "Left Early" }
      case "excused":
        return { color: "bg-purple-500", text: "Excused" }
      case "unexcused":
        return { color: "bg-red-500", text: "Unexcused" }
      case "unexcused-late":
        return { color: "bg-red-600", text: "Unexcused Late" }
      default:
        return { color: "bg-gray-500", text: "Unknown" }
    }
  }

  // Get day abbreviation
  const getDayAbbreviation = (day: Date) => {
    const dayNames = ["S", "M", "T", "W", "Th", "F", "S"]
    return dayNames[day.getDay()]
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="attendance" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-center font-medium">
                <span>Supabase Error: </span>{errorMessage}
              </div>
            )}
            {/* Page title */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#136c37] md:text-3xl">Group Attendance</h1>

              <Button asChild className="bg-[#136c37] hover:bg-[#136c37]/90 text-white">
                <Link href="/manage-paalams">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Manage Paalams
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Attendance Analytics */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900">Attendance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Year and Month Dropdowns */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <DropdownMenu open={yearDropdownOpen} onOpenChange={setYearDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-between bg-white border-gray-300 hover:bg-gray-50 ${
                                yearDropdownOpen ? "border-[#136c37] ring-2 ring-[#136c37] ring-opacity-20" : ""
                              }`}
                            >
                              <span>2025</span>
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[120px]">
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              2025
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              2024
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              2023
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <DropdownMenu open={monthDropdownOpen} onOpenChange={setMonthDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-between bg-white border-gray-300 hover:bg-gray-50 ${
                                monthDropdownOpen ? "border-[#136c37] ring-2 ring-[#136c37] ring-opacity-20" : ""
                              }`}
                            >
                              <span>August</span>
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[120px]">
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              August
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              July
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              June
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              May
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              April
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              March
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              February
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {}}
                              className="cursor-pointer"
                            >
                              January
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                      {/* Accurate Average Attendance */}
                      {(() => {
                        // Get unique member IDs
                        const memberIds = Array.from(new Set(attendanceData.map(m => m.id)));
                        const totalMembers = memberIds.length;
                        const presentCount = attendanceData.filter(m => m.status === "present").length;
                        const absentCount = attendanceData.filter(m => m.status === "absent").length;
                        const avgAttendance = totalMembers > 0 ? ((presentCount / totalMembers) * 100).toFixed(1) : "0";
                        const avgAbsence = totalMembers > 0 ? ((absentCount / totalMembers) * 100).toFixed(1) : "0";
                        // Section with most issues (unexcused absences)
                        const sectionIssues: Record<string, number> = {};
                        attendanceData.forEach(m => {
                          if (m.attendanceType === "unexcused") {
                            sectionIssues[m.voiceSection] = (sectionIssues[m.voiceSection] || 0) + 1;
                          }
                        });
                        const mostIssuesSection = Object.entries(sectionIssues).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
                        const mostIssuesCount = Object.entries(sectionIssues).sort((a, b) => b[1] - a[1])[0]?.[1] || 0;
                        // Quick stats
                        // If you have a members table, replace with actual count
                        const rehearsalsThisMonth = 12; // Placeholder, replace with actual count if available
                        return (
                          <>
                            {/* Average Attendance */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-800">Average Member Attendance</p>
                                  <p className="text-2xl font-bold text-green-600">{avgAttendance}%</p>
                                  <p className="text-xs text-green-600">{presentCount} out of {totalMembers} members</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-full">
                                  <UserCheck className="h-6 w-6 text-green-600" />
                                </div>
                              </div>
                            </div>
                            {/* Average Absence */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-red-800">Average Member Absence</p>
                                  <p className="text-2xl font-bold text-red-600">{avgAbsence}%</p>
                                  <p className="text-xs text-red-600">{absentCount} out of {totalMembers} members</p>
                                </div>
                                <div className="bg-red-100 p-2 rounded-full">
                                  <UserX className="h-6 w-6 text-red-600" />
                                </div>
                              </div>
                            </div>
                            {/* Section with Most Issues */}
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Section with Most Issues</p>
                                  <p className="text-lg font-bold text-amber-600">{mostIssuesSection}</p>
                                  <p className="text-xs text-amber-600">Unexcused Absences: {mostIssuesCount}</p>
                                  <p className="text-xs text-amber-600">Total issues: {mostIssuesCount}</p>
                                </div>
                                <div className="bg-amber-100 p-2 rounded-full">
                                  <AlertCircle className="h-6 w-6 text-amber-600" />
                                </div>
                              </div>
                            </div>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-xs font-medium text-blue-800">Total Members</p>
                                <p className="text-lg font-bold text-blue-600">{totalMembers}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <p className="text-xs font-medium text-purple-800">Rehearsals This Month</p>
                                <p className="text-lg font-bold text-purple-600">{rehearsalsThisMonth}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Calendar and Attendance List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Attendance Overview Panel */}
                <Card className="shadow-md border-gray-200">
                  {/* Calendar Navigation */}
                  <div className="px-4 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek("prev")}
                        className="rounded-full hover:bg-gray-200"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>

                      <span className="text-sm font-medium text-gray-600">{format(currentWeek[0], "MMM yyyy")}</span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek("next")}
                        className="rounded-full hover:bg-gray-200"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-6">
                      {currentWeek.map((day) => {
                        const isSelected = isSameDay(day, selectedDate)
                        const isToday = isSameDay(day, today)
                        const attendanceCount = getAttendanceCountForDay(day)

                        return (
                          <Button
                            key={day.toString()}
                            variant="outline"
                            className={`
                              flex flex-col items-center justify-center p-2 h-auto aspect-square relative
                              ${isSelected ? "bg-[#136c37] text-white hover:bg-[#136c37] hover:text-white" : ""}
                              ${isToday && !isSelected ? "border-[#136c37] border-2" : ""}
                              ${isToday && isSelected ? "bg-[#136c37] text-white hover:bg-[#136c37] hover:text-white" : ""}
                            `}
                            onClick={() => setSelectedDate(day)}
                          >
                            <span className="text-xs font-medium">{getDayAbbreviation(day)}</span>
                            <span className="text-lg font-bold">{format(day, "d")}</span>
                            {isToday && (
                              <span className="absolute top-1 right-1 text-[10px] font-medium px-1 rounded-sm bg-white text-[#136c37]">
                                Today
                              </span>
                            )}
                            <Badge
                              className={`mt-1 text-xs ${isSelected ? "bg-white text-[#136c37]" : "bg-[#136c37] text-white"}`}
                            >
                              {attendanceCount}
                            </Badge>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Attendance Overview Title */}
                  <div className="px-4 pt-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {format(selectedDate, "MMMM d, yyyy")} - Attendance Overview
                    </h2>
                  </div>

                  {/* Voice Filter */}
                  <div className="px-4 pt-4">
                    {/* Desktop: Tabs */}
                    <div className="hidden sm:block">
                      <Tabs defaultValue="all" value={activeVoice} onValueChange={setActiveVoice}>
                        <TabsList className="grid grid-cols-5 w-full bg-gray-100 p-1 rounded-lg">
                          <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-[#136c37] data-[state=active]:text-white"
                          >
                            All
                          </TabsTrigger>
                          <TabsTrigger
                            value="soprano"
                            className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                          >
                            Soprano
                          </TabsTrigger>
                          <TabsTrigger
                            value="alto"
                            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                          >
                            Alto
                          </TabsTrigger>
                          <TabsTrigger
                            value="tenor"
                            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                          >
                            Tenor
                          </TabsTrigger>
                          <TabsTrigger
                            value="bass"
                            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                          >
                            Bass
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Mobile: Dropdown */}
                    <div className="sm:hidden">
                      <DropdownMenu open={voiceDropdownOpen} onOpenChange={setVoiceDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between bg-white border-gray-300 hover:bg-gray-50 ${
                              voiceDropdownOpen ? "border-[#136c37] ring-2 ring-[#136c37] ring-opacity-20" : ""
                            }`}
                          >
                            <span className="capitalize">
                              {activeVoice === "all" ? "All Voice Sections" : `${activeVoice} ${activeVoice !== "all" ? "Section" : ""}`}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px]">
                          <DropdownMenuItem
                            onClick={() => setActiveVoice("all")}
                            className="cursor-pointer"
                          >
                            All Voice Sections
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setActiveVoice("soprano")}
                            className="cursor-pointer"
                          >
                            Soprano Section
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setActiveVoice("alto")}
                            className="cursor-pointer"
                          >
                            Alto Section
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setActiveVoice("tenor")}
                            className="cursor-pointer"
                          >
                            Tenor Section
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setActiveVoice("bass")}
                            className="cursor-pointer"
                          >
                            Bass Section
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Attendance Status Tabs and View Toggle */}
                  <div className="px-4 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Attendance Status Tabs - Takes remaining width */}
                      <div className="flex-1">
                        {/* Desktop: Tabs */}
                        <div className="hidden sm:block">
                          <Tabs defaultValue="present" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-3 w-full bg-gray-100 p-1 rounded-lg">
                              <TabsTrigger
                                value="present"
                                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Present
                              </TabsTrigger>
                              <TabsTrigger
                                value="excused"
                                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Excused
                              </TabsTrigger>
                              <TabsTrigger
                                value="unexcused"
                                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Unexcused
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        {/* Mobile: Dropdown */}
                        <div className="sm:hidden">
                          <DropdownMenu open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-between bg-white border-gray-300 hover:bg-gray-50 ${
                                  statusDropdownOpen ? "border-[#136c37] ring-2 ring-[#136c37] ring-opacity-20" : ""
                                }`}
                              >
                                <span className="flex items-center">
                                  {activeTab === "present" && <UserCheck className="w-4 h-4 mr-2" />}
                                  {activeTab === "excused" && <AlertCircle className="w-4 h-4 mr-2" />}
                                  {activeTab === "unexcused" && <UserX className="w-4 h-4 mr-2" />}
                                  {activeTab === "present" ? "Present" : activeTab === "excused" ? "Excused" : "Unexcused"}
                                </span>
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full min-w-[200px]">
                              <DropdownMenuItem
                                onClick={() => setActiveTab("present")}
                                className="cursor-pointer"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Present
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setActiveTab("excused")}
                                className="cursor-pointer"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Excused
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setActiveTab("unexcused")}
                                className="cursor-pointer"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Unexcused
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* View Toggle - Fixed width on the right */}
                      <DropdownMenu open={viewDropdownOpen} onOpenChange={setViewDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 px-3 py-1 bg-white border-gray-300 hover:bg-gray-50 ${
                              viewDropdownOpen ? "border-[#136c37] ring-2 ring-[#136c37] ring-opacity-20" : ""
                            }`}
                          >
                            {viewMode === "cards" ? (
                              <Grid3X3 className="w-4 h-4" />
                            ) : (
                              <List className="w-4 h-4" />
                            )}
                            <ChevronDown className="w-3 h-3 ml-2 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => setViewMode("cards")}
                            className="cursor-pointer"
                            title="View attendance data as compact cards in a grid layout"
                          >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            View as cards
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setViewMode("list")}
                            className="cursor-pointer"
                            title="View attendance data as a structured table with columns"
                          >
                            <List className="w-4 h-4 mr-2" />
                            View as a list
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Attendance List */}
                  <CardContent className="pt-4">
                    {getAttendanceByStatus(activeTab).length > 0 ? (
                      viewMode === "cards" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getAttendanceByStatus(activeTab).map((member) => {
                            const statusBadge = getStatusBadge(member.attendanceType)
                            return (
                              <div
                                key={member.id}
                                className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 transition-shadow"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src="/images/profile-1.jpg" alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{member.name}</h3>
                                    <div className="text-xs text-gray-500 capitalize">
                                      {member.voiceSection} {member.voiceNumber}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {member.time && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {member.time}
                                    </div>
                                  )}
                                  {member.etd && (
                                    <div className="text-xs text-orange-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      ETD: {member.etd}
                                    </div>
                                  )}
                                  {member.reason && (
                                    <div className="text-xs text-gray-600 line-clamp-2">
                                      {member.reason}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-gray-100">
                                  <Badge className={`${statusBadge.color} text-xs`}>
                                    {statusBadge.text}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {/* Desktop: Full width table */}
                          <div className="hidden lg:block">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200">Voice</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200">Arrival</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200">ETD</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200">Reason/Notes</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {getAttendanceByStatus(activeTab).map((member) => {
                                  const statusBadge = getStatusBadge(member.attendanceType)
                                  return (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{member.name}</td>
                                      <td className="px-4 py-3 text-xs text-gray-600 capitalize border-r border-gray-200">
                                        {member.voiceSection} {member.voiceNumber}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-200">
                                        {member.time || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-200">
                                        {member.etd || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-200 max-w-[150px] truncate">
                                        {member.reason || member.notes || "-"}
                                      </td>
                                      <td className="px-4 py-3 text-xs">
                                        <Badge className={`${statusBadge.color} text-xs px-2 py-1`}>
                                          {statusBadge.text}
                                        </Badge>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile/Tablet: Horizontally scrollable table */}
                          <div className="lg:hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-[800px]">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Voice</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Arrival</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">ETD</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Reason/Notes</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {getAttendanceByStatus(activeTab).map((member) => {
                                    const statusBadge = getStatusBadge(member.attendanceType)
                                    return (
                                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">{member.name}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 capitalize border-r border-gray-200 whitespace-nowrap">
                                          {member.voiceSection} {member.voiceNumber}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-200 whitespace-nowrap">
                                          {member.time || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-200 whitespace-nowrap">
                                          {member.etd || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 border-r border-gray-200 max-w-[150px] truncate whitespace-nowrap">
                                          {member.reason || member.notes || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                          <Badge className={`${statusBadge.color} text-xs px-2 py-1`}>
                                            {statusBadge.text}
                                          </Badge>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>No {activeTab} members for this date.</p>
                      </div>
                    )}

                    {getAttendanceByStatus(activeTab).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 text-center text-sm text-gray-500">
                        End of List
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
