// src/app/dashboard/home/page.tsx
"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ClientFilesSection from "@/components/dashboard/ClientFilesSection";
import { motion } from "framer-motion";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { useClientFiles } from "@/hooks/useClientFiles";
import { useImageCrop } from "@/hooks/useImageCrop";
import CropDialog from "@/components/dashboard/CropDialog";
import { useFileContext } from "@/context/FileContext";
import { useEffect, useRef } from "react";
import { ClientFile } from "@/lib/types";

// Animation variants
const contentVariants = {
  open: {
    marginLeft: "0px",
    transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 15 },
  },
  collapsed: {
    marginLeft: "50px",
    transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function DashboardPage() {
  const { setSelectedFileId, clearSelectedFileId } = useFileContext();
  const {
    companyInfo,
    updateCompanyInfo,
    isEditing,
    toggleEdit,
    save,
    isSidebarCollapsed,
    toggleSidebar,
  } = useCompanyInfo();
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
  const {
    cropDialogOpen,
    imageToCrop,
    cropType,
    cropState,
    setCropDialogOpen,
    setImageToCrop,
    setCropType,
    setCropState,
    handleFileUpload,
    handleCropImage,
    handleCropExistingImage,
  } = useImageCrop(companyInfo, updateCompanyInfo);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear selection when page mounts
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
      className="min-h-[95vh] flex gap-2"
      ref={containerRef}
      onClick={handleClickOutside}
    >
      <Sidebar
        companyInfo={companyInfo}
        updateCompanyInfo={updateCompanyInfo}
        isEditing={isEditing}
        toggleEdit={toggleEdit}
        save={save}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        handleFileUpload={handleFileUpload}
        handleCropExistingImage={handleCropExistingImage}
      />
      <motion.div
        variants={contentVariants}
        initial="open"
        animate={isSidebarCollapsed ? "collapsed" : "open"}
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
      <CropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageToCrop={imageToCrop}
        cropType={cropType}
        cropState={cropState}
        setCropState={setCropState}
        handleCropImage={handleCropImage}
        setImageToCrop={setImageToCrop}
        setCropType={setCropType}
      />
    </div>
  );
}
