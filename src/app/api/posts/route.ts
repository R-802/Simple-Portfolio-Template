import { NextResponse } from 'next/server'
import { getPostMetadata } from '@/lib/posts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 5

  const allPosts = getPostMetadata()
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / limit)

  const start = (page - 1) * limit
  const end = start + limit
  const posts = allPosts.slice(start, end)

  return NextResponse.json({
    posts,
    currentPage: page,
    totalPages,
    totalPosts,
  })
}