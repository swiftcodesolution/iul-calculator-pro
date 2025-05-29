import { useState, useCallback } from "react";

export const useColumnHighlight = () => {
  const [columnTextWhite, setColumnTextWhite] = useState({
    currentPlan: false,
    taxes: true,
    taxFreePlan: true,
  });
  const [highlightedRows, setHighlightedRows] = useState<Set<number>>(
    new Set()
  );

  const handleHeaderClick = useCallback(
    (column: keyof typeof columnTextWhite) => {
      setColumnTextWhite((prev) => ({
        ...prev,
        [column]: !prev[column],
      }));
    },
    []
  );

  const handleCellClick = useCallback((rowIndex: number) => {
    setHighlightedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex); // Unhighlight if already highlighted
      } else {
        newSet.add(rowIndex); // Highlight new row
      }
      return newSet;
    });
  }, []);

  return {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  };
};
