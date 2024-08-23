"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function SidebarWithState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-gray-100 dark:bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Post Title</h1>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-6 w-6" />
        </Button>
      </header>

      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <aside className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex-shrink-0 h-screen fixed top-0">
        <Sidebar />
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
          <Sidebar />
        </div>
      </div>
    </>
  );
}
