import { useState, useCallback } from "react";

export const useColumnHighlight = () => {
  const [columnTextWhite, setColumnTextWhite] = useState({
    currentPlan: false,
    taxes: true,
    taxFreePlan: true,
  });
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

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
    setHighlightedRow((prev) => (prev === rowIndex ? null : rowIndex));
  }, []);

  return {
    columnTextWhite,
    highlightedRow,
    handleHeaderClick,
    handleCellClick,
  };
};
