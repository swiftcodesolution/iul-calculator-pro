"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ClientFile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";
import { useTableStore } from "@/lib/store";

export function useClientFiles(initialFiles: ClientFile[] = []) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedFileId, setSelectedFileId, clearSelectedFileId } =
    useFileContext();
  const { clearEverythingForFreshFile } = useTableStore();
  const [clientFiles, setClientFiles] = useState<ClientFile[]>(initialFiles);
  const [newClientName, setNewClientName] = useState("");
  const [selectedFile, setSelectedFile] = useState<ClientFile | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    if (selectedFileId && !selectedFile) {
      const file = clientFiles.find((f) => f.id === selectedFileId);
      if (file) setSelectedFile(file);
    }
  }, [selectedFileId, selectedFile, clientFiles]);

  const handleClientAction = async (
    action: string,
    data?: { id?: string; name?: string; category?: string }
  ): Promise<{ fileId?: string } | void> => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.error("Unauthenticated user");
      return;
    }

    const targetFileId = data?.id;
    // let newFile: ClientFile | undefined;

    try {
      if (action === "new" && data?.name) {
        clearEverythingForFreshFile();
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
          router.push(`/dashboard/calculator/${newFile.id}`);
          return { fileId: newFile.id };
        }
      } else if (action === "open" && targetFileId) {
        setSelectedFileId(targetFileId);
        router.push(`/dashboard/calculator/${targetFileId}`);
      } else if (
        action === "copy" &&
        targetFileId &&
        data?.name &&
        data?.category
      ) {
        const fileToCopy = clientFiles.find((file) => file.id === targetFileId);
        if (fileToCopy) {
          const fileResponse = await fetch(`/api/files/${targetFileId}`);
          if (!fileResponse.ok) {
            console.error("Failed to fetch file data");
            return;
          }
          const originalFile = await fileResponse.json();

          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: data.name }), // Use user-entered name
          });
          if (response.ok) {
            const newFile = await response.json();
            const updateResponse = await fetch(`/api/files/${newFile.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                boxesData: originalFile.boxesData,
                tablesData: originalFile.tablesData,
                combinedResults: originalFile.combinedResults,
                fields: originalFile.fields,
                category: data.category,
              }),
            });
            if (updateResponse.ok) {
              const updatedFile = await updateResponse.json();
              setClientFiles((prev) => [...prev, updatedFile]);
              setSelectedFile(updatedFile);
              setSelectedFileId(updatedFile.id);
              setNewClientName("");
              setDialogAction(null); // Close dialog
              return { fileId: updatedFile.id };
            }
          }
        }
      } else if (action === "rename" && targetFileId && data?.name) {
        const response = await fetch(`/api/files/${targetFileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: data.name }),
        });
        if (response.ok) {
          setClientFiles((prev) =>
            prev.map((file) =>
              file.id === targetFileId
                ? { ...file, fileName: data.name! }
                : file
            )
          );
          if (selectedFile?.id === targetFileId) {
            setSelectedFile({
              ...selectedFile,
              fileName: data.name!,
            });
          }
          setNewClientName("");
          setDialogAction(null);
        }
      } else if (action === "delete" && data?.id) {
        const file = clientFiles.find((file) => file.id === data.id);
        if (
          file?.category === "Pro Sample Files" &&
          session.user.role !== "admin"
        ) {
          console.error("Cannot delete Pro Sample Files");
          return;
        }
        const response = await fetch(`/api/files/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setClientFiles((prev) => prev.filter((file) => file.id !== data.id));
          if (selectedFile?.id === data.id) {
            setSelectedFile(null);
            clearSelectedFileId();
          }
          setDialogAction(null);
        }
      } else if (action === "latest") {
        setIsRefreshing(true);
        try {
          const response = await fetch("/api/files");
          if (response.ok) {
            const files = await response.json();
            setClientFiles(files);
          } else {
            console.error("Failed to refresh files:", response.statusText);
          }
        } catch (error) {
          console.error("Error refreshing files:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} file:`, error);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("fileId", id);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetCategory: ClientFile["category"]
  ) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    const file = clientFiles.find((f) => f.id === fileId);

    if (!file || file.category === targetCategory) return;

    if (
      session?.user?.role === "agent" &&
      file.category === "Pro Sample Files"
    ) {
      const newFileName = `${file.fileName} (Copy)`; // Append (Copy) for drag-and-drop
      await handleClientAction("copy", {
        id: file.id,
        name: newFileName,
        category: targetCategory,
      });
    } else {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: targetCategory }),
        });
        if (response.ok) {
          setClientFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, category: targetCategory } : f
            )
          );
        }
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    }
  };

  return {
    clientFiles,
    newClientName,
    setNewClientName,
    selectedFile,
    setSelectedFile,
    dialogAction,
    setDialogAction,
    handleClientAction,
    handleDragStart,
    handleDrop,
    isRefreshing,
  };
}
