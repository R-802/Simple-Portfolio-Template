"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Edit2, X } from "lucide-react";
import { Comment } from "@/components/Comments";
import SignInForm from "@/components/SignInForm";
import MarkdownToolbar from "@/components/MarkdownToolbar";

export interface CommentFormProps {
  onSubmit: (content: string, displayName: string) => void;
  onCancel?: () => void;
  isReply?: boolean;
  parentComment?: Comment;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  isReply = false,
  parentComment,
}) => {
  const [content, setContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [textareaHeight, setTextareaHeight] = useState<string>("auto");

  useEffect(() => {
    if (isReply && parentComment) {
      const prefillContent = `@${parentComment.author} `;
      setContent(prefillContent);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          prefillContent.length,
          prefillContent.length
        );
      }
    } else {
      const storedContent = localStorage.getItem("pendingComment");
      if (storedContent) {
        setContent(storedContent);
      }
    }
  }, [isReply, parentComment]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const displayName = localStorage.getItem("displayName");
    if (displayName) {
      onSubmit(content, displayName);
      setContent("");
      setIsPreviewMode(false);
      localStorage.removeItem("pendingComment");
    } else {
      localStorage.setItem("pendingComment", content);
      setIsSignInModalOpen(true);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    autoResizeTextarea(e.target);
  };

  const handleSignIn = (username: string, provider: string) => {
    const pendingComment = localStorage.getItem("pendingComment");
    if (pendingComment) {
      onSubmit(pendingComment, username);
      localStorage.removeItem("pendingComment");
    }
    setContent("");
    setIsPreviewMode(false);
    setIsSignInModalOpen(false);
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handlePreviewToggle = () => {
    if (textareaRef.current) {
      if (isPreviewMode) {
        textareaRef.current.style.height = textareaHeight;
      } else {
        setTextareaHeight(textareaRef.current.style.height);
      }
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const handleCancel = () => {
    setContent("");
    setIsPreviewMode(false);
    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    if (!isPreviewMode && textareaRef.current) {
      textareaRef.current.style.height = textareaHeight;
    }
  }, [isPreviewMode, textareaHeight]);

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6" ref={formRef}>
        <div className="relative">
          {isPreviewMode ? (
            <div className="min-h-[80px] p-6 border rounded-md dark:bg-gray-700 dark:text-gray-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p {...props} style={{ whiteSpace: "pre-wrap" }} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onInput={handleInput}
              placeholder={isReply ? "Write a reply..." : "Leave a comment..."}
              className="min-h-[70px] pb-14 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              style={{ resize: "none", overflow: "hidden" }}
            />
          )}
          {!isPreviewMode && (
            <div className="absolute bottom-2 left-2">
              <MarkdownToolbar onInsert={insertMarkdown} />
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <Button
            type="button"
            onClick={handlePreviewToggle}
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
          <div className="flex space-x-2">
            {isReply && (
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}
            <Button
              type="submit"
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200"
            >
              {isReply ? "Reply" : "Submit"}
            </Button>
          </div>
        </div>
      </form>

      <SignInForm
        isOpen={isSignInModalOpen}
        onOpenChange={setIsSignInModalOpen}
        onSignIn={handleSignIn}
      />
    </>
  );
};

export default CommentForm;
