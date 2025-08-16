"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Determine if we're currently in dark mode (either manual dark or system dark)
  const isCurrentlyDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => {
    // Simply toggle between light and dark
    setTheme(isCurrentlyDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`transition-all duration-200 focus:ring-0 focus:ring-offset-0 ${
        isCurrentlyDark
          ? "text-white hover:bg-white/20"
          : "text-[#09331f] hover:bg-[#09331f]/10"
      }`}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
