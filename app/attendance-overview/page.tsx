"use client"

import { useState, useEffect } from "react"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useUserRole } from "@/hooks/use-user-role"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import IndividualAttendanceOverview from "@/components/attendance/individual-attendance-overview"

export default function AttendanceOverviewPage() {
  const router = useRouter();
  const [isGroupView, setIsGroupView] = useState(false);
  const { userRole, loading, hasSecheadType } = useUserRole();
  const [userId, setUserId] = useState<string>("");

  // Check if user should see the toggle (requires either role OR secheadtype)
  const shouldShowToggle = () => {
    // Show toggle if user has either a valid role OR a secheadtype
    const hasValidRole = userRole && userRole !== "Not Applicable"
    const hasValidSecheadType = hasSecheadType
    return hasValidRole || hasValidSecheadType
  }

  // Get current user ID
  useEffect(() => {
    async function getCurrentUserId() {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    }
    getCurrentUserId();
  }, []);

  // Don't render until we know the user's role
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col">
          <AuthenticatedHeader currentPage="attendance" />
          <main className="flex-1 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#136c37] border-t-transparent"></div>
          </main>
        </div>
      </div>
    )
  }

  // Redirect users with role or secheadtype to admin attendance page
  const hasValidRole = userRole && userRole !== "Not Applicable"
  const hasValidSecheadType = hasSecheadType
  const hasRoleOrSechead = hasValidRole || hasValidSecheadType
  
  if (hasRoleOrSechead) {
    router.push("/admin/attendance-overview")
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col">
          <AuthenticatedHeader currentPage="attendance" />
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
        <AuthenticatedHeader currentPage="attendance" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-6xl min-h-screen">
            {/* Page title and action button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#136c37] md:text-3xl">
                {isGroupView ? "Group Attendance" : "My Attendance"}
              </h1>
              
              <div className="flex items-center gap-4">
                {/* Role-based toggle for group view vs individual view */}
                {shouldShowToggle() && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="view-mode"
                      checked={isGroupView}
                      onCheckedChange={setIsGroupView}
                      className="data-[state=checked]:bg-[#136c37]"
                    />
                    <Label htmlFor="view-mode" className="text-sm font-medium">
                      {isGroupView ? "Group View" : "Individual View"}
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {isGroupView ? (
              /* Group View - redirect to group attendance page */
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Group Attendance View</h2>
                  <p className="text-gray-500 mb-6">Switch to group view to see all members&apos; attendance records.</p>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/attendance-overview">
                      View Group Attendance
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Individual View - Use shared component */
              <IndividualAttendanceOverview userId={userId} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
