import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CommentSkeleton: React.FC = () => {
  return (
    <Card className="w-full dark:bg-gray-800 dark:text-gray-100 animate-pulse">
      <CardHeader className="flex flex-col space-y-1.5 p-6">
        <CardTitle className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSkeleton;
