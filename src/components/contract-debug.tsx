"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Bug } from "lucide-react"

interface ContractDebugProps {
  provider: ethers.providers.Web3Provider | null
  contractAddress: string
  contractAbi: any[]
}

export default function ContractDebug({ provider, contractAddress, contractAbi }: ContractDebugProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)
  const [method, setMethod] = useState("")
  const [args, setArgs] = useState("")

  const checkContract = async () => {
    if (!provider) return

    try {
      setLoading(true)
      setError("")
      setResult(null)

      // Check if contract exists at address
      const code = await provider.getCode(contractAddress)
      if (code === "0x") {
        setError(`No contract found at address ${contractAddress}`)
        return
      }

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractAbi, provider)

      // Get available methods
      const availableMethods = Object.keys(contract.functions)
        .filter((fn) => !fn.includes("("))
        .join(", ")

      setResult({
        contractExists: true,
        availableMethods,
      })
    } catch (err: any) {
      console.error("Contract check error:", err)
      setError(err.reason || err.message || "Failed to check contract")
    } finally {
      setLoading(false)
    }
  }

  const callMethod = async () => {
    if (!provider || !method) return

    try {
      setLoading(true)
      setError("")

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractAbi, provider)

      // Parse arguments if provided
      const parsedArgs = args ? JSON.parse(`[${args}]`) : []

      // Call the method
      const result = await contract[method](...parsedArgs)

      // Format result based on type
      let formattedResult = result

      if (ethers.BigNumber.isBigNumber(result)) {
        formattedResult = {
          type: "BigNumber",
          hex: result.toHexString(),
          decimal: result.toString(),
          ether: ethers.utils.formatEther(result),
        }
      }

      setResult(formattedResult)
    } catch (err: any) {
      console.error("Method call error:", err)
      setError(err.reason || err.message || "Failed to call method")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="w-5 h-5" />
          <span>Contract Debugger</span>
        </CardTitle>
        <CardDescription>Debug your smart contract connection and test contract methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Contract Address</Label>
          <div className="font-mono text-sm bg-gray-100 rounded p-2">{contractAddress || "No address provided"}</div>
        </div>

        <Button onClick={checkContract} disabled={loading || !provider || !contractAddress} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking Contract...
            </>
          ) : (
            "Check Contract Existence"
          )}
        </Button>

        {result && result.contractExists && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Available Methods</Label>
              <div className="font-mono text-xs bg-gray-100 rounded p-2 max-h-24 overflow-y-auto">
                {result.availableMethods}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Call Method</Label>
              <Input
                id="method"
                placeholder="e.g. manager"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="args">Arguments (comma separated)</Label>
              <Input
                id="args"
                placeholder='e.g. 1, true, "0x..."'
                value={args}
                onChange={(e) => setArgs(e.target.value)}
              />
            </div>

            <Button onClick={callMethod} disabled={loading || !method} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calling Method...
                </>
              ) : (
                `Call ${method}()`
              )}
            </Button>

            {result && result !== true && result.contractExists === undefined && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Result</Label>
                <pre className="font-mono text-xs bg-gray-100 rounded p-2 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
