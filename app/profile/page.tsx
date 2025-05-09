"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Pencil, Save, X } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  role: string
  committee: string | null
  section: string | null
  is_admin: boolean
  is_performing: boolean
  is_executive_board: boolean
  admin_role: string | null
  email: string
  birthday: string | null
  id_number: string | null
  degree_program: string | null
  contact_number: string | null
  profile_image_url: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Get current user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          throw new Error("No active session")
        }

        // Get user profile from Users table
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          throw userError
        }

        // Set profile with user data and email from session
        setProfile({
          ...userData,
          email: session.user.email || "",
        })

        // Initialize edited profile
        setEditedProfile({
          birthday: userData.birthday || "",
          id_number: userData.id_number || "",
          degree_program: userData.degree_program || "",
          contact_number: userData.contact_number || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Helper function to format role/committee/section for display
  const formatValue = (value: string | null) => {
    if (!value) return "N/A"

    // Convert kebab-case or snake_case to Title Case
    return value
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPreviewUrl(null)
    setSelectedFile(null)
    setEditedProfile({
      birthday: profile?.birthday || "",
      id_number: profile?.id_number || "",
      degree_program: profile?.degree_program || "",
      contact_number: profile?.contact_number || "",
    })
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)

    try {
      // Upload profile image if selected
      let profileImageUrl = profile.profile_image_url

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop()
        const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `profile-images/${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("profiles").upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("profiles").getPublicUrl(filePath)

        profileImageUrl = publicUrl
      }

      // Update profile in database
      const { error } = await supabase
        .from("Users")
        .update({
          ...editedProfile,
          profile_image_url: profileImageUrl,
        })
        .eq("id", profile.id)

      if (error) throw error

      // Update local state
      setProfile({
        ...profile,
        ...editedProfile,
        profile_image_url: profileImageUrl,
      })

      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            {/* Dashboard Navigation */}
            <DashboardNav isAdmin={profile?.is_admin || false} />

            <h1 className="text-2xl font-bold text-[#09331f] dark:text-white md:text-3xl mb-6">My Profile</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent"></div>
              </div>
            ) : profile ? (
              <div className="grid gap-6">
                {/* Profile Card */}
                <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg pb-3 flex flex-row justify-between items-center">
                    <CardTitle className="text-xl font-bold text-[#09331f] dark:text-white">
                      Profile Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button variant="ghost" size="sm" onClick={handleEditClick} className="dark:text-white">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-red-500">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="text-green-500"
                        >
                          {isSaving ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-[#09331f]/20 dark:border-gray-600">
                          {isEditing && previewUrl ? (
                            <AvatarImage src={previewUrl || "/placeholder.svg"} alt={profile.name} />
                          ) : (
                            <AvatarImage src={profile.profile_image_url || ""} alt={profile.name} />
                          )}
                          <AvatarFallback className="text-2xl bg-[#09331f] text-white dark:bg-gray-700">
                            {profile.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white dark:bg-gray-700"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </>
                        )}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold dark:text-white">{profile.name}</h2>
                          <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#09331f]">{profile.is_admin ? "Admin" : "Member"}</Badge>
                          {profile.is_performing && <Badge className="bg-blue-500">Performing</Badge>}
                          {profile.is_executive_board && <Badge className="bg-purple-500">Executive Board</Badge>}
                          {profile.admin_role && (
                            <Badge className="bg-amber-500">{formatValue(profile.admin_role)}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg pb-3">
                    <CardTitle className="text-xl font-bold text-[#09331f] dark:text-white">Member Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h3>
                        <p className="text-lg font-medium dark:text-white">{formatValue(profile.role)}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Committee</h3>
                        <p className="text-lg font-medium dark:text-white">{formatValue(profile.committee)}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Voice Section</h3>
                        <p className="text-lg font-medium dark:text-white">{formatValue(profile.section)}</p>
                      </div>

                      {profile.is_admin && profile.admin_role && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Role</h3>
                          <p className="text-lg font-medium dark:text-white">{formatValue(profile.admin_role)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information Card */}
                <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg pb-3">
                    <CardTitle className="text-xl font-bold text-[#09331f] dark:text-white">
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="birthday" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Birthday
                        </Label>
                        {isEditing ? (
                          <Input
                            id="birthday"
                            type="date"
                            value={editedProfile.birthday || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile, birthday: e.target.value })}
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-lg font-medium dark:text-white">{profile.birthday || "Not set"}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="id_number" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          ID Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="id_number"
                            type="text"
                            value={editedProfile.id_number || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile, id_number: e.target.value })}
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-lg font-medium dark:text-white">{profile.id_number || "Not set"}</p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="degree_program"
                          className="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Degree Program
                        </Label>
                        {isEditing ? (
                          <Input
                            id="degree_program"
                            type="text"
                            value={editedProfile.degree_program || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile, degree_program: e.target.value })}
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-lg font-medium dark:text-white">{profile.degree_program || "Not set"}</p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="contact_number"
                          className="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Contact Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="contact_number"
                            type="tel"
                            value={editedProfile.contact_number || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile, contact_number: e.target.value })}
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-lg font-medium dark:text-white">{profile.contact_number || "Not set"}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Profile not found. Please try logging in again.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <PageFooter />
      </div>
    </div>
  )
}
