"use client"

import { LoginForm } from "@/components/auth/login-form"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0E7FF] via-[#F0F3FF] to-[#E5F9F1] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        {/* <PageHeader /> */}
        {/* You might want a simpler header or no header on the login page */}
        <main className="flex w-full flex-1 flex-col items-center justify-center py-8">
          <div className="mb-8 text-center">
            {/* You can add your logo or app name here */}
            <h1 className="text-4xl font-bold tracking-tight text-[#09331f] dark:text-white">
              DLSU Chorale
            </h1>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
              Attendance Management System
            </p>
          </div>
          <LoginForm />
        </main>
        {/* <PageFooter /> */}
        {/* Footer might also be simplified or omitted here */}
      </div>
    </div>
  )
}
