// src/app/admin/dashboard/page.tsx
"use client";

import ClientFilesSection from "@/components/dashboard/ClientFilesSection";
import { motion } from "framer-motion";
import { useClientFiles } from "@/hooks/useClientFiles";

import { useFileContext } from "@/context/FileContext";
import { useEffect, useRef } from "react";
import { ClientFile } from "@/lib/types";

// Animation variants
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AdminFilesPage() {
  const { setSelectedFileId, clearSelectedFileId } = useFileContext();
  const {
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
  } = useClientFiles();

  const containerRef = useRef<HTMLDivElement>(null);

  // Clear selection on page mount
  useEffect(() => {
    clearSelectedFileId();
    setSelectedFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle click outside file items to deselect
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (containerRef.current && !target.closest(".file-item")) {
      setSelectedFile(null);
      clearSelectedFileId();
    }
  };

  // Handle file selection
  const handleFileSelection = (file: ClientFile) => {
    setSelectedFile(file);
    setSelectedFileId(file.id);
  };

  return (
    <div
      className="min-h-screen flex flex-col gap-4 p-4"
      ref={containerRef}
      onClick={handleClickOutside}
    >
      <h1 className="text-2xl font-bold">Pro Sample Files</h1>
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        className="flex-1"
      >
        <ClientFilesSection
          clientFiles={clientFiles}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          selectedFile={selectedFile}
          selectedFileId={selectedFile?.id || null}
          setSelectedFile={handleFileSelection}
          dialogAction={dialogAction}
          setDialogAction={setDialogAction}
          handleClientAction={handleClientAction}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
        />
      </motion.div>
    </div>
  );
}
