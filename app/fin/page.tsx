"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CalendarDays,
  DollarSign,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  Edit,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { AuthenticatedHeader } from "@/components/layout/authenticated-header"

// Mock data for demonstration
const mockMembers = [
  {
    id: 1,
    name: "Maria Santos",
    voice: "Soprano",
    email: "maria.santos@dlsu.edu.ph",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    voice: "Tenor",
    email: "juan.delacruz@dlsu.edu.ph",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Ana Rodriguez",
    voice: "Alto",
    email: "ana.rodriguez@dlsu.edu.ph",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    voice: "Bass",
    email: "carlos.mendoza@dlsu.edu.ph",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Isabella Garcia",
    voice: "Soprano",
    email: "isabella.garcia@dlsu.edu.ph",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const mockAttendanceRecords = [
  {
    id: 1,
    memberId: 1,
    date: "2024-01-15",
    type: "Rehearsal",
    status: "Absent",
    fee: 50,
    paid: false,
    excused: false,
  },
  {
    id: 2,
    memberId: 1,
    date: "2024-01-22",
    type: "Rehearsal",
    status: "Late",
    fee: 25,
    paid: true,
    excused: false,
  },
  {
    id: 3,
    memberId: 1,
    date: "2024-01-29",
    type: "Performance",
    status: "Absent",
    fee: 100,
    paid: false,
    excused: false,
  },
  {
    id: 4,
    memberId: 2,
    date: "2024-01-15",
    type: "Rehearsal",
    status: "Late",
    fee: 25,
    paid: false,
    excused: false,
  },
  {
    id: 5,
    memberId: 2,
    date: "2024-02-05",
    type: "Performance",
    status: "Absent",
    fee: 100,
    paid: true,
    excused: false,
  },
  {
    id: 6,
    memberId: 3,
    date: "2024-01-20",
    type: "Rehearsal",
    status: "Absent",
    fee: 50,
    paid: false,
    excused: false,
  },
  {
    id: 7,
    memberId: 4,
    date: "2024-01-18",
    type: "Rehearsal",
    status: "Absent",
    fee: 50,
    paid: false,
    excused: false,
  },
  {
    id: 8,
    memberId: 4,
    date: "2024-01-25",
    type: "Performance",
    status: "Absent",
    fee: 100,
    paid: false,
    excused: false,
  },
  {
    id: 9,
    memberId: 5,
    date: "2024-01-12",
    type: "Rehearsal",
    status: "Late",
    fee: 25,
    paid: true,
    excused: false,
  },
]

const mockPaymentHistory = [
  {
    id: 1,
    memberId: 1,
    date: "2024-01-25",
    amount: 25,
    method: "Cash",
    status: "Completed",
    recordedBy: "Finance Admin",
  },
  {
    id: 2,
    memberId: 1,
    date: "2024-01-10",
    amount: 50,
    method: "GCash",
    status: "Completed",
    recordedBy: "Finance Admin",
  },
  {
    id: 3,
    memberId: 2,
    date: "2024-02-08",
    amount: 100,
    method: "Bank Transfer",
    status: "Completed",
    recordedBy: "Finance Admin",
  },
  {
    id: 4,
    memberId: 5,
    date: "2024-01-15",
    amount: 25,
    method: "Cash",
    status: "Completed",
    recordedBy: "Finance Admin",
  },
]

export default function FeeManagementPage() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendanceRecords)
  const [paymentHistory, setPaymentHistory] = useState(mockPaymentHistory)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null)
  const [isMobileDetailView, setIsMobileDetailView] = useState(false)

  const selectedMemberData = mockMembers.find((m) => m.id === selectedMember)
  const memberAttendanceRecords = attendanceRecords.filter((r) => r.memberId === selectedMember)
  const memberPaymentHistory = paymentHistory.filter((p) => p.memberId === selectedMember)

  const totalFees = memberAttendanceRecords.reduce((sum, record) => sum + record.fee, 0)
  const totalPaid = memberPaymentHistory.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = totalFees - totalPaid

  // Calculate remaining balance for each member and sort by highest outstanding balance
  const getMemberBalance = (memberId: number) => {
    const memberRecords = attendanceRecords.filter((r) => r.memberId === memberId)
    const memberPayments = paymentHistory.filter((p) => p.memberId === memberId)
    const totalFees = memberRecords.reduce((sum, record) => sum + record.fee, 0)
    const totalPaid = memberPayments.reduce((sum, payment) => sum + payment.amount, 0)
    return totalFees - totalPaid
  }

  // Sort members by outstanding balance (highest first)
  const sortedMembers = [...mockMembers].sort((a, b) => {
    const balanceA = getMemberBalance(a.id)
    const balanceB = getMemberBalance(b.id)
    return balanceB - balanceA
  })

  const handleMemberSelect = (memberId: number) => {
    setSelectedMember(memberId)
    setIsMobileDetailView(true)
  }

  const handleBackToList = () => {
    setIsMobileDetailView(false)
    setSelectedMember(null)
  }

  const handleMarkAsPaid = (recordId: number) => {
    setSelectedRecordId(recordId)
    const record = attendanceRecords.find((r) => r.id === recordId)
    if (record) {
      setPaymentAmount(record.fee.toString())
    }
    setIsPaymentDialogOpen(true)
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setPaymentAmount(payment.amount.toString())
    setPaymentMethod(payment.method)
    setIsEditPaymentDialogOpen(true)
  }

  const handleDeletePayment = (paymentId: number) => {
    setDeletingPaymentId(paymentId)
    setIsDeleteDialogOpen(true)
  }

  const handlePaymentSubmit = () => {
    if (!paymentAmount || !paymentMethod || !selectedRecordId || !selectedMember) {
      toast.error("Please fill in all payment details")
      return
    }

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    // Update attendance record as paid
    setAttendanceRecords((prev) =>
      prev.map((record) => (record.id === selectedRecordId ? { ...record, paid: true } : record)),
    )

    // Add to payment history
    const newPayment = {
      id: paymentHistory.length + 1,
      memberId: selectedMember,
      date: new Date().toISOString().split("T")[0],
      amount: amount,
      method: paymentMethod,
      status: "Completed" as const,
      recordedBy: "Finance Admin",
    }

    setPaymentHistory((prev) => [newPayment, ...prev])

    // Reset form
    setPaymentAmount("")
    setPaymentMethod("")
    setSelectedRecordId(null)
    setIsPaymentDialogOpen(false)

    toast.success("Payment recorded successfully!")
  }

  const handleEditPaymentSubmit = () => {
    if (!paymentAmount || !paymentMethod || !editingPayment) {
      toast.error("Please fill in all payment details")
      return
    }

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    // Update payment history
    setPaymentHistory((prev) =>
      prev.map((payment) =>
        payment.id === editingPayment.id
          ? {
              ...payment,
              amount: amount,
              method: paymentMethod,
              recordedBy: "Finance Admin (Edited)",
            }
          : payment,
      ),
    )

    // Reset form
    setPaymentAmount("")
    setPaymentMethod("")
    setEditingPayment(null)
    setIsEditPaymentDialogOpen(false)

    toast.success("Payment updated successfully!")
  }

  const handleDeletePaymentConfirm = () => {
    if (!deletingPaymentId) return

    // Find the payment being deleted
    const deletedPayment = paymentHistory.find((p) => p.id === deletingPaymentId)

    // Remove from payment history
    setPaymentHistory((prev) => prev.filter((payment) => payment.id !== deletingPaymentId))

    // If this payment was for a specific attendance record, mark it as unpaid
    if (deletedPayment && selectedMember) {
      const relatedRecord = attendanceRecords.find(
        (record) => record.memberId === selectedMember && record.fee === deletedPayment.amount && record.paid,
      )

      if (relatedRecord) {
        setAttendanceRecords((prev) =>
          prev.map((record) => (record.id === relatedRecord.id ? { ...record, paid: false } : record)),
        )
      }
    }

    setDeletingPaymentId(null)
    setIsDeleteDialogOpen(false)

    toast.success("Payment deleted successfully!")
  }

  const handleBulkPayment = () => {
    const unpaidRecords = memberAttendanceRecords.filter((r) => !r.paid)
    const totalUnpaid = unpaidRecords.reduce((sum, record) => sum + record.fee, 0)

    setPaymentAmount(totalUnpaid.toString())
    setSelectedRecordId(null) // Indicates bulk payment
    setIsPaymentDialogOpen(true)
  }

  const handleBulkPaymentSubmit = () => {
    if (!paymentAmount || !paymentMethod || !selectedMember) {
      toast.error("Please fill in all payment details")
      return
    }

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    // Mark all unpaid records as paid
    setAttendanceRecords((prev) =>
      prev.map((record) => (record.memberId === selectedMember && !record.paid ? { ...record, paid: true } : record)),
    )

    // Add to payment history
    const newPayment = {
      id: paymentHistory.length + 1,
      memberId: selectedMember,
      date: new Date().toISOString().split("T")[0],
      amount: amount,
      method: paymentMethod,
      status: "Completed" as const,
      recordedBy: "Finance Admin",
    }

    setPaymentHistory((prev) => [newPayment, ...prev])

    // Reset form
    setPaymentAmount("")
    setPaymentMethod("")
    setSelectedRecordId(null)
    setIsPaymentDialogOpen(false)

    toast.success("Bulk payment recorded successfully!")
  }

  return (
    <div className="min-h-screen">
      <AuthenticatedHeader currentPage="finances" />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Left Sidebar - Member List */}
          <div className={`lg:w-1/3 ${isMobileDetailView ? "hidden lg:block" : "block"}`}>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {sortedMembers.map((member) => {
                    const balance = getMemberBalance(member.id)
                    return (
                      <div
                        key={member.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                          selectedMember === member.id ? "bg-[#09331f]/5 border-l-4 border-l-[#09331f]" : ""
                        }`}
                        onClick={() => handleMemberSelect(member.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.voice}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>₱{balance}</p>
                            <p className="text-xs text-gray-500">{balance > 0 ? "Outstanding" : "Paid"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Detail View */}
          <div className={`lg:w-2/3 ${!isMobileDetailView ? "hidden lg:block" : "block"}`}>
            {selectedMemberData ? (
              <div className="space-y-6">
                {/* Mobile Back Button */}
                <div className="lg:hidden">
                  <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Members
                  </Button>
                </div>

                {/* Member Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedMemberData.avatar || "/placeholder.svg"}
                        alt={selectedMemberData.name}
                        className="h-16 w-16 rounded-full"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedMemberData.name}</h2>
                        <p className="text-gray-600">
                          {selectedMemberData.voice} • {selectedMemberData.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Fees</p>
                          <p className="text-xl font-bold text-gray-900">₱{totalFees}</p>
                        </div>
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Paid</p>
                          <p className="text-xl font-bold text-green-600">₱{totalPaid}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Remaining</p>
                          <p
                            className={`text-xl font-bold ${remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            ₱{remainingBalance}
                          </p>
                        </div>
                        <Clock className="h-6 w-6 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <Badge variant={remainingBalance === 0 ? "default" : "destructive"} className="mt-1">
                            {remainingBalance === 0 ? "Fully Paid" : "Outstanding"}
                          </Badge>
                        </div>
                        <CreditCard className="h-6 w-6 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Records & Fee Breakdown */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Attendance Records & Fees
                      </CardTitle>
                      {remainingBalance > 0 && (
                        <Button onClick={handleBulkPayment} className="bg-[#09331f] hover:bg-[#09331f]/90">
                          Pay All Outstanding
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fee</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {memberAttendanceRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {new Date(record.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{record.type}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={record.status === "Present" ? "default" : "destructive"}
                                  className={
                                    record.status === "Present"
                                      ? "bg-green-100 text-green-800"
                                      : record.status === "Late"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">₱{record.fee}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={record.paid ? "default" : "destructive"}
                                  className={record.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                >
                                  {record.paid ? "Paid" : "Unpaid"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!record.paid && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(record.id)}
                                    className="bg-[#09331f] hover:bg-[#09331f]/90"
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {memberPaymentHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Recorded By</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memberPaymentHistory.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-medium">
                                  {new Date(payment.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium text-green-600">₱{payment.amount}</TableCell>
                                <TableCell>{payment.method}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                                </TableCell>
                                <TableCell>{payment.recordedBy}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditPayment(payment)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeletePayment(payment.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment history found for this member.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Member</h3>
                    <p className="text-gray-500">
                      Choose a chorale member from the list to view their fee details and payment history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="GCash">GCash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={selectedRecordId ? handlePaymentSubmit : handleBulkPaymentSubmit}
                className="bg-[#09331f] hover:bg-[#09331f]/90"
              >
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Payment Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="GCash">GCash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPaymentSubmit} className="bg-[#09331f] hover:bg-[#09331f]/90">
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone and may affect the
              member's balance calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePaymentConfirm} className="bg-red-600 hover:bg-red-700">
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
