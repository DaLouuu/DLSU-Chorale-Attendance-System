"use client"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { AttendanceExcuseForm } from "@/components/attendance/excuse-form"

export default function AttendanceExcusePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-4 text-center mb-6">
              <Image
                src="/images/dlsu-chorale-logo.png"
                alt="DLSU Chorale Logo"
                width={120}
                height={160}
                className="mb-2"
              />
              <h1 className="text-3xl font-bold tracking-tight text-[#09331f]">Attendance Excuse Form</h1>
              <p className="text-sm text-[#1B1B1B]">Submit your excuse for absence or tardiness</p>
            </div>

            <AttendanceExcuseForm />

            <div className="mt-4 text-center text-sm">
              <Link href="#" className="text-[#09331f] hover:underline font-medium">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>

        <PageFooter />
      </div>
    </div>
  )
}
