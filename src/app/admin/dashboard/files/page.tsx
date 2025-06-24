"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ClientFile } from "@/lib/types";
import DialogContentRenderer from "@/components/dashboard/DialogContentRenderer";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Variants } from "framer-motion";

const fileItemVariant: Variants = {
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
  const [adminFiles, setAdminFiles] = useState<ClientFile[]>([]);
  const [userFiles, setUserFiles] = useState<ClientFile[]>([]);
  const [filteredUserFiles, setFilteredUserFiles] = useState<ClientFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [selectedFile, setSelectedFile] = useState<ClientFile | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      if (status !== "authenticated" || !session?.user?.id) return;
      try {
        const response = await fetch("/api/files/all");
        if (response.ok) {
          const files: ClientFile[] = await response.json();
          setAdminFiles(
            files.filter((file) => file.userId === session.user.id)
          );
          setUserFiles(files.filter((file) => file.userId !== session.user.id));
          setFilteredUserFiles(
            files.filter((file) => file.userId !== session.user.id)
          );
        } else {
          console.error("Failed to fetch files:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    }
    fetchFiles();
  }, [session, status]);

  // Handle search filtering
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredUserFiles(
      userFiles.filter((file) => {
        const fullName =
          file.user?.firstName && file.user?.lastName
            ? `${file.user.firstName} ${file.user.lastName}`.toLowerCase()
            : "";
        return (
          file.fileName.toLowerCase().includes(lowerQuery) ||
          fullName.includes(lowerQuery)
        );
      })
    );
  }, [searchQuery, userFiles]);

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
          body: JSON.stringify({
            fileName: data.name,
            category: "Pro Sample Files", // Set category for admin-created files
          }),
        });
        if (response.ok) {
          const newFile = await response.json();
          setAdminFiles((prev) => [...prev, newFile]);
          setSelectedFile(newFile);
          setSelectedFileId(newFile.id);
          setNewClientName("");
          setDialogAction(null);
          router.push(`/admin/dashboard/files/calculator/${newFile.id}`);
          return { fileId: newFile.id };
        }
      } else if (action === "copy" && data?.id && data?.name) {
        const fileToCopy = adminFiles.find((file) => file.id === data.id);
        if (fileToCopy) {
          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: data.name,
              category: "Pro Sample Files", // Ensure copy is also Pro Sample Files
            }),
          });
          if (response.ok) {
            const newFile = await response.json();
            setAdminFiles((prev) => [...prev, newFile]);
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
          setAdminFiles((prev) =>
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
          setAdminFiles((prev) => prev.filter((file) => file.id !== data.id));
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
    <div className="h-[90vh] overflow-y-scroll">
      <div className="space-y-6">
        {/* Section 1: Your Sample Files */}
        <Card>
          <CardHeader>
            <CardTitle>Your Sample Files</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1">
              {adminFiles.length > 0 ? (
                adminFiles.map((file) => (
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
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No sample files available
                </div>
              )}
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
                aria-label="Create new sample file"
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
                  aria-label="Open sample file"
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
                    aria-label={`${action} sample file`}
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

        {/* Section 2: User's Files */}
        <Card>
          <CardHeader>
            <CardTitle>User Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by file name or created by"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserFiles.length > 0 ? (
                  filteredUserFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.fileName}</TableCell>
                      <TableCell>
                        {file.user?.firstName && file.user?.lastName
                          ? `${file.user.firstName} ${file.user.lastName}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      {searchQuery
                        ? "No matching user files found"
                        : "No user files available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
