"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Timer } from "lucide-react"

interface CampaignData {
  manager: string
  target: string
  deadline: number
  raisedAmount: string
  noOfContributors: number
  isManager: boolean
  userContribution: string
  isDeadlinePassed: boolean
  targetReached: boolean
}

interface CampaignOverviewProps {
  campaignData: CampaignData
}

export default function CampaignOverview({ campaignData }: CampaignOverviewProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = Math.max(0, campaignData.deadline - now)

      const days = Math.floor(remaining / (24 * 60 * 60))
      const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((remaining % (60 * 60)) / 60)
      const seconds = remaining % 60

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [campaignData.deadline])

  const progressPercentage =
    Number.parseFloat(campaignData.target) > 0
      ? (Number.parseFloat(campaignData.raisedAmount) / Number.parseFloat(campaignData.target)) * 100
      : 0

  const formatAddress = (address: string) => {
    if (!address) return "Not loaded"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusBadge = () => {
    if (campaignData.targetReached) {
      return <Badge className="bg-green-100 text-green-800">Target Reached</Badge>
    }
    if (campaignData.isDeadlinePassed) {
      return <Badge variant="destructive">Deadline Passed</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
  }

  const formatCountdown = () => {
    if (campaignData.isDeadlinePassed) {
      return "Campaign Ended"
    }

    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
    } else {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Funding Progress */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Funding Progress</span>
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Raised: {campaignData.raisedAmount} ETH</span>
              <span>Target: {campaignData.target} ETH</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {progressPercentage.toFixed(1)}% of target reached
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{campaignData.noOfContributors}</div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{campaignData.userContribution}</div>
              <div className="text-sm text-muted-foreground">Your Contribution (ETH)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Countdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="w-5 h-5" />
            <span>Time Left</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {!campaignData.isDeadlinePassed ? (
              <>
                <div className="text-2xl font-bold text-orange-600 font-mono">
                  {timeLeft.days > 0 ? (
                    <div className="space-y-1">
                      <div>{timeLeft.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>
                        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground">H:M:S</div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">{formatCountdown()}</div>
              </>
            ) : (
              <div className="text-2xl font-bold text-red-600">ENDED</div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Deadline: {new Date(campaignData.deadline * 1000).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="font-mono text-sm bg-gray-100 rounded p-2 mb-2">{formatAddress(campaignData.manager)}</div>
            {campaignData.isManager && (
              <Badge variant="secondary" className="text-xs">
                You are the manager
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
