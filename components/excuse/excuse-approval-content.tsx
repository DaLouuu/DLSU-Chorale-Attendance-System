"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExcuseList } from "@/components/excuse/excuse-list"
import { HistoryList } from "@/components/excuse/history-list"
import { VoiceFilter } from "@/components/excuse/voice-filter"
import { DeclineReasonDialog } from "@/components/excuse/decline-reason-dialog"
import type { ExcuseRequest, ExcuseRequestWithProfile, ExcuseStatus } from "@/types/excuse"

export function ExcuseApprovalContent() {
  const [activeTab, setActiveTab] = useState("pending")
  const [activeVoice, setActiveVoice] = useState<string | null>(null)

  // Decline dialog state
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false)
  const [excuseToDecline, setExcuseToDecline] = useState<ExcuseRequestWithProfile | null>(null)
  const [historyItemToDecline, setHistoryItemToDecline] = useState<ExcuseRequestWithProfile | null>(null)

  // Data state
  const [pendingExcuses, setPendingExcuses] = useState<ExcuseRequestWithProfile[]>([])
  const [historyExcuses, setHistoryExcuses] = useState<ExcuseRequestWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch excuses data
  useEffect(() => {
    fetchExcuses()
  }, [])

  const fetchExcuses = async () => {
    try {
      setLoading(true)
      
      // Fetch pending excuses
      const pendingResponse = await fetch('/api/admin/excuses?status=Pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingExcuses(pendingData)
      }

      // Fetch history excuses (approved/rejected)
      const historyResponse = await fetch('/api/admin/excuses?status=Approved,Rejected')
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistoryExcuses(historyData)
      }
    } catch (error) {
      console.error('Error fetching excuses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      const response = await fetch(`/api/admin/excuses/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Approved' as ExcuseStatus,
        }),
      })

      if (response.ok) {
        // Refresh the data
        await fetchExcuses()
      }
    } catch (error) {
      console.error('Error approving excuse:', error)
    }
  }

  const handleDeclineClick = (excuse: ExcuseRequestWithProfile) => {
    setExcuseToDecline(excuse)
    setHistoryItemToDecline(null)
    setIsDeclineDialogOpen(true)
  }

  const handleDeclineConfirm = async (reason: string) => {
    if (excuseToDecline) {
      try {
        const response = await fetch(`/api/admin/excuses/${excuseToDecline.request_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Rejected' as ExcuseStatus,
            adminNotes: reason,
          }),
        })

        if (response.ok) {
          // Refresh the data
          await fetchExcuses()
        }
      } catch (error) {
        console.error('Error declining excuse:', error)
      }
    } else if (historyItemToDecline) {
      try {
        const response = await fetch(`/api/admin/excuses/${historyItemToDecline.request_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Rejected' as ExcuseStatus,
            adminNotes: reason,
          }),
        })

        if (response.ok) {
          // Refresh the data
          await fetchExcuses()
        }
      } catch (error) {
        console.error('Error updating excuse status:', error)
      }
    }

    // Close the dialog and reset state
    setIsDeclineDialogOpen(false)
    setExcuseToDecline(null)
    setHistoryItemToDecline(null)
  }

  const handleEditApproval = (excuse: ExcuseRequestWithProfile) => {
    if (excuse.status === "Approved") {
      // If changing from APPROVED to DECLINED, show the decline dialog
      setHistoryItemToDecline(excuse)
      setExcuseToDecline(null)
      setIsDeclineDialogOpen(true)
    } else {
      // If changing from DECLINED to APPROVED, update the status
      handleApprove(excuse.request_id)
    }
  }

  // Filter excuses based on active voice
  const filteredPendingExcuses = activeVoice 
    ? pendingExcuses.filter((excuse) => excuse.profiles?.section === activeVoice) 
    : pendingExcuses

  // Filter history items based on active voice
  const filteredHistoryExcuses = activeVoice
    ? historyExcuses.filter((excuse) => excuse.profiles?.section === activeVoice)
    : historyExcuses

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-t-lg bg-gray-100 p-0">
          <TabsTrigger
            value="pending"
            className="rounded-tl-lg rounded-tr-none py-3 data-[state=active]:bg-white data-[state=active]:text-[#09331f] data-[state=active]:shadow-none"
          >
            Pending ({filteredPendingExcuses.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-tr-lg rounded-tl-none py-3 data-[state=active]:bg-white data-[state=active]:text-[#09331f] data-[state=active]:shadow-none"
          >
            History ({filteredHistoryExcuses.length})
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <VoiceFilter activeVoice={activeVoice} setActiveVoice={setActiveVoice} />
        </div>

        <TabsContent value="pending" className="m-0">
          <ExcuseList 
            excuses={filteredPendingExcuses} 
            onApprove={handleApprove} 
            onDecline={handleDeclineClick} 
          />
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <HistoryList 
            historyItems={filteredHistoryExcuses} 
            onEditApproval={handleEditApproval} 
          />
        </TabsContent>
      </Tabs>

      {/* Decline Reason Dialog */}
      {(excuseToDecline || historyItemToDecline) && (
        <DeclineReasonDialog
          isOpen={isDeclineDialogOpen}
          onClose={() => {
            setIsDeclineDialogOpen(false)
            setExcuseToDecline(null)
            setHistoryItemToDecline(null)
          }}
          onConfirm={handleDeclineConfirm}
          excuseName={excuseToDecline?.profiles?.full_name || historyItemToDecline?.profiles?.full_name || ""}
          excuseType={excuseToDecline?.excuse_type || historyItemToDecline?.excuse_type || ""}
          excuseDate={excuseToDecline?.request_date || historyItemToDecline?.request_date || ""}
        />
      )}
    </div>
  )
}
