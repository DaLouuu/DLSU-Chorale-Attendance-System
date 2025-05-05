import { RegisterForm } from "@/components/auth/register-form"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col">
        {/* Header with DLSU Chorale branding */}
        <header className="bg-[#09331f] py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">DLSU Chorale</h1>
          </div>
        </header>

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
              <h1 className="text-3xl font-bold tracking-tight text-[#09331f]">Create an account</h1>
              <p className="text-sm text-[#1B1B1B]">Register with your Google account</p>
            </div>
            <RegisterForm />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#1B1B1B] py-4">
          <div className="container mx-auto px-4 text-center text-white text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
