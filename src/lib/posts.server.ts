import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  contentPreview: string;
  show_n_headings: number;
  contentPreviewHtml?: string;
}

export interface PostContent extends PostMetadata {
  contentHtml: string;
}

const postsDirectory = path.join(process.cwd(), 'src/pages/posts');

export function getPostMetadata(): PostMetadata[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const { title, contentWithoutTitle } = extractTitleAndContent(content);
        const show_n_headings = parseInt(data.show_n_headings, 10) || 1;
        const contentPreview = extractContentPreview(contentWithoutTitle, show_n_headings);

        return {
          slug,
          title: title || data.title || 'Untitled',
          date: data.date || 'Unknown date',
          tags: data.tags || [],
          content: contentWithoutTitle || '',
          contentPreview,
          show_n_headings,
        };
      });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error in getPostMetadata:', error);
    return [];
  }
}

function extractContentPreview(content: string, maxHeadings: number): string {
  const lines = content.split('\n');
  let headingsFound = 0;
  let preview = '';
  let inBlockquote = false;

  for (const line of lines) {
    if (line.startsWith('#')) {
      headingsFound++;
      if (headingsFound > maxHeadings) break;
    }

    if (line.startsWith('>')) {
      inBlockquote = true;
      preview += '> ' + line.slice(1).trim().replace(/^["']|["']$/g, '') + '\n';
    } else if (inBlockquote && line.trim() === '') {
      inBlockquote = false;
      preview += '\n';
    } else if (inBlockquote) {
      preview += '> ' + line.trim().replace(/^["']|["']$/g, '') + '\n';
    } else {
      preview += line + '\n';
    }
  }

  return preview.trim();
}

function removeQuotesFromBlockquotes() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      if (node.children && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild.type === 'paragraph' && firstChild.children && firstChild.children.length > 0) {
          const firstTextNode = firstChild.children[0];
          if (firstTextNode.type === 'text') {
            firstTextNode.value = firstTextNode.value.replace(/^["']|["']$/g, '');
          }
        }
      }
    });
  };
}

export async function getPostBySlug(slug: string): Promise<PostContent | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    if (!content) {
      console.warn(`No content found for slug: ${slug}`);
    }

    const { title, contentWithoutTitle } = extractTitleAndContent(content || '');
    const show_n_headings = parseInt(data.show_n_headings, 10) || 1;
    const contentPreview = extractContentPreview(contentWithoutTitle, show_n_headings);
    
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkEmoji)
      .use(removeQuotesFromBlockquotes)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(contentWithoutTitle);
    
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: title || data.title || slug,
      date: data.date || 'Unknown date',
      tags: data.tags || [],
      content: contentWithoutTitle || '',
      contentPreview,
      show_n_headings,
      contentHtml,
    };
  } catch (error) {
    console.error(`Error reading file for slug: ${slug}`, error);
    return null;
  }
}

function extractTitleAndContent(content: string): { title: string, contentWithoutTitle: string } {
  const lines = content.split('\n');
  let title = 'Untitled';
  let contentWithoutTitle = content;

  // Find the first heading
  const firstHeadingIndex = lines.findIndex(line => line.startsWith('#'));

  if (firstHeadingIndex !== -1) {
    // Extract the title from the first heading
    title = lines[firstHeadingIndex].replace(/^#+\s*/, '').trim();
    
    // Remove the first heading from the content
    lines.splice(firstHeadingIndex, 1);
    contentWithoutTitle = lines.join('\n').trim();
  } else {
    // If no heading is found, use a default title and keep the content as is
    contentWithoutTitle = content.trim();
  }

  return { title, contentWithoutTitle };
}