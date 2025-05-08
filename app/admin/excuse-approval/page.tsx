"use client"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { ExcuseApprovalContent } from "@/components/excuse/excuse-approval-content"

export default function ExcuseApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-bold text-[#09331f] md:text-3xl">Excuse Approval</h1>
            <ExcuseApprovalContent />
          </div>
        </main>

        <PageFooter />
      </div>
    </div>
  )
}
