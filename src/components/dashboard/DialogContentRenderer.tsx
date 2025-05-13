"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientFile } from "@/lib/types";

interface DialogContentRendererProps {
  dialogAction: string | null;
  newClientName: string;
  setNewClientName: (name: string) => void;
  selectedFile: ClientFile | null;
  handleClientAction: (
    action: string,
    data?: { id?: string; name?: string }
  ) => void;
}

export default function DialogContentRenderer({
  dialogAction,
  newClientName,
  setNewClientName,
  selectedFile,
  handleClientAction,
}: DialogContentRendererProps) {
  if (!dialogAction) return null;

  const titles: { [key: string]: string } = {
    new: "Start New Client",
    open: "Open Client File",
    copy: "Copy Client File",
    rename: "Rename Client File",
    delete: "Delete Client File",
  };

  const placeholders: { [key: string]: string } = {
    new: "Client Name",
    rename: "New File Name",
    copy: "Copy File Name",
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
              disabled={dialogAction === "open"}
            />
          </motion.div>
        )}
        {dialogAction === "delete" && (
          <p>Are you sure you want to delete {selectedFile?.name}?</p>
        )}
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="w-min"
        >
          <Button
            size="sm"
            onClick={() =>
              handleClientAction(dialogAction, {
                id: selectedFile?.id,
                name: newClientName,
              })
            }
            disabled={
              (dialogAction === "new" ||
                dialogAction === "copy" ||
                dialogAction === "rename") &&
              !newClientName
            }
          >
            {dialogAction === "delete" ? "Confirm" : "Submit"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
