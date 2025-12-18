"use client"

import { PageHeader } from "@/components/layout/page-header"
import { useTheme } from "@/components/theme-provider"

export default function AboutPage() {
  const { theme } = useTheme()
  // Check if we're in dark mode (either manual dark or system dark)
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <div className="flex min-h-screen flex-col relative z-10 pt-16">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-6">About DLSU Chorale</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The DLSU Chorale is a prestigious choral group that represents the De La Salle University 
              in various performances and competitions. We are dedicated to excellence in choral music 
              and fostering a community of passionate singers.
            </p>
          </div>
        </main>

        <footer className={`footer-compact ${!isDarkMode ? 'light' : ''} mt-auto`}>
          <div className="container mx-auto px-4 text-center text-sm">
            &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
