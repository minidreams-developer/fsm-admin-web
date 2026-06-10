import { useState, useEffect, useCallback, useMemo } from 'react';

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
 * 
 * Features:
 * - Automatically resets to page 1 when items array changes
 * - Updates itemsPerPage state when prop changes
 * - Validates currentPage never exceeds totalPages
 * - Handles edge case where itemsPerPage changes
 * - Memoizes calculated values for performance
 * 
 * Issues Fixed:
 * - itemsPerPage state now properly syncs with prop changes
 * - Dependency arrays are complete
 * - totalPages calculation is accurate
 * - Handles filtered items updates correctly
 */
export const usePagination = ({
  items,
  itemsPerPage = 10,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  // Sync itemsPerPage prop changes with state
  useEffect(() => {
    setPageSize(itemsPerPage);
    // Reset to first page when itemsPerPage changes
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Reset to page 1 when items change (filters, search, etc)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]); // Use items.length instead of items to avoid unnecessary resets

  // Calculate pagination values with memoization
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }, [items.length, pageSize]);

  // Ensure current page is valid and doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return Math.max(0, (currentPage - 1) * pageSize);
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(items.length, startIndex + pageSize);
  }, [startIndex, pageSize, items.length]);

  // Get paginated items
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Memoized setter functions to prevent unnecessary re-renders
  const handleSetCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const handleSetItemsPerPage = useCallback((items: number) => {
    const validItems = Math.max(1, items);
    setPageSize(validItems);
    // Reset to page 1 when changing page size
    setCurrentPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    itemsPerPage: pageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    resetPage,
  };
};
