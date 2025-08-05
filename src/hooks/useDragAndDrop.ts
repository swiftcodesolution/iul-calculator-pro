// src/hooks/useDragAndDrop.ts
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { TabContent } from "@/lib/types";

export const useDragAndDrop = (
  tabs: TabContent[],
  setTabs: (tabs: TabContent[]) => void
) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog

  const handleTabDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", id);
    },
    []
  );

  const handleTabDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId === targetId) return;

      const draggedTab = tabs.find((tab) => tab.id === draggedId);
      const targetTab = tabs.find((tab) => tab.id === targetId);
      if (!draggedTab || !targetTab) return;

      // Show dialog for non-admins trying to reorder admin tabs
      if (draggedTab.createdByRole === "admin" && !isAdmin) {
        setDialogOpen(true);
        return;
      }

      const draggedIndex = tabs.findIndex((tab) => tab.id === draggedId);
      const targetIndex = tabs.findIndex((tab) => tab.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return;

      const newTabs = [...tabs];
      [newTabs[draggedIndex], newTabs[targetIndex]] = [
        newTabs[targetIndex],
        newTabs[draggedIndex],
      ];
      setTabs(newTabs);

      // Persist admin tab order to database
      if (isAdmin && draggedTab.createdByRole === "admin") {
        const updatedTabs = newTabs
          .filter((tab) => tab.createdByRole === "admin")
          .map((tab, index) => ({
            id: tab.id,
            order: index + 1,
          }));

        try {
          const response = await fetch("/api/tab-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tabs: updatedTabs }),
          });
          if (!response.ok) throw new Error("Failed to reorder tabs");
        } catch (error) {
          console.error("Error reordering tabs:", error);
        }
      }
    },
    [tabs, setTabs, isAdmin]
  );

  const handleTabDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  return {
    handleTabDragStart,
    handleTabDrop,
    handleTabDragOver,
    dialogOpen,
    setDialogOpen,
  };
};
