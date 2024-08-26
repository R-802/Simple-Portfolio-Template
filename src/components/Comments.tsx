"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import { getAuthToken } from "firebaseConfig";

const MAX_INDENTATION_DEPTH = 1;

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies: Comment[];
  upvotes: number;
  downvotes: number;
  mentionedUsers?: string[];
}

export interface CommentsProps {
  postSlug: string;
}

export default function Comments({ postSlug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postSlug=${postSlug}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      const sortedComments = data.sort(
        (a: Comment, b: Comment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleNewComment = async (content: string, displayName: string) => {
    try {
      const token = await getAuthToken(); // Retrieve the auth token
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the header
        },
        body: JSON.stringify({
          postSlug,
          content,
          author: displayName,
          parentId: null,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit comment");
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleReply = async (
    parentId: string,
    content: string,
    displayName: string
  ) => {
    try {
      const token = await getAuthToken(); // Retrieve the token
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in header
        },
        body: JSON.stringify({
          postSlug,
          content,
          author: displayName,
          parentId,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit reply");
      await fetchComments();
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleVote = async (
    commentId: string,
    voteType: "upvote" | "downvote"
  ) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error("Failed to submit vote");
      await fetchComments();
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const token = await getAuthToken(); // Retrieve the auth token
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the header
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      await fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <section className="mt-12">
      <Card className="w-full dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <CardTitle className="text-3xl font-semibold leading-none tracking-tight py-0 px-0">
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommentForm onSubmit={handleNewComment} />
          <div>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onVote={handleVote}
                onDelete={handleDelete}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                depth={0}
                maxIndentationDepth={MAX_INDENTATION_DEPTH}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
