"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"

export default function WalletConnection() {
  const { account, isConnected, connectWallet, disconnectWallet, chainId } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 5:
        return "Goerli"
      case 11155111:
        return "Sepolia"
      case 137:
        return "Polygon"
      default:
        return "Unknown"
    }
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} className="flex items-center space-x-2">
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          {chainId && getNetworkName(chainId)}
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">
          {account && formatAddress(account)}
        </Badge>
      </div>
      <Button variant="outline" size="sm" onClick={disconnectWallet} className="flex items-center space-x-1">
        <LogOut className="w-3 h-3" />
        <span>Disconnect</span>
      </Button>
    </div>
  )
}
