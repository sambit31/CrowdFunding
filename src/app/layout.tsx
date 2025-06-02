import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Web3Provider } from "@/hooks/use-web3"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CrowdFund DApp",
  description: "Decentralized crowdfunding platform built on Ethereum",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
