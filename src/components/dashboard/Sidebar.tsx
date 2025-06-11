"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CompanyInfoSection from "./CompanyInfoSection";
import InsuranceCompaniesSection from "./InsuranceCompaniesSection";
import TrainingResourcesSection from "./TrainingResourcesSection";
import { CompanyInfo } from "@/lib/types";

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 15 },
  },
  collapsed: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 15 },
  },
};

const contentVisibility = {
  open: {
    opacity: 1,
    display: "block",
    transition: { delay: 0.1, duration: 0.3, ease: "easeInOut" },
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
    transitionEnd: { display: "none" },
  },
};

interface SidebarProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (
    info: Partial<CompanyInfo>,
    logoFile?: File | null,
    profilePicFile?: File | null
  ) => Promise<void>;
  deleteCompanyInfo: () => Promise<void>;
  isEditing: boolean;
  toggleEdit: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  handleFileUpload: (
    file: File | null,
    type: "logo" | "profilePic",
    setValue: (field: string, value: File | string) => void
  ) => void;
  handleCropExistingImage: (
    type: "logo" | "profilePic",
    imageSrc: string
  ) => void;
}

export default function Sidebar({
  companyInfo,
  updateCompanyInfo,
  deleteCompanyInfo,
  isEditing,
  toggleEdit,
  isSidebarCollapsed,
  toggleSidebar,
  handleFileUpload,
  handleCropExistingImage,
}: SidebarProps) {
  return (
    <div
      className={`relative ${
        !isSidebarCollapsed ? "w-[500px] h-full" : "w-[0px]"
      }`}
    >
      <motion.div
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? <ArrowRight /> : <ArrowLeft />}
        </Button>
      </motion.div>
      <AnimatePresence>
        <motion.aside
          className={`h-full flex flex-col gap-4 ${
            isSidebarCollapsed ? "w-[50px]" : "w-[500px]"
          }`}
          variants={sidebarVariants}
          initial="open"
          animate={isSidebarCollapsed ? "collapsed" : "open"}
          exit="collapsed"
        >
          <motion.div
            variants={contentVisibility}
            className="flex flex-col gap-4"
          >
            <CompanyInfoSection
              companyInfo={companyInfo}
              updateCompanyInfo={updateCompanyInfo}
              deleteCompanyInfo={deleteCompanyInfo}
              isEditing={isEditing}
              toggleEdit={toggleEdit}
              isLoading={false}
              error={null}
              handleFileUpload={handleFileUpload} // Pass useImageCrop functions
              handleCropExistingImage={handleCropExistingImage}
            />
            <InsuranceCompaniesSection />
            <TrainingResourcesSection />
          </motion.div>
        </motion.aside>
      </AnimatePresence>
    </div>
  );
}
