import { AnimatePresence, motion } from "framer-motion";
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
import { TotalAdvantage } from "@/lib/types";
import { ManageTabsDialog } from "@/components/calculator/ManageTabsDialog";
import { useTableStore } from "@/lib/store";
import React from "react";

interface TabManagerProps {
  activeTab: string | null;
  setActiveTab: (id: string) => void;
  isTabCardExpanded: boolean;
  setIsTabCardExpanded: (value: boolean) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (value: boolean) => void;
  isManageDialogOpen: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (value: boolean) => void;
  setEditTabId: (id: string | null) => void;
  newTabName: string;
  setNewTabName: (name: string) => void;
  newTabFile: File | null;
  setNewTabFile: (file: File | null) => void;
  handleAddTab: () => void;
  handleEditTab: () => void;
  handleDeleteTab: (id: string) => void;
  handleToggleVisibility: (id: string) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  totalAdvantage: TotalAdvantage;
}

// Reusable Tab Navigation Component
const TabNavigation = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: {
    id: string;
    name: string;
    type: string;
    isVisible: boolean;
    src?: string;
  }[];
  activeTab: string | null;
  setActiveTab: (id: string) => void;
}) => (
  <div className="flex gap-2 overflow-x-auto">
    {tabs
      .filter((tab) => tab.isVisible)
      .slice(0, 10)
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
          <Button
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            className="cursor-pointer"
          >
            {index + 1}
          </Button>
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
    <Button variant="outline" size="sm" onClick={onClick}>
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
}: {
  tab: { id: string; name: string; type: string; src?: string };
  totalAdvantage: TotalAdvantage;
}) => {
  return (
    <div className="h-full space-y-4">
      {tab.type === "totalAdvantage" && (
        <div className="w-full">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-5">Total Advantage</h2>
            <h2 className="text-4xl font-bold mb-5">
              ${totalAdvantage.total.toLocaleString()}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="cursor-pointer">
                Taxes: ${totalAdvantage.taxes.toLocaleString()}
              </Button>

              <Button variant="outline" size="lg" className="cursor-pointer">
                Fees: ${totalAdvantage.fees.toLocaleString()}
              </Button>

              <Button variant="outline" size="lg" className="cursor-pointer">
                Cumulative Income: $
                {totalAdvantage.cumulativeIncome.toLocaleString()}
              </Button>

              <Button variant="outline" size="lg" className="cursor-pointer">
                Death Benefit: ${totalAdvantage.deathBenefits.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      )}
      {tab.type === "calculator" && (
        <div className="h-full flex items-center justify-center gap-4 text-center">
          <TabCalculator />
        </div>
      )}
      {tab.type === "image" && tab.src && (
        <div>
          <Image
            src={tab.src}
            alt={tab.name}
            width={300}
            height={200}
            className="object-contain w-full h-[400px]"
          />
        </div>
      )}
      {tab.type === "video" && tab.src && (
        <div>
          <video
            src={tab.src}
            controls
            className="w-full h-auto max-h-[400px]"
          />
        </div>
      )}
      {tab.type === "pdf" && tab.src && (
        <div>
          <embed
            src={tab.src}
            type="application/pdf"
            className="w-full h-[400px]"
          />
        </div>
      )}
      {tab.type === "other" && tab.src && (
        <p>Unsupported file type: {tab.name}</p>
      )}
    </div>
  );
};

const TabManager = React.memo(function TabManager({
  activeTab,
  setActiveTab,
  isTabCardExpanded,
  setIsTabCardExpanded,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isManageDialogOpen,
  setIsManageDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
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
  totalAdvantage,
}: TabManagerProps) {
  const { tabs } = useTableStore();

  // Single content render for active tab
  const content = activeTab && tabs.find((tab) => tab.id === activeTab) && (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-center p-4 w-full min-h-[600px] ${
        isTabCardExpanded ? "" : ""
      }`}
    >
      <TabContentRenderer
        tab={tabs.find((tab) => tab.id === activeTab)!}
        totalAdvantage={totalAdvantage}
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
          <Card className="h-full p-2">
            <CardContent className="p-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                  <div className="flex gap-2">
                    <div className="flex gap-2">
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
                        <DialogContent className="bg-gray-50 p-6">
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
                            {newTabFile && <p>Selected: {newTabFile.name}</p>}
                            <Button
                              onClick={handleAddTab}
                              disabled={!newTabName || !newTabFile}
                              className="w-full"
                            >
                              Add Tab
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <ManageTabsDialog
                        tabs={tabs}
                        isManageDialogOpen={isManageDialogOpen}
                        setIsManageDialogOpen={setIsManageDialogOpen}
                        setEditTabId={setEditTabId}
                        newTabName={newTabName}
                        setNewTabName={setNewTabName}
                        newTabFile={newTabFile}
                        setNewTabFile={setNewTabFile}
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
                  <div className="flex flex-col">{content}</div>
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
          className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
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
                    <DialogContent className="bg-gray-50 p-6">
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
                        {newTabFile && <p>Selected: {newTabFile.name}</p>}
                        <Button
                          onClick={handleAddTab}
                          disabled={!newTabName || !newTabFile}
                          className="w-full"
                        >
                          Add Tab
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <ManageTabsDialog
                    tabs={tabs}
                    isManageDialogOpen={isManageDialogOpen}
                    setIsManageDialogOpen={setIsManageDialogOpen}
                    setEditTabId={setEditTabId}
                    newTabName={newTabName}
                    setNewTabName={setNewTabName}
                    newTabFile={newTabFile}
                    setNewTabFile={setNewTabFile}
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
