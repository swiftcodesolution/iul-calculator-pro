// src/components/dashboard/AdminFilesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ClientFile } from "@/lib/types";
import DialogContentRenderer from "@/components/dashboard/DialogContentRenderer";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const fileItemVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, type: "spring", stiffness: 120 },
  },
};

export default function AdminFilesSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setSelectedFileId, clearSelectedFileId } = useFileContext();
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [newClientName, setNewClientName] = useState("");
  const [selectedFile, setSelectedFile] = useState<ClientFile | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      if (status !== "authenticated" || !session?.user?.id) return;
      try {
        const response = await fetch("/api/files");
        if (response.ok) {
          const files = await response.json();
          setClientFiles(files);
        } else {
          console.error("Failed to fetch files:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    }
    fetchFiles();
  }, [session, status]);

  const handleClientAction = async (
    action: string,
    data?: { id?: string; name?: string }
  ): Promise<{ fileId?: string } | void> => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.error("Unauthenticated user");
      return;
    }

    try {
      if (action === "new" && data?.name) {
        const response = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: data.name }),
        });
        if (response.ok) {
          const newFile = await response.json();
          setClientFiles((prev) => [...prev, newFile]);
          setSelectedFile(newFile);
          setSelectedFileId(newFile.id);
          setNewClientName("");
          setDialogAction(null);
          router.push(`/admin/dashboard/files/calculator/${newFile.id}`);
          return { fileId: newFile.id };
        }
      } else if (action === "copy" && data?.id && data?.name) {
        const fileToCopy = clientFiles.find((file) => file.id === data.id);
        if (fileToCopy) {
          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: data.name }),
          });
          if (response.ok) {
            const newFile = await response.json();
            setClientFiles((prev) => [...prev, newFile]);
            setSelectedFile(newFile);
            setSelectedFileId(newFile.id);
            setNewClientName("");
            setDialogAction(null);
            return { fileId: newFile.id };
          }
        }
      } else if (action === "rename" && data?.id && data?.name) {
        const response = await fetch(`/api/files/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: data.name }),
        });
        if (response.ok) {
          setClientFiles((prev) =>
            prev.map((file) =>
              file.id === data.id ? { ...file, fileName: data.name! } : file
            )
          );
          setSelectedFile(null);
          clearSelectedFileId();
          setNewClientName("");
          setDialogAction(null);
        }
      } else if (action === "delete" && data?.id) {
        const response = await fetch(`/api/files/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setClientFiles((prev) => prev.filter((file) => file.id !== data.id));
          setSelectedFile(null);
          clearSelectedFileId();
          setDialogAction(null);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} file:`, error);
    }
  };

  const handleOpen = () => {
    if (selectedFile?.id) {
      setSelectedFileId(selectedFile.id);
      router.push(`/admin/dashboard/files/calculator/${selectedFile.id}`);
    }
  };

  const handleDialogClose = () => {
    setDialogAction(null);
    setNewClientName("");
  };

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col h-full space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="text-xl font-bold"
        >
          Admin: Manage Sample Files
        </motion.h2>

        <div className="flex-1 overflow-y-auto border rounded-md p-2 bg-gray-100 space-y-1">
          {clientFiles?.map((file) => (
            <motion.div
              key={file.id}
              variants={fileItemVariant}
              initial="hidden"
              animate="visible"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                selectedFile?.id === file.id
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white"
              }`}
              onClick={() => setSelectedFile(file)}
            >
              {file.fileName}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex flex-wrap gap-2 justify-end"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          <Button
            size="sm"
            onClick={() => setDialogAction("new")}
            aria-label="Create new file"
          >
            Create New
          </Button>

          <motion.div
            variants={fileItemVariant}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={handleOpen}
              disabled={!selectedFile?.id}
              aria-label="Open file"
            >
              Open
            </Button>
          </motion.div>

          {["copy", "rename", "delete"].map((action) => (
            <motion.div
              key={action}
              variants={fileItemVariant}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                onClick={() => setDialogAction(action)}
                disabled={!selectedFile?.id}
                aria-label={`${action} file`}
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <Dialog
          open={!!dialogAction}
          onOpenChange={(open) => !open && handleDialogClose()}
        >
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
      </CardContent>
    </Card>
  );
}
