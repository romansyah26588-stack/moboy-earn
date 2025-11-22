// export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const posts = await db.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { linkUrl, walletAddress } = await request.json()

    if (!linkUrl || !walletAddress) {
      return NextResponse.json(
        { error: 'Link URL and wallet address are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(linkUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if link already exists
    const existingPost = await db.post.findUnique({
      where: { linkUrl }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Content link already exists' },
        { status: 409 }
      )
    }

    // Create or update user
    const user = await db.user.upsert({
      where: { walletAddress },
      update: {
        postCount: {
          increment: 1
        }
      },
      create: {
        walletAddress,
        postCount: 1
      }
    })

    // Create post
    const post = await db.post.create({
      data: {
        linkUrl,
        walletAddress
      }
    })

    return NextResponse.json({ post, user })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}