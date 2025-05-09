"use client"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { AttendanceExcuseForm } from "@/components/attendance/excuse-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AttendanceExcusePage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserRole() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data: userData } = await supabase.from("Users").select("is_admin").eq("id", session.user.id).single()

        setIsAdmin(userData?.is_admin || false)
        setLoading(false)
      } catch (error) {
        console.error("Error checking user role:", error)
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center p-4">
          <div className="w-full max-w-4xl mb-6">
            <DashboardNav isAdmin={isAdmin} />

            <Button variant="ghost" size="sm" asChild className="mb-6 dark:text-white">
              <Link href={isAdmin ? "/admin/attendance-overview" : "/attendance-overview"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Overview
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-4 text-center mb-6">
              <Image
                src="/images/dlsu-chorale-logo.png"
                alt="DLSU Chorale Logo"
                width={120}
                height={160}
                className="mb-2 dark:invert"
              />
              <h1 className="text-3xl font-bold tracking-tight text-[#09331f] dark:text-white">
                Attendance Excuse Form
              </h1>
              <p className="text-sm text-[#1B1B1B] dark:text-gray-300">Submit your excuse for absence or tardiness</p>
            </div>

            <AttendanceExcuseForm />
          </div>
        </main>

        <PageFooter />
      </div>
    </div>
  )
}
