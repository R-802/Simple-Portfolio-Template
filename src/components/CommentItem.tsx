import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ThumbsDown,
	ThumbsUp,
	ChevronDown,
	ChevronUp,
	MessageSquare,
	MoreVertical,
	Trash2,
} from "lucide-react";
import CommentForm from "@/components/CommentForm";
import { Comment } from "@/components/Comments";

export interface CommentItemProps {
	comment: Comment;
	onReply: (parentId: string, content: string, displayName: string) => void;
	onVote: (commentId: string, voteType: "upvote" | "downvote") => void;
	onDelete: (commentId: string) => void;
	isReply?: boolean;
	activeReplyId: string | null;
	setActiveReplyId: (id: string | null) => void;
	depth: number;
	maxIndentationDepth: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
	comment,
	onReply,
	onVote,
	onDelete,
	isReply = false,
	activeReplyId,
	setActiveReplyId,
	depth,
	maxIndentationDepth,
}) => {
	const [showReplies, setShowReplies] = useState(true);
	const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes);
	const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes);
	const [userVote, setUserVote] = useState<null | "upvote" | "downvote" | 0>(
		null
	);

	const handleReply = (content: string, displayName: string) => {
		const replyContent = content.trim();
		if (!replyContent) return;

		onReply(comment.id, replyContent, displayName);
		setActiveReplyId(null);
	};

	const handleVote = async (voteType: "upvote" | "downvote") => {
		const isUpvote = voteType === "upvote";
		const currentVote = userVote;

		// Optimistically update local state
		if (isUpvote) {
			if (currentVote === "upvote") {
				setLocalUpvotes((prev) => prev - 1);
				setUserVote(null);
			} else {
				setLocalUpvotes((prev) => prev + 1);
				if (currentVote === "downvote") {
					setLocalDownvotes((prev) => prev - 1);
				}
				setUserVote("upvote");
			}
		} else {
			if (currentVote === "downvote") {
				setLocalDownvotes((prev) => prev - 1);
				setUserVote(null);
			} else {
				setLocalDownvotes((prev) => prev + 1);
				if (currentVote === "upvote") {
					setLocalUpvotes((prev) => prev - 1);
				}
				setUserVote("downvote");
			}
		}

		// Call the onVote prop to update the backend
		try {
			await onVote(comment.id, voteType);
		} catch (error) {
			console.error("Error submitting vote:", error);

			// Roll back the state if there is an error
			if (isUpvote) {
				setLocalUpvotes((prev) => prev - 1);
				if (currentVote === "downvote") {
					setLocalDownvotes((prev) => prev + 1);
				}
			} else {
				setLocalDownvotes((prev) => prev - 1);
				if (currentVote === "upvote") {
					setLocalUpvotes((prev) => prev + 1);
				}
			}
			setUserVote(currentVote); // Restore previous vote state
		}
	};


	const handleDelete = () => {
		onDelete(comment.id);
	};

	const countTotalReplies = (comment: Comment): number => {
		let count = comment.replies.length;
		for (const reply of comment.replies) {
			count += countTotalReplies(reply);
		}
		return count;
	};

	const formatTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);
		const diffInMonths = Math.floor(diffInDays / 30);
		const diffInYears = Math.floor(diffInDays / 365);

		if (diffInSeconds < 60) {
			return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
		} else if (diffInDays < 30) {
			return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
		} else if (diffInMonths < 12) {
			return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
		} else {
			return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
		}
	};

	const totalReplies = countTotalReplies(comment);
	const effectiveDepth = Math.min(depth, maxIndentationDepth);
	const xPadding = isReply ? 10 : 0;

	return (
		<div className={`mb-6 ${!isReply ? "mb-8" : ""} relative`}>
			{isReply && (
				<div
					className="absolute bg-gray-300 dark:bg-gray-600"
					style={{
						width: "2px",
						top: "0",
						bottom: "30px",
						left: `${(effectiveDepth - 1) * 20 + 20}px`,
						zIndex: 1,
					}}
				/>
			)}
			<div
				className={`flex space-x-4 px-${xPadding}`}
				style={{ marginLeft: `${effectiveDepth * 20}px` }}
			>
				<Avatar className={isReply ? "w-8 h-8" : "w-10 h-10"}>
					<AvatarImage
						src={`https://avatar.vercel.sh/${comment.author}`}
						alt={comment.author}
						className="object-cover"
					/>
					<AvatarFallback className={isReply ? "text-xs" : "text-sm"}>
						{comment.author.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 relative">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<h4 className="text-sm font-semibold">{comment.author}</h4>
							<time className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
								{formatTimeAgo(new Date(comment.createdAt))}
							</time>
						</div>
						{comment.author === localStorage.getItem("displayName") && (
							<div className="absolute top-0 right-0 ">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0 ">
											<span className="sr-only">Open comment menu</span>
											<MoreVertical className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="
                bg-gray-200 dark:bg-gray-800 hover:bg-gray-300
                dark:hover:bg-gray-600 text-gray-800 dark:text-white
                transition-colors duration-200"
									>
										<DropdownMenuItem onClick={handleDelete}>
											<Trash2 className="mr-2 h-4 w-4" />
											<span>Delete</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>
					<div className="mt-1 text-sm prose dark:prose-invert max-w-none">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{comment.content}
						</ReactMarkdown>
					</div>
					<div className="mt-2 flex items-center space-x-2 pb-5">
						<Button
							onClick={() => handleVote("upvote")}
							variant="ghost"
							size="sm"
							className={`text-xs flex items-center ${userVote === "upvote"
								? "text-blue-500"
								: "text-gray-600 dark:text-gray-400"
								} hover:text-blue-500`}
						>
							<ThumbsUp className="h-3 w-3 mr-1" />
							{localUpvotes}
						</Button>
						<Button
							onClick={() => handleVote("downvote")}
							variant="ghost"
							size="sm"
							className={`text-xs flex items-center ${userVote === "downvote"
								? "text-red-500"
								: "text-gray-600 dark:text-gray-400"
								} hover:text-red-500`}
						>
							<ThumbsDown className="h-3 w-3 mr-1" />
							{localDownvotes}
						</Button>
						<Button
							onClick={() =>
								setActiveReplyId(
									activeReplyId === comment.id ? null : comment.id
								)
							}
							variant="ghost"
							size="sm"
							className="text-xs flex items-center"
						>
							<MessageSquare className="h-3 w-3 mr-1" />
							Reply
						</Button>
						{!isReply && totalReplies > 0 && (
							<Button
								onClick={() => setShowReplies(!showReplies)}
								variant="ghost"
								size="sm"
								className="text-xs flex items-center"
							>
								{showReplies ? (
									<ChevronUp className="h-3 w-3 mr-1" />
								) : (
									<ChevronDown className="h-3 w-3 mr-1" />
								)}
								{showReplies ? "Hide" : "Show"} Replies ({totalReplies})
							</Button>
						)}
					</div>
				</div>
			</div>
			{activeReplyId === comment.id && (
				<div
					className="mt-4"
					style={{ marginLeft: `${(effectiveDepth + 1) * 34}px` }}
				>
					<CommentForm
						onSubmit={handleReply}
						onCancel={() => setActiveReplyId(null)}
						isReply={true}
						parentComment={comment}
					/>
				</div>
			)}
			{showReplies && comment.replies && comment.replies.length > 0 && (
				<div className="mt-4 space-y-4">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onReply={onReply}
							onVote={onVote}
							onDelete={onDelete}
							activeReplyId={activeReplyId}
							setActiveReplyId={setActiveReplyId}
							depth={depth + 1}
							maxIndentationDepth={maxIndentationDepth}
							isReply={true}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default CommentItem;
