"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Reply,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Eye,
  Edit2,
  MessageSquare,
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies: Comment[];
  upvotes: number;
  downvotes: number;
  mentionedUsers?: string[];
}

interface CommentsProps {
  postSlug: string;
}

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isReply?: boolean;
  parentComment?: Comment;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isReply = false,
  parentComment,
}) => {
  const [content, setContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (parentComment && parentComment.replies) {
      const usernames = [
        parentComment.author,
        ...parentComment.replies.map((reply) => reply.author),
      ];
      setMentionedUsers(Array.from(new Set(usernames)));
    }
  }, [parentComment]);

  const insertMarkdown = (syntax: string, placeholder: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const selectedText = text.substring(start, end) || placeholder;
      const newText = `${before}${syntax.replace(
        "text",
        selectedText
      )}${after}`;
      setContent(newText);
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current!.selectionStart = start + syntax.indexOf("text");
        textareaRef.current!.selectionEnd =
          start + syntax.indexOf("text") + selectedText.length;
      }, 0);
    }
  };

  const handleMention = (username: string) => {
    const mention = `@${username} `;
    setContent((prevContent) => {
      const newContent = prevContent.replace(/@\S+\s?/, "") + mention;
      return newContent;
    });
    if (textareaRef.current) {
      const newCursorPosition = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        newCursorPosition,
        newCursorPosition
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
    setIsPreviewMode(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        {isPreviewMode ? (
          <div className="min-h-[100px] p-3 border rounded-md dark:bg-gray-700 dark:text-gray-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isReply ? "Write a reply..." : "Leave a comment..."}
            className="min-h-[100px] pb-12 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
        )}
        {!isPreviewMode && (
          <div className="absolute bottom-2 left-2 flex space-x-2 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("**text**", "bold text")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("*text*", "italic text")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("~~text~~", "strikethrough text")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("# text", "heading")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Heading className="h-4 w-4" />
            </Button>
            <div className="separator"></div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("- text", "list item")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("1. text", "numbered list item")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="separator"></div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("> text", "quote")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("`text`", "code")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <Code className="h-4 w-4" />
            </Button>
            <div className="separator"></div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown("[text](url)", "link text")}
              className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isReply && mentionedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {mentionedUsers.map((username) => (
            <Button
              key={username}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMention(username)}
              className="flex items-center space-x-1"
            >
              <Reply className="h-4 w-4 mr-1" />
              <span>@{username}</span>
            </Button>
          ))}
        </div>
      )}
      <div className="mt-2 flex justify-between items-center">
        <Button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
        >
          {isPreviewMode ? (
            <>
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </>
          )}
        </Button>
        <Button
          type="submit"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200"
        >
          {isReply ? "Reply" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  onVote: (commentId: string, voteType: "upvote" | "downvote") => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onVote,
  isReply = false,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes);
  const [userVote, setUserVote] = useState<null | "upvote" | "downvote">(null);

  const replyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        replyBoxRef.current &&
        !replyBoxRef.current.contains(event.target as Node)
      ) {
        setIsReplying(false);
      }
    };

    if (isReplying) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isReplying]);

  const handleReply = (content: string) => {
    onReply(comment.id, content);
    setIsReplying(false);
  };

  const handleVote = (voteType: "upvote" | "downvote") => {
    let newUpvotes = localUpvotes;
    let newDownvotes = localDownvotes;

    if (voteType === "upvote") {
      if (userVote === "upvote") {
        newUpvotes -= 1;
        setUserVote(null);
      } else {
        newUpvotes += 1;
        if (userVote === "downvote") {
          newDownvotes -= 1;
        }
        setUserVote("upvote");
      }
    } else if (voteType === "downvote") {
      if (userVote === "downvote") {
        newDownvotes -= 1;
        setUserVote(null);
      } else {
        newDownvotes += 1;
        if (userVote === "upvote") {
          newUpvotes -= 1;
        }
        setUserVote("downvote");
      }
    }

    setLocalUpvotes(newUpvotes);
    setLocalDownvotes(newDownvotes);

    onVote(comment.id, voteType);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`relative ${isReply ? "pl-16" : ""}`}>
      {isReply && (
        <div
          className="absolute bg-gray-300 dark:bg-gray-600"
          style={{
            width: "2px",
            top: "-30%",
            bottom: "0",
            left: "16px",
          }}
        />
      )}
      <div className="mb-4">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage
              src={`https://avatar.vercel.sh/${comment.author}`}
              alt={comment.author}
            />
            <AvatarFallback>
              {comment.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{comment.author}</h4>
              <time className="text-xs text-muted-foreground dark:text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </time>
            </div>
            <div className="mt-1 text-sm prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.content}
              </ReactMarkdown>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Button
                onClick={() => handleVote("upvote")}
                variant="ghost"
                size="sm"
                className={`text-sm flex items-center ${
                  userVote === "upvote"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400"
                } hover:text-white`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {localUpvotes}
              </Button>
              <Button
                onClick={() => handleVote("downvote")}
                variant="ghost"
                size="sm"
                className={`text-sm flex items-center ${
                  userVote === "downvote"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400"
                } hover:text-white`}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {localDownvotes}
              </Button>
              <Button
                onClick={() => setIsReplying(!isReplying)}
                variant="ghost"
                size="sm"
                className="text-sm flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reply
              </Button>
              {hasReplies && (
                <Button
                  onClick={() => setShowReplies(!showReplies)}
                  variant="ghost"
                  size="sm"
                  className="text-sm flex items-center"
                >
                  {showReplies ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {showReplies ? "Hide" : "Show"} Replies (
                  {comment.replies.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {(isReplying || hasReplies) && (
        <div
          className={`relative ${
            !showReplies && !isReplying ? "h-0 overflow-hidden" : "mt-4"
          }`}
        >
          {hasReplies && showReplies && (
            <div>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onVote={onVote}
                  isReply={true}
                />
              ))}
            </div>
          )}
          {isReplying && (
            <div ref={replyBoxRef} className="mb-4 ml-6">
              <CommentForm
                onSubmit={handleReply}
                isReply={true}
                parentComment={comment}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Comments: React.FC<CommentsProps> = ({ postSlug }) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postSlug=${postSlug}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleNewComment = async (content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, content, author: "Anonymous" }),
      });
      if (!response.ok) throw new Error("Failed to submit comment");
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const mentionedUsers =
        content.match(/@(\w+)/g)?.map((mention) => mention.slice(1)) || [];

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          content,
          author: "Anonymous",
          parentId,
          mentionedUsers,
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

  return (
    <section className="mt-12">
      <Card className="w-full dark:bg-gray-800 dark:text-gray-100">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentForm onSubmit={handleNewComment} />
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onVote={handleVote}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Comments;
