import { useTableStore } from "@/lib/store";
import { useState, useCallback } from "react";

export const useColumnHighlight = () => {
  const { activeButtons, setActiveButtons } = useTableStore();
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

  const handleCellClick = useCallback(
    (rowIndex: number) => {
      setHighlightedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex); // Unhighlight row
        } else {
          newSet.add(rowIndex); // Highlight row
        }
        return newSet;
      });

      // Map table row indices to Total Advantage button indices
      const buttonMapping: { [key: number]: number } = {
        8: 8, // Cumulative Taxes Paid -> Taxes Saved button
        9: 9, // Cumulative Fees Paid -> Fees Saved button
        10: 10, // Cumulative Net Income -> Extra Income button
        13: 13, // Death Benefits -> Death Benefit button
      };

      if (buttonMapping[rowIndex] !== undefined) {
        setActiveButtons({
          ...activeButtons,
          [buttonMapping[rowIndex]]: !activeButtons[buttonMapping[rowIndex]],
        });
      }
    },
    [activeButtons, setActiveButtons]
  );

  return {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  };
};
