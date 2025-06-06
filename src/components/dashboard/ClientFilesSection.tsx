// src/components/dashboard/ClientFilesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ClientFile } from "@/lib/types";
import DialogContentRenderer from "./DialogContentRenderer";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";

const newClientVariant = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, type: "spring", stiffness: 120 },
  },
};

interface ClientFilesSectionProps {
  clientFiles: ClientFile[];
  newClientName: string;
  setNewClientName: (name: string) => void;
  selectedFile: ClientFile | null;
  selectedFileId: string | null;
  setSelectedFile: (file: ClientFile) => void;
  dialogAction: string | null;
  setDialogAction: (action: string | null) => void;
  handleClientAction: (
    action: string,
    data?: { id?: string; name?: string }
  ) => Promise<{ fileId?: string } | void>;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  handleDrop: (
    e: React.DragEvent<HTMLDivElement>,
    category: ClientFile["category"]
  ) => void;
}

export default function ClientFilesSection({
  clientFiles,
  newClientName,
  setNewClientName,
  selectedFile,
  selectedFileId,
  setSelectedFile,
  dialogAction,
  setDialogAction,
  handleClientAction,
  handleDragStart,
  handleDrop,
}: ClientFilesSectionProps) {
  const router = useRouter();

  const { selectedFileId: contextFileId, setSelectedFileId } = useFileContext();

  const handleOpen = () => {
    if (selectedFileId) {
      setSelectedFileId(selectedFileId);
      router.push(`/dashboard/calculator/${selectedFileId}`);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="space-y-4 flex flex-col h-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="text-xl font-bold"
        >
          IUL Client Files
        </motion.h2>
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="w-min"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClientAction("latest")}
          >
            Get Latest
          </Button>
        </motion.div>
        <div className="grid grid-cols-4 gap-2 flex-1">
          {[
            "Pro Sample Files",
            "Your Sample Files",
            "Your Prospect Files",
            "Your Closed Sales",
          ].map((category) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1, backgroundColor: "#f5f5f5" }}
              className="border p-1 bg-gray-100 overflow-hidden"
              onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                e.preventDefault()
              }
              onDrop={(e: React.DragEvent<HTMLDivElement>) =>
                handleDrop(e, category as ClientFile["category"])
              }
              style={{ maxHeight: "100%" }}
            >
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="font-semibold text-sm"
              >
                {category}
              </motion.h3>
              <div
                className="overflow-y-auto scrollbar-none"
                style={{ maxHeight: "max-content" }}
              >
                {clientFiles
                  .filter((file) => file.category === category)
                  .map((file) => (
                    <motion.div
                      key={file.id}
                      variants={newClientVariant}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ backgroundColor: "#e5e7eb" }}
                      whileDrag={{ scale: 1.1, opacity: 0.8 }}
                      className={`file-item p-1 border-b cursor-pointer text-sm rounded-md transition-colors ${
                        selectedFile?.id === file.id
                          ? "bg-blue-100 border-blue-500 border"
                          : "bg-transparent"
                      }`}
                      draggable
                      onClick={() => setSelectedFile(file)}
                      onDragStartCapture={(
                        e: React.DragEvent<HTMLDivElement>
                      ) => handleDragStart(e, file.id)}
                      aria-selected={selectedFile?.id === file.id}
                    >
                      {file.fileName}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex gap-2 justify-end"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <Dialog
            open={!!dialogAction}
            onOpenChange={(open) => {
              if (!open) {
                setDialogAction(null);
                setNewClientName("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => setDialogAction("new")}
                aria-label="Create new client file"
              >
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogContentRenderer
                dialogAction={dialogAction}
                newClientName={newClientName}
                setNewClientName={setNewClientName}
                selectedFile={selectedFile}
                handleClientAction={handleClientAction}
              />
            </DialogContent>
          </Dialog>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 120 },
              },
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={handleOpen}
              disabled={!contextFileId}
              aria-label="Open client file"
            >
              Open
            </Button>
          </motion.div>
          {["copy", "rename", "delete"].map((action) => (
            <motion.div
              key={action}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 120 },
                },
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                onClick={() => setDialogAction(action)}
                disabled={!selectedFileId}
                aria-label={`${
                  action.charAt(0).toUpperCase() + action.slice(1)
                } client file`}
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
