"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostMetadata } from "@/lib/posts.server";
import PaginationComponent from "@/components/Pagination";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import { unified } from "unified";
import SkeletonPost from "@/components/ui/skeleton";
import SidebarWithState from "@/components/SidebarWithState";

const POSTS_PER_PAGE = 3;

// Main Home Component
export default function Home() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarWithState />

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-auto dark:bg-gray-900 dark:text-gray-100 md:ml-64">
        <div className="max-w-8xl mx-auto p-5">
          <section className="mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8 leading-tight">
              Portfolio{" "}
              <span className="text-primary dark:text-primary-foreground">
                Template
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8">
              This website can be used as a template for showcasing your
              professional portfolio, or personal projects.
            </p>
          </section>

          {/* Wrap posts and pagination in a Suspense boundary */}
          <Suspense fallback={<SkeletonPost />}>
            <ClientSideContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// Client-side logic for fetching posts and pagination
function ClientSideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts and handle pagination
  const fetchPosts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/posts/all?page=${page}&limit=${POSTS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await response.json();

      const postsWithHtml = await Promise.all(
        data.posts.map(async (post: PostMetadata) => ({
          ...post,
          contentPreviewHtml: await convertMarkdownToHtml(post.contentPreview),
        }))
      );

      setPosts(postsWithHtml);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to fetch posts. Please try again later.");
    }
    setIsLoading(false);
  }, []);

  const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkEmoji)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(markdown);

    return result.toString();
  };

  useEffect(() => {
    const page = Number(searchParams?.get("page")) || 1;
    setCurrentPage(page);
    fetchPosts(page); // Calls the updated fetchPosts function
  }, [searchParams, fetchPosts]); // Added fetchPosts to the dependency array

  const handlePageChange = (page: number) => {
    router.push(`/?page=${page}`);
  };

  return (
    <>
      <PostsSection isLoading={isLoading} error={error} posts={posts} />
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}

// Component for displaying posts
function PostsSection({
  isLoading,
  error,
  posts,
}: {
  isLoading: boolean;
  error: string | null;
  posts: PostMetadata[];
}) {
  return (
    <section className="mb-16">
      {isLoading ? (
        <div className="space-y-12">
          {[...Array(POSTS_PER_PAGE)].map((_, index) => (
            <SkeletonPost key={index} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-12">
          {posts.map((post) => (
            <Card
              key={post.slug}
              className="w-full dark:bg-gray-800 dark:text-gray-100"
            >
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground dark:text-gray-400 px-10 py-0">
                  {post.date}
                </p>
              </CardHeader>
              <CardContent>
                <article className="prose dark:prose-invert lg:prose-xl max-w-none px-10">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: post.contentPreviewHtml || "No Content Available",
                    }}
                  />
                </article>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {post.tags.length > 0 ? (
                    post.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground dark:text-gray-400">
                      No tags available
                    </span>
                  )}
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-primary dark:hover:text-gray-50 hover:underline dark:text-gray-400"
                >
                  Read more
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
