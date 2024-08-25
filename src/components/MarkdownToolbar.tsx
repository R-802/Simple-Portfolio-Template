import React from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface MarkdownToolbarProps {
  onInsert: (syntax: string, placeholder: string) => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert }) => {
  return (
    <div className="flex space-x-2 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("**text**", "bold text")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("*text*", "italic text")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("~~text~~", "strikethrough text")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("# text", "heading")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Heading"
      >
        <Heading className="h-4 w-4" />
      </Button>
      <div
        className="w-px h-6 bg-gray-300 dark:bg-gray-600"
        aria-hidden="true"
      ></div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("- text", "list item")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Unordered List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("1. text", "numbered list item")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div
        className="w-px h-6 bg-gray-300 dark:bg-gray-600"
        aria-hidden="true"
      ></div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("> text", "quote")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("`text`", "code")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <div
        className="w-px h-6 bg-gray-300 dark:bg-gray-600"
        aria-hidden="true"
      ></div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onInsert("[text](url)", "link text")}
        className="toolbar-button hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MarkdownToolbar;
