"use client"

import { useState, useEffect, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { Plus, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AttendanceExcuseForm } from "@/components/attendance/excuse-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PaalamItem = { 
  request_id: number; 
  request_date: string | null; 
  request_time: string | null; 
  excuse_type: string | null; 
  status: "Pending" | "Approved" | "Rejected"; 
  excuse_reason: string | null 
}

type AttendanceLogItem = {
  log_id: number;
  created_at: string;
  profile_id_fk: string;
  log_method: string;
  log_status: string;
  reh_id_fk: number | null;
  reh_date: string;
  status?: string;
}

type RehearsalItem = {
  rehearsal_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
}

type AttendanceStatus = "present" | "late" | "absent" | "step-out" | "leave-early" | "unexcused" | "excused";

type RehearsalDetailsItem = {
  reh_id: number;
  created_at: string;
  reh_date: string;
  reh_time: string;
  reh_name: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  rehearsal_date: string;
}

interface IndividualAttendanceOverviewProps {
  userId: string;
}

function PaalamsSectionCard({ userId }: { userId: string }) {
  const [myPaalams, setMyPaalams] = useState<PaalamItem[]>([])
  const [activePaalamTab, setActivePaalamTab] = useState<"pending" | "approved">("pending")

  useEffect(() => {
    async function fetchPaalams() {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setMyPaalams([])
        return
      }
      const { data: excuses } = await supabase
        .from("excuse_requests")
        .select("request_id, request_date, request_time, excuse_type, status, excuse_reason")
        .eq("profile_id_fk", session.user.id)
        .order("created_at", { ascending: false })
      setMyPaalams(excuses || [])
    }
    fetchPaalams()
  }, [userId])

  return (
    <Card className="shadow-md border-gray-200 h-full flex flex-col">
      {myPaalams.length > 0 ? (
        <CardHeader className="bg-gray-100 rounded-t-lg pb-3 flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#136c37] text-left">My Paalams</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#136c37] hover:bg-[#136c37]/90 text-white">
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
        </CardHeader>
      ) : (
        <CardHeader className="bg-gray-100 rounded-t-lg pb-3">
          <CardTitle className="text-xl font-bold text-[#136c37] text-left">My Paalams</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4 flex-1 flex flex-col">
        {myPaalams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-gray-500 mb-6">No paalams made yet.</p>
            <Dialog>
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
        ) : (
          <div className="flex-1 flex flex-col">
            <Tabs value={activePaalamTab} onValueChange={(v) => setActivePaalamTab(v as "pending" | "approved")}>
              <TabsList className="grid grid-cols-2 w-full bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#136c37] data-[state=active]:text-white">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-[#136c37] data-[state=active]:text-white">Approved</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
              {(activePaalamTab === "pending" ? myPaalams.filter(p => p.status === "Pending") : myPaalams.filter(p => p.status === "Approved")).map((p) => (
                <div key={p.request_id} className="p-4 rounded-lg border border-gray-200 bg-white flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.excuse_type || "Paalam"}</p>
                    <p className="text-xs text-gray-600">{p.request_date || ""} {p.request_time || ""}</p>
                    {p.excuse_reason && (<p className="text-xs text-gray-500 mt-1">{p.excuse_reason}</p>)}
                  </div>
                  <Badge className={`${p.status === "Pending" ? "bg-amber-500" : "bg-green-600"} text-white text-xs`}>{p.status}</Badge>
                </div>
              ))}
              {(activePaalamTab === "pending" ? myPaalams.filter(p => p.status === "Pending").length === 0 : myPaalams.filter(p => p.status === "Approved").length === 0) && (
                <div className="py-8 text-center text-gray-500">No {activePaalamTab} paalams.</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function IndividualAttendanceOverview({ userId }: IndividualAttendanceOverviewProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(today);
  const [rehearsalDetails, setRehearsalDetails] = useState<RehearsalDetailsItem | null>(null);
  const [rehearsals, setRehearsals] = useState<RehearsalItem[]>([]);
  const [excuseRequests, setExcuseRequests] = useState<PaalamItem[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceLogItem[]>([]);

  // Generate days for the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Fetch attendance logs for the current user
  useEffect(() => {
    async function fetchAttendance() {
      try {
        const supabase = (await import("@/utils/supabase/client")).createClient();
        const { toast } = await import("@/hooks/use-toast");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setAttendanceData([]);
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view attendance logs. Please login again.",
            variant: "destructive",
          });
          return;
        }
        // Get profile ID
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();
        if (profileError || !profileData) {
          setAttendanceData([]);
          toast({
            title: "Profile Error",
            description: "Could not find your profile information. Please ensure your account is fully set up or contact support.",
            variant: "destructive",
          });
          return;
        }
        // Get attendance logs
        const logs = await supabase.
          from("attendance_logs")
          .select("*")
          .eq("profile_id_fk", profileData.id)
          .order("created_at", { ascending: false });
        if (logs.error || !logs.data) {
          setAttendanceData([]);
          toast({
            title: "Database Error",
            description: `Failed to retrieve attendance logs. ${logs.error?.message || "Unknown error."}`,
            variant: "destructive",
          });
        } else {
          setAttendanceData(logs.data);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData([]);
      }
    }
    fetchAttendance();
  }, [userId]);

  // Fetch excuse requests for the current user
  useEffect(() => {
    async function fetchExcuseRequests() {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setExcuseRequests([]);
        return;
      }
      const { data: excuses } = await supabase
        .from("excuse_requests")
        .select("request_id, request_date, request_time, excuse_type, status, excuse_reason")
        .eq("profile_id_fk", session.user.id)
        .order("created_at", { ascending: false });
      setExcuseRequests(excuses || []);
    }
    fetchExcuseRequests();
  }, [userId]);

  // Fetch rehearsals data
  useEffect(() => {
    async function fetchRehearsals() {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const { data: rehearsalsData, error: rehearsalsError } = await supabase
        .from("rehearsals")
        .select("rehearsal_date, start_time, end_time, notes")
        .order("rehearsal_date", { ascending: true });

      if (rehearsalsError) {
        console.error("Error fetching rehearsals:", rehearsalsError);
      } else {
        setRehearsals(rehearsalsData || []);
      }
    }
    fetchRehearsals();
  }, []);

  // Fetch rehearsal details for selected day
  useEffect(() => {
    async function fetchRehearsalDetails() {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const { data: rehearsals } = await supabase
        .from("rehearsals")
        .select("*")
        .eq("rehearsal_date", format(selectedCalendarDay, "yyyy-MM-dd"))
        .single();
      setRehearsalDetails(rehearsals);
    }
    fetchRehearsalDetails();
  }, [selectedCalendarDay]);

  // Set today as default selected day on initial load
  useEffect(() => {
    setSelectedCalendarDay(today);
  }, [today]);

  // Get attendance status for rehearsal details background
  const getAttendanceStatusForDay = (day: Date): AttendanceStatus => {
    const record = attendanceData.find((item) => {
      return isSameDay(new Date(item.reh_date), day);
    });
    
    // Check if user has a paalam for this day
    const paalam = excuseRequests.find((item) => {
      return item.request_date && isSameDay(new Date(item.request_date), day);
    });
    
    // If no attendance record exists, check if there's an approved paalam
    if (!record) {
      if (paalam && paalam.status === "Approved") {
        if (paalam.excuse_type === "Absence") return "excused";
        if (paalam.excuse_type === "Step Out") return "step-out";
        if (paalam.excuse_type === "Leave Early") return "leave-early";
      }
      // No attendance record and no approved paalam = unexcused absence
      return "unexcused";
    }
    
    // If attendance record exists
    if (record) {
      if (record.log_status === "On-time") return "present";
      if (record.log_status === "Late") return "late";
      return "absent";
    }
    
    return "unexcused";
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className="mx-auto max-w-6xl min-h-screen">
      {/* Desktop Layout: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left Column: Attendance Summary and Paalams */}
        <div className="lg:col-span-1 flex flex-col h-full">
          {/* Attendance Summary */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gray-100 rounded-t-lg pb-3">
              <CardTitle className="text-xl font-bold text-[#136c37] text-left">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <p className="text-green-800 font-medium text-sm">Present</p>
                  <p className="text-xl font-bold text-green-600">
                    {attendanceData.filter((item) => item.log_status === "On-time").length}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg text-center">
                  <p className="text-amber-800 font-medium text-sm">Late</p>
                  <p className="text-xl font-bold text-amber-600">
                    {attendanceData.filter((item) => item.log_status === "Late").length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <p className="text-blue-800 font-medium text-sm">Step Out</p>
                  <p className="text-xl font-bold text-blue-600">
                    {excuseRequests.filter((item) => item.excuse_type === "Step Out" && item.status === "Approved").length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg text-center">
                  <p className="text-orange-800 font-medium text-sm">Leave Early</p>
                  <p className="text-xl font-bold text-orange-600">
                    {excuseRequests.filter((item) => item.excuse_type === "Leave Early" && item.status === "Approved").length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg text-center">
                  <p className="text-purple-800 font-medium text-sm">Absent</p>
                  <p className="text-xl font-bold text-purple-600">
                    {attendanceData.filter((item) => item.log_status === "Late").length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <p className="text-red-800 font-medium text-sm">Unexcused</p>
                  <p className="text-xl font-bold text-red-600">
                    {(() => {
                      // Count rehearsals where user has no attendance record or has late/absent status without approved excuse
                      const unexcusedCount = rehearsals.filter(rehearsal => {
                        const hasAttendance = attendanceData.some(item => 
                          item.reh_date === rehearsal.rehearsal_date
                        );
                        const hasApprovedExcuse = excuseRequests.some(item => 
                          item.request_date === rehearsal.rehearsal_date && item.status === "Approved"
                        );
                        
                        // Count as unexcused if no attendance record OR has late/absent status without approved excuse
                        return !hasAttendance || (hasAttendance && !hasApprovedExcuse);
                      }).length;
                      
                      return unexcusedCount;
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paalams Section */}
          <div className="flex-1 mt-6 h-full">
            <PaalamsSectionCard userId={userId} />
          </div>
        </div>

        {/* Right Column: Calendar and Rehearsal Details */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gray-100 rounded-t-lg pb-3">
              <CardTitle className="text-xl font-bold text-[#136c37] text-left">Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => navigateMonth('prev')} className="text-[#136c37]">
                  &larr; Previous Month
                </Button>

                <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>

                <Button variant="ghost" onClick={() => navigateMonth('next')} className="text-[#136c37]">
                  Next Month &rarr;
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 h-80">
                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="p-2 h-12"></div>
                ))}

                                        {/* Days of the month */}
                        {daysInMonth.map((day) => {
                          const status = getAttendanceStatusForDay(day)
                          const isToday = isSameDay(day, today)
                          const isSelected = isSameDay(day, selectedCalendarDay)

                          // Get background color based on status
                          const getDayBackgroundColor = () => {
                            // Check if this day is a rehearsal day
                            const isRehearsalDay = rehearsals.some(rehearsal => 
                              rehearsal.rehearsal_date === format(day, "yyyy-MM-dd")
                            )
                            
                            if (isSelected) {
                              if (isRehearsalDay) {
                                // Use solid colors for rehearsal days when selected
                                switch (status) {
                                  case "present": return "bg-green-600 text-white"
                                  case "late": return "bg-amber-600 text-white"
                                  case "absent": return "bg-purple-600 text-white"
                                  case "step-out": return "bg-blue-600 text-white"
                                  case "leave-early": return "bg-orange-600 text-white"
                                  case "unexcused": return "bg-red-600 text-white"
                                  default: return "bg-[#136c37] text-white"
                                }
                              } else {
                                // Default dark green for non-rehearsal days when selected
                                return "bg-[#136c37] text-white"
                              }
                            }
                            
                            if (isToday) return "border-[#09331f] border-2 hover:bg-green-50"
                            
                            // Only show status colors for rehearsal days
                            if (!isRehearsalDay) {
                              return "border-gray-200 hover:bg-green-50"
                            }
                            
                            switch (status) {
                              case "present": return "bg-green-50 border-green-200 hover:bg-green-100"
                              case "late": return "bg-amber-50 border-amber-200 hover:bg-amber-100"
                              case "absent": return "bg-purple-50 border-purple-200 hover:bg-purple-100"
                              case "step-out": return "bg-blue-50 border-blue-200 hover:bg-blue-100"
                              case "leave-early": return "bg-orange-50 border-orange-200 hover:bg-orange-100"
                              case "unexcused": return "bg-red-50 border-red-200 hover:bg-red-100"
                              default: return "border-gray-200 hover:bg-green-50"
                            }
                          }

                          return (
                            <button
                              key={day.toString()}
                              onClick={() => setSelectedCalendarDay(day)}
                              className={`p-2 h-12 rounded-md border flex flex-col items-center justify-center relative transition-all ${getDayBackgroundColor()}`}
                            >
                              <span className={`text-sm ${isSelected ? "text-white" : ""}`}>{format(day, "d")}</span>
                              {isToday && !isSelected && (
                                <span className="absolute top-1 right-1 text-[10px] font-medium px-1 rounded-sm bg-white text-[#136c37]">
                                  Today
                                </span>
                              )}
                            </button>
                          )
                        })}

                {/* Empty cells for days after the end of the month */}
                {Array.from({ length: 6 - daysInMonth[daysInMonth.length - 1].getDay() }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="p-2 h-12"></div>
                ))}
              </div>
            </CardContent>
          </Card>

                    {/* Rehearsal Details Section */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-md min-h-[200px] flex items-center justify-center">
            {rehearsalDetails ? (
              <div className={`p-4 rounded-lg border w-full ${
                (() => {
                  const status = getAttendanceStatusForDay(selectedCalendarDay);
                  switch (status) {
                    case "present": return "bg-green-50 border-green-200";
                    case "late": return "bg-amber-50 border-amber-200";
                    case "absent": return "bg-purple-50 border-purple-200";
                    case "step-out": return "bg-blue-50 border-blue-200";
                    case "leave-early": return "bg-orange-50 border-orange-200";
                    default: return "bg-red-50 border-red-200";
                  }
                })()
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold text-lg ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "text-green-900";
                          case "late": return "text-amber-900";
                          case "absent": return "text-purple-900";
                          case "step-out": return "text-blue-900";
                          case "leave-early": return "text-orange-900";
                          default: return "text-red-900";
                        }
                      })()
                    }`}>
                      {rehearsalDetails.notes || "Rehearsal"}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "text-green-700";
                          case "late": return "text-amber-700";
                          case "absent": return "text-purple-700";
                          case "step-out": return "text-blue-700";
                          case "leave-early": return "text-orange-700";
                          default: return "text-red-700";
                        }
                      })()
                    }`}>
                      Time: {(() => {
                        const startTime = rehearsalDetails.start_time?.split('T')[1]?.split('+')[0] || rehearsalDetails.start_time;
                        const endTime = rehearsalDetails.end_time?.split('T')[1]?.split('+')[0] || rehearsalDetails.end_time;
                        if (startTime && endTime) {
                          // Convert to 12-hour format
                          const formatTime = (timeStr: string) => {
                            const [hours, minutes] = timeStr.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          };
                          return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                        }
                        return 'N/A';
                      })()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "text-green-600";
                          case "late": return "text-amber-600";
                          case "absent": return "text-purple-600";
                          case "step-out": return "text-blue-600";
                          case "leave-early": return "text-orange-600";
                          default: return "text-red-600";
                        }
                      })()
                    }`}>
                      Arrival: {(() => {
                        const attendanceRecord = attendanceData.find(item => 
                          item.reh_date === rehearsalDetails.rehearsal_date
                        );
                        if (attendanceRecord && attendanceRecord.created_at) {
                          const timeStr = attendanceRecord.created_at.split('T')[1]?.split('+')[0];
                          if (timeStr) {
                            const [hours, minutes] = timeStr.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          }
                        }
                        return 'N/A';
                      })()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "text-green-600";
                          case "late": return "text-amber-600";
                          case "absent": return "text-purple-600";
                          case "step-out": return "text-blue-600";
                          case "leave-early": return "text-orange-600";
                          default: return "text-red-600";
                        }
                      })()
                    }`}>
                      Departure: {(() => {
                        const paalam = excuseRequests.find(item => 
                          item.request_date === rehearsalDetails.rehearsal_date && 
                          item.status === "Approved" &&
                          (item.excuse_type === "Step Out" || item.excuse_type === "Leave Early")
                        );
                        if (paalam && paalam.request_time) {
                          const timeStr = paalam.request_time;
                          if (timeStr) {
                            const [hours, minutes] = timeStr.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          }
                        }
                        return 'N/A';
                      })()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "text-green-600";
                          case "late": return "text-amber-600";
                          case "absent": return "text-purple-600";
                          case "step-out": return "text-blue-600";
                          case "leave-early": return "text-orange-600";
                          default: return "text-red-600";
                        }
                      })()
                    }`}>
                      Date: {format(new Date(rehearsalDetails.rehearsal_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full ${
                      (() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        switch (status) {
                          case "present": return "bg-green-100";
                          case "late": return "bg-amber-100";
                          case "absent": return "bg-purple-100";
                          case "step-out": return "bg-blue-100";
                          case "leave-early": return "bg-orange-100";
                          default: return "bg-red-100";
                        }
                      })()
                    }`}>
                      <Clock className={`h-6 w-6 ${
                        (() => {
                          const status = getAttendanceStatusForDay(selectedCalendarDay);
                          switch (status) {
                            case "present": return "text-green-600";
                            case "late": return "text-amber-600";
                            case "absent": return "text-purple-600";
                            case "step-out": return "text-blue-600";
                            case "leave-early": return "text-orange-600";
                            default: return "text-red-600";
                          }
                        })()
                      }`} />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-2">
                      {(() => {
                        const status = getAttendanceStatusForDay(selectedCalendarDay);
                        const hasApprovedPaalam = excuseRequests.some(item => 
                          item.request_date === rehearsalDetails.rehearsal_date && 
                          item.status === "Approved"
                        );
                        
                        // Determine if status is unexcused
                        const isUnexcused = !hasApprovedPaalam && status !== "present";
                        
                        let statusText = "";
                        let badgeColor = "";
                        
                        if (status === "present") {
                          statusText = "On Time";
                          badgeColor = "bg-green-600 text-white";
                        } else if (isUnexcused) {
                          // All unexcused statuses get red color
                          switch (status) {
                            case "late": statusText = "Unexcused Late"; break;
                            case "absent": statusText = "Unexcused Absent"; break;
                            case "step-out": statusText = "Unexcused Step Out"; break;
                            case "leave-early": statusText = "Unexcused Leave Early"; break;
                            default: statusText = "Unexcused"; break;
                          }
                          badgeColor = "bg-red-600 text-white";
                        } else {
                          // Excused statuses
                          switch (status) {
                            case "late": statusText = "Late"; badgeColor = "bg-amber-600 text-white"; break;
                            case "absent": statusText = "Absent"; badgeColor = "bg-purple-600 text-white"; break;
                            case "step-out": statusText = "Step Out"; badgeColor = "bg-blue-600 text-white"; break;
                            case "leave-early": statusText = "Leave Early"; badgeColor = "bg-orange-600 text-white"; break;
                            default: statusText = "Unknown"; badgeColor = "bg-gray-600 text-white"; break;
                          }
                        }
                        
                        return (
                          <Badge className={`${badgeColor} text-xs font-medium px-2 py-1`}>
                            {statusText}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                {format(selectedCalendarDay, "EEEE, MMMM d")} is not a rehearsal day
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
