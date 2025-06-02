"use client"

import type React from "react"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, AlertTriangle } from "lucide-react"

interface CreateRequestProps {
  contract: ethers.Contract | null
  campaignData: any
  onSuccess: () => void
  disabled?: boolean
}

export default function CreateRequest({ contract, campaignData, onSuccess, disabled = false }: CreateRequestProps) {
  const [formData, setFormData] = useState({
    description: "",
    recipient: "",
    amount: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !formData.description || !formData.recipient || !formData.amount || disabled) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Validate recipient address
      if (!ethers.utils.isAddress(formData.recipient)) {
        setError("Invalid recipient address")
        return
      }

      // Validate amount
      const amountWei = ethers.utils.parseEther(formData.amount)
      const availableFunds = ethers.utils.parseEther(campaignData.raisedAmount)

      if (amountWei.gt(availableFunds)) {
        setError("Request amount exceeds available funds")
        return
      }

      // Use YOUR contract's function name: "createRequest"
      const tx = await contract.createRequest(formData.description, formData.recipient, amountWei)
      await tx.wait()

      setSuccess("Spending request created successfully!")
      setFormData({ description: "", recipient: "", amount: "" })
      onSuccess()
    } catch (err: any) {
      console.error("Create request error:", err)
      setError(err.reason || err.message || "Failed to create request")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (!campaignData.isManager) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Only the campaign manager can create spending requests.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Spending Request</span>
        </CardTitle>
        <CardDescription>
          Create a new request to spend campaign funds. Contributors will vote on whether to approve it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {disabled && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-yellow-800">
              Request creation is temporarily disabled. Please check your network connection and contract status.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this payment is for..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={loading || disabled}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => handleInputChange("recipient", e.target.value)}
              disabled={loading || disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              disabled={loading || disabled}
            />
            <div className="text-sm text-muted-foreground">Available funds: {campaignData.raisedAmount} ETH</div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.description || !formData.recipient || !formData.amount || disabled}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Request...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Spending Request
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-900">Request Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Requests need {">"} 50% approval from contributors to be executed</li>
            <li>• Only executable after campaign deadline if target is reached</li>
            <li>• Each contributor gets one vote per request</li>
            <li>• Amount cannot exceed available campaign funds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
