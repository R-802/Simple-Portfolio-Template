import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center mt-8">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={`/?page=${currentPage - 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPage - 1);
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </PaginationPrevious>
            </PaginationItem>
          )}

          {currentPage > 2 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href={`/?page=1`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 3 && <PaginationEllipsis />}
            </>
          )}

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (page) =>
                page === currentPage ||
                page === currentPage - 1 ||
                page === currentPage + 1
            )
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href={`/?page=${page}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink
                  href={`/?page=${totalPages}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(totalPages);
                  }}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={`/?page=${currentPage + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPage + 1);
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </PaginationNext>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
