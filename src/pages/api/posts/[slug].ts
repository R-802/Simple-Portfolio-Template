// src/pages/api/posts/[slug].ts
import { getPostMetadata, getPostBySlug } from '@/lib/posts.server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, page, limit } = req.query;

  if (slug === 'all') {
    // Handle pagination for all posts
    const allPosts = getPostMetadata();
    const pageNumber = parseInt(page as string) || 1;
    const postsPerPage = parseInt(limit as string) || 10;
    const startIndex = (pageNumber - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    res.status(200).json({
      posts: paginatedPosts,
      totalPages: Math.ceil(allPosts.length / postsPerPage),
      currentPage: pageNumber,
    });
  } else {
    // Handle single post request
    const post = await getPostBySlug(slug as string);
    
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  }
}