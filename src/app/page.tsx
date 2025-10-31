'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Home, PieChart, Wallet, Settings, LogOut, Link2, TrendingUp, User, Copy, Check } from 'lucide-react'

// ... (semua interface dan tipe yang ada di kode asli Anda) ...
interface PhantomWallet {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  publicKey?: { toString: () => string }
  isConnected?: boolean
}

interface WindowWithSolana {
  solana?: PhantomWallet
}

declare global {
  interface Window {
    solana?: PhantomWallet
  }
}

interface ContentSubmission {
  id: string
  url: string
  platform: string
  views: number
  reward: number
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  user: {
    walletAddress: string
    displayName: string
  }
  latestViewMetric?: any
}

interface UserProfile {
  walletAddress: string
  totalPosts: number
  totalViews: number
  totalRewards: number
  claimableRewards: number
}

export default function Home() {
  // ... (semua state dan logika dari kode asli Anda) ...
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletDetected, setWalletDetected] = useState(false)

  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadUserData()
    }
  }, [walletConnected, walletAddress])

  useEffect(() => {
    const checkWallet = () => {
      const { solana } = window as WindowWithSolana
      setWalletDetected(!!solana?.isPhantom)
    }
    
    checkWallet()
    const interval = setInterval(checkWallet, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadUserData = async () => {
    try {
      const profileResponse = await fetch(`/api/user/profile?walletAddress=${walletAddress}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData.profile)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      const { solana } = window as WindowWithSolana
      
      if (!solana?.isPhantom) {
        const shouldInstall = window.confirm('Phantom wallet is not installed. Would you like to install it?')
        if (shouldInstall) {
          window.open('https://phantom.app/', '_blank')
        }
        return
      }

      const response = await solana.connect()
      const walletAddr = response.publicKey.toString()
      
      const authResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr })
      })
      
      if (authResponse.ok) {
        setWalletConnected(true)
        setWalletAddress(walletAddr)
      } else {
        alert('Failed to authenticate wallet')
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const { solana } = window as WindowWithSolana
      if (solana?.isPhantom && solana?.disconnect) {
        await solana.disconnect()
      }
      setWalletConnected(false)
      setWalletAddress('')
      setUserProfile(null)
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      setWalletConnected(false)
      setWalletAddress('')
      setUserProfile(null)
    }
  }

  const validateUrl = (url: string): boolean => {
    const patterns = {
      twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
      instagram: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+/,
      youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      tiktok: /^https?:\/\/(www\.)?(tiktok\.com)\/.+/,
      facebook: /^https?:\/\/(www\.)?(facebook\.com|fb\.me)\/.+/
    }
    return Object.values(patterns).some(pattern => pattern.test(url))
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!submitUrl.trim()) {
      setSubmitError('Please enter a valid URL')
      return
    }
    if (!validateUrl(submitUrl)) {
      setSubmitError('Invalid URL format. Please use a valid social media link.')
      return
    }
    try {
      const response = await fetch('/api/content/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submitUrl, walletAddress })
      })
      const data = await response.json()
      if (!response.ok) {
        setSubmitError(data.error)
        return
      }
      setSubmitUrl('')
      loadUserData()
    } catch (error) {
      console.error('Submission failed:', error)
      setSubmitError('Failed to submit content. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- STRUKTUR JSX BARU ---
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-slate-900 p-6 flex flex-col items-center border-r border-slate-800">
        <img 
          src="https://z-cdn-media.chatglm.cn/files/1acdfc6b-87e8-4b89-b52f-61c646bc1342_Moboy.png?auth_key=1793413052-1047e80ce48d451db507db8b29202d2d-0-75686c64ee6502ece6451f883e499088" 
          alt="Moboy Character" 
          className="w-32 h-32 mb-8 rounded-lg" 
        />
        <nav className="flex flex-col space-y-6 w-full">
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Home className="mr-3 h-5 w-5" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <PieChart className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Wallet className="mr-3 h-5 w-5" />
            Wallet
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </nav>
        <div className="mt-auto w-full space-y-4">
          {walletConnected && (
            <div className="text-center text-xs text-slate-400">
              <p>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            className="justify-start text-slate-300 hover:text-white hover:bg-slate-800 w-full"
            onClick={walletConnected ? disconnectWallet : connectWallet}
          >
            {walletConnected ? <LogOut className="mr-3 h-5 w-5" /> : <Wallet className="mr-3 h-5 w-5" />}
            {walletConnected ? 'Logout' : 'Connect Wallet'}
          </Button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Share your social media content and earn rewards based on views
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!walletConnected ? (
                <div className="text-center">
                  <Button onClick={connectWallet} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Connect Phantom
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content-url" className="block text-sm font-medium text-slate-300 mb-2">
                      Content URL
                    </Label>
                    <Input
                      id="content-url"
                      type="url"
                      placeholder="https://twitter.com/your-post"
                      value={submitUrl}
                      onChange={(e) => setSubmitUrl(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  {submitError && (
                    <Alert className="border-red-600 bg-red-900/20">
                      <AlertDescription className="text-red-300">
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700">
                    Submit Content
                  </Button>
                </div>
              )}

              {!walletConnected && (
                <Alert className="border-yellow-600 bg-yellow-900/20">
                  <AlertDescription className="text-yellow-400 text-center">
                    Connect Wallet First
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
