import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { TabContent } from "@/lib/types";

export const useDragAndDrop = (
  tabs: TabContent[],
  setTabs: (tabs: TabContent[]) => void
) => {
  const { data: session } = useSession();
  // const isAdmin = session?.user?.role === "admin";
  const [dialogOpen, setDialogOpen] = useState(false);

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

      const staticTabIds = [
        "total-advantage",
        "calculator",
        "inflationCalculator",
        "annualContributionCalculatorForIUL",
        "cagrChart",
      ];

      // Prevent reordering static tabs
      if (
        staticTabIds.includes(draggedTab.id) ||
        staticTabIds.includes(targetTab.id)
      ) {
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

      // Update userOrder based on new positions
      const updatedTabs = newTabs.map((tab, index) => ({
        ...tab,
        userOrder: index,
      }));
      setTabs(updatedTabs);

      // Persist tab order to UserTabContentOrder
      if (session?.user?.id) {
        const tabsToSync = updatedTabs
          .filter((tab) => !staticTabIds.includes(tab.id))
          .map((tab, index) => ({
            id: tab.id,
            order: index,
          }));

        try {
          const response = await fetch("/api/user-tab-content-order", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tabs: tabsToSync }),
          });
          if (!response.ok) throw new Error("Failed to reorder tabs");
        } catch (error) {
          console.error("Error reordering tabs:", error);
        }
      }
    },
    [tabs, setTabs, session?.user?.id]
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
