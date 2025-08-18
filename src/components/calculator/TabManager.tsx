// src/components/TabManager.tsx
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import TabCalculator from "@/components/TabCalculator";
import { TotalAdvantage, TabContent } from "@/lib/types";
import { ManageTabsDialog } from "@/components/calculator/ManageTabsDialog";
import { useTableStore } from "@/lib/store";
import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import InflationCalculator from "../InflationCalculator";
import CagrChart from "../CagrChart";
import { useSession } from "next-auth/react";
import AnnualContributionCalculatorForIUL from "../AnnualContributionCalculatorForIUL";
import TaxBracketTab from "../TaxBracketTab";

interface TabManagerProps {
  activeTab: string | null;
  setActiveTab: (id: string | null) => void;
  isTabCardExpanded: boolean;
  setIsTabCardExpanded: (value: boolean) => void;
  totalAdvantage: TotalAdvantage;
  handleCellClick?: (rowIndex: number) => void;
}

// Static tabs (always present)
const staticTabs: TabContent[] = [
  {
    id: "total-advantage",
    name: "Total Advantage",
    type: "totalAdvantage",
    isVisible: true,
    userOrder: undefined,
  },
  {
    id: "2025TaxBrackets",
    name: "2025 Tax Brackets",
    type: "2025TaxBrackets",
    isVisible: true,
    userOrder: undefined,
  },
  {
    id: "calculator",
    name: "Calculator",
    type: "calculator",
    isVisible: true,
    userOrder: undefined,
  },
  {
    id: "annualContributionCalculatorForIUL",
    name: "Annual Contribution for IUL",
    type: "annualContributionCalculatorForIUL",
    isVisible: true,
    userOrder: undefined,
  },
  {
    id: "inflationCalculator",
    name: "Inflation Calculator",
    type: "inflationCalculator",
    isVisible: true,
    userOrder: undefined,
  },
  {
    id: "cagrChart",
    name: "CAGR Chart",
    type: "cagrChart",
    isVisible: true,
    userOrder: undefined,
  },
];

// Reusable Tab Navigation Component
const TabNavigation = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: TabContent[];
  activeTab: string | null;
  setActiveTab: (id: string | null) => void;
}) => (
  <div className="flex gap-2 flex-wrap w-3/4">
    {tabs
      .filter((tab) => tab.isVisible)
      .sort((a, b) => {
        const aIsStatic = staticTabs.some((t) => t.id === a.id);
        const bIsStatic = staticTabs.some((t) => t.id === b.id);
        if (aIsStatic && bIsStatic) {
          return (
            staticTabs.findIndex((t) => t.id === a.id) -
            staticTabs.findIndex((t) => t.id === b.id)
          );
        }
        if (aIsStatic) return -1;
        if (bIsStatic) return 1;
        return (
          (a.userOrder ?? a.order ?? 9999) - (b.userOrder ?? b.order ?? 9999)
        );
      })
      .map((tab, index) => (
        <motion.div
          key={tab.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 1 }}
          title={tab.name}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() =>
                    setActiveTab(activeTab === tab.id ? null : tab.id)
                  }
                  aria-selected={activeTab === tab.id}
                  className="cursor-pointer w-10 h-10"
                >
                  {index + 1}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-lg">{tab.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      ))}
  </div>
);

// Reusable Expand/Collapse Button
const ToggleExpandButton = ({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
    whileTap={{ scale: 0.95 }}
  >
    <Button variant="outline" onClick={onClick}>
      {isExpanded ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  </motion.div>
);

// Reusable Tab Content
const TabContentRenderer = ({
  tab,
  totalAdvantage,
  handleCellClick,
}: {
  tab: TabContent;
  totalAdvantage: TotalAdvantage;
  handleCellClick?: (rowIndex: number) => void;
}) => {
  const { activeButtons, setActiveButtons } = useTableStore();

  const toggleButton = (id: number) => {
    setActiveButtons({
      ...activeButtons,
      [id]: !activeButtons[id],
    });
    handleCellClick?.(id);
  };

  const getEmbedUrl = (link: string | null) => {
    if (!link) return null;
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      const videoId = link.includes("youtube.com")
        ? new URL(link).searchParams.get("v")
        : link.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return link;
  };

  return (
    <div className="w-full h-full space-y-4">
      {tab.type === "totalAdvantage" && (
        <div className="w-full">
          <div className="flex flex-col items-center justify-center p-4 text-center border-black border-2">
            <h2 className="text-2xl font-bold mb-5">
              Your Estimated - Total Advantage
            </h2>
            <h2 className="text-3xl font-bold mb-5">
              ${totalAdvantage.total.toLocaleString()} + Living Benefits
            </h2>
            <div className="w-full flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className={`cursor-pointer p-6 min-w-1/5 
                  ${
                    activeButtons[8]
                      ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                      : ""
                  } 
                  ${
                    totalAdvantage.cumulativeTaxesPaid < 0
                      ? "border-red-500 text-red-500  font-bold"
                      : ""
                  } 
                `}
                onClick={() => toggleButton?.(8)}
              >
                Taxes saved:
                <br />${totalAdvantage.cumulativeTaxesPaid.toLocaleString()}
              </Button>
              <Button
                variant="outline"
                className={`cursor-pointer p-6 min-w-1/5 ${
                  activeButtons[9]
                    ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                    : ""
                }
                ${
                  totalAdvantage.fees < 0
                    ? "border-red-500 text-red-500  font-bold"
                    : ""
                } 
                `}
                onClick={() => toggleButton?.(9)}
              >
                Fees Saved: <br /> ${totalAdvantage.fees.toLocaleString()}
              </Button>
              <Button
                variant="outline"
                className={`cursor-pointer p-6 min-w-1/5 ${
                  activeButtons[10]
                    ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                    : ""
                }
                ${
                  totalAdvantage.cumulativeIncome < 0
                    ? "border-red-500 text-red-500  font-bold"
                    : ""
                } 
                `}
                onClick={() => toggleButton?.(10)}
              >
                Extra Income: <br /> $
                {totalAdvantage.cumulativeIncome.toLocaleString()}
              </Button>
              <Button
                variant="outline"
                className={`cursor-pointer p-6 min-w-1/5 ${
                  activeButtons[13]
                    ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                    : ""
                }
                ${
                  totalAdvantage.deathBenefits < 0
                    ? "border-red-500 text-red-500  font-bold"
                    : ""
                } 
                `}
                onClick={() => toggleButton?.(13)}
              >
                Death Benefit: <br /> $
                {totalAdvantage.deathBenefits.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      )}
      {tab.type === "2025TaxBrackets" && (
        <div className="h-full w-full flex items-center justify-center gap-4 text-center">
          <TaxBracketTab />
        </div>
      )}
      {tab.type === "calculator" && (
        <div className="h-full w-full flex items-center justify-center gap-4 text-center">
          <TabCalculator />
        </div>
      )}
      {tab.type === "annualContributionCalculatorForIUL" && (
        <div className="h-full w-full flex items-center justify-center gap-4 text-center">
          <AnnualContributionCalculatorForIUL />
        </div>
      )}
      {tab.type === "inflationCalculator" && (
        <div className="h-full w-full flex items-center justify-center gap-4 text-center">
          <InflationCalculator />
        </div>
      )}
      {tab.type === "cagrChart" && (
        <div className="h-full w-full flex items-center justify-center gap-4 text-center">
          <CagrChart />
        </div>
      )}
      {tab.type === "image" && tab.filePath && (
        <div>
          <Image
            src={tab.filePath}
            alt={tab.name}
            width={1000}
            height={1000}
            className={`object-contain w-full h-[600px] max-h-full`}
          />
        </div>
      )}
      {tab.type === "video" && tab.filePath && (
        <div>
          <video
            src={tab.filePath}
            controls
            className="w-full h-auto max-h-full"
          />
        </div>
      )}
      {tab.type === "pdf" && tab.filePath && (
        <div>
          <embed
            src={tab.filePath}
            type="application/pdf"
            className="w-full h-[600px] max-h-full"
          />
        </div>
      )}
      {tab.type === "link" && tab.link && getEmbedUrl(tab.link) && (
        <div>
          <iframe
            src={getEmbedUrl(tab.link)!}
            className="w-full h-[600px] max-h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}
      {tab.type === "other" && (tab.filePath || tab.link) && (
        <p>Unsupported content: {tab.name}</p>
      )}
    </div>
  );
};

const TabManager = React.memo(function TabManager({
  activeTab,
  setActiveTab,
  isTabCardExpanded,
  setIsTabCardExpanded,
  totalAdvantage,
  handleCellClick,
}: TabManagerProps) {
  const { data: session } = useSession();
  const { tabs, setTabs } = useTableStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);
  const [newTabLink, setNewTabLink] = useState("");
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const staticTabIds = staticTabs.map((tab) => tab.id);

  useEffect(() => {
    async function fetchTabContent() {
      try {
        const response = await fetch("/api/tab-content");
        if (response.status === 401) {
          setError("Please log in to view tab content");
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch tab content");
        const data: {
          id: string;
          tabName: string;
          filePath?: string | null;
          fileFormat?: string | null;
          link?: string | null;
          createdByRole?: string;
          userId?: string;
          order?: number;
          userOrder?: number; // New: User-specific order
        }[] = await response.json();

        const dynamicTabs: TabContent[] = data.map((item) => ({
          id: item.id,
          name: item.tabName,
          type: (item.link
            ? "link"
            : item.fileFormat?.startsWith("image/")
            ? "image"
            : item.fileFormat?.startsWith("video/")
            ? "video"
            : item.fileFormat === "application/pdf"
            ? "pdf"
            : "other") as TabContent["type"],
          filePath: item.filePath,
          fileFormat: item.fileFormat,
          link: item.link,
          isVisible: true,
          createdByRole: item.createdByRole,
          userId: item.userId,
          order: item.order,
          userOrder: item.userOrder, // Include user-specific order
        }));

        // Initialize with static tabs first, then append dynamic tabs
        setTabs([...staticTabs, ...dynamicTabs]);
      } catch (err) {
        setError("Error loading tab content");
        console.error(err);
      }
    }
    if (session?.user?.id) {
      fetchTabContent();
    }
  }, [session, setTabs]);

  const handleAddTab = async () => {
    if (!newTabName || (!newTabFile && !newTabLink)) {
      setError("Tab name and either file or link are required.");
      return;
    }

    const formData = new FormData();
    formData.append("tabName", newTabName);
    if (newTabFile) formData.append("file", newTabFile);
    if (newTabLink) formData.append("link", newTabLink);

    try {
      const response = await fetch("/api/tab-content", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add tab");
      const newTab: {
        id: string;
        tabName: string;
        filePath?: string | null;
        fileFormat?: string | null;
        link?: string | null;
        createdByRole?: string;
        userId?: string;
        order?: number;
        userOrder?: number;
      } = await response.json();
      setTabs([
        ...tabs,
        {
          id: newTab.id,
          name: newTab.tabName,
          type: (newTab.link
            ? "link"
            : newTab.fileFormat?.startsWith("image/")
            ? "image"
            : newTab.fileFormat?.startsWith("video/")
            ? "video"
            : newTab.fileFormat === "application/pdf"
            ? "pdf"
            : "other") as TabContent["type"],
          filePath: newTab.filePath,
          fileFormat: newTab.fileFormat,
          link: newTab.link,
          isVisible: true,
          createdByRole: session?.user?.role || "user",
          userId: session?.user?.id || "",
          order: newTab.order,
          userOrder: newTab.userOrder,
        },
      ]);
      setIsAddDialogOpen(false);
      setNewTabName("");
      setNewTabFile(null);
      setNewTabLink("");
      setError(null);
    } catch (err) {
      setError("Error adding tab");
      console.error(err);
    }
  };

  const handleEditTab = async () => {
    if (!editTabId || !newTabName) {
      setError("Tab name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("id", editTabId);
    formData.append("tabName", newTabName);
    if (newTabFile) formData.append("file", newTabFile);
    if (newTabLink) formData.append("link", newTabLink);

    try {
      const response = await fetch("/api/tab-content", {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to edit tab");
      const updatedTab: TabContent = await response.json();
      setTabs(
        tabs.map((tab) =>
          tab.id === editTabId
            ? {
                ...tab,
                name: updatedTab.name,
                filePath: updatedTab.filePath,
                fileFormat: updatedTab.fileFormat,
                link: updatedTab.link,
                type: updatedTab.link
                  ? "link"
                  : updatedTab.fileFormat?.startsWith("image/")
                  ? "image"
                  : updatedTab.fileFormat?.startsWith("video/")
                  ? "video"
                  : updatedTab.fileFormat === "application/pdf"
                  ? "pdf"
                  : "other",
              }
            : tab
        )
      );
      setIsEditDialogOpen(false);
      setEditTabId(null);
      setNewTabName("");
      setNewTabFile(null);
      setNewTabLink("");
      setError(null);
    } catch (err) {
      setError("Error editing tab");
      console.error(err);
    }
  };

  const handleDeleteTab = async (id: string) => {
    try {
      const response = await fetch("/api/tab-content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete tab");
      setTabs(tabs.filter((tab) => tab.id !== id));
    } catch (err) {
      setError("Error deleting tab");
      console.error(err);
    }
  };

  const handleToggleVisibility = (id: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === id ? { ...tab, isVisible: !tab.isVisible } : tab
      )
    );
  };

  const handleMoveUp = (index: number) => {
    if (index <= staticTabIds.length) return; // Prevent moving static tabs
    const newTabs = [...tabs];
    [newTabs[index], newTabs[index - 1]] = [newTabs[index - 1], newTabs[index]];
    newTabs[index].userOrder = index;
    newTabs[index - 1].userOrder = index - 1;
    setTabs(newTabs);
    fetch("/api/user-tab-content-order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabs: newTabs
          .filter((t) => !staticTabIds.includes(t.id)) // Exclude static tabs
          .map((t, index) => ({ id: t.id, order: index })), // Use index for order
      }),
    }).catch((err) => {
      console.error("Error updating tab order:", err);
      setError("Failed to update tab order");
    });
  };

  const handleMoveDown = (index: number) => {
    if (index < staticTabIds.length || index >= tabs.length - 1) return;
    const newTabs = [...tabs];
    [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]];
    newTabs[index].userOrder = index;
    newTabs[index + 1].userOrder = index + 1;
    setTabs(newTabs);
    fetch("/api/user-tab-content-order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabs: newTabs
          .filter((t) => !staticTabIds.includes(t.id)) // Exclude static tabs
          .map((t, index) => ({ id: t.id, order: index })), // Use index for order
      }),
    }).catch((err) => {
      console.error("Error updating tab order:", err);
      setError("Failed to update tab order");
    });
  };

  const content = activeTab && tabs.find((tab) => tab.id === activeTab) && (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-center w-full h-full min-h-[auto] ${
        isTabCardExpanded ? "" : ""
      }`}
    >
      <TabContentRenderer
        tab={tabs.find((tab) => tab.id === activeTab)!}
        totalAdvantage={totalAdvantage}
        handleCellClick={handleCellClick}
      />
    </motion.div>
  );

  return (
    <AnimatePresence>
      {!isTabCardExpanded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="grow"
        >
          <Card className="h-full p-2 grow">
            <CardContent className="p-0 h-full">
              <motion.div
                className="h-full flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                  <div className="flex gap-2">
                    <div className="flex gap-2">
                      {session?.user.role !== "admin" && (
                        <Dialog
                          open={isAddDialogOpen}
                          onOpenChange={setIsAddDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button variant="outline">Add</Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent className="p-6">
                            <DialogHeader>
                              <DialogTitle>Add New Tab</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="Tab Name"
                                value={newTabName}
                                onChange={(e) => setNewTabName(e.target.value)}
                                className="rounded-md"
                              />
                              <Button asChild>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  Upload File
                                  <Upload className="h-4 w-4" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*,application/pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) setNewTabFile(file);
                                    }}
                                  />
                                </label>
                              </Button>
                              <Input
                                type="url"
                                placeholder="Or provide a link (e.g., YouTube)"
                                value={newTabLink}
                                onChange={(e) => setNewTabLink(e.target.value)}
                              />
                              {newTabFile && <p>Selected: {newTabFile.name}</p>}
                              <Button
                                onClick={handleAddTab}
                                disabled={
                                  !newTabName || (!newTabFile && !newTabLink)
                                }
                                className="w-full"
                              >
                                Add Tab
                              </Button>
                              {error && <p className="text-red-500">{error}</p>}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <ManageTabsDialog
                        tabs={tabs}
                        setTabs={setTabs}
                        isManageDialogOpen={isManageDialogOpen}
                        setIsManageDialogOpen={setIsManageDialogOpen}
                        setEditTabId={setEditTabId}
                        newTabName={newTabName}
                        setNewTabName={setNewTabName}
                        newTabFile={newTabFile}
                        setNewTabFile={setNewTabFile}
                        newTabLink={newTabLink}
                        setNewTabLink={setNewTabLink}
                        handleEditTab={handleEditTab}
                        handleDeleteTab={handleDeleteTab}
                        handleToggleVisibility={handleToggleVisibility}
                        handleMoveUp={handleMoveUp}
                        handleMoveDown={handleMoveDown}
                        isEditDialogOpen={isEditDialogOpen}
                        setIsEditDialogOpen={setIsEditDialogOpen}
                      />
                    </div>
                    <ToggleExpandButton
                      isExpanded={false}
                      onClick={() => setIsTabCardExpanded(true)}
                    />
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <div className="my-auto flex flex-col">{content}</div>
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="fixed inset-0 z-50 bg-black p-6 flex flex-col"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          >
            <div className="flex items-center justify-between mb-4">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <div className="flex gap-2">
                <div className="flex gap-2">
                  {session?.user.role !== "admin" && (
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="outline">Add</Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="p-6">
                        <DialogHeader>
                          <DialogTitle>Add New Tab</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Tab Name"
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            className="rounded-md"
                          />
                          <Button asChild>
                            <label className="flex items-center gap-2 cursor-pointer">
                              Upload File
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,video/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setNewTabFile(file);
                                }}
                              />
                            </label>
                          </Button>
                          <Input
                            type="url"
                            placeholder="Or provide a link (e.g., YouTube)"
                            value={newTabLink}
                            onChange={(e) => setNewTabLink(e.target.value)}
                          />
                          {newTabFile && <p>Selected: {newTabFile.name}</p>}
                          <Button
                            onClick={handleAddTab}
                            disabled={
                              !newTabName || (!newTabFile && !newTabLink)
                            }
                            className="w-full"
                          >
                            Add Tab
                          </Button>
                          {error && <p className="text-red-500">{error}</p>}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <ManageTabsDialog
                    tabs={tabs}
                    setTabs={setTabs}
                    isManageDialogOpen={isManageDialogOpen}
                    setIsManageDialogOpen={setIsManageDialogOpen}
                    setEditTabId={setEditTabId}
                    newTabName={newTabName}
                    setNewTabName={setNewTabName}
                    newTabFile={newTabFile}
                    setNewTabFile={setNewTabFile}
                    newTabLink={newTabLink}
                    setNewTabLink={setNewTabLink}
                    handleEditTab={handleEditTab}
                    handleDeleteTab={handleDeleteTab}
                    handleToggleVisibility={handleToggleVisibility}
                    handleMoveUp={handleMoveUp}
                    handleMoveDown={handleMoveDown}
                    isEditDialogOpen={isEditDialogOpen}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                  />
                </div>
                <ToggleExpandButton
                  isExpanded={true}
                  onClick={() => setIsTabCardExpanded(false)}
                />
              </div>
            </div>
            <AnimatePresence mode="wait">{content}</AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default TabManager;
