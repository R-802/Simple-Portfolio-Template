/**
 * This file contains functions for handling posts in a server-side environment.
 * It provides functions to retrieve metadata of all posts and to retrieve a specific post by its slug.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm'; // GitHub Flavored Markdown support

// Post metadata interface
export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

// Directory where all posts are stored
const postsDirectory = path.join(process.cwd(), 'src/content/posts');

// Function to get metadata of all posts
export function getPostMetadata(): PostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || 'Unknown date',
        tags: data.tags || [],
        excerpt: data.excerpt || '',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Function to get post by slug
export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown support
    .use(html) // Convert Markdown to HTML
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    metadata: {
      title: data.title,
      date: data.date,
      tags: data.tags,
      excerpt: data.excerpt,
    },
    contentHtml,
  };
}
