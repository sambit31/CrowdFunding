"use client"

import type React from "react"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2, AlertTriangle } from "lucide-react"

interface ContributionFormProps {
  contract: ethers.Contract | null
  campaignData: any
  onSuccess: () => void
  disabled?: boolean
}

export default function ContributionForm({
  contract,
  campaignData,
  onSuccess,
  disabled = false,
}: ContributionFormProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !amount || disabled) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const amountWei = ethers.utils.parseEther(amount)

      // Check minimum contribution (100 wei)
      if (amountWei.lt(ethers.BigNumber.from("100"))) {
        setError("Minimum contribution is 100 wei")
        return
      }

      // Check if deadline has passed
      if (campaignData.isDeadlinePassed) {
        setError("Campaign deadline has passed")
        return
      }

      // Use YOUR contract's function name: "contribute"
      const tx = await contract.contribute({ value: amountWei })
      await tx.wait()

      setSuccess(`Successfully contributed ${amount} ETH!`)
      setAmount("")
      onSuccess()
    } catch (err: any) {
      console.error("Contribution error:", err)
      setError(err.reason || err.message || "Failed to contribute")
    } finally {
      setLoading(false)
    }
  }

  const canContribute = !campaignData.isDeadlinePassed && !campaignData.targetReached && !disabled

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <span>Make a Contribution</span>
        </CardTitle>
        <CardDescription>Support this campaign by contributing ETH. Minimum contribution is 100 wei.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Deadline Warning */}
        {campaignData.isDeadlinePassed && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">
              Campaign deadline has passed. No more contributions are accepted.
            </AlertDescription>
          </Alert>
        )}

        {/* Target Reached */}
        {campaignData.targetReached && !campaignData.isDeadlinePassed && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Campaign target has been reached! You can still contribute to support the project further.
            </AlertDescription>
          </Alert>
        )}

        {/* Disabled Warning */}
        {disabled && !campaignData.isDeadlinePassed && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-yellow-800">
              Contributions are temporarily disabled. Please check your network connection and contract status.
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

        <form onSubmit={handleContribute} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || !canContribute}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !amount || !canContribute}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Contributing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Contribute {amount || "0"} ETH
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Campaign Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Target:</span>
              <span className="ml-2 font-medium">{campaignData.target} ETH</span>
            </div>
            <div>
              <span className="text-muted-foreground">Raised:</span>
              <span className="ml-2 font-medium">{campaignData.raisedAmount} ETH</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contributors:</span>
              <span className="ml-2 font-medium">{campaignData.noOfContributors}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Your Total:</span>
              <span className="ml-2 font-medium">{campaignData.userContribution} ETH</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
