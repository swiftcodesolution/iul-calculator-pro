import { useState } from "react";
import { CompanyInfo } from "@/lib/types";

const initialCompanyInfo: CompanyInfo = {
  businessName: "IUL Calculator Pro",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "760-517-8105",
  logoSrc: "/logo.png",
  profilePicSrc: "/profile.jpg",
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
