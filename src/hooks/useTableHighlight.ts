import { useState, useCallback } from "react";

export const useTableHighlight = () => {
  const [highlightedRows, setHighlightedRows] = useState<Set<number>>(
    new Set()
  );
  const [highlightedColumns, setHighlightedColumns] = useState<Set<string>>(
    new Set()
  );

  const handleRowClick = useCallback((rowIndex: number) => {
    setHighlightedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, []);

  const handleColumnClick = useCallback((column: string) => {
    setHighlightedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }, []);

  return {
    highlightedRows,
    highlightedColumns,
    handleRowClick,
    handleColumnClick,
  };
};
