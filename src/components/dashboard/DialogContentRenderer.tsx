"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientFile } from "@/lib/types";
import { useFileContext } from "@/context/FileContext";

interface DialogContentRendererProps {
  dialogAction: string | null;
  newClientName: string;
  setNewClientName: (name: string) => void;
  selectedFile: ClientFile | null;
  handleClientAction: (
    action: string,
    data?: { id?: string; name?: string; category?: string }
  ) => Promise<{ fileId?: string } | void>;
}

export default function DialogContentRenderer({
  dialogAction,
  newClientName,
  setNewClientName,
  selectedFile,
  handleClientAction,
}: DialogContentRendererProps) {
  const { setSelectedFileId } = useFileContext();

  if (!dialogAction) return null;

  const titles: { [key: string]: string } = {
    new: "Create New Client File",
    copy: "Copy Client File",
    rename: "Rename Client File",
    delete: "Delete Client File",
  };

  const placeholders: { [key: string]: string } = {
    new: "Enter File Name",
    rename: "New File Name",
    copy: "Copy File Name",
  };

  const handleSubmit = async () => {
    if (dialogAction === "delete") {
      if (selectedFile) {
        await handleClientAction("delete", { id: selectedFile.id });
      }
    } else if (newClientName.trim()) {
      const data: { id?: string; name?: string; category?: string } = {
        name: newClientName,
      };
      if (dialogAction === "copy" || dialogAction === "rename") {
        data.id = selectedFile?.id;
      }
      if (dialogAction === "copy") {
        data.category = "Your Sample Files"; // Default category for copy
      }
      const result = await handleClientAction(dialogAction, data);
      if (
        (dialogAction === "new" || dialogAction === "copy") &&
        result?.fileId
      ) {
        setSelectedFileId(result.fileId);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
    >
      <DialogHeader>
        <DialogTitle className="mb-2">{titles[dialogAction]}</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        {dialogAction !== "delete" && (
          <motion.div
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
          >
            <Input
              placeholder={placeholders[dialogAction] || "Enter name"}
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="h-8"
            />
          </motion.div>
        )}
        {dialogAction === "delete" && (
          <p>Are you sure you want to delete {selectedFile?.fileName}?</p>
        )}
        <div className="flex gap-2 justify-end">
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewClientName("");
                handleClientAction("cancel", {});
              }}
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                (dialogAction === "new" ||
                  dialogAction === "copy" ||
                  dialogAction === "rename") &&
                !newClientName.trim()
              }
            >
              {dialogAction === "delete" ? "Confirm" : "Submit"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
