import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Get all submissions from all users with user info
    const submissions = await db.contentSubmission.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        },
        viewMetrics: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    })

    // Get total count for pagination
    const totalCount = await db.contentSubmission.count()

    // Format the response
    const formattedSubmissions = submissions.map(submission => ({
      id: submission.id,
      url: submission.url,
      platform: submission.platform,
      views: submission.views,
      reward: submission.reward,
      status: submission.status,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      user: {
        walletAddress: submission.user.walletAddress,
        displayName: `${submission.user.walletAddress.slice(0, 4)}...${submission.user.walletAddress.slice(-4)}`
      },
      latestViewMetric: submission.viewMetrics[0] || null
    }))

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    })

  } catch (error) {
    console.error('All submissions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}