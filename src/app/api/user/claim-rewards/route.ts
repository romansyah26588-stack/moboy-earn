export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate rewards (25,000 Momo Coin per post)
    const rewardsPerPost = 25000
    const totalRewards = user.postCount * rewardsPerPost

    if (totalRewards < 1000000) {
      return NextResponse.json(
        { error: 'Minimum 1 million Momo Coin required to claim rewards' },
        { status: 400 }
      )
    }

    // Update user rewards claimed count
    const updatedUser = await db.user.update({
      where: { walletAddress },
      data: {
        rewardsClaimed: {
          increment: totalRewards
        }
      }
    })

    return NextResponse.json({
      rewards: totalRewards,
      totalRewardsClaimed: updatedUser.rewardsClaimed,
      message: `Successfully claimed ${totalRewards} Momo Coin`
    })
  } catch (error) {
    console.error('Error claiming rewards:', error)
    return NextResponse.json(
      { error: 'Failed to claim rewards' },
      { status: 500 }
    )
  }
}