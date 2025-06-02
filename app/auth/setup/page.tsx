"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function setupUserProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          throw new Error("No active session found")
        }

        const registrationDataStr = localStorage.getItem("registrationData")
        if (!registrationDataStr) {
          throw new Error("Registration data not found")
        }
        const registrationData = JSON.parse(registrationDataStr)

        const { data: directoryData, error: directoryError } = await supabase
          .from("directory")
          .select("id, email")
          .eq("email", session.user.email!)
          .single()

        if (directoryError || !directoryData) {
          toast.error("Your email is not found in the official directory. Please contact an administrator.")
          router.push("/unauthorized")
          return
        }

        const { data: existingAccount } = await supabase
          .from("accounts")
          .select("user_type, account_id")
          .eq("auth_user_id", session.user.id)
          .single()

        if (existingAccount) {
          toast.info("Account already set up.")
          if (existingAccount.user_type === "admin") {
            router.push("/admin/attendance-overview")
          } else {
            router.push("/attendance-form")
          }
          return
        }

        const accountToInsert = {
          directory_id: directoryData.id,
          auth_user_id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.user_metadata.name || registrationData.full_name || "User",
          user_type: registrationData.user_type,
          role: registrationData.adminRole || null,
          committee: registrationData.committee || "N/A",
          section: registrationData.voiceSection || null,
          is_execboard: registrationData.is_execboard || false,
          is_sechead: registrationData.is_sechead || false,
        }

        const { error: insertError } = await supabase.from("accounts").upsert(accountToInsert)

        if (insertError) {
          throw insertError
        }

        localStorage.removeItem("registrationData")
        toast.success("Registration successful!")
        if (accountToInsert.user_type === "admin") {
          router.push("/admin/attendance-overview")
        } else {
          router.push("/attendance-form")
        }
      } catch (error) {
        console.error("Setup error:", error)
        toast.error(`Failed to complete registration: ${(error as Error).message}`)
        router.push("/register")
      } finally {
        setIsLoading(false)
      }
    }

    setupUserProfile()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <PageHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-2 border-[#09331f]/20 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-[#09331f] dark:text-white">
                Setting up your account
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent mb-4"></div>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Please wait while we set up your account...
              </p>
            </CardContent>
          </Card>
        </main>
        <PageFooter />
      </div>
    </div>
  )
}
