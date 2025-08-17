"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Pencil, Save, X } from "lucide-react"

const COLLEGE_OPTIONS = [
  "Brother Andrew Gonzales College of Education",
  "Carlos L. Tiu School of Economics",
  "College of Computer Studies",
  "College of Liberal Arts",
  "College of Science",
  "Gokongwei College of Engineering",
  "Ramon V. del Rosario College of Business",
  "School of Innovation and Sustainability (Laguna Campus)",
  "Tañada-Diokno School of Law"
]

const COMMITTEE_OPTIONS = [
  "Production & Logistics",
  "Finance",
  "Documentations",
  "Human Resources",
  "Publicity & Marketing"
]

const VOICE_SECTION_OPTIONS = [
  "Soprano",
  "Alto",
  "Tenor",
  "Bass"
]

const MEMBERSHIP_STATUS_OPTIONS = [
  "Trainee",
  "Junior Member",
  "Senior Member"
]

const CURRENT_TERM_STAT_OPTIONS = [
  "Inactive",
  "Active (Performing)",
  "Active (Non-performing)",
  "Honorary (Graduating)",
  "On Leave of Absence (LOA)",
  "Resigned",
  "Withdrawn Unofficially"
]

const ROLE_OPTIONS = [
  "Not Applicable",
  "Executive Board",
  "Company Manager",
  "Associate Company Manager",
  "Conductor"
]

const SECHEAD_TYPE_OPTIONS = [
  "Not Applicable",
  "Logistical",
  "Musical"
]

interface UserProfile {
  id: string
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  committee: string | null
  role: string | null
  section: string | null
  school_id: number | null
  degree_code: string | null
  college: string | null
  membership_status: string | null
  current_term_status: string | null
  birthday: string | null
  last_name: string | null
  first_name: string | null
  middle_name: string | null
  nickname: string | null
  contact_number: number | null
  sechead_type: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'middle_name' | 'nickname' | 'committee' | 'section' | 'degree_code' | 'college' | 'membership_status' | 'current_term_status' | 'birthday' | 'contact_number' | 'role' | 'sechead_type'>>>({})
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
            avatar_url,
            created_at,
            updated_at,
            committee,
            role,
            section,
            school_id,
            degree_code,
            college,
            membership_status,
            current_term_status,
            birthday,
            last_name,
            first_name,
            middle_name,
            nickname,
            contact_number,
            sechead_type
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
          avatar_url: accountData.avatar_url,
          created_at: accountData.created_at,
          updated_at: accountData.updated_at,
          committee: accountData.committee,
          role: accountData.role,
          section: accountData.section,
          school_id: accountData.school_id,
          degree_code: accountData.degree_code,
          college: accountData.college,
          membership_status: accountData.membership_status,
          current_term_status: accountData.current_term_status,
          birthday: accountData.birthday,
          last_name: accountData.last_name,
          first_name: accountData.first_name,
          middle_name: accountData.middle_name,
          nickname: accountData.nickname,
          contact_number: accountData.contact_number,
          sechead_type: accountData.sechead_type,
        }
        setProfile(userProfileData)
        console.log("[ProfilePage] Profile state set:", userProfileData)

        setEditedProfile({
          first_name: accountData.first_name || "",
          last_name: accountData.last_name || "",
          middle_name: accountData.middle_name || "",
          nickname: accountData.nickname || "",
          committee: accountData.committee || "",
          section: accountData.section || "",
          degree_code: accountData.degree_code || "",
          college: accountData.college || "",
          membership_status: accountData.membership_status || "",
          current_term_status: accountData.current_term_status || null,
          birthday: accountData.birthday || "",
          contact_number: accountData.contact_number || null,
          role: accountData.role || "",
          sechead_type: accountData.sechead_type || "",
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
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            middle_name: profile.middle_name || "",
            nickname: profile.nickname || "",
            committee: profile.committee || "",
            section: profile.section || "",
            degree_code: profile.degree_code || "",
            college: profile.college || "",
            membership_status: profile.membership_status || "",
            current_term_status: profile.current_term_status || null,
            birthday: profile.birthday || "",
            contact_number: profile.contact_number || null,
            role: profile.role || "",
            sechead_type: profile.sechead_type || "",
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
      
      // Ensure current_term_status is properly handled
      if (editedProfile.current_term_status === "") {
        updatesForAccounts.current_term_status = null;
      }
      
      if (newProfileImageUrl !== profile.avatar_url) {
        updatesForAccounts.avatar_url = newProfileImageUrl
      }
      console.log("[ProfilePage] Data to update in 'profiles':", updatesForAccounts)

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatesForAccounts)
        .eq("id", profile.id)

      if (updateError) {
        console.error("[ProfilePage] Error updating account in DB:", updateError)
        console.error("[ProfilePage] Error details - code:", updateError.code, "message:", updateError.message, "details:", updateError.details)
        console.error("[ProfilePage] Data that failed to update:", updatesForAccounts)
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
    // Convert empty strings to null for database compatibility
    const processedValue = value === "" ? null : value;
    setEditedProfile(prev => ({ ...prev, [name]: processedValue }));
  };



  const formatContactNumber = (contactNumber: number | null): string => {
    if (!contactNumber) return "N/A"
    const numberStr = contactNumber.toString()
    
    // Remove any leading zeros or country code indicators
    const cleanNumber = numberStr
    
    // If it's 11 digits and starts with 9 (Philippine mobile format)
    if (cleanNumber.length === 11 && cleanNumber.startsWith('9')) {
      return `+63 ${cleanNumber.slice(1, 4)} ${cleanNumber.slice(4, 7)} ${cleanNumber.slice(7, 11)}`
    }
    // If it's 10 digits (Philippine mobile without leading 9)
    else if (cleanNumber.length === 10) {
      return `+63 ${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6, 10)}`
    }
    // If it's 9 digits (Philippine mobile without leading 9)
    else if (cleanNumber.length === 9) {
      return `+63 ${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6, 9)}`
    }
    // For other formats, just return the number as is
    else {
      return cleanNumber
    }
  }

  const formatFullName = (lastName: string | null, firstName: string | null, middleName: string | null): string => {
    if (!lastName && !firstName) return "N/A"
    
    const last = lastName || ""
    const first = firstName || ""
    const middle = middleName ? middleName.charAt(0).toUpperCase() + "." : ""
    
    if (last && first) {
      return `${last.toUpperCase()}, ${first} ${middle}`.trim()
    } else if (last) {
      return last.toUpperCase()
    } else if (first) {
      return first
    }
    return "N/A"
  }

  const formatRoles = (role: string | null, secheadType: string, voiceSection: string | null): string => {
    const roles = []
    
    // Add main role if applicable
    if (role && role !== "Not Applicable") {
      if (role === "Executive Board") {
        roles.push(`Division Manager for ${profile?.committee || "Unknown Committee"}`)
      } else if (role === "Company Manager") {
        roles.push("Company Manager")
      } else if (role === "Associate Company Manager") {
        roles.push("Associate Company Manager")
      } else if (role === "Conductor") {
        roles.push("Conductor")
      }
    }
    
    // Add section head role if applicable
    if (secheadType && secheadType !== "Not Applicable" && voiceSection) {
      const sectionHeadTitle = `${secheadType} Section Head for ${voiceSection}`
      roles.push(sectionHeadTitle)
    }
    
    if (roles.length === 0) {
      return "Not Applicable"
    }
    
    return roles.join(", ")
  }

  const shouldShowRole = (role: string | null, committee: string | null): boolean => {
    return role !== "Not Applicable" || committee === "Human Resources"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <AuthenticatedHeader currentPage="profile" />

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-4xl">
            

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
                            <AvatarImage src={previewUrl || undefined} alt={profile.first_name || "User avatar"} />
                          ) : (
                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name || "User avatar"} />
                          )}
                          <AvatarFallback>{profile.first_name ? profile.first_name.charAt(0).toUpperCase() : profile.last_name ? profile.last_name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-[#09331f] text-white rounded-full p-1.5 cursor-pointer hover:bg-[#0a4429]">
                            <Pencil className="h-3 w-3" />
                            <input id="profile-image-upload" type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                          </label>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                        <div className="sm:col-span-2">
                          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</Label>
                          {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="first_name" className="text-xs font-semibold text-gray-500 dark:text-gray-400">First Name</Label>
                                <Input type="text" id="first_name" name="first_name" value={editedProfile.first_name || ""} onChange={handleInputChange} placeholder="Enter First Name" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                              </div>
                              <div>
                                <Label htmlFor="last_name" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Last Name</Label>
                                <Input type="text" id="last_name" name="last_name" value={editedProfile.last_name || ""} onChange={handleInputChange} placeholder="Enter Last Name" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                              </div>
                              <div>
                                <Label htmlFor="middle_name" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Middle Name</Label>
                                <Input type="text" id="middle_name" name="middle_name" value={editedProfile.middle_name || ""} onChange={handleInputChange} placeholder="Enter Middle Name" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                              </div>
                            </div>
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{formatFullName(profile.last_name, profile.first_name, profile.middle_name)}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="nickname" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nickname</Label>
                          {isEditing ? (
                            <Input type="text" id="nickname" name="nickname" value={editedProfile.nickname || ""} onChange={handleInputChange} placeholder="Enter Nickname" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.nickname || "N/A"}</p>
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
                        {shouldShowRole(profile.role, profile.committee) && (
                          <div>
                            <Label htmlFor="role" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Roles</Label>
                            {isEditing && (profile.committee === "Human Resources" || (profile.role && profile.role !== "Not Applicable")) ? (
                              <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, role: value }))} value={editedProfile.role || ""}>
                                <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-base font-medium text-gray-800 dark:text-white">
                                {formatRoles(profile.role, profile.sechead_type, profile.section)}
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <Label htmlFor="degree_code" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Degree Code</Label>
                          {isEditing ? (
                            <Input type="text" id="degree_code" name="degree_code" value={editedProfile.degree_code || ""} onChange={handleInputChange} placeholder="Enter Degree Code" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.degree_code || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="college" className="text-xs font-semibold text-gray-500 dark:text-gray-400">College</Label>
                          {isEditing ? (
                            <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, college: value }))} value={editedProfile.college || ""}>
                              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Select a college" />
                              </SelectTrigger>
                              <SelectContent>
                                {COLLEGE_OPTIONS.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.college || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="membership_status" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Membership Status</Label>
                          {isEditing ? (
                            <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, membership_status: value }))} value={editedProfile.membership_status || ""}>
                              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                              <SelectContent>
                                {MEMBERSHIP_STATUS_OPTIONS.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.membership_status || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="current_term_status" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Current Term Status</Label>
                          {isEditing ? (
                            <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, current_term_status: value }))} value={editedProfile.current_term_status || ""}>
                              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENT_TERM_STAT_OPTIONS.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.current_term_status || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="birthday" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Birthday</Label>
                          {isEditing ? (
                            <Input type="date" id="birthday" name="birthday" value={editedProfile.birthday || ""} onChange={handleInputChange} className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : "N/A"}</p>
                          )}
                        </div>
                        {profile.role !== "Not Applicable" && (
                          <div>
                            <Label htmlFor="section" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Voice Section</Label>
                            {isEditing ? (
                              <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, section: value }))} value={editedProfile.section || ""}>
                                <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                  <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                  {VOICE_SECTION_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-base font-medium text-gray-800 dark:text-white">{profile.section || "N/A"}</p>
                          )}
                          </div>
                        )}
                        <div>
                          <Label htmlFor="committee" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Committee</Label>
                          {isEditing ? (
                            <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, committee: value }))} value={editedProfile.committee || ""}>
                              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Select a committee" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMITTEE_OPTIONS.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{profile.committee || "N/A"}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="contact_number" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Contact Number</Label>
                          {isEditing ? (
                            <Input type="number" id="contact_number" name="contact_number" value={editedProfile.contact_number || ""} onChange={handleInputChange} placeholder="Enter Contact Number" className="w-full text-base dark:bg-gray-700 dark:text-white" />
                          ) : (
                            <p className="text-base font-medium text-gray-800 dark:text-white">{formatContactNumber(profile.contact_number)}</p>
                          )}
                        </div>
                        {isEditing && (profile.committee === "Human Resources" || (profile.role && profile.role !== "Not Applicable")) && (
                          <div>
                            <Label htmlFor="sechead_type" className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sechead Type</Label>
                            <Select onValueChange={(value) => setEditedProfile(prev => ({ ...prev, sechead_type: value }))} value={editedProfile.sechead_type || ""}>
                              <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                {SECHEAD_TYPE_OPTIONS.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
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

        
      </div>
    </div>
  )
}
