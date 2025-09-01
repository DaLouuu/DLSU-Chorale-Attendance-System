"use client"

import { useState } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, UserCheck, List, Grid3X3, ChevronDown, Plus, FileText } from "lucide-react"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AttendanceExcuseForm } from "@/components/attendance/excuse-form"
import { useUserRole } from "@/hooks/use-user-role"
import { ExcuseApprovalContent } from "@/components/excuse/excuse-approval-content"


// Mock excuse data for calendar view
const mockExcuseData = [
  {
    id: "1",
    date: "2025-01-20",
    count: 3,
    pending: 2,
    approved: 1
  },
  {
    id: "2",
    date: "2025-01-21",
    count: 5,
    pending: 3,
    approved: 2
  },
  {
    id: "3",
    date: "2025-01-22",
    count: 2,
    pending: 1,
    approved: 1
  },
  {
    id: "4",
    date: "2025-01-23",
    count: 7,
    pending: 4,
    approved: 3
  },
  {
    id: "5",
    date: "2025-01-24",
    count: 1,
    pending: 0,
    approved: 1
  },
  {
    id: "6",
    date: "2025-01-25",
    count: 4,
    pending: 2,
    approved: 2
  },
  {
    id: "7",
    date: "2025-01-26",
    count: 0,
    pending: 0,
    approved: 0
  }
]

export default function ManagePaalamsPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentWeek, setCurrentWeek] = useState(
    eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
    }),
  )
  const [activeTab, setActiveTab] = useState("pending")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [isApprovalView, setIsApprovalView] = useState(true)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const { userRole, isHRMember, loading } = useUserRole()

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

  // Get excuse count for a specific day
  const getExcuseCountForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const dayData = mockExcuseData.find(item => item.date === dateStr)
    return dayData || { count: 0, pending: 0, approved: 0 }
  }

  // Get day abbreviation
  const getDayAbbreviation = (day: Date) => {
    const dayNames = ["S", "M", "T", "W", "Th", "F", "S"]
    return dayNames[day.getDay()]
  }

  // Check if user should see the toggle (admins or HR members only)
  const shouldShowToggle = () => {
    if (!userRole) return false
    if (userRole === "Not Applicable") return false
    if (userRole === "Executive Board" || userRole === "Company Manager" || userRole === "Associate Company Manager" || userRole === "Conductor") return true
    // For regular members, only show toggle if they're in HR committee
    if (isHRMember) return true
    return false
  }

  // Don't render until we know the user's role
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col">
          <AuthenticatedHeader currentPage="excuse-form" />
          <main className="flex-1 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#136c37] border-t-transparent"></div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="excuse-form" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            {/* Page title and controls */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#136c37] md:text-3xl">Manage Paalams</h1>

              <div className="flex items-center gap-4">
                {/* Role-based toggle for approval view vs personal view */}
                {shouldShowToggle() && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="view-mode"
                      checked={isApprovalView}
                      onCheckedChange={setIsApprovalView}
                    />
                    <Label htmlFor="view-mode" className="text-sm font-medium">
                      {isApprovalView ? "Approval View" : "My Paalams"}
                    </Label>
                  </div>
                )}

                {/* Submit Paalam Button */}
                <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#136c37] hover:bg-[#136c37]/90 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit a Paalam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Submit a Paalam</DialogTitle>
                    </DialogHeader>
                    <AttendanceExcuseForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Paalam Analytics */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-md border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900">Paalam Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Statistics */}
                    <div className="space-y-4">
                      {/* Total Paalams This Week */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">Total Paalams This Week</p>
                            <p className="text-2xl font-bold text-blue-600">22</p>
                            <p className="text-xs text-blue-600">Across all days</p>
                          </div>
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* Pending Approvals */}
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Pending Approvals</p>
                            <p className="text-2xl font-bold text-yellow-600">12</p>
                            <p className="text-xs text-yellow-600">Awaiting review</p>
                          </div>
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </div>

                      {/* Approved This Week */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Approved This Week</p>
                            <p className="text-2xl font-bold text-green-600">10</p>
                            <p className="text-xs text-green-600">Successfully processed</p>
                          </div>
                          <div className="bg-green-100 p-2 rounded-full">
                            <UserCheck className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-800">Today&apos;s Paalams</p>
                          <p className="text-lg font-bold text-purple-600">3</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <p className="text-xs font-medium text-orange-800">This Month</p>
                          <p className="text-lg font-bold text-orange-600">89</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Calendar and Paalam List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Paalam Overview Panel */}
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
                        const excuseCount = getExcuseCountForDay(day)

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
                            {excuseCount.count > 0 && (
                              <div className="mt-1 space-y-1">
                                <Badge
                                  className={`text-xs ${isSelected ? "bg-white text-[#136c37]" : "bg-[#136c37] text-white"}`}
                                >
                                  {excuseCount.count}
                                </Badge>
                                {excuseCount.pending > 0 && (
                                  <Badge
                                    className={`text-xs ${isSelected ? "bg-yellow-500 text-white" : "bg-yellow-500 text-white"}`}
                                  >
                                    {excuseCount.pending} P
                                  </Badge>
                                )}
                              </div>
                            )}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Paalam Overview Title */}
                  <div className="px-4 pt-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {format(selectedDate, "MMMM d, yyyy")} - {isApprovalView ? "Paalam Approvals" : "My Paalams"}
                    </h2>
                  </div>

                  {/* View Toggle */}
                  <div className="px-4 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 py-1 bg-white border-gray-300 hover:bg-gray-50"
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
                          >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            View as cards
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setViewMode("list")}
                            className="cursor-pointer"
                          >
                            <List className="w-4 h-4 mr-2" />
                            View as a list
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Paalam Content */}
                  <CardContent className="pt-4">
                    {isApprovalView ? (
                      <ExcuseApprovalContent />
                    ) : (
                      <div className="space-y-4">
                        {/* Tabs for Pending and Approved */}
                        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="grid grid-cols-2 w-full bg-gray-100 p-1 rounded-lg">
                            <TabsTrigger
                              value="pending"
                              className="data-[state=active]:bg-[#136c37] data-[state=active]:text-white"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Pending
                            </TabsTrigger>
                            <TabsTrigger
                              value="approved"
                              className="data-[state=active]:bg-[#136c37] data-[state=active]:text-white"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approved
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>

                        {/* Content based on active tab */}
                        <div className="py-8 text-center text-gray-500">
                          {activeTab === "pending" ? (
                            <div>
                              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>No pending paalams for this date.</p>
                            </div>
                          ) : (
                            <div>
                              <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>No approved paalams for this date.</p>
                            </div>
                          )}
                        </div>
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
