"use client"

import { useState } from "react"
import type { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react"

interface RefundSectionProps {
  contract: ethers.Contract | null
  campaignData: any
  onSuccess: () => void
  disabled?: boolean
}

export default function RefundSection({ contract, campaignData, onSuccess, disabled = false }: RefundSectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRefund = async () => {
    if (!contract || disabled) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Use YOUR contract's function name: "getRefund"
      const tx = await contract.getRefund()
      await tx.wait()

      setSuccess(`Successfully refunded ${campaignData.userContribution} ETH!`)
      onSuccess()
    } catch (err: any) {
      console.error("Refund error:", err)
      setError(err.reason || err.message || "Failed to process refund")
    } finally {
      setLoading(false)
    }
  }

  const canGetRefund = () => {
    return (
      campaignData.isDeadlinePassed &&
      !campaignData.targetReached &&
      Number.parseFloat(campaignData.userContribution) > 0 &&
      !disabled
    )
  }

  const getRefundStatus = () => {
    if (disabled) {
      return {
        canRefund: false,
        message: "Refunds are temporarily disabled. Please check your network connection and contract status.",
        type: "warning",
      }
    }

    if (!campaignData.isDeadlinePassed) {
      return {
        canRefund: false,
        message: "Refunds are only available after the campaign deadline has passed.",
        type: "info",
      }
    }

    if (campaignData.targetReached) {
      return {
        canRefund: false,
        message: "Campaign target was reached. Refunds are not available for successful campaigns.",
        type: "info",
      }
    }

    if (Number.parseFloat(campaignData.userContribution) === 0) {
      return {
        canRefund: false,
        message: "You have not contributed to this campaign.",
        type: "info",
      }
    }

    return {
      canRefund: true,
      message: "Campaign failed to reach its target. You can claim a refund of your contribution.",
      type: "success",
    }
  }

  const refundStatus = getRefundStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5" />
          <span>Refund Center</span>
        </CardTitle>
        <CardDescription>
          If the campaign fails to reach its target by the deadline, contributors can claim refunds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Alert
          className={`${
            refundStatus.type === "success"
              ? "border-green-200 bg-green-50"
              : refundStatus.type === "warning"
                ? "border-yellow-200 bg-yellow-50"
                : "border-blue-200 bg-blue-50"
          }`}
        >
          {refundStatus.type === "warning" && <AlertTriangle className="w-4 h-4" />}
          <AlertDescription
            className={
              refundStatus.type === "success"
                ? "text-green-800"
                : refundStatus.type === "warning"
                  ? "text-yellow-800"
                  : "text-blue-800"
            }
          >
            {refundStatus.message}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">Your Contribution:</span>
            <div className="text-lg font-semibold">{campaignData.userContribution} ETH</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Campaign Status:</span>
            <div className="text-lg font-semibold">
              {campaignData.targetReached ? "Target Reached" : campaignData.isDeadlinePassed ? "Failed" : "Active"}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Target Amount:</span>
            <div className="text-lg font-semibold">{campaignData.target} ETH</div>
          </div>
          <div>
            <span className="text-muted-foreground">Amount Raised:</span>
            <div className="text-lg font-semibold">{campaignData.raisedAmount} ETH</div>
          </div>
        </div>

        {refundStatus.canRefund && (
          <Button onClick={handleRefund} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Refund...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Claim Refund ({campaignData.userContribution} ETH)
              </>
            )}
          </Button>
        )}

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium mb-2 text-yellow-900">Refund Policy</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Refunds are only available if the campaign fails to reach its target</li>
            <li>• You can only claim a refund after the campaign deadline has passed</li>
            <li>• You will receive the exact amount you contributed</li>
            <li>• Gas fees for the refund transaction are paid by you</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
