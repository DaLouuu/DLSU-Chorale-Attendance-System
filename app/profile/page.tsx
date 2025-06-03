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
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Pencil, Save, X } from "lucide-react"
import { format } from 'date-fns'

interface UserProfile {
  account_id: number
  auth_user_id: string
  name: string | null
  role: string | null
  committee: string | null
  section: string | null
  user_type: string | null
  is_execboard: boolean | null
  is_sechead: boolean | null
  email: string
  birthday: string | null
  id_number: string | null
  degree_program: string | null
  contact_number: string | null
  profile_image_url: string | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Pick<UserProfile, 'name' | 'committee' | 'section' | 'birthday' | 'degree_program' | 'contact_number'>>>({})
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

        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select(`
            account_id,
            auth_user_id,
            name,
            role,
            committee,
            section,
            user_type,
            is_execboard,
            is_sechead,
            profile_image_url, 
            contact_number, 
            degree_program, 
            birthday, 
            directory_id
          `)
          .eq("auth_user_id", session.user.id)
          .single()

        if (accountError) {
          console.error("[ProfilePage] Error fetching account data:", accountError)
          if (accountError.code === 'PGRST116') {
            toast.error("Profile data not found. Please complete setup.")
          } else {
            toast.error("Failed to load profile data.")
          }
          setLoading(false)
          return
        }
        console.log("[ProfilePage] Account data fetched:", accountData)

        let idNumberFromDirectory: string | null = null
        if (accountData.directory_id) {
          console.log(`[ProfilePage] Fetching ID number from directory for directory_id: ${accountData.directory_id}`)
          const { data: dirData, error: dirError } = await supabase
            .from("directory")
            .select("id")
            .eq("id", accountData.directory_id)
            .single()
          if (dirError) {
            console.error("[ProfilePage] Error fetching ID number from directory:", dirError)
            toast.message("Warning", { description: "Could not fetch ID number from directory." })
          } else if (dirData) {
            idNumberFromDirectory = dirData.id?.toString() || null
            console.log("[ProfilePage] ID number from directory:", idNumberFromDirectory)
          }
        }

        const userProfileData: UserProfile = {
          account_id: accountData.account_id,
          auth_user_id: accountData.auth_user_id!,
          name: accountData.name,
          role: accountData.role,
          committee: accountData.committee,
          section: accountData.section,
          user_type: accountData.user_type,
          is_execboard: accountData.is_execboard,
          is_sechead: accountData.is_sechead,
          email: session.user.email || "",
          birthday: accountData.birthday,
          id_number: idNumberFromDirectory,
          degree_program: accountData.degree_program,
          contact_number: accountData.contact_number,
          profile_image_url: accountData.profile_image_url,
        }
        setProfile(userProfileData)
        console.log("[ProfilePage] Profile state set:", userProfileData)

        setEditedProfile({
          name: accountData.name || "",
          committee: accountData.committee || "",
          section: accountData.section || "",
          birthday: accountData.birthday || "",
          degree_program: accountData.degree_program || "",
          contact_number: accountData.contact_number || "",
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
            name: profile.name || "",
            committee: profile.committee || "",
            section: profile.section || "",
            birthday: profile.birthday || "",
            degree_program: profile.degree_program || "",
            contact_number: profile.contact_number || "",
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
      let newProfileImageUrl = profile.profile_image_url

      if (selectedFile) {
        console.log("[ProfilePage] Selected file present. Uploading new profile image...")
        const fileExt = selectedFile.name.split(".").pop()
        const fileName = `${profile.auth_user_id}-${Date.now()}.${fileExt}`
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

      const updatesForAccounts: Partial<UserProfile> & { profile_image_url?: string | null } = {
        ...editedProfile,
      }
      if (newProfileImageUrl !== profile.profile_image_url) {
        updatesForAccounts.profile_image_url = newProfileImageUrl
      }
      console.log("[ProfilePage] Data to update in 'accounts':", updatesForAccounts)

      const { error: updateError } = await supabase
        .from("accounts")
        .update(updatesForAccounts)
        .eq("account_id", profile.account_id)

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen flex-col">
        <PageHeader />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            <DashboardNav isAdmin={profile?.user_type === 'admin' || false} />

            <h1 className="text-2xl font-bold text-[#09331f] dark:text-white md:text-3xl mb-6">My Profile</h1>

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
                            <AvatarImage src={previewUrl || undefined} alt={profile.name || "User avatar"} />
                          ) : (
                            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.name || "User avatar"} />
                          )}
                          <AvatarFallback>{profile.name ? profile.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
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
                            <Input type="text" id="name" name="name" value={editedProfile.name || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.name || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</Label>
                          <p className="text-base text-gray-800 dark:text-white">{profile.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">ID Number</Label>
                          <p className="text-base text-gray-800 dark:text-white">{profile.id_number || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">User Type</Label>
                          <Badge variant={profile.user_type === "admin" ? "destructive" : "secondary"} className="capitalize">
                            {formatValue(profile.user_type)}
                          </Badge>
                        </div>
                        {profile.user_type === "admin" && profile.role && (
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
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Executive Board</Label>
                          <Badge variant={profile.is_execboard ? "default" : "outline"} className="capitalize">
                            {profile.is_execboard ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Section Head</Label>
                          <Badge variant={profile.is_sechead ? "default" : "outline"} className="capitalize">
                            {profile.is_sechead ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <Label htmlFor="birthday" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Birthday</Label>
                          {isEditing ? (
                            <Input type="date" id="birthday" name="birthday" value={editedProfile.birthday || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.birthday ? format(new Date(profile.birthday), "MMMM d, yyyy") : "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="degree_program" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Degree Program</Label>
                          {isEditing ? (
                            <Input type="text" id="degree_program" name="degree_program" value={editedProfile.degree_program || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.degree_program || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="contact_number" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Contact Number</Label>
                          {isEditing ? (
                            <Input type="tel" id="contact_number" name="contact_number" value={editedProfile.contact_number || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.contact_number || "N/A"}</p>
                          )}
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
