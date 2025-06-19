"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CompanyInfoSection from "./CompanyInfoSection";
import InsuranceCompaniesSection from "./InsuranceCompaniesSection";
import TrainingResourcesSection from "./TrainingResourcesSection";
import { CompanyInfo } from "@/lib/types";
import { useState } from "react";
import Image from "next/image";

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
  const [isCoverCollapsed, setIsCoverCollapsed] = useState(true);

  return (
    <div
      className={`relative ${
        !isSidebarCollapsed ? "w-[500px] h-[95vh]" : "w-[0px]"
      }`}
    >
      {/* Added cover div on top of sidebar with separate toggle button */}
      <div
        className={`p-6 flex items-center content-center absolute top-0 left-0 h-[95vh] inset-0 bg-gray-800 bg-opacity-75 z-30 ${
          isCoverCollapsed ? "hidden" : "block"
        }`}
        onClick={() => setIsCoverCollapsed(true)}
      >
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4"
          onClick={() => setIsCoverCollapsed(!isCoverCollapsed)}
        >
          {isCoverCollapsed ? "Expand" : "Collapse"}
        </Button>

        <div className="flex items-center justify-center h-[90%] w-full">
          <div className="flex flex-col">
            <Image
              src={"/white-logo.png"}
              width={1000}
              height={1000}
              alt="Logo"
              className="w-full h-[200px] object-contain mb-6"
            />
            <h3 className="text-md font-bold text-white mb-61">
              Would you rather get guidance on where to save for retirement, or
              become educated and make your own informed decision?
            </h3>
            <p className="text-sm text-white">
              Heads up: This tool is here to help you explore different
              financial scenarios using math and logic-its not financial advice.
              We&apos;re not telling you what to do with your money, just giving
              you some number-powered insights to compare options.
            </p>
          </div>
        </div>
      </div>

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
              handleFileUpload={handleFileUpload}
              handleCropExistingImage={handleCropExistingImage}
            />
            <InsuranceCompaniesSection />
            <TrainingResourcesSection />
          </motion.div>

          <Button
            className="mt-auto"
            onClick={() => {
              setIsCoverCollapsed(!isCoverCollapsed);
            }}
          >
            {isCoverCollapsed ? "Hide Info" : "Show info"}
          </Button>
        </motion.aside>
      </AnimatePresence>
    </div>
  );
}
