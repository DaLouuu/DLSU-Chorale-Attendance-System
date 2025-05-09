import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-600 mb-4">This is the profile page. Content will be added soon.</p>

          <Link href="/" className="text-[#09331f] font-medium hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </main>

      <PageFooter />
    </div>
  )
}
