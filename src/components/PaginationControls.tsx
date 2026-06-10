import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  startIndex: number;
  endIndex: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) {
      endPage = 4;
    } else if (currentPage >= totalPages - 1) {
      startPage = totalPages - 3;
    }

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  // Handle items per page change with validation
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    if (newItemsPerPage > 0 && newItemsPerPage !== itemsPerPage) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // Handle page change with validation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Previous page button
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Next page button
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Calculate display range for showing items
  const displayStartIndex = totalItems === 0 ? 0 : startIndex + 1;
  const displayEndIndex = Math.min(endIndex, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 bg-card rounded-xl border border-border">
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Show</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-muted-foreground">entries</span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || totalPages === 0}
          className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="text-muted-foreground text-xs px-1">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]'
                    : 'border border-border text-card-foreground hover:bg-secondary'
                }`}
                style={
                  isActive
                    ? { background: 'linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)' }
                    : {}
                }
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-2 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Entry count */}
      <div className="text-sm text-muted-foreground text-center sm:text-right">
        {totalItems === 0 ? (
          <span>No entries to display</span>
        ) : (
          <span>
            Showing {displayStartIndex} to {displayEndIndex} of {totalItems} entries
          </span>
        )}
      </div>
    </div>
  );
};
