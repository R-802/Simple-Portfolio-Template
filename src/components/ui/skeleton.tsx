import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export default function SkeletonPost() {
  return (
    <Card className="w-full dark:bg-gray-800 overflow-hidden">
      <div className="animate-shimmer">
        <div
          className="h-full w-[200%] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent"
          style={{
            transform: "translateX(-50%)",
            animation: "shimmer 2s infinite",
          }}
        >
          <CardHeader>
            <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-4/6"></div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
