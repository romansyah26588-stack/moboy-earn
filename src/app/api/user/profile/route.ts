import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { walletAddress },
      include: {
        submissions: {
          orderBy: { submittedAt: 'desc' }
        },
        rewardClaims: {
          orderBy: { claimedAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate current stats
    const totalViews = user.submissions.reduce((sum, submission) => sum + submission.views, 0)
    const totalRewards = user.submissions.reduce((sum, submission) => sum + submission.reward, 0)
    const claimableRewards = user.claimableRewards

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        walletAddress: user.walletAddress,
        totalPosts: user.totalPosts,
        totalViews,
        totalRewards,
        claimableRewards,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}