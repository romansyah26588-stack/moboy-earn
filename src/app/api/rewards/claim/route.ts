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

    // Find user
    const user = await db.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.claimableRewards <= 0) {
      return NextResponse.json(
        { error: 'No rewards available to claim' },
        { status: 400 }
      )
    }

    // In a real implementation, you would process the Solana transaction here
    // For now, we'll simulate it with AI
    try {
      const zai = await ZAI.create()
      
      // Mock transaction processing
      const mockTxHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create reward claim record
      const claim = await db.rewardClaim.create({
        data: {
          amount: user.claimableRewards,
          txHash: mockTxHash,
          userId: user.id
        }
      })

      // Update user's claimable rewards
      await db.user.update({
        where: { id: user.id },
        data: {
          claimableRewards: 0
        }
      })

      return NextResponse.json({
        success: true,
        claim: {
          id: claim.id,
          amount: claim.amount,
          claimedAt: claim.claimedAt,
          txHash: claim.txHash
        },
        message: 'Rewards claimed successfully!'
      })

    } catch (aiError) {
      console.error('Transaction processing failed:', aiError)
      return NextResponse.json(
        { error: 'Failed to process transaction' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Reward claim error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}