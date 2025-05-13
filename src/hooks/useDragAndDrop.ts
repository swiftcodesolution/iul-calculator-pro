import { useCallback } from "react";
import { TabContent } from "@/lib/types";

export const useDragAndDrop = (
  tabs: TabContent[],
  setTabs: (tabs: TabContent[]) => void
) => {
  const handleTabDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      if (id === "total-advantage" || id === "calculator") {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/plain", id);
    },
    []
  );

  const handleTabDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if (
        draggedId === targetId ||
        draggedId === "total-advantage" ||
        draggedId === "calculator" ||
        targetId === "total-advantage" ||
        targetId === "calculator"
      ) {
        return;
      }
      const newTabs = [...tabs];
      const draggedIndex = newTabs.findIndex((tab) => tab.id === draggedId);
      const targetIndex = newTabs.findIndex((tab) => tab.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return; // Safety check
      [newTabs[draggedIndex], newTabs[targetIndex]] = [
        newTabs[targetIndex],
        newTabs[draggedIndex],
      ];
      setTabs(newTabs);
    },
    [tabs, setTabs]
  );

  const handleTabDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    },
    []
  );

  return { handleTabDragStart, handleTabDrop, handleTabDragOver };
};
