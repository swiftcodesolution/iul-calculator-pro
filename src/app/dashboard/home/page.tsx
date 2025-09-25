"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ClientFilesSection from "@/components/dashboard/ClientFilesSection";
import { motion, Variants } from "framer-motion";
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

const contentVariants: Variants = {
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
    isLoading,
    error,
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
    isRefreshing,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const form = useForm<CompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      ...companyInfo,
      email: companyInfo.email || session?.user?.email || "", // Initialize with session email
    },
  });

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.email &&
      !companyInfo.email &&
      !form.getValues("email")
    ) {
      form.setValue("email", session.user.email);
    }
    form.reset({
      ...companyInfo,
      email:
        form.getValues("email") ||
        companyInfo.email ||
        session?.user?.email ||
        "",
    });
  }, [companyInfo, session, status, form]);

  useEffect(() => {
    console.log("CropDialog state:", { cropDialogOpen, imageToCrop, cropType });
  }, [cropDialogOpen, imageToCrop, cropType]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    console.log(
      "Click outside triggered, target:",
      target.className,
      target.tagName
    );
    if (
      containerRef.current &&
      !target.closest(".file-item") &&
      !target.closest("button") &&
      !target.closest(".dialog-content")
    ) {
      console.log("Clearing selection due to click outside");
      setSelectedFile(null);
      clearSelectedFileId();
    }
  };

  const handleFileSelection = (file: ClientFile) => {
    console.log("handleFileSelection called:", file);
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
        deleteCompanyInfo={deleteCompanyInfo}
        isEditing={isEditing}
        toggleEdit={toggleEdit}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isLoading={isLoading}
        error={error}
        handleFileUpload={handleFileUpload}
        handleCropExistingImage={handleCropExistingImage}
        form={form}
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
          isRefreshing={isRefreshing}
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
