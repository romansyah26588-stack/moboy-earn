'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Wallet, Link, User, Gift, Send, Globe, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

declare global {
  interface Window {
    solana?: any
  }
}

interface Post {
  id: string
  linkUrl: string
  walletAddress: string
  createdAt: string
}

interface UserProfile {
  walletAddress: string
  postCount: number
  rewardsClaimed: number
}

export default function MoBoyApp() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('post')
  const [postLink, setPostLink] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Connect to Solana wallet
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        const response = await window.solana.connect()
        const address = response.publicKey.toString()
        setWalletAddress(address)
        setIsConnected(true)
        toast.success('Wallet connected successfully!')
        fetchUserProfile(address)
        fetchPosts()
      } else {
        toast.error('Phantom wallet not found. Please install Phantom wallet.')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast.error('Failed to connect wallet')
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress('')
    setIsConnected(false)
    setUserProfile(null)
    // Don't clear posts when disconnecting - keep public posts visible
    toast.success('Wallet disconnected')
  }

  // Fetch user profile
  const fetchUserProfile = async (address: string) => {
    try {
      const response = await fetch(`/api/user/profile?walletAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.solana?.isConnected) {
      connectWallet()
    }
  }, [])

  useEffect(() => {
    // Fetch posts on component mount (public access)
    fetchPosts()
  }, [])

  // Validate URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Submit post
  const submitPost = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!postLink.trim()) {
      toast.error('Please enter a link')
      return
    }

    if (!isValidUrl(postLink)) {
      toast.error('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkUrl: postLink,
          walletAddress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post submitted successfully!')
        setPostLink('')
        fetchPosts()
        fetchUserProfile(walletAddress)
      } else {
        setError(data.error || 'Failed to submit post')
        toast.error(data.error || 'Failed to submit post')
      }
    } catch (error) {
      console.error('Error submitting post:', error)
      toast.error('Failed to submit post')
    } finally {
      setIsLoading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  // Claim rewards
  const claimRewards = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/claim-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Rewards claimed: ${data.rewards} Momo Coin!`)
        fetchUserProfile(walletAddress)
      } else {
        toast.error(data.error || 'Failed to claim rewards')
      }
    } catch (error) {
      console.error('Error claiming rewards:', error)
      toast.error('Failed to claim rewards')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.solana?.isConnected) {
      connectWallet()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* MoBoy Character */}
              <div className="relative">
                <img
                  src="https://raw.githubusercontent.com/romansyah26588-stack/moboy-earn/refs/heads/main/public/Moboy.png"
                  alt="MoBoy"
                  className="w-16 h-16"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  MoBoy
                  <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                    BETA
                  </Badge>
                </h1>
                <p className="text-blue-300 text-sm">Posting About Momo Coin</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-lg border border-blue-700">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white font-mono">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-blue-800">
              <TabsTrigger
                value="post"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <Link className="w-4 h-4 mr-2" />
                Links
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Post Tab */}
            <TabsContent value="post" className="mt-6">
              <Card className="bg-slate-800 border-blue-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" />
                    Create New Post
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Share your Momo Coin related content with the community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="post-link" className="text-blue-300">
                      Content Link
                    </Label>
                    <Textarea
                      id="post-link"
                      placeholder="https://your-content-link.com"
                      value={postLink}
                      onChange={(e) => setPostLink(e.target.value)}
                      className="mt-1 bg-slate-700 border-blue-700 text-white placeholder-blue-400"
                      rows={3}
                    />
                  </div>

                  {error && (
                    <Alert className="border-red-600 bg-red-900/20 text-red-400">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={submitPost}
                    disabled={!isConnected || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Content
                      </>
                    )}
                  </Button>

                  {!isConnected && (
                    <Alert className="border-yellow-600 bg-yellow-900/20 text-yellow-400">
                      <AlertDescription>
                        Please connect your Solana wallet to post content
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="mt-6">
              <Card className="bg-slate-800 border-blue-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Community Posts
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Discover Momo Coin content shared by our community members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-blue-400">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first to share!</p>
                      {!isConnected && (
                        <p className="text-sm mt-2 text-blue-500">
                          Connect your wallet to start posting content
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-slate-700 p-4 rounded-lg border border-blue-700 hover:border-blue-600 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Link className="w-4 h-4 text-blue-400" />
                                <a
                                  href={post.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-200 text-sm truncate max-w-xs"
                                >
                                  {post.linkUrl}
                                </a>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-blue-400">
                                <span className="flex items-center gap-1">
                                  <Wallet className="w-3 h-3" />
                                  {post.walletAddress.slice(0, 4)}...{post.walletAddress.slice(-4)}
                                </span>
                                <span>
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(post.linkUrl, 'Link')}
                                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(post.walletAddress, 'Wallet Address')}
                                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                              >
                                <Wallet className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card className="bg-slate-800 border-blue-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Profile Dashboard
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Manage your account and track your rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfile ? (
                    <div className="space-y-6">
                      {/* Wallet Info */}
                      <div className="bg-slate-700 p-4 rounded-lg border border-blue-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-300 mb-1">Wallet Address</p>
                            <p className="font-mono text-white">
                              {userProfile.walletAddress}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(userProfile.walletAddress, 'Wallet Address')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700 p-4 rounded-lg border border-blue-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-blue-300">Total Posts</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{userProfile.postCount}</p>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-lg border border-blue-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-blue-300">Rewards Claimed</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{userProfile.rewardsClaimed}</p>
                        </div>
                      </div>

                      {/* Claim Rewards Button */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">Claim Your Rewards</h3>
                            <div className="space-y-1">
                              <p className="text-sm text-blue-100">
                                Available: <span className="font-bold text-white">{(userProfile.postCount * 25000).toLocaleString()}</span> Momo Coin
                              </p>
                              <p className="text-xs text-blue-200">
                                Value per post: 25,000 Momo Coin
                              </p>
                              <p className="text-xs text-blue-200">
                                Minimum to claim: 1,000,000 Momo Coin
                              </p>
                              {userProfile.postCount * 25000 < 1000000 && (
                                <p className="text-xs text-yellow-300">
                                  Need {Math.ceil((1000000 - (userProfile.postCount * 25000)) / 25000)} more posts to claim
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={claimRewards}
                            disabled={isLoading || userProfile.postCount * 25000 < 1000000}
                            className="bg-white text-blue-600 hover:bg-blue-50 border-0"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Claiming...
                              </div>
                            ) : (
                              <>
                                <Gift className="w-4 h-4 mr-2" />
                                Claim
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-blue-400">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Connect your wallet to view your profile</p>
                    </div>
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