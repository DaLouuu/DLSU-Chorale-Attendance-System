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
      console.log("[SetupPage] Starting setupUserProfile...")
      try {
        console.log("[SetupPage] Attempting to get session...")
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[SetupPage] Session error:", sessionError)
          throw new Error(`Session error: ${sessionError.message}`)
        }
        if (!session) {
          console.warn("[SetupPage] No active session found.")
          throw new Error("No active session found")
        }
        console.log("[SetupPage] Session retrieved:", session)

        console.log("[SetupPage] Attempting to get registrationData from localStorage...")
        const registrationDataStr = localStorage.getItem("registrationData")
        if (!registrationDataStr) {
          console.warn("[SetupPage] Registration data not found in localStorage.")
          throw new Error("Registration data not found")
        }
        console.log("[SetupPage] registrationData string from localStorage:", registrationDataStr)
        let registrationData
        try {
          registrationData = JSON.parse(registrationDataStr)
          console.log("[SetupPage] Parsed registrationData:", registrationData)
        } catch (parseError) {
          console.error("[SetupPage] Failed to parse registrationData from localStorage:", parseError)
          throw new Error("Failed to parse registration data")
        }

        console.log(`[SetupPage] Attempting to query 'directory' for email: ${session.user.email}`)
        const { data: directoryData, error: directoryError } = await supabase
          .from("directory")
          .select("id, email")
          .eq("email", session.user.email!)
          .single()

        if (directoryError) {
          console.error("[SetupPage] Directory query error:", directoryError)
          // PGRST116: no rows found, this is a specific case we handle differently
          if (directoryError.code !== 'PGRST116') {
            throw new Error(`Directory query error: ${directoryError.message}`)
          }
        }
        console.log("[SetupPage] Directory query result - data:", directoryData, "error:", directoryError)

        if (!directoryData) { // This implies directoryError was PGRST116 or it was null and no data
          console.warn("[SetupPage] Email not found in directory. User email:" , session.user.email)
          toast.error("Your email is not found in the official directory. Please contact an administrator.")
          router.push("/unauthorized")
          return
        }
        console.log("[SetupPage] Directory data found:", directoryData)

        console.log(`[SetupPage] Attempting to query 'accounts' for auth_user_id: ${session.user.id}`)
        const { data: existingAccount, error: accountQueryError } = await supabase
          .from("accounts")
          .select("user_type, account_id")
          .eq("auth_user_id", session.user.id)
          .single()

        if (accountQueryError && accountQueryError.code !== 'PGRST116') {
          console.error("[SetupPage] Accounts query error:", accountQueryError)
          throw new Error(`Accounts query error: ${accountQueryError.message}`)
        }
        console.log("[SetupPage] Existing account query result - data:", existingAccount, "error:", accountQueryError)

        if (existingAccount) {
          console.log("[SetupPage] Account already exists:", existingAccount)
          toast.info("Account already set up.")
          setIsLoading(false);
          if (existingAccount.user_type === "admin") {
            console.log("[SetupPage] Redirecting existing admin to /admin/attendance-overview")
            router.push("/admin/attendance-overview")
          } else {
            console.log("[SetupPage] Redirecting existing member to /attendance-form")
            router.push("/attendance-form")
          }
          return;
        }
        console.log("[SetupPage] No existing account found. Proceeding to create one.")

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
        console.log("[SetupPage] Data to insert into 'accounts':", accountToInsert)

        console.log("[SetupPage] Attempting to upsert into 'accounts'...")
        const { error: insertError } = await supabase.from("accounts").upsert(accountToInsert)

        if (insertError) {
          console.error("[SetupPage] Insert/Upsert error into 'accounts':", insertError)
          throw insertError // Re-throw to be caught by the main catch block
        }
        console.log("[SetupPage] Successfully upserted data into 'accounts'.")

        console.log("[SetupPage] Removing 'registrationData' from localStorage.")
        localStorage.removeItem("registrationData")
        toast.success("Registration successful!")

        if (accountToInsert.user_type === "admin") {
          console.log("[SetupPage] Redirecting new admin to /admin/attendance-overview")
          router.push("/admin/attendance-overview")
        } else {
          console.log("[SetupPage] Redirecting new member to /attendance-form")
          router.push("/attendance-form")
        }
      } catch (error) {
        console.error("[SetupPage] Error in setupUserProfile catch block:", error)
        toast.error(`Failed to complete registration: ${(error as Error).message}`)
        console.log("[SetupPage] Redirecting to /register due to error.")
        setIsLoading(false);
        router.push("/register")
      } finally {
        console.log("[SetupPage] setupUserProfile finally block. Setting isLoading to false.")
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
              {isLoading ? (
                <>
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent mb-4"></div>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    Please wait while we set up your account...
                  </p>
                </>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Setup process completed. If you are not redirected, please try navigating manually or contact support.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
        <PageFooter />
      </div>
    </div>
  )
}
