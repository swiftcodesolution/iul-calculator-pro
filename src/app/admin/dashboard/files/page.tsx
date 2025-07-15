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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Pro Sample Files",
    "Your Sample Files",
    "Your Prospect Files",
    "Your Closed Sales",
  ];

  useEffect(() => {
    async function fetchFiles() {
      if (status !== "authenticated" || !session?.user?.id) return;
      try {
        const response = await fetch("/api/files/all");
        if (response.ok) {
          const files: ClientFile[] = await response.json();
          setAdminFiles(
            files
              .filter((file) => file.userId === session.user.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // Sort by sortOrder
          );
          setUserFiles(files.filter((file) => file.userId !== session.user.id));
          setFilteredUserFiles(
            files.filter((file) => file.userId !== session.user.id)
          );
        } else {
          console.error("Failed to fetch files:", response.statusText);
          toast.error("Failed to fetch files");
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to fetch files");
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
        const matchesSearch =
          file.fileName.toLowerCase().includes(lowerQuery) ||
          fullName.includes(lowerQuery);
        const matchesCategory =
          selectedCategory === "All" || file.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    );
  }, [searchQuery, userFiles, selectedCategory]);

  const handleClientAction = async (
    action: string,
    data?: { id?: string; name?: string }
  ): Promise<{ fileId?: string } | void> => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.error("Unauthenticated user");
      toast.error("You must be logged in to perform this action");
      return;
    }

    try {
      if (action === "new" && data?.name) {
        const response = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: data.name,
            category: "Pro Sample Files",
          }),
        });
        if (response.ok) {
          const newFile = await response.json();
          setAdminFiles((prev) =>
            [...prev, newFile].sort(
              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
            )
          );
          setSelectedFile(newFile);
          setSelectedFileId(newFile.id);
          setNewClientName("");
          setDialogAction(null);
          router.push(`/admin/dashboard/files/calculator/${newFile.id}`);
          return { fileId: newFile.id };
        } else {
          throw new Error("Failed to create file");
        }
      } else if (action === "copy" && data?.id && data?.name) {
        const fileToCopy = adminFiles.find((file) => file.id === data.id);
        if (fileToCopy) {
          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: data.name,
              category: "Pro Sample Files",
            }),
          });
          if (response.ok) {
            const newFile = await response.json();
            setAdminFiles((prev) =>
              [...prev, newFile].sort(
                (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
              )
            );
            setSelectedFile(newFile);
            setSelectedFileId(newFile.id);
            setNewClientName("");
            setDialogAction(null);
            return { fileId: newFile.id };
          } else {
            throw new Error("Failed to copy file");
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
            prev
              .map((file) =>
                file.id === data.id ? { ...file, fileName: data.name! } : file
              )
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          );
          setSelectedFile(null);
          clearSelectedFileId();
          setNewClientName("");
          setDialogAction(null);
        } else {
          throw new Error("Failed to rename file");
        }
      } else if (action === "delete" && data?.id) {
        const response = await fetch(`/api/files/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setAdminFiles((prev) =>
            prev
              .filter((file) => file.id !== data.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          );
          setSelectedFile(null);
          clearSelectedFileId();
          setDialogAction(null);
        } else {
          throw new Error("Failed to delete file");
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} file:`, error);
      toast.error(`Failed to ${action} file`);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return; // Can't move up if already at the top
    const newAdminFiles = [...adminFiles];
    [newAdminFiles[index - 1], newAdminFiles[index]] = [
      newAdminFiles[index],
      newAdminFiles[index - 1],
    ];
    setAdminFiles(newAdminFiles);

    // Update the order on the server
    try {
      const response = await fetch("/api/files/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: newAdminFiles.map((file) => file.id),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to reorder files");
      }
    } catch (error) {
      console.error("Error updating file order:", error);
      toast.error("Failed to reorder files");
      // Optionally revert the state if the server update fails
      setAdminFiles(adminFiles);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === adminFiles.length - 1) return; // Can't move down if already at the bottom
    const newAdminFiles = [...adminFiles];
    [newAdminFiles[index], newAdminFiles[index + 1]] = [
      newAdminFiles[index + 1],
      newAdminFiles[index],
    ];
    setAdminFiles(newAdminFiles);

    // Update the order on the server
    try {
      const response = await fetch("/api/files/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: newAdminFiles.map((file) => file.id),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to reorder files");
      }
    } catch (error) {
      console.error("Error updating file order:", error);
      toast.error("Failed to reorder files");
      // Revert the state if the server update fails
      setAdminFiles(adminFiles);
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
            <CardTitle>Pro Sample Files</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1">
              {adminFiles.length > 0 ? (
                adminFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    variants={fileItemVariant}
                    initial="hidden"
                    animate="visible"
                    className={`flex items-center p-2 border rounded cursor-pointer text-sm transition-colors ${
                      selectedFile?.id === file.id
                        ? "bg-blue-100 dark:bg-gray-800 border-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedFile(file)}
                    aria-selected={selectedFile?.id === file.id}
                  >
                    <div className="flex gap-2 mr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label={`Move ${file.fileName} up`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === adminFiles.length - 1}
                        aria-label={`Move ${file.fileName} down`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="flex-1">{file.fileName}</span>
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
            <div className="flex gap-4">
              <Input
                placeholder="Search by file name or created by"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Category: {selectedCategory}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onSelect={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Category</TableHead>
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
                      <TableCell>{file.category || "Uncategorized"}</TableCell>
                      <TableCell>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {searchQuery || selectedCategory !== "All"
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
