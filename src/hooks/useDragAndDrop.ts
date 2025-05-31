import { useCallback } from "react";
import { TabContent } from "@/lib/types";

export const useDragAndDrop = (
  tabs: TabContent[],
  setTabs: (tabs: TabContent[]) => void
) => {
  const handleTabDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", id);
    },
    []
  );

  const handleTabDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedId = e.dataTransfer.getData("text/plain");

      if (draggedId === targetId) return;

      const draggedIndex = tabs.findIndex((tab) => tab.id === draggedId);
      const targetIndex = tabs.findIndex((tab) => tab.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const newTabs = [...tabs];
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
      e.stopPropagation();
    },
    []
  );

  return { handleTabDragStart, handleTabDrop, handleTabDragOver };
};
