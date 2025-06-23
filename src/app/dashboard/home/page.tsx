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
import { ClientFile, CompanyInfo, companyInfoSchema } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

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
    deleteCompanyInfo,
    isEditing,
    toggleEdit,
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
    originalImages,
  } = useImageCrop();

  const form = useForm<CompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: companyInfo,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();

  useEffect(() => {
    clearSelectedFileId();
    setSelectedFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("CropDialog state:", { cropDialogOpen, imageToCrop, cropType });
  }, [cropDialogOpen, imageToCrop, cropType]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      containerRef.current &&
      !target.closest(".file-item") &&
      !target.closest("button") &&
      !target.closest(".dialog-content")
    ) {
      setSelectedFile(null);
      clearSelectedFileId();
      console.log(selectedFile);
    }
    console.log("click outside");
  };

  const handleFileSelection = (file: ClientFile) => {
    setSelectedFile(file);
    setSelectedFileId(file.id);
    console.log(file);
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
        deleteCompanyInfo={deleteCompanyInfo}
        isEditing={isEditing}
        toggleEdit={toggleEdit}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        handleFileUpload={handleFileUpload} // Pass useImageCrop functions
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
          userRole={session!.user.role}
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
        updateCompanyInfo={updateCompanyInfo}
        setValue={(field: string, value: File | string) =>
          form.setValue(field as keyof CompanyInfo, value)
        }
        originalImages={originalImages}
      />
    </div>
  );
}
