"use client"

import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { ExcuseApprovalContent } from "@/components/excuse/excuse-approval-content"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export default function ExcuseApprovalPage() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="excuse-form" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/admin/attendance-overview">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Overview
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-[#09331f] dark:text-white md:text-3xl">Excuse Approval</h1>
            </div>

            <ExcuseApprovalContent />
          </div>
        </main>

        {/* Footer */}
        <footer className={`mt-auto ${
          isDarkMode 
            ? 'bg-[#09331f] shadow-lg' 
            : 'bg-white border-t border-gray-200'
        }`}>
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
