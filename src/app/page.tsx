'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Wallet, Link2, TrendingUp, User, ChevronRight, ExternalLink, Copy, Check, Download } from 'lucide-react'

// TypeScript types for Phantom wallet
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
  const [activeTab, setActiveTab] = useState('submit')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletDetected, setWalletDetected] = useState(false)

  // Load user data when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadUserData()
    }
  }, [walletConnected, walletAddress])

  // Detect Phantom wallet on mount
  useEffect(() => {
    const checkWallet = () => {
      const { solana } = window as WindowWithSolana
      setWalletDetected(!!solana?.isPhantom)
    }
    
    checkWallet()
    
    // Listen for wallet changes
    const interval = setInterval(checkWallet, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load all submissions on mount (even without wallet connection)
  useEffect(() => {
    loadAllSubmissions()
  }, [])

  const loadAllSubmissions = async () => {
    try {
      const submissionsResponse = await fetch('/api/content/all?limit=50&sortBy=submittedAt&sortOrder=desc')
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions)
      }
    } catch (error) {
      console.error('Failed to load all submissions:', error)
    }
  }

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await fetch(`/api/user/profile?walletAddress=${walletAddress}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData.profile)
      }

      // Load all submissions (not just user's submissions)
      const submissionsResponse = await fetch('/api/content/all?limit=50&sortBy=submittedAt&sortOrder=desc')
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      
      // Check if Phantom wallet is installed
      const { solana } = window as WindowWithSolana
      
      if (!solana?.isPhantom) {
        // Show modal to install Phantom wallet
        const shouldInstall = window.confirm('Phantom wallet is not installed. Would you like to install it?')
        if (shouldInstall) {
          window.open('https://phantom.app/', '_blank')
        }
        return
      }

      // Connect to Phantom wallet
      const response = await solana.connect()
      const walletAddress = response.publicKey.toString()
      
      // Verify with backend
      const authResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      })
      
      if (authResponse.ok) {
        const data = await authResponse.json()
        setWalletConnected(true)
        setWalletAddress(walletAddress)
        setUserProfile(data.user)
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
      setSubmissions([])
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      // Force disconnect even if Phantom fails
      setWalletConnected(false)
      setWalletAddress('')
      setUserProfile(null)
      setSubmissions([])
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
      
      // Add new submission to list
      const newSubmission: ContentSubmission = {
        id: data.submission.id,
        url: data.submission.url,
        platform: data.submission.platform,
        views: data.submission.views,
        reward: data.submission.reward,
        submittedAt: data.submission.submittedAt,
        status: data.submission.status
      }
      
      setSubmissions([newSubmission, ...submissions])
      setSubmitUrl('')
      
      // Reload data to update stats and all submissions
      loadUserData()
      loadAllSubmissions()
      
    } catch (error) {
      console.error('Submission failed:', error)
      setSubmitError('Failed to submit content. Please try again.')
    }
  }

  const getPlatformFromUrl = (url: string): string => {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('tiktok.com')) return 'TikTok'
    if (url.includes('facebook.com')) return 'Facebook'
    return 'Unknown'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const claimRewards = async () => {
    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error)
        return
      }
      
      alert(data.message)
      
      // Reload user data to update claimable rewards
      loadUserData()
      
    } catch (error) {
      console.error('Claim failed:', error)
      alert('Failed to claim rewards. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-800/30 backdrop-blur-sm bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Moboy Post to Earn</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Wallet Connection */}
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block">
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Connected
                  </p>
                  <p className="text-sm text-white font-mono">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="border-red-600 text-red-300 hover:bg-red-900/20"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {!walletDetected && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    No wallet
                  </div>
                )}
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`${walletDetected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'} text-white flex items-center gap-2 disabled:opacity-50`}
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      {walletDetected ? 'Connect Phantom' : 'Install Phantom'}
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Moboy Character - Moved to top right */}
            <div className="relative">
              <img
                src="https://z-cdn-media.chatglm.cn/files/1acdfc6b-87e8-4b89-b52f-61c646bc1342_Moboy.png?auth_key=1793413052-1047e80ce48d451db507db8b29202d2d-0-75686c64ee6502ece6451f883e499088"
                alt="Moboy"
                width={50}
                height={50}
                className="w-12 h-12 object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-blue-800/30">
              <TabsTrigger 
                value="submit" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Submit Content
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Submit Content Tab */}
            <TabsContent value="submit" className="mt-6">
              <Card className="bg-slate-800/50 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-400" />
                    Submit Your Content
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Share your social media content and earn rewards based on views
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!walletConnected && (
                    <Alert className="border-orange-600 bg-orange-900/20">
                      <AlertDescription className="text-orange-300 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        {walletDetected 
                          ? 'Connect your Phantom wallet to start submitting content' 
                          : 'Install Phantom wallet to start submitting content'
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-blue-300">Content URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://twitter.com/your-post"
                      value={submitUrl}
                      onChange={(e) => setSubmitUrl(e.target.value)}
                      disabled={!walletConnected}
                      className="bg-slate-700/50 border-blue-700/50 text-white placeholder-blue-400/50 disabled:opacity-50"
                    />
                  </div>
                  
                  {submitError && (
                    <Alert className="border-red-600 bg-red-900/20">
                      <AlertDescription className="text-red-300">
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleSubmit}
                    disabled={!walletConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 disabled:text-slate-400"
                  >
                    {!walletConnected ? 'Connect Wallet First' : 'Submit Content'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-6">
              <Card className="bg-slate-800/50 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    All User Submissions
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Browse all content submissions from the entire community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
                        <p className="text-blue-300">No submissions yet</p>
                        <p className="text-blue-400 text-sm mt-2">Be the first to submit content!</p>
                      </div>
                    ) : (
                      submissions.map((submission) => (
                        <div key={submission.id} className="bg-slate-700/30 rounded-lg p-4 border border-blue-700/30">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-blue-600 text-blue-300">
                                {submission.platform}
                              </Badge>
                              <Badge 
                                variant={submission.status === 'approved' ? 'default' : 'secondary'}
                                className={submission.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}
                              >
                                {submission.status}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-blue-400">
                                <User className="w-3 h-3" />
                                {submission.user.displayName}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(submission.url)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          
                          <div className="text-sm text-blue-300 mb-2 truncate">
                            {submission.url}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-blue-400">Views</p>
                              <p className="text-white font-semibold">{submission.views.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-blue-400">Reward</p>
                              <p className="text-green-400 font-semibold">{submission.reward.toFixed(3)} SOL</p>
                            </div>
                            <div>
                              <p className="text-blue-400">Date</p>
                              <p className="text-white text-xs">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card className="bg-slate-800/50 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Your Profile
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Manage your earnings and track your performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userProfile && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-700/30">
                          <p className="text-blue-400 text-sm mb-1">Total Posts</p>
                          <p className="text-2xl font-bold text-white">{userProfile.totalPosts}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-700/30">
                          <p className="text-blue-400 text-sm mb-1">Total Views</p>
                          <p className="text-2xl font-bold text-white">{userProfile.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-700/30">
                          <p className="text-blue-400 text-sm mb-1">Total Rewards</p>
                          <p className="text-2xl font-bold text-green-400">{userProfile.totalRewards.toFixed(3)} SOL</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-600/30">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-blue-300 text-sm mb-1">Claimable Rewards</p>
                            <p className="text-3xl font-bold text-white">{userProfile.claimableRewards.toFixed(3)} SOL</p>
                          </div>
                          <Button
                            onClick={claimRewards}
                            className="bg-green-600 hover:bg-green-700 text-white px-6"
                            disabled={userProfile.claimableRewards === 0}
                          >
                            Claim Rewards
                          </Button>
                        </div>
                        <p className="text-blue-400 text-xs">
                          Rewards are automatically calculated based on content performance
                        </p>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-700/30">
                        <p className="text-blue-400 text-sm mb-2">Wallet Address</p>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-mono text-sm">{userProfile.walletAddress}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(userProfile.walletAddress)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}