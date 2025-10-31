import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';
import { db } from '@/lib/db'

// Social media URL validation patterns
const SOCIAL_MEDIA_PATTERNS = {
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
  instagram: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+/,
  youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
  tiktok: /^https?:\/\/(www\.)?(tiktok\.com)\/.+/,
  facebook: /^https?:\/\/(www\.)?(facebook\.com|fb\.me)\/.+/
}

function getPlatformFromUrl(url: string): string {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter'
  if (url.includes('instagram.com')) return 'Instagram'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('tiktok.com')) return 'TikTok'
  if (url.includes('facebook.com')) return 'Facebook'
  return 'Unknown'
}

function validateSocialMediaUrl(url: string): { valid: boolean; platform?: string } {
  for (const [platform, pattern] of Object.entries(SOCIAL_MEDIA_PATTERNS)) {
    if (pattern.test(url)) {
      return { valid: true, platform: getPlatformFromUrl(url) }
    }
  }
  return { valid: false }
}

async function analyzeContentWithAI(url: string): Promise<{ estimatedViews: number; quality: number }> {
  try {
    const zai = await ZAI.create()
    
    // Use web search to analyze the content
    const searchResult = await zai.functions.invoke("web_search", {
      query: url,
      num: 5
    })

    // Mock analysis based on search results
    // In a real implementation, you would analyze the actual content
    const estimatedViews = Math.floor(Math.random() * 10000) + 100
    const quality = Math.random() * 0.5 + 0.5 // 0.5 to 1.0

    return { estimatedViews, quality }
  } catch (error) {
    console.error('AI analysis failed:', error)
    // Fallback values
    return { estimatedViews: 500, quality: 0.7 }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, walletAddress } = await request.json()

    if (!url || !walletAddress) {
      return NextResponse.json(
        { error: 'URL and wallet address are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    const validation = validateSocialMediaUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please use a valid social media link.' },
        { status: 400 }
      )
    }

    // Check for duplicate submission
    const existingSubmission = await db.contentSubmission.findUnique({
      where: { url }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Konten sudah ada' },
        { status: 409 }
      )
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await db.user.create({
        data: { walletAddress }
      })
    }

    // Analyze content with AI
    const { estimatedViews, quality } = await analyzeContentWithAI(url)

    // Calculate initial reward based on quality and estimated views
    const baseReward = 0.00001 // 0.00001 SOL per view
    const initialReward = estimatedViews * baseReward * quality

    // Create content submission
    const submission = await db.contentSubmission.create({
      data: {
        url,
        platform: validation.platform!,
        views: 0,
        reward: 0,
        status: 'pending',
        userId: user.id
      }
    })

    // Create initial view metric
    await db.viewMetric.create({
      data: {
        views: 0,
        contentId: submission.id
      }
    })

    // Update user stats
    await db.user.update({
      where: { id: user.id },
      data: {
        totalPosts: user.totalPosts + 1
      }
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        url: submission.url,
        platform: submission.platform,
        views: submission.views,
        reward: submission.reward,
        status: submission.status,
        submittedAt: submission.submittedAt,
        estimatedViews,
        estimatedReward: initialReward
      }
    })

  } catch (error) {
    console.error('Content submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}