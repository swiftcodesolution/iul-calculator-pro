"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import ClientFilesSection from "@/components/dashboard/ClientFilesSection";
import { motion } from "framer-motion";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { useClientFiles } from "@/hooks/useClientFiles";
import { useImageCrop } from "@/hooks/useImageCrop";
import CropDialog from "@/components/dashboard/CropDialog";

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
  const { companyInfo, updateCompanyInfo, isEditing, toggleEdit, save } =
    useCompanyInfo();
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
  const { isSidebarCollapsed, toggleSidebar } = useCompanyInfo();
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

  return (
    <div className="min-h-[95vh] flex gap-4">
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
          setSelectedFile={setSelectedFile}
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
