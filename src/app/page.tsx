"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuIcon } from "lucide-react";
import { PostMetadata } from "@/lib/posts";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Sidebar from "@/components/Sidebar";

const POSTS_PER_PAGE = 2;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    setCurrentPage(page);
    fetchPosts(page);
  }, [searchParams]);

  const fetchPosts = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?page=${page}&limit=${POSTS_PER_PAGE}`
      );
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
    setIsLoading(false);
  };

  const handlePageChange = (page: number) => {
    router.push(`/?page=${page}`, undefined); // Using shallow routing
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-gray-100 dark:bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Some Title</h1>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-6 w-6" />
        </Button>
      </header>

      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <aside className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex-shrink-0">
        <Sidebar
          toggleSidebar={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </aside>

      {/* Mobile Sidebar - Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      >
        <div
          className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-100 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar
            toggleSidebar={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-auto dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-8xl mx-auto">
          <section className="mb-16">
            {isLoading ? (
              <p></p>
            ) : (
              <div className="space-y-12">
                {posts.map((post) => (
                  <Card
                    key={post.slug}
                    className="w-full dark:bg-gray-800 dark:text-gray-100"
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="hover:underline"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {post.date}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground dark:text-gray-300">
                        {post.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center flex-wrap">
                      <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="dark:bg-gray-700 dark:text-gray-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-primary hover:underline dark:text-blue-400"
                      >
                        Read more
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                {/* Previous Button - Only show if not on the first page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/?page=${currentPage - 1}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </PaginationPrevious>
                  </PaginationItem>
                )}

                {/* Start Page */}
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href={`/?page=1`}
                        onClick={() => handlePageChange(1)}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && <PaginationEllipsis />}
                  </>
                )}

                {/* Pages around the current page */}
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (page) =>
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`/?page=${page}`}
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {/* End Page */}
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink
                        href={`/?page=${totalPages}`}
                        onClick={() => handlePageChange(totalPages)}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                {/* Next Button - Only show if not on the last page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/?page=${currentPage + 1}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </PaginationNext>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </main>
    </div>
  );
}
