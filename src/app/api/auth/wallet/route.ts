import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';
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

    // Validate wallet address format (basic Solana address validation)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          walletAddress
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        totalPosts: user.totalPosts,
        totalViews: user.totalViews,
        totalRewards: user.totalRewards,
        claimableRewards: user.claimableRewards
      }
    })

  } catch (error) {
    console.error('Wallet auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}