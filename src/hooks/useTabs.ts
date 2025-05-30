import { useState, useCallback } from "react";
import { TabContent } from "@/lib/types";
import { useTableStore } from "@/lib/store";

export const useTabs = () => {
  const { tabs, setTabs } = useTableStore();
  const [activeTab, setActiveTab] = useState<string | null>(null); // Initialize as null
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);

  const handleAddTab = useCallback(() => {
    if (tabs.length >= 4) {
      alert(
        "Demo version: Storage not connected. Cannot add more than 4 tabs."
      );
      return;
    }
    if (newTabName && newTabFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        const type = newTabFile.type.startsWith("image")
          ? "image"
          : newTabFile.type.startsWith("video")
          ? "video"
          : newTabFile.type === "application/pdf"
          ? "pdf"
          : "other";
        const newTab: TabContent = {
          id: Date.now().toString(),
          name: newTabName,
          src,
          type,
          isVisible: true,
        };
        setTabs([...tabs, newTab]);
        setIsAddDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
      };
      reader.readAsDataURL(newTabFile);
    }
  }, [newTabName, newTabFile, tabs, setTabs]);

  const handleEditTab = useCallback(() => {
    if (editTabId && newTabName) {
      if (newTabFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const src = reader.result as string;
          const type = newTabFile.type.startsWith("image")
            ? "image"
            : newTabFile.type.startsWith("video")
            ? "video"
            : newTabFile.type === "application/pdf"
            ? "pdf"
            : "other";
          setTabs(
            tabs.map((tab) =>
              tab.id === editTabId
                ? { ...tab, name: newTabName, src, type }
                : tab
            )
          );
          setIsEditDialogOpen(false);
          setNewTabName("");
          setNewTabFile(null);
          setEditTabId(null);
        };
        reader.readAsDataURL(newTabFile);
      } else {
        setTabs(
          tabs.map((tab) =>
            tab.id === editTabId ? { ...tab, name: newTabName } : tab
          )
        );
        setIsEditDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
        setEditTabId(null);
      }
    }
  }, [editTabId, newTabName, newTabFile, tabs, setTabs]);

  const handleDeleteTab = useCallback(
    (id: string) => {
      if (id === "total-advantage" || id === "calculator") return;
      setTabs(tabs.filter((tab) => tab.id !== id));
      if (activeTab === id) {
        setActiveTab(null); // Set to null instead of selecting another tab
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
