import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';
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
      where: { walletAddress }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's content submissions
    const submissions = await db.contentSubmission.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        viewMetrics: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission.id,
        url: submission.url,
        platform: submission.platform,
        views: submission.views,
        reward: submission.reward,
        status: submission.status,
        submittedAt: submission.submittedAt,
        updatedAt: submission.updatedAt,
        latestViewMetric: submission.viewMetrics[0] || null
      }))
    })

  } catch (error) {
    console.error('Content list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}