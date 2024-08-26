import { NextRequest, NextResponse } from 'next/server';
import { getPostMetadata } from '@/lib/posts.server';

const POSTS_PER_PAGE = 3;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || String(POSTS_PER_PAGE), 10);

    const allPosts = getPostMetadata();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    return NextResponse.json({
      posts: paginatedPosts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalPosts,
    });
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
