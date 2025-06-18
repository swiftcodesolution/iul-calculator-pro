// src/hooks/useTabs.ts
import { useState, useCallback } from "react";
import { TabContent } from "@/lib/types";
import { useTableStore } from "@/lib/store";

export const useTabs = () => {
  const { tabs, setTabs } = useTableStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);

  const handleAddTab = useCallback(async () => {
    if (!newTabName || !newTabFile) return;

    const formData = new FormData();
    formData.append("tabName", newTabName);
    formData.append("file", newTabFile);

    try {
      const response = await fetch("/api/tab-content", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add tab");
      const newTab: TabContent = await response.json();
      setTabs([...tabs, newTab]);
      setIsAddDialogOpen(false);
      setNewTabName("");
      setNewTabFile(null);
    } catch (err) {
      console.error("Error adding tab:", err);
    }
  }, [newTabName, newTabFile, tabs, setTabs]);

  const handleEditTab = useCallback(async () => {
    if (!editTabId || !newTabName) return;

    const formData = new FormData();
    formData.append("id", editTabId);
    formData.append("tabName", newTabName);
    if (newTabFile) formData.append("file", newTabFile);

    try {
      const response = await fetch("/api/tab-content", {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to edit tab");
      const updatedTab: TabContent = await response.json();
      setTabs(tabs.map((tab) => (tab.id === editTabId ? updatedTab : tab)));
      setIsEditDialogOpen(false);
      setNewTabName("");
      setNewTabFile(null);
      setEditTabId(null);
    } catch (err) {
      console.error("Error editing tab:", err);
    }
  }, [editTabId, newTabName, newTabFile, tabs, setTabs]);

  const handleDeleteTab = useCallback(
    async (id: string) => {
      if (id === "total-advantage" || id === "calculator") return;
      try {
        const response = await fetch("/api/tab-content", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("Failed to delete tab");
        setTabs(tabs.filter((tab) => tab.id !== id));
        if (activeTab === id) setActiveTab(null);
      } catch (err) {
        console.error("Error deleting tab:", err);
      }
    },
    [activeTab, tabs, setTabs]
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      setTabs(
        tabs.map((tab) =>
          tab.id === id ? { ...tab, isVisible: !tab.isVisible } : tab
        )
      );
    },
    [tabs, setTabs]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newTabs = [...tabs];
      [newTabs[index - 1], newTabs[index]] = [
        newTabs[index],
        newTabs[index - 1],
      ];
      setTabs(newTabs);
    },
    [tabs, setTabs]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === tabs.length - 1) return;
      const newTabs = [...tabs];
      [newTabs[index], newTabs[index + 1]] = [
        newTabs[index + 1],
        newTabs[index],
      ];
      setTabs(newTabs);
    },
    [tabs, setTabs]
  );

  return {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isManageDialogOpen,
    setIsManageDialogOpen,
    editTabId,
    setEditTabId,
    newTabName,
    setNewTabName,
    newTabFile,
    setNewTabFile,
    handleAddTab,
    handleEditTab,
    handleDeleteTab,
    handleToggleVisibility,
    handleMoveUp,
    handleMoveDown,
  };
};
