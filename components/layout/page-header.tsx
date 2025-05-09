"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-[#09331f] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/dlsu-chorale-logo.png"
            alt="DLSU Chorale Logo"
            width={36}
            height={48}
            className="hidden sm:block"
          />
          <h1 className="text-xl font-bold tracking-tight">DLSU CHORALE</h1>
        </Link>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#0a4429]">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0 border-none w-[280px] sm:w-[320px]">
            <div className="flex flex-col h-full">
              <div className="p-4 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 px-4">
                <div className="space-y-1 mb-8">
                  <Link
                    href="/"
                    className="block py-3 font-medium text-[#09331f] border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/attendance"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Attendance
                  </Link>
                  <Link
                    href="/performances"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Performances
                  </Link>
                  <Link
                    href="/events"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    href="/notifications"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/members"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Members
                  </Link>
                  <Link
                    href="/resources"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Resources
                  </Link>
                </div>

                <div className="space-y-1 mt-auto">
                  <Link
                    href="/profile"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/settings"
                    className="block py-3 font-medium text-gray-700 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="block py-3 font-medium text-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
