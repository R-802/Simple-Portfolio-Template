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

            // Update the ensureNumericVotes function with the correct type
            const ensureNumericVotes = (comment: Comment): Comment => ({
                ...comment,
                upvotes: comment.upvotes || 0,
                downvotes: comment.downvotes || 0,
                replies: comment.replies.map(ensureNumericVotes), // recursively apply the same logic to replies
            });

            const commentsWithVotes = data.map(ensureNumericVotes);
            const sortedComments = commentsWithVotes.sort(
                (
                    a: { createdAt: string | number | Date },
                    b: { createdAt: string | number | Date }
                ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
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
                    Authorization: `Bearer ${token}`, // Include the token in the header
                    "Content-Type": "application/json",
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
            const token = await getAuthToken();
            const url = `/api/comments/${commentId}/vote`;
            const method = "POST";
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            const body = JSON.stringify({ voteType });
            const response = await fetch(url, {
                method,
                headers,
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to submit vote:", errorData);
                throw new Error("Failed to submit vote");
            }

            await fetchComments();
        } catch (error) {
            console.error("Error submitting vote:", error);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const token = await getAuthToken(); // Retrieve the auth token
            const response = await fetch(`/api/comments/${commentId}/delete`, {
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
