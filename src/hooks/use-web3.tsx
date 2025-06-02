"use client"

import type React from "react"

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

import { useState, useEffect, createContext, useContext } from "react"
import { ethers } from "ethers"

interface Web3ContextType {
  account: string | null
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  isConnected: boolean
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  networkError: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // Expected network - change this to match your contract's network
  // Sepolia = 11155111, Goerli = 5, Mainnet = 1
  const EXPECTED_NETWORK_ID = 11155111
  const EXPECTED_NETWORK_NAME = "Sepolia"

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])

        const signer = provider.getSigner()
        const account = await signer.getAddress()
        const network = await provider.getNetwork()

        setProvider(provider)
        setSigner(signer)
        setAccount(account)
        setChainId(network.chainId)

        // Check if on the correct network
        if (network.chainId !== EXPECTED_NETWORK_ID) {
          setNetworkError(`Please switch to ${EXPECTED_NETWORK_NAME} network to interact with this dApp`)

          // Optionally, prompt to switch networks
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${EXPECTED_NETWORK_ID.toString(16)}` }],
            })
          } catch (switchError) {
            // Handle error or user rejection
            console.error("Failed to switch networks:", switchError)
          }
        } else {
          setNetworkError(null)
        }

        // Store connection state
        localStorage.setItem("walletConnected", "true")
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("Please install MetaMask!")
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    localStorage.removeItem("walletConnected")
  }

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("walletConnected")
    if (wasConnected && typeof window !== "undefined" && window.ethereum) {
      connectWallet()
    }
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const value = {
    account,
    provider,
    signer,
    isConnected: !!account,
    chainId,
    connectWallet,
    disconnectWallet,
    networkError,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
