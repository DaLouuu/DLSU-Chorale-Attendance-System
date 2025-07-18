import { RegisterForm } from "@/components/auth/register-form"
import { GalleryBackground } from "@/components/ui/gallery-background"
import { WhiteLogo } from "@/components/ui/white-logo"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <GalleryBackground />
      <div className="flex min-h-screen flex-col relative z-10">
        {/* Header with DLSU Chorale branding */}
        <header className="bg-primary py-8 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-primary-foreground">DLSU Chorale</h1>
          </div>
        </header>
        {/* Main content - increased padding top and bottom */}
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center space-y-6 text-center mb-8">
              <WhiteLogo className="mb-2" />
              <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">Create an account</h1>
              <p className="text-sm text-primary-foreground/80">Register with your Google account</p>
            </div>
            <RegisterForm />
          </div>
        </main>
        {/* Footer - increased padding */}
        <footer className="bg-background border-t border-border py-6 shadow-inner">
          <div className="container mx-auto px-4 text-center text-foreground text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
