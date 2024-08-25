// app/posts/[slug]/page.tsx

import { getPostMetadata, getPostBySlug } from "@/lib/posts.server";
import React from "react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import SidebarWithState from "@/components/SidebarWithState";
import dynamic from "next/dynamic";

// Import the client-side wrapper, ensure this is correctly imported
const ClientComments = dynamic(() => import("./ClientComments"), {
  ssr: false,
});

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getPostMetadata();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background dark:bg-gray-900">
      <SidebarWithState />
      <main className="flex-grow p-6 md:p-8 overflow-auto dark:bg-gray-900 dark:text-gray-100 md:ml-64">
        <div className="max-w-8xl mx-auto p-5">
          <section className="mb-16">
            <Card className="w-full dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground dark:text-gray-400 px-10 py-0">
                  {post.date}
                </p>
              </CardHeader>
              <CardContent>
                <article className="prose dark:prose-invert lg:prose-xl max-w-none px-10">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: post.contentHtml || "No Content Available",
                    }}
                  />
                </article>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link
                  href="/"
                  className="text-primary hover:text-gray-800 dark:hover:text-gray-50 hover:underline dark:text-gray-400"
                >
                  Back to Home
                </Link>
              </CardFooter>
            </Card>
          </section>

          {/* Use the client-side Comments wrapper */}
          <ClientComments postSlug={params.slug} />
        </div>
      </main>
    </div>
  );
}
