import { useState, useEffect } from 'react';

export interface UsePaginationProps {
  items: any[];
  itemsPerPage?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  paginatedItems: any[];
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  resetPage: () => void;
}

/**
 * Custom hook for handling pagination logic
 * Automatically resets to page 1 when items array changes
 */
export const usePagination = ({
  items,
  itemsPerPage = 10,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    itemsPerPage: pageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage: setPageSize,
    resetPage,
  };
};
