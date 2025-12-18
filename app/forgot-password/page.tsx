"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Don&apos;t worry, we can help you get back into your account.
          </p>
        </div>

        <Card className="border-2 border-[#09331f]/20 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="text-center space-y-1 p-8">
            <div className="mx-auto w-12 h-12 bg-[#09331f]/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-[#09331f] dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#09331f] dark:text-white">
              Contact Administrator
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                What to do:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <li>• Contact your DLSU Chorale administrator</li>
                <li>• Provide your email address</li>
                <li>• Request a password reset</li>
                <li>• Wait for the administrator to process your request</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-[#09331f] hover:bg-[#0a4429] text-white">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact your administrator directly.
          </p>
        </div>
      </div>
    </div>
  )
}
