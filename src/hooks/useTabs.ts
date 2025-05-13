import { useState, useCallback } from "react";
import { TabContent } from "@/lib/types";

export const useTabs = (initialTabs: TabContent[]) => {
  const [tabs, setTabs] = useState<TabContent[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<string | null>(null); // Initialize as null
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);

  const handleAddTab = useCallback(() => {
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
          file: newTabFile,
          src,
          type,
          isVisible: true,
        };
        setTabs((prev) => [...prev, newTab]);
        setIsAddDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
      };
      reader.readAsDataURL(newTabFile);
    }
  }, [newTabName, newTabFile]);

  const handleEditTab = useCallback(() => {
    if (editTabId && newTabName) {
      if (editTabId === "total-advantage" || editTabId === "calculator") {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === editTabId ? { ...tab, name: newTabName } : tab
          )
        );
        setIsEditDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
        setEditTabId(null);
        return;
      }
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
          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === editTabId
                ? { ...tab, name: newTabName, file: newTabFile, src, type }
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
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === editTabId ? { ...tab, name: newTabName } : tab
          )
        );
        setIsEditDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
        setEditTabId(null);
      }
    }
  }, [editTabId, newTabName, newTabFile]);

  const handleDeleteTab = useCallback(
    (id: string) => {
      if (id === "total-advantage" || id === "calculator") return;
      setTabs((prev) => prev.filter((tab) => tab.id !== id));
      if (activeTab === id) {
        setActiveTab(null); // Set to null instead of selecting another tab
      }
    },
    [activeTab]
  );

  const handleToggleVisibility = useCallback((id: string) => {
    if (id === "total-advantage" || id === "calculator") return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, isVisible: !tab.isVisible } : tab
      )
    );
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setTabs((prev) => {
      const newTabs = [...prev];
      [newTabs[index - 1], newTabs[index]] = [
        newTabs[index],
        newTabs[index - 1],
      ];
      return newTabs;
    });
  }, []);

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === tabs.length - 1) return;
      setTabs((prev) => {
        const newTabs = [...prev];
        [newTabs[index], newTabs[index + 1]] = [
          newTabs[index + 1],
          newTabs[index],
        ];
        return newTabs;
      });
    },
    [tabs.length]
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
