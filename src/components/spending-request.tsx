"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Vote, Check, Send, Loader2, X } from "lucide-react"

interface SpendingRequest {
  description: string
  recipient: string
  amount: string
  completed: boolean
  noOfVoters: number
  index: number
}

interface SpendingRequestsProps {
  contract: ethers.Contract | null
  campaignData: any
  account: string | null
  onSuccess: () => void
}

export default function SpendingRequests({ contract, campaignData, account, onSuccess }: SpendingRequestsProps) {
  const [requests, setRequests] = useState<SpendingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState("")
  const [votedRequests, setVotedRequests] = useState<{ [key: number]: boolean }>({})

  const loadRequests = async () => {
    if (!contract || !account) return

    try {
      setLoading(true)
      setError("")

      const numRequests = await contract.numRequests()
      const requestsData: SpendingRequest[] = []
      const votedStatus: { [key: number]: boolean } = {}

      for (let i = 0; i < numRequests.toNumber(); i++) {
        // Use getRequestDetails function from YOUR contract
        const [description, recipient, value, completed, noOfVoters] = await contract.getRequestDetails(i)

        // Check if user has voted using YOUR contract's hasVoted function
        const hasVoted = await contract.hasVoted(i, account)
        votedStatus[i] = hasVoted

        requestsData.push({
          description,
          recipient,
          amount: ethers.utils.formatEther(value),
          completed,
          noOfVoters: noOfVoters.toNumber(),
          index: i,
        })
      }

      setRequests(requestsData)
      setVotedRequests(votedStatus)
    } catch (err) {
      console.error("Error loading requests:", err)
      setError("Failed to load spending requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [contract, account])

  const handleVote = async (requestIndex: number, approve: boolean) => {
    if (!contract) return

    try {
      setActionLoading({ ...actionLoading, [`vote-${requestIndex}`]: true })
      setError("")

      // Use YOUR contract's voteRequest function with approve parameter
      const tx = await contract.voteRequest(requestIndex, approve)
      await tx.wait()

      await loadRequests()
      onSuccess()
    } catch (err: any) {
      console.error("Vote error:", err)
      setError(err.reason || err.message || "Failed to vote")
    } finally {
      setActionLoading({ ...actionLoading, [`vote-${requestIndex}`]: false })
    }
  }

  const handleMakePayment = async (requestIndex: number) => {
    if (!contract) return

    try {
      setActionLoading({ ...actionLoading, [`pay-${requestIndex}`]: true })
      setError("")

      const tx = await contract.makePayment(requestIndex)
      await tx.wait()

      await loadRequests()
      onSuccess()
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.reason || err.message || "Failed to make payment")
    } finally {
      setActionLoading({ ...actionLoading, [`pay-${requestIndex}`]: false })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getApprovalPercentage = (request: SpendingRequest) => {
    if (campaignData.noOfContributors === 0) return 0
    return (request.noOfVoters / campaignData.noOfContributors) * 100
  }

  const canExecute = (request: SpendingRequest) => {
    return (
      !request.completed &&
      campaignData.isManager &&
      campaignData.targetReached &&
      campaignData.isDeadlinePassed &&
      getApprovalPercentage(request) > 50
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-5 h-5" />
            <span>Spending Requests</span>
          </CardTitle>
          <CardDescription>
            Vote on how the raised funds should be spent. Each contributor gets one vote per request.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No spending requests have been created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Request #{request.index + 1}</CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {request.completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                    {canExecute(request) && <Badge className="bg-blue-100 text-blue-800">Ready to Execute</Badge>}
                    {votedRequests[request.index] && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                        You Voted
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Recipient:</span>
                    <div className="font-mono text-sm bg-gray-100 rounded p-2 mt-1">
                      {formatAddress(request.recipient)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <div className="text-lg font-semibold mt-1">{request.amount} ETH</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Approval:</span>
                    <div className="mt-1">
                      <div className="text-sm">
                        {request.noOfVoters} / {campaignData.noOfContributors} votes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getApprovalPercentage(request).toFixed(1)}% approval
                      </div>
                    </div>
                  </div>
                </div>

                {!request.completed && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      {Number.parseFloat(campaignData.userContribution) > 0 && !votedRequests[request.index] && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVote(request.index, true)}
                            disabled={actionLoading[`vote-${request.index}`]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading[`vote-${request.index}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(request.index, false)}
                            disabled={actionLoading[`vote-${request.index}`]}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            {actionLoading[`vote-${request.index}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      {Number.parseFloat(campaignData.userContribution) === 0 && (
                        <Badge variant="outline">Must contribute to vote</Badge>
                      )}
                      {votedRequests[request.index] && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Already voted
                        </Badge>
                      )}
                    </div>

                    {canExecute(request) && (
                      <Button
                        onClick={() => handleMakePayment(request.index)}
                        disabled={actionLoading[`pay-${request.index}`]}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading[`pay-${request.index}`] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Execute Payment
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
