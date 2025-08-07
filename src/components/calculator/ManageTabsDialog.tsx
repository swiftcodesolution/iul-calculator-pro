/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { ChevronUp, ChevronDown, Pencil, Trash2, Upload } from "lucide-react";
import { TabContent } from "@/lib/types";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

interface ManageTabsDialogProps {
  tabs: TabContent[];
  setTabs: (tabs: TabContent[]) => void;
  isManageDialogOpen?: boolean;
  setIsManageDialogOpen?: (value: boolean) => void;
  setEditTabId: (id: string | null) => void;
  newTabName: string;
  setNewTabName: (name: string) => void;
  newTabFile: File | null;
  setNewTabFile: (file: File | null) => void;
  newTabLink: string;
  setNewTabLink: (link: string) => void;
  handleEditTab: () => void;
  handleDeleteTab: (id: string) => void;
  handleToggleVisibility: (id: string) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen?: (value: boolean) => void;
}

export function ManageTabsDialog({
  tabs,
  setTabs,
  isManageDialogOpen,
  setIsManageDialogOpen,
  setEditTabId,
  newTabName,
  setNewTabName,
  newTabFile,
  setNewTabFile,
  newTabLink,
  setNewTabLink,
  handleEditTab,
  handleDeleteTab,
  handleToggleVisibility,
  handleMoveUp,
  handleMoveDown,
  isEditDialogOpen,
  setIsEditDialogOpen,
}: ManageTabsDialogProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const {
    handleTabDragStart,
    handleTabDrop,
    handleTabDragOver,
    dialogOpen,
    setDialogOpen,
  } = useDragAndDrop(tabs, setTabs);

  const staticTabIds = [
    "total-advantage",
    "calculator",
    "inflationCalculator",
    "annualContributionCalculatorForIUL",
    "cagrChart",
  ];

  const adminTabs = tabs
    .filter(
      (tab) => tab.createdByRole === "admin" || staticTabIds.includes(tab.id)
    )
    .sort((a, b) => {
      const aIsStatic = staticTabIds.includes(a.id);
      const bIsStatic = staticTabIds.includes(b.id);
      if (aIsStatic && bIsStatic) {
        return staticTabIds.indexOf(a.id) - staticTabIds.indexOf(b.id); // Maintain static tab order
      }
      if (aIsStatic) return -1; // Static tabs come first
      if (bIsStatic) return 1;
      return (a.order ?? Infinity) - (b.order ?? Infinity); // Sort admin tabs by order
    });
  const userTabs = tabs
    .filter(
      (tab) => tab.createdByRole !== "admin" && tab.userId === session?.user?.id
    )
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

  const handleSave = async () => {
    // Sync current tab order to database
    if (session?.user?.id) {
      const userTabsToSync = tabs
        .filter(
          (t) =>
            t.userId === session.user.id &&
            t.createdByRole !== "admin" &&
            !staticTabIds.includes(t.id)
        )
        .map((t, index) => ({ id: t.id, order: index }));
      try {
        const response = await fetch("/api/tab-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tabs: userTabsToSync }),
        });
        if (!response.ok) throw new Error("Failed to save tab order");
      } catch (error) {
        console.error("Error saving tab order:", error);
      }
    }
    setIsManageDialogOpen!(false);
  };

  return (
    <>
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline">Manage</Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="p-6 min-w-1/2 flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Tabs</DialogTitle>
            <DialogDescription className="high-contrast:text-white">
              Reorder, enable/disable, edit, or delete tabs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex gap-4">
            {/* ADMIN TABS */}
            <div className="space-y-2 grow w-1/2">
              <h3 className="font-semibold">Content from Admin</h3>
              <div className="h-[400px] overflow-y-scroll space-y-2 px-2">
                {adminTabs.map((tab) => (
                  <motion.div
                    key={tab.id}
                    className={`flex items-center justify-between p-2 border rounded-md ${
                      (tab.createdByRole === "admin" ||
                        staticTabIds.includes(tab.id)) &&
                      !isAdmin
                        ? "cursor-default"
                        : "cursor-move"
                    }`}
                    draggable={
                      (tab.createdByRole !== "admin" || isAdmin) &&
                      !staticTabIds.includes(tab.id)
                    }
                    onDragStartCapture={(e) =>
                      (tab.createdByRole !== "admin" || isAdmin) &&
                      !staticTabIds.includes(tab.id) &&
                      handleTabDragStart(e, tab.id)
                    }
                    onDragOver={handleTabDragOver}
                    onDrop={(e) =>
                      (tab.createdByRole !== "admin" || isAdmin) &&
                      !staticTabIds.includes(tab.id) &&
                      handleTabDrop(e, tab.id)
                    }
                    whileDrag={{ scale: 1.05, opacity: 0.8 }}
                    aria-describedby={`drag-tab-${tab.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={
                          (tab.createdByRole === "admin" ||
                            staticTabIds.includes(tab.id)) &&
                          !isAdmin
                            ? "cursor-default"
                            : "cursor-grab"
                        }
                        aria-label={`Drag handle for ${tab.name}`}
                        id={`drag-tab-${tab.id}`}
                      >
                        <svg
                          className="h-4 w-4 text-gray-500 high-contrast:bg-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </motion.div>
                      <input
                        type="checkbox"
                        checked={tab.isVisible}
                        onChange={() => handleToggleVisibility(tab.id)}
                        className="h-4 w-4"
                        aria-label={`Toggle visibility for ${tab.name}`}
                      />
                      <span>{tab.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="high-contrast:bg-white"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(tabs.indexOf(tab))}
                        disabled={
                          tabs.indexOf(tab) === 0 ||
                          ((tab.createdByRole === "admin" ||
                            staticTabIds.includes(tab.id)) &&
                            !isAdmin) ||
                          staticTabIds.includes(tab.id)
                        }
                        aria-label={`Move ${tab.name} up`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        className="high-contrast:bg-white"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(tabs.indexOf(tab))}
                        disabled={
                          tabs.indexOf(tab) === adminTabs.length - 1 ||
                          ((tab.createdByRole === "admin" ||
                            staticTabIds.includes(tab.id)) &&
                            !isAdmin) ||
                          staticTabIds.includes(tab.id)
                        }
                        aria-label={`Move ${tab.name} down`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      {isAdmin && !staticTabIds.includes(tab.id) && (
                        <>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditTabId(tab.id);
                              setNewTabName(tab.name);
                              setNewTabFile(null);
                              setNewTabLink(tab.link || "");
                              setIsEditDialogOpen!(true);
                            }}
                            aria-label={`Edit ${tab.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTab(tab.id)}
                            aria-label={`Delete ${tab.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* USER TABS */}
            {!isAdmin && (
              <div className="space-y-2 grow w-1/2">
                <h3 className="font-semibold">Your Content</h3>
                <div className="h-[400px] overflow-y-scroll space-y-2 px-2">
                  {userTabs
                    .sort(
                      (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
                    )
                    .map((tab) => (
                      <motion.div
                        key={tab.id}
                        className="flex items-center justify-between p-2 border rounded-md cursor-move"
                        draggable="true"
                        onDragStartCapture={(e) =>
                          handleTabDragStart(e, tab.id)
                        }
                        onDragOver={handleTabDragOver}
                        onDrop={(e) => handleTabDrop(e, tab.id)}
                        whileDrag={{ scale: 1.05, opacity: 0.8 }}
                        aria-describedby={`drag-tab-${tab.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-grab"
                            aria-label={`Drag handle for ${tab.name}`}
                            id={`drag-tab-${tab.id}`}
                          >
                            <svg
                              className="h-4 w-4 text-gray-500 high-contrast:bg-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>
                          </motion.div>
                          <input
                            type="checkbox"
                            checked={tab.isVisible}
                            onChange={() => handleToggleVisibility(tab.id)}
                            className="h-4 w-4"
                            aria-label={`Toggle visibility for ${tab.name}`}
                          />
                          <span>{tab.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveUp(tabs.indexOf(tab))}
                            disabled={tabs.indexOf(tab) === adminTabs.length}
                            aria-label={`Move ${tab.name} up`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => handleMoveDown(tabs.indexOf(tab))}
                            disabled={tabs.indexOf(tab) === tabs.length - 1}
                            aria-label={`Move ${tab.name} down`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditTabId(tab.id);
                              setNewTabName(tab.name);
                              setNewTabFile(null);
                              setNewTabLink(tab.link || "");
                              setIsEditDialogOpen!(true);
                            }}
                            aria-label={`Edit ${tab.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            className="high-contrast:bg-white"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTab(tab.id)}
                            aria-label={`Delete ${tab.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            className="w-full high-contrast:border border-white"
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Tab</DialogTitle>
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
                Upload New File (Optional)
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
              placeholder="Update link (e.g., YouTube)"
              value={newTabLink}
              onChange={(e) => setNewTabLink(e.target.value)}
            />
            {newTabFile && <p>Selected: {newTabFile.name}</p>}
            <Button
              onClick={handleEditTab}
              disabled={!newTabName}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action Not Permitted</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Reordering of admin-uploaded content is restricted to administrators
            only. You may check or uncheck admin content to toggle its
            visibility.
          </p>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
