import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { TabContent } from "@/lib/types";

export const useDragAndDrop = (
  tabs: TabContent[],
  setTabs: (tabs: TabContent[]) => void
) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
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

      // Prevent non-admins from reordering admin or static tabs
      if (
        (draggedTab.createdByRole === "admin" ||
          staticTabIds.includes(draggedTab.id)) &&
        !isAdmin
      ) {
        setDialogOpen(true);
        return;
      }

      // Allow reordering only within same tab group (admin/static or user)
      const draggedIsUserTab =
        draggedTab.createdByRole !== "admin" &&
        !staticTabIds.includes(draggedTab.id);
      const targetIsUserTab =
        targetTab.createdByRole !== "admin" &&
        !staticTabIds.includes(targetTab.id);
      if (draggedIsUserTab !== targetIsUserTab) {
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

      // Update order based on new positions
      const updatedTabs = newTabs.map((tab, index) => ({
        ...tab,
        order: index,
      }));
      setTabs(updatedTabs);

      // Persist user tab order to database
      if (draggedIsUserTab && session?.user?.id) {
        const userTabs = updatedTabs
          .filter(
            (tab) =>
              tab.userId === session.user.id &&
              tab.createdByRole !== "admin" &&
              !staticTabIds.includes(tab.id)
          )
          .map((tab, index) => ({
            id: tab.id,
            order: index + 1,
          }));

        try {
          const response = await fetch("/api/tab-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tabs: userTabs }),
          });
          if (!response.ok) throw new Error("Failed to reorder tabs");
        } catch (error) {
          console.error("Error reordering tabs:", error);
        }
      }
    },
    [tabs, setTabs, isAdmin, session?.user?.id]
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
