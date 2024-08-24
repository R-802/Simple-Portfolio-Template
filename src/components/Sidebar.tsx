import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  FolderIcon,
  UserIcon,
  LinkedinIcon,
  MailIcon,
  XIcon,
} from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  isMobile?: boolean;
  toggleSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile = false,
  toggleSidebar,
}) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-0 left-0 right-0 h-48">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("/images/sidebar-bg.jpg")' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-gray-100 dark:to-gray-800" />
      </div>
      {isMobile && toggleSidebar && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <XIcon className="h-6 w-6" />
        </Button>
      )}
      <div className="relative px-6 pt-48 pb-6 flex flex-col flex-grow overflow-y-auto">
        <div className="relative -mt-24 mb-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src="/images/profile.jpg"
              alt="Profile picture"
              layout="fill"
              className="rounded-full border-4 border-white shadow-lg dark:border-gray-700"
              priority
            />
          </div>
          <h1 className="text-xl font-bold mb-2">Title</h1>
          <p className="text-sm text-gray-600 italic dark:text-gray-400">
            &quot;Some text&quot;
          </p>
        </div>

        <nav className="mb-auto" aria-label="Main navigation">
          <ul className="space-y-2">
            <li>
              <Link href="/" passHref legacyBehavior>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <HomeIcon className="mr-2 h-4 w-4" /> Home
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/categories" passHref legacyBehavior>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FolderIcon className="mr-2 h-4 w-4" /> Categories
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/about" passHref legacyBehavior>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <UserIcon className="mr-2 h-4 w-4" /> About
                </Button>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex justify-left space-x-2 items-center">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
          >
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LinkedinIcon className="h-4 w-4" />
            </Button>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
          >
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <GitHubLogoIcon className="h-4 w-4" />
            </Button>
          </a>
          <a href="mailto:joesmother69420@gmail.com" aria-label="Email contact">
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MailIcon className="h-4 w-4" />
            </Button>
          </a>

          <div
            className="h-6 w-px bg-gray-300 dark:bg-gray-700"
            aria-hidden="true"
          />

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
