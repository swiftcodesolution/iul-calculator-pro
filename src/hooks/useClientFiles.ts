// src/app/hooks/useClientFiles.ts
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ClientFile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";

export function useClientFiles(initialFiles: ClientFile[] = []) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setSelectedFileId, clearSelectedFileId } = useFileContext();
  const [clientFiles, setClientFiles] = useState<ClientFile[]>(initialFiles);
  const [newClientName, setNewClientName] = useState("");
  const [selectedFile, setSelectedFile] = useState<ClientFile | null>(null);
  const [dialogAction, setDialogAction] = useState<string | null>(null);

  // Fetch files when session is authenticated
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

  // Create, open, copy, rename, or delete file
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
          return { fileId: newFile.id };
        }
      } else if (action === "open" && data?.id) {
        router.push(`/dashboard/calculator?fileId=${data.id}`);
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
        const response = await fetch(`/api/${data.id}`, {
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
        const response = await fetch(`/api/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setClientFiles((prev) => prev.filter((file) => file.id !== data.id));
          setSelectedFile(null);
          clearSelectedFileId();
          setDialogAction(null);
        }
      } else if (action === "latest") {
        const latestFile = clientFiles.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        if (latestFile) {
          setSelectedFile(latestFile);
          setSelectedFileId(latestFile.id);
          router.push(`/dashboard/calculator?fileId=${latestFile.id}`);
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
    if (file && file.category !== targetCategory) {
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
  };
}
