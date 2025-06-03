"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardCheck, Home, User, Settings, LogOut, Menu } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

export function DashboardNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Attendance",
      href: isAdmin ? "/admin/attendance-overview" : "/attendance-overview",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Excuse Form",
      href: "/attendance-form",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      label: "Excuse Approval",
      href: "/admin/excuse-approval",
      icon: <ClipboardCheck className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  // Filter items based on admin status
  const filteredItems = navItems.filter((item) => !item.adminOnly || (item.adminOnly && isAdmin))

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#09331f] dark:text-white">Dashboard</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px] dark:bg-gray-800">
            <nav className="flex flex-col gap-4 mt-8">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    pathname === item.href
                      ? "bg-[#09331f] text-white dark:bg-[#09331f]"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {filteredItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "outline"}
              size="sm"
              asChild
              className={pathname === item.href ? "bg-[#09331f] text-white" : "dark:text-white dark:border-gray-700"}
            >
              <Link href={item.href} className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
