/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/hooks/useCompanyInfo.ts
import { useState, useEffect } from "react";
import { CompanyInfo } from "@/lib/types";

const initialCompanyInfo: CompanyInfo = {
  id: "",
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch("/api/company-info");
        const data = await response.json();
        if (response.ok && data && Object.keys(data).length > 0) {
          setCompanyInfo(data);
        }
      } catch (err) {
        setError("Failed to fetch company info");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanyInfo();
  }, []);

  const updateCompanyInfo = async (
    info: Partial<CompanyInfo>,
    logoFile?: File | null,
    profilePicFile?: File | null
  ) => {
    setError(null);
    const formData = new FormData();
    formData.append(
      "businessName",
      info.businessName || companyInfo.businessName
    );
    formData.append("agentName", info.agentName || companyInfo.agentName);
    formData.append("email", info.email || companyInfo.email);
    formData.append("phone", info.phone || companyInfo.phone);
    if (logoFile) formData.append("logoSrc", logoFile);
    if (profilePicFile) formData.append("profilePicSrc", profilePicFile);

    try {
      const response = await fetch("/api/company-info", {
        method: companyInfo.id ? "PATCH" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save company info");
      }

      const updatedInfo = await response.json();
      setCompanyInfo(updatedInfo);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCompanyInfo = async () => {
    setError(null);
    try {
      const response = await fetch("/api/company-info", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete company info");
      }

      setCompanyInfo(initialCompanyInfo);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setError(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return {
    companyInfo,
    updateCompanyInfo,
    deleteCompanyInfo,
    isEditing,
    toggleEdit,
    isLoading,
    error,
    isSidebarCollapsed,
    toggleSidebar,
  };
}
