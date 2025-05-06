import { RegisterForm } from "@/components/auth/register-form"
import { GalleryBackground } from "@/components/ui/gallery-background"
import { WhiteLogo } from "@/components/ui/white-logo"

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <GalleryBackground />
      <div className="flex min-h-screen flex-col relative z-10">
        {/* Header with DLSU Chorale branding */}
        <header className="bg-[#09331f] py-6 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">DLSU Chorale</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-4 text-center mb-6">
              <WhiteLogo className="mb-2" />
              <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
              <p className="text-sm text-white/80">Register with your Google account</p>
            </div>
            <RegisterForm />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#1B1B1B] py-4 shadow-inner">
          <div className="container mx-auto px-4 text-center text-white text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
