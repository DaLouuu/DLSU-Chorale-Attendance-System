"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AttendanceOverviewPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate days for the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Fetch attendance logs for the current user
  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const { toast } = await import("@/hooks/use-toast");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setAttendanceData([]);
        setLoading(false);
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
        setLoading(false);
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
        .eq("account_id_fk", profileData.id)
        .order("reh_date", { ascending: false });
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
      setLoading(false);
    }
    fetchAttendance();
  }, [currentMonth]);

  // Get status for a specific day
  const getAttendanceStatus = (day: Date) => {
    const record = attendanceData.find((item) => {
      // Assuming attendance_logs has a reh_date or similar field
      return isSameDay(new Date(item.reh_date), day);
    });
    return record ? (record.log_status === "Late" ? "late" : record.log_status === "On-time" ? "present" : "absent") : null;
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
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="attendance" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            {/* Page title and action button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-primary md:text-3xl">My Attendance</h1>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/attendance-form">Submit Excuse</Link>
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => navigateMonth('prev')} className="text-primary">
                &larr; Previous Month
              </Button>

              <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>

              <Button variant="ghost" onClick={() => navigateMonth('next')} className="text-primary">
                Next Month &rarr;
              </Button>
            </div>

            {/* Calendar */}
            <Card className="shadow-md border-gray-200 mb-6">
              <CardHeader className="bg-gray-100 rounded-t-lg pb-3">
                <CardTitle className="text-xl font-bold text-[#09331f]">Attendance Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the start of the month */}
                  {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="p-2 h-14"></div>
                  ))}

                  {/* Days of the month */}
                  {daysInMonth.map((day) => {
                    const status = getAttendanceStatus(day)
                    const isToday = isSameDay(day, today)

                    return (
                      <div
                        key={day.toString()}
                        className={`p-2 h-14 rounded-md border flex flex-col items-center justify-center relative ${
                          isToday ? "border-[#09331f] border-2" : "border-gray-200"
                        }`}
                      >
                        <span className="text-sm">{format(day, "d")}</span>
                        {status && (
                          <Badge
                            className={`mt-1 text-xs ${
                              status === "present"
                                ? "bg-green-500 text-white"
                                : status === "late"
                                  ? "bg-amber-500 text-white"
                                  : "bg-red-500 text-white"
                            }`}
                          >
                            {status}
                          </Badge>
                        )}
                      </div>
                    )
                  })}

                  {/* Empty cells for days after the end of the month */}
                  {Array.from({ length: 6 - daysInMonth[daysInMonth.length - 1].getDay() }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="p-2 h-14"></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card className="shadow-md border-gray-200">
              <CardHeader className="bg-gray-100 rounded-t-lg pb-3">
                <CardTitle className="text-xl font-bold text-[#09331f]">Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg text-center">
                    <p className="text-green-800 font-medium">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceData.filter((item) => item.status === "present").length}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-4 rounded-lg text-center">
                    <p className="text-amber-800 font-medium">Late</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {attendanceData.filter((item) => item.status === "late").length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg text-center">
                    <p className="text-red-800 font-medium">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceData.filter((item) => item.status === "absent").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* PageFooter is removed as per the edit hint */}
      </div>
    </div>
  )
}
