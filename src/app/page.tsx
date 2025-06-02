"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CONTRACT_ABI } from "../../contracts/abi"
import { Wallet, Target, Users, Vote, Send, RefreshCw, AlertTriangle } from "lucide-react"
import WalletConnection from "@/components/wallet-connection"
import CampaignOverview from "@/components/campaign-overview"
import ContributionForm from "@/components/contribution-form"
import SpendingRequests from "@/components/spending-request"
import CreateRequest from "@/components/create-request"
import RefundSection from "@/components/refund-section"
import { useWeb3 } from "@/hooks/use-web3"

// Your exact ABI from Remix

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5ea8fb92a197d5b754bfa1c4ba3c7e67c76d61cc" // Example address - replace with yours

// Expected network configuration
const EXPECTED_NETWORKS = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Polygon Mumbai",
}

export default function CrowdfundingDApp() {
  const { account, provider, signer, isConnected, chainId } = useWeb3()

  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [campaignData, setCampaignData] = useState({
    manager: "",
    target: "0",
    deadline: 0,
    raisedAmount: "0",
    noOfContributors: 0,
    isManager: false,
    userContribution: "0",
    isDeadlinePassed: false,
    targetReached: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [networkError, setNetworkError] = useState("")
  const [contractExists, setContractExists] = useState<boolean | null>(null)

  // Optimized data loading with useCallback to prevent unnecessary re-renders
  const loadCampaignData = useCallback(
    async (forceReload = false) => {
      if (!contract || !account) return

      // Skip reload if data already exists and not forced
      if (!forceReload && campaignData.manager && campaignData.target !== "0") {
        return
      }

      try {
        setLoading(true)
        setError("")

        // Check if contract exists at the address (fixed bug)
        const code = await provider?.getCode(CONTRACT_ADDRESS)
        if (!code || code === "0x" || code === "0x0") {
          setContractExists(false)
          throw new Error(`No contract found at address ${CONTRACT_ADDRESS}. Please check the address and network.`)
        }
        setContractExists(true)

        const [manager, target, deadline, raisedAmount, noOfContributors, userContribution] = await Promise.all([
          contract.manager(),
          contract.target(),
          contract.deadline(),
          contract.raisedAmount(),
          contract.noOfContributors(),
          contract.contributors(account),
        ])

        const now = Math.floor(Date.now() / 1000)
        const isDeadlinePassed = now > deadline.toNumber()
        const targetReached = raisedAmount.gte(target)

        setCampaignData({
          manager: manager.toLowerCase(),
          target: ethers.utils.formatEther(target),
          deadline: deadline.toNumber(),
          raisedAmount: ethers.utils.formatEther(raisedAmount),
          noOfContributors: noOfContributors.toNumber(),
          isManager: manager.toLowerCase() === account.toLowerCase(),
          userContribution: ethers.utils.formatEther(userContribution),
          isDeadlinePassed,
          targetReached,
        })
      } catch (err: any) {
        console.error("Error loading campaign data:", err)
        setContractExists(false)

        if (err.code === "CALL_EXCEPTION") {
          setError("Contract call failed. Make sure the contract is deployed and ABI is correct.")
        } else if (err.message?.includes("resolver or addr")) {
          setError("Invalid contract address. Please check the address and network.")
        } else {
          setError(err.message || "Failed to load campaign data")
        }

        // Set safe default values
        setCampaignData({
          manager: "",
          target: "0",
          deadline: 0,
          raisedAmount: "0",
          noOfContributors: 0,
          isManager: false,
          userContribution: "0",
          isDeadlinePassed: false,
          targetReached: false,
        })
      } finally {
        setLoading(false)
      }
    },
    [contract, account, provider, campaignData.manager, campaignData.target],
  )

  // Initialize contract
  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      try {
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer || provider)
        setContract(contractInstance)
        setError("")
      } catch (err) {
        console.error("Contract initialization error:", err)
        setError("Failed to initialize contract. Check address and ABI.")
      }
    }
  }, [provider, signer])

  // Network validation
  useEffect(() => {
    if (chainId && !EXPECTED_NETWORKS[chainId as keyof typeof EXPECTED_NETWORKS]) {
      setNetworkError(`Unsupported network. Please switch to one of: ${Object.values(EXPECTED_NETWORKS).join(", ")}`)
    } else {
      setNetworkError("")
    }
  }, [chainId])

  // Load data when contract or account changes
  useEffect(() => {
    if (contract && account) {
      loadCampaignData(true) // Force reload on initial load
    }
  }, [contract, account])

  // Optimized event listeners - only update specific data instead of full reload
  useEffect(() => {
    if (!contract) return

    const handleContribution = (contributor: string, amount: ethers.BigNumber) => {
      console.log("Contribution event:", contributor, ethers.utils.formatEther(amount))
      // Only reload if it's the current user's contribution
      if (contributor.toLowerCase() === account?.toLowerCase()) {
        loadCampaignData(true)
      } else {
        // Just update the raised amount and contributor count
        setCampaignData((prev) => ({
          ...prev,
          raisedAmount: (
            Number.parseFloat(prev.raisedAmount) + Number.parseFloat(ethers.utils.formatEther(amount))
          ).toString(),
          noOfContributors: prev.noOfContributors + 1,
        }))
      }
    }

    const handleRefund = (contributor: string, amount: ethers.BigNumber) => {
      console.log("Refund event:", contributor, ethers.utils.formatEther(amount))
      if (contributor.toLowerCase() === account?.toLowerCase()) {
        loadCampaignData(true)
      }
    }

    const handleRequestCreated = (
      requestId: ethers.BigNumber,
      description: string,
      recipient: string,
      value: ethers.BigNumber,
    ) => {
      console.log("Request created:", requestId.toNumber(), description, recipient, ethers.utils.formatEther(value))
      // No need to reload campaign data for request creation
    }

    const handleVoteCast = (requestId: ethers.BigNumber, voter: string) => {
      console.log("Vote cast:", requestId.toNumber(), voter)
      // No need to reload campaign data for votes
    }

    const handlePaymentExecuted = (requestId: ethers.BigNumber, recipient: string, value: ethers.BigNumber) => {
      console.log("Payment executed:", requestId.toNumber(), recipient, ethers.utils.formatEther(value))
      // Update raised amount after payment
      setCampaignData((prev) => ({
        ...prev,
        raisedAmount: (
          Number.parseFloat(prev.raisedAmount) - Number.parseFloat(ethers.utils.formatEther(value))
        ).toString(),
      }))
    }

    contract.on("ContributionReceived", handleContribution)
    contract.on("RefundIssued", handleRefund)
    contract.on("RequestCreated", handleRequestCreated)
    contract.on("VoteCast", handleVoteCast)
    contract.on("PaymentExecuted", handlePaymentExecuted)

    return () => {
      contract.removeAllListeners()
    }
  }, [contract, account, loadCampaignData])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your MetaMask wallet to interact with the crowdfunding campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnection />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CrowdFund</h1>
              {chainId && EXPECTED_NETWORKS[chainId as keyof typeof EXPECTED_NETWORKS] && (
                <span className="text-sm text-gray-500">
                  ({EXPECTED_NETWORKS[chainId as keyof typeof EXPECTED_NETWORKS]})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {campaignData.isManager && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Manager
                </span>
              )}
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Error */}
        {networkError && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-yellow-800">{networkError}</AlertDescription>
          </Alert>
        )}

        {/* Contract Error */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Contract Status */}
        {contractExists === false && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <div>
                  Contract not found at address: <code className="bg-red-100 px-1 rounded">{CONTRACT_ADDRESS}</code>
                </div>
                <div className="text-sm">
                  Please check:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Contract address is correct</li>
                    <li>You're on the right network</li>
                    <li>Contract is deployed and verified</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Campaign Overview */}
            <CampaignOverview campaignData={campaignData} />

            {/* Main Tabs */}
            <Tabs defaultValue="contribute" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contribute" className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Contribute</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center space-x-2">
                  <Vote className="w-4 h-4" />
                  <span>Requests</span>
                </TabsTrigger>
                {campaignData.isManager && (
                  <TabsTrigger value="manage" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Manage</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="refund" className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refund</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contribute" className="mt-6">
                <ContributionForm
                  contract={contract}
                  campaignData={campaignData}
                  onSuccess={() => loadCampaignData(true)}
                  disabled={campaignData.isDeadlinePassed || networkError !== "" || contractExists === false}
                />
              </TabsContent>

              <TabsContent value="requests" className="mt-6">
                <SpendingRequests
                  contract={contract}
                  campaignData={campaignData}
                  account={account}
                  onSuccess={() => loadCampaignData(true)}
                />
              </TabsContent>

              {campaignData.isManager && (
                <TabsContent value="manage" className="mt-6">
                  <CreateRequest
                    contract={contract}
                    campaignData={campaignData}
                    onSuccess={() => loadCampaignData(true)}
                    disabled={networkError !== "" || contractExists === false}
                  />
                </TabsContent>
              )}

              <TabsContent value="refund" className="mt-6">
                <RefundSection
                  contract={contract}
                  campaignData={campaignData}
                  onSuccess={() => loadCampaignData(true)}
                  disabled={networkError !== "" || contractExists === false}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
