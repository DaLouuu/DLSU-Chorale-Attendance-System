"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExcuseList } from "@/components/excuse/excuse-list"
import { HistoryList } from "@/components/excuse/history-list"
import { VoiceFilter } from "@/components/excuse/voice-filter"
import type { ExcuseItem, HistoryItem } from "@/types/excuse"

export function ExcuseApprovalContent() {
  const [activeTab, setActiveTab] = useState("pending")
  const [activeVoice, setActiveVoice] = useState<string | null>(null)

  // Pending excuses data
  const [excuses, setExcuses] = useState<ExcuseItem[]>([
    {
        id: "1",
        name: "Dana Guillarte",
        voiceSection: "soprano",
        voiceNumber: 1,
        type: "ABSENT",
        date: "Tuesday, September 21, 2004",
        reason: "Thesis Meeting",
        notes: "thesis offended",
        profileImage: "/images/default-avatar.jpg",
      },
      {
        id: "2",
        name: "Marian Ariaga",
        voiceSection: "alto",
        voiceNumber: 1,
        type: "ABSENT",
        date: "Tuesday, September 21, 2004",
        reason: "Sick",
        notes: "masakit likod",
        profileImage: "/images/default-avatar.jpg",
      },
      {
        id: "3",
        name: "Kharlene Monloy",
        voiceSection: "alto",
        voiceNumber: 2,
        type: "ABSENT",
        date: "Tuesday, September 21, 2004",
        reason: "Family Matters",
        notes: "Family reunion",
        profileImage: "/images/default-avatar.jpg",
      },
      {
        id: "4",
        name: "Rovin Montaño",
        voiceSection: "tenor",
        voiceNumber: 2,
        type: "LATE",
        date: "Wednesday, September 22, 2004",
        reason: "Traffic",
        notes: "Heavy traffic on EDSA",
        profileImage: "/images/default-avatar.jpg",
      },
      {
        id: "5",
        name: "Ballerina Cappuccina",
        voiceSection: "soprano",
        voiceNumber: 2,
        type: "ABSENT",
        date: "Thursday, September 23, 2004",
        reason: "Exam",
        notes: "Final exam for Math 101",
        profileImage: "/images/default-avatar.jpg",
      },
      {
        id: "6",
        name: "Kean Genota",
        voiceSection: "bass",
        voiceNumber: 2,
        type: "LATE",
        date: "Friday, September 24, 2004",
        reason: "Requirements",
        notes: "Had to submit a project",
        profileImage: "/images/default-avatar.jpg",
      },
  ])

  // History data
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: "h1",
      name: "Tralalero Tralala",
      voiceSection: "alto",
      voiceNumber: 1,
      type: "ABSENT",
      date: "Tuesday, September 21, 2004",
      status: "DECLINED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h2",
      name: "Tralalero Tralala",
      voiceSection: "alto",
      voiceNumber: 1,
      type: "LATE",
      date: "Tuesday, September 21, 2004",
      status: "APPROVED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h3",
      name: "Tralalero Tralala",
      voiceSection: "alto",
      voiceNumber: 1,
      type: "ABSENT",
      date: "Tuesday, September 21, 2004",
      status: "APPROVED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h4",
      name: "Tralalero Tralala",
      voiceSection: "alto",
      voiceNumber: 1,
      type: "LATE",
      date: "Tuesday, September 21, 2004",
      status: "DECLINED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h5",
      name: "Soprano Example",
      voiceSection: "soprano",
      voiceNumber: 2,
      type: "ABSENT",
      date: "Wednesday, September 22, 2004",
      status: "APPROVED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h6",
      name: "Tenor Example",
      voiceSection: "tenor",
      voiceNumber: 1,
      type: "LATE",
      date: "Thursday, September 23, 2004",
      status: "DECLINED",
      profileImage: "/images/profile-1.jpg",
    },
    {
      id: "h7",
      name: "Bass Example",
      voiceSection: "bass",
      voiceNumber: 3,
      type: "ABSENT",
      date: "Friday, September 24, 2004",
      status: "APPROVED",
      profileImage: "/images/profile-1.jpg",
    },
  ])

  const handleApprove = (id: string) => {
    // Move the excuse from pending to history with APPROVED status
    const excuseToMove = excuses.find((excuse) => excuse.id === id)
    if (excuseToMove) {
      const newHistoryItem: HistoryItem = {
        id: `h${Date.now()}`, // Generate a new ID
        name: excuseToMove.name,
        voiceSection: excuseToMove.voiceSection,
        voiceNumber: excuseToMove.voiceNumber,
        type: excuseToMove.type,
        date: excuseToMove.date,
        status: "APPROVED",
        profileImage: excuseToMove.profileImage,
      }

      setHistoryItems([newHistoryItem, ...historyItems])
      setExcuses(excuses.filter((excuse) => excuse.id !== id))
    }
  }

  const handleDecline = (id: string) => {
    // Move the excuse from pending to history with DECLINED status
    const excuseToMove = excuses.find((excuse) => excuse.id === id)
    if (excuseToMove) {
      const newHistoryItem: HistoryItem = {
        id: `h${Date.now()}`, // Generate a new ID
        name: excuseToMove.name,
        voiceSection: excuseToMove.voiceSection,
        voiceNumber: excuseToMove.voiceNumber,
        type: excuseToMove.type,
        date: excuseToMove.date,
        status: "DECLINED",
        profileImage: excuseToMove.profileImage,
      }

      setHistoryItems([newHistoryItem, ...historyItems])
      setExcuses(excuses.filter((excuse) => excuse.id !== id))
    }
  }

  const handleEditApproval = (id: string) => {
    // Find the history item
    const historyItem = historyItems.find((item) => item.id === id)
    if (historyItem) {
      // Toggle the status
      const newStatus = historyItem.status === "APPROVED" ? "DECLINED" : "APPROVED"

      // Update the history items
      setHistoryItems(historyItems.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
    }
  }

  // Filter excuses based on active voice
  const filteredExcuses = activeVoice ? excuses.filter((excuse) => excuse.voiceSection === activeVoice) : excuses

  // Filter history items based on active voice
  const filteredHistoryItems = activeVoice
    ? historyItems.filter((item) => item.voiceSection === activeVoice)
    : historyItems

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-t-lg bg-gray-100 p-0">
          <TabsTrigger
            value="pending"
            className="rounded-tl-lg rounded-tr-none py-3 data-[state=active]:bg-white data-[state=active]:text-[#09331f] data-[state=active]:shadow-none"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-tr-lg rounded-tl-none py-3 data-[state=active]:bg-white data-[state=active]:text-[#09331f] data-[state=active]:shadow-none"
          >
            History
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <VoiceFilter activeVoice={activeVoice} setActiveVoice={setActiveVoice} />
        </div>

        <TabsContent value="pending" className="m-0">
          <ExcuseList excuses={filteredExcuses} onApprove={handleApprove} onDecline={handleDecline} />
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <HistoryList historyItems={filteredHistoryItems} onEditApproval={handleEditApproval} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
