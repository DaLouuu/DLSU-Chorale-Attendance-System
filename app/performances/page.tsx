import Link from "next/link"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"

export default function PerformancesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthenticatedHeader currentPage="dashboard" />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Performances</h1>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <p className="text-muted-foreground mb-4">This is the performances page. Content will be added soon.</p>

          <Link href="/dashboard" className="text-primary font-medium hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
