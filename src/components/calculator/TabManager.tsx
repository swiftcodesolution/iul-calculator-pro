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
import { TotalAdvantage, TabContent } from "@/lib/types";
import { ManageTabsDialog } from "@/components/calculator/ManageTabsDialog";

interface TabManagerProps {
  tabs: TabContent[];
  setTabs: (tabs: TabContent[]) => void;
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

export function TabManager({
  tabs,
  setTabs, // eslint-disable-line @typescript-eslint/no-unused-vars
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
          <Card className="h-full">
            <CardContent className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {tabs
                      .filter((tab) => tab.isVisible)
                      .map((tab) => (
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: tabs.indexOf(tab) * 0.1,
                          }}
                          whileHover={{
                            scale: 1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={
                              activeTab === tab.id ? "default" : "outline"
                            }
                            onClick={() => setActiveTab(tab.id)}
                            aria-selected={activeTab === tab.id}
                          >
                            {tab.name}
                          </Button>
                        </motion.div>
                      ))}
                  </div>
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTabCardExpanded(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
                <div className="flex gap-2 mb-4">
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
                    newTabName={newTabName} // Re-added
                    setNewTabName={setNewTabName}
                    newTabFile={newTabFile} // Re-added
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
                <AnimatePresence mode="wait">
                  {activeTab && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 min-h-[200px]"
                    >
                      {tabs.map(
                        (tab) =>
                          tab.id === activeTab && (
                            <div key={tab.id} className="space-y-4">
                              {tab.type === "totalAdvantage" && (
                                <div className="h-[400px] flex items-center justify-center gap-4 text-center">
                                  <div className="mt-[100px] border-2 border-black w-full h-[200px] flex items-center justify-center flex-col">
                                    <h2 className="text-4xl font-bold mb-5">
                                      Total Advantage
                                    </h2>
                                    <h2 className="text-4xl font-bold mb-5">
                                      ${totalAdvantage.total.toLocaleString()}
                                    </h2>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="lg"
                                        className="cursor-pointer"
                                      >
                                        Taxes $
                                        {totalAdvantage.taxes.toLocaleString()}
                                      </Button>
                                      <p>|</p>
                                      <Button
                                        variant="ghost"
                                        size="lg"
                                        className="cursor-pointer"
                                      >
                                        Fees $
                                        {totalAdvantage.fees.toLocaleString()}
                                      </Button>
                                      <p>|</p>
                                      <Button
                                        variant="ghost"
                                        size="lg"
                                        className="cursor-pointer"
                                      >
                                        Cumulative Income $
                                        {totalAdvantage.cumulativeIncome.toLocaleString()}
                                      </Button>
                                      <p>|</p>
                                      <Button
                                        variant="ghost"
                                        size="lg"
                                        className="cursor-pointer"
                                      >
                                        Death Benefit $
                                        {totalAdvantage.deathBenefits.toLocaleString()}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {tab.type === "calculator" && (
                                <div className="h-[400px] flex items-center justify-center gap-4 text-center">
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
                                    className="w-full h-auto max-h-64"
                                  />
                                </div>
                              )}
                              {tab.type === "pdf" && tab.src && (
                                <div>
                                  <embed
                                    src={tab.src}
                                    type="application/pdf"
                                    className="w-full h-64"
                                  />
                                </div>
                              )}
                              {tab.type === "other" && tab.src && (
                                <p>Unsupported file type: {tab.name}</p>
                              )}
                            </div>
                          )
                      )}
                    </motion.div>
                  )}
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
              <div className="flex gap-2 overflow-x-auto">
                {tabs
                  .filter((tab) => tab.isVisible)
                  .map((tab) => (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: tabs.indexOf(tab) * 0.1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={activeTab === tab.id ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.id)}
                        aria-selected={activeTab === tab.id}
                      >
                        {tab.name}
                      </Button>
                    </motion.div>
                  ))}
              </div>
              <motion.div
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTabCardExpanded(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <div className="flex gap-2 mb-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                newTabName={newTabName} // Re-added
                setNewTabName={setNewTabName}
                newTabFile={newTabFile} // Re-added
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
            <AnimatePresence mode="wait">
              {activeTab && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 flex-1 overflow-y-auto"
                >
                  {tabs.map(
                    (tab) =>
                      tab.id === activeTab && (
                        <div key={tab.id} className="space-y-4">
                          {tab.type === "totalAdvantage" && (
                            <div className="h-full flex items-center justify-center gap-4 text-center">
                              <div>
                                <h2 className="text-3xl font-bold">
                                  ${totalAdvantage.total.toLocaleString()}
                                </h2>
                                <p>
                                  Taxes ${totalAdvantage.taxes.toLocaleString()}
                                </p>
                                <p>
                                  Fees ${totalAdvantage.fees.toLocaleString()}
                                </p>
                                <p>
                                  Cumulative Income $
                                  {totalAdvantage.cumulativeIncome.toLocaleString()}
                                </p>
                                <p>
                                  Death Benefit $
                                  {totalAdvantage.deathBenefits.toLocaleString()}
                                </p>
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
                                className="object-contain w-full max-h-[80vh] mx-auto"
                              />
                            </div>
                          )}
                          {tab.type === "video" && tab.src && (
                            <div>
                              <video
                                src={tab.src}
                                controls
                                className="w-full h-auto max-h-[80vh] mx-auto"
                              />
                            </div>
                          )}
                          {tab.type === "pdf" && tab.src && (
                            <div>
                              <embed
                                src={tab.src}
                                type="application/pdf"
                                className="w-full h-[80vh] mx-auto"
                              />
                            </div>
                          )}
                          {tab.type === "other" && tab.src && (
                            <p>Unsupported file type: {tab.name}</p>
                          )}
                        </div>
                      )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
