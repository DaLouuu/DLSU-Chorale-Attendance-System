"use client"

import { useState } from "react"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()

  // Helper to determine if dark mode is active
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully")
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion is disabled in this demo")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="settings" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold text-primary md:text-3xl mb-6">Settings</h1>

            <div className="grid gap-6">
              {/* Notification Settings */}
              <Card className="shadow-md">
                <CardHeader className="bg-muted rounded-t-lg pb-3">
                  <CardTitle className="text-xl font-bold text-primary">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="text-base font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive email notifications for attendance updates</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode" className="text-base font-medium">
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={isDark}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="mt-6">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="shadow-md">
                <CardHeader className="bg-muted rounded-t-lg pb-3">
                  <CardTitle className="text-xl font-bold text-primary">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button variant="outline" onClick={handleSignOut} disabled={isLoading} className="w-full">
                      {isLoading ? "Signing out..." : "Sign Out"}
                    </Button>

                    <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Removed PageFooter */}
      </div>
    </div>
  )
}
