"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Pencil, Save, X } from "lucide-react"

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  committee: string | null
  role: string | null
  is_sechead: boolean
  section: string | null
  school_id: number | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Pick<UserProfile, 'full_name' | 'committee' | 'section'>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      console.log("[ProfilePage] Fetching profile...")
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error("[ProfilePage] No active session", sessionError)
          toast.error("No active session. Please login.")
          setLoading(false)
          return
        }
        console.log("[ProfilePage] Session found for user:", session.user.id)

        // First, try a simple query to test RLS access
        console.log("[ProfilePage] Testing basic RLS access...")
        const { data: testData, error: testError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single()
        
        console.log("[ProfilePage] Test query result:", testData, "error:", testError)
        
        if (testError) {
          console.error("[ProfilePage] Basic RLS test failed:", testError)
          if (testError.message?.includes('policy') || testError.message?.includes('permission')) {
            toast.error("Database access denied. This is an RLS policy issue.")
            setLoading(false)
            return
          }
        }

        // Now try the full query
        const { data: accountData, error: accountError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            full_name,
            avatar_url,
            created_at,
            updated_at,
            committee,
            role,
            is_sechead,
            section,
            school_id
          `)
          .eq("id", session.user.id)
          .single()

        console.log("[ProfilePage] Raw query result - data:", accountData, "error:", accountError)

        if (accountError) {
          console.error("[ProfilePage] Error fetching profile data:", accountError)
          console.error("[ProfilePage] Error details - code:", accountError.code, "message:", accountError.message, "details:", accountError.details)
          
          if (accountError.code === 'PGRST116') {
            toast.error("Profile data not found. Please complete setup.")
          } else if (accountError.message?.includes('policy') || accountError.message?.includes('permission')) {
            toast.error("Access denied. This might be due to database permissions.")
            console.error("[ProfilePage] This appears to be an RLS policy issue")
          } else {
            toast.error("Failed to load profile data.")
          }
          setLoading(false)
          return
        }
        console.log("[ProfilePage] Profile data fetched:", accountData)

        const userProfileData: UserProfile = {
          id: accountData.id,
          email: accountData.email,
          full_name: accountData.full_name,
          avatar_url: accountData.avatar_url,
          created_at: accountData.created_at,
          updated_at: accountData.updated_at,
          committee: accountData.committee,
          role: accountData.role,
          is_sechead: accountData.is_sechead,
          section: accountData.section,
          school_id: accountData.school_id,
        }
        setProfile(userProfileData)
        console.log("[ProfilePage] Profile state set:", userProfileData)

        setEditedProfile({
          full_name: accountData.full_name || "",
          committee: accountData.committee || "",
          section: accountData.section || "",
        })
      } catch (error) {
        console.error("Error fetching profile in outer catch:", error)
        toast.error("Failed to load profile data.")
      } finally {
        setLoading(false)
        console.log("[ProfilePage] fetchProfile finished.")
      }
    }

    fetchProfile()
  }, [supabase])

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
    if (profile) {
        setEditedProfile({
            full_name: profile.full_name || "",
            committee: profile.committee || "",
            section: profile.section || "",
        });
    } else {
        setEditedProfile({});
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    console.log("[ProfilePage] Saving profile. Initial edited data:", editedProfile)

    try {
      let newProfileImageUrl = profile.avatar_url

      if (selectedFile) {
        console.log("[ProfilePage] Selected file present. Uploading new profile image...")
        const fileExt = selectedFile.name.split(".").pop()
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`
        const filePath = `profile-images/${fileName}`
        console.log("[ProfilePage] Uploading to path:", filePath)

        const { error: uploadError, data: uploadData } = await supabase.storage.from("profiles").upload(filePath, selectedFile)

        if (uploadError) {
          console.error("[ProfilePage] Profile image upload error:", uploadError)
          throw uploadError
        }
        console.log("[ProfilePage] Profile image uploaded:", uploadData)

        const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(filePath)
        newProfileImageUrl = urlData.publicUrl
        console.log("[ProfilePage] New profile image public URL:", newProfileImageUrl)
      }

      const updatesForAccounts: Partial<UserProfile> & { avatar_url?: string | null } = {
        ...editedProfile,
      }
      if (newProfileImageUrl !== profile.avatar_url) {
        updatesForAccounts.avatar_url = newProfileImageUrl
      }
      console.log("[ProfilePage] Data to update in 'accounts':", updatesForAccounts)

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatesForAccounts)
        .eq("id", profile.id)

      if (updateError) {
        console.error("[ProfilePage] Error updating account in DB:", updateError)
        throw updateError
      }
      console.log("[ProfilePage] Account successfully updated in DB.")

      setProfile(prevProfile => ({
        ...prevProfile!,
        ...updatesForAccounts,
      }))

      setIsEditing(false)
      setPreviewUrl(null)
      setSelectedFile(null)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile in handleSaveProfile:", error)
      toast.error(`Failed to update profile: ${(error as Error).message}`)
    } finally {
      setIsSaving(false)
      console.log("[ProfilePage] handleSaveProfile finished.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value || null }));
  };

  const formatValue = (value: string | null | undefined) => {
    if (!value) return "N/A"
    return value
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            <DashboardNav isAdmin={profile?.role === 'admin' || false} />

            <h1 className="text-2xl font-bold text-primary md:text-3xl mb-6">My Profile</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#09331f] border-t-transparent dark:border-white dark:border-t-transparent"></div>
              </div>
            ) : profile ? (
              <div className="grid gap-6">
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
                            <AvatarImage src={previewUrl || undefined} alt={profile.full_name || "User avatar"} />
                          ) : (
                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "User avatar"} />
                          )}
                          <AvatarFallback>{profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-[#09331f] text-white rounded-full p-1.5 cursor-pointer hover:bg-[#0a4429]">
                            <Pencil className="h-3 w-3" />
                            <input id="profile-image-upload" type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                          </label>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                        <div>
                          <Label htmlFor="name" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</Label>
                          {isEditing ? (
                            <Input type="text" id="full_name" name="full_name" value={editedProfile.full_name || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.full_name || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</Label>
                          <p className="text-base text-gray-800 dark:text-white">{profile.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ID Number</Label>
                          <p className="text-base text-gray-800 dark:text-white">{profile.school_id || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">User Type</Label>
                          <Badge variant={profile.role === "admin" ? "destructive" : "secondary"} className="capitalize">
                            {formatValue(profile.role)}
                          </Badge>
                        </div>
                        {profile.role === "admin" && profile.role && (
                          <div>
                            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Admin Role</Label>
                            <p className="text-base font-medium text-gray-800 dark:text-white">{formatValue(profile.role)}</p>
                          </div>
                        )}
                        <div>
                          <Label htmlFor="section" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Section/Voice</Label>
                          {isEditing ? (
                            <Input type="text" id="section" name="section" value={editedProfile.section || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{formatValue(profile.section)}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="committee" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Committee</Label>
                          {isEditing ? (
                            <Input type="text" id="committee" name="committee" value={editedProfile.committee || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{formatValue(profile.committee)}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Section Head</Label>
                          <Badge variant={profile.is_sechead ? "default" : "outline"} className="capitalize">
                            {profile.is_sechead ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">No profile data found. Please complete your account setup or contact an administrator.</p>
              </div>
            )}
          </div>
        </main>

        <PageFooter />
      </div>
    </div>
  )
}
