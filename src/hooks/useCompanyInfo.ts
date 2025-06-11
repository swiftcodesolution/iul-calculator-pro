import { useState } from "react";
import { CompanyInfo } from "@/lib/types";

const initialCompanyInfo: CompanyInfo = {
  businessName: "",
  agentName: "",
  email: "",
  phone: "",
  logoSrc: "",
  profilePicSrc: "",
};

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfo>(initialCompanyInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => ({ ...prev, ...info }));
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const save = () => {
    setIsEditing(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return {
    companyInfo,
    updateCompanyInfo,
    isEditing,
    toggleEdit,
    save,
    isSidebarCollapsed,
    toggleSidebar,
  };
}
