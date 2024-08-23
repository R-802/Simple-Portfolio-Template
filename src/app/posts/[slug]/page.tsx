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

const Comments = dynamic(() => import("@/components/Comments"), { ssr: false });

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getPostMetadata();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const getBadgeVariant = (variant: string) => {
  switch (variant) {
    case "info":
      return "info";
    case "warning":
      return "warning";
    case "success":
      return "success";
    default:
      return "default";
  }
};

const parseBadges = (content: string) => {
  return content.replace(/\{\{badge:(\w+):(\w+)\}\}/g, (_, variant, tag) => {
    return `<div class="badge-wrapper"><Badge variant="${getBadgeVariant(
      variant
    )}">${tag}</Badge></div>`;
  });
};

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const { metadata, contentHtml } = post;
  const parsedContentHtml = parseBadges(contentHtml);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background dark:bg-gray-900">
      <SidebarWithState />
      <main className="flex-grow p-6 md:p-8 overflow-auto dark:bg-gray-900 dark:text-gray-100 md:ml-64">
        <div className="max-w-8xl mx-auto">
          <section className="mb-16">
            <Card className="w-full dark:bg-gray-800 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  {metadata.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {metadata.date}
                </p>
              </CardHeader>
              <CardContent>
                <article className="prose dark:prose-invert lg:prose-xl">
                  <div
                    dangerouslySetInnerHTML={{ __html: parsedContentHtml }}
                  />
                </article>
              </CardContent>
              <CardFooter className="flex justify-between items-center flex-wrap">
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map(
                    (
                      tag:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            any,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | Promise<React.AwaitedReactNode>
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <Badge
                        key={index}
                        variant={
                          typeof tag === "string"
                            ? getBadgeVariant(tag)
                            : undefined
                        }
                        className={`transition-colors duration-200 
              ${
                getBadgeVariant(tag as string) === "default"
                  ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  : ""
              }`}
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
                <Link
                  href="/"
                  className="text-primary hover:underline dark:text-blue-400"
                >
                  Back to Home
                </Link>
              </CardFooter>
            </Card>
          </section>
          <Comments postSlug={params.slug} />
        </div>
      </main>
    </div>
  );
}
