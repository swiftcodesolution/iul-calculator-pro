/* eslint-disable @typescript-eslint/no-explicit-any */
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
          console.log("Fetched company info:", data);
          setCompanyInfo(data);
        } else {
          console.log("No company info found or empty response");
        }
      } catch (err) {
        setError("Failed to fetch company info");
        console.error("Fetch error:", err);
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
  ): Promise<CompanyInfo> => {
    setError(null);
    console.log("updateCompanyInfo called with:", {
      info,
      logoFile,
      profilePicFile,
    });
    const formData = new FormData();
    formData.append(
      "businessName",
      info.businessName || companyInfo.businessName || ""
    );
    formData.append("agentName", info.agentName || companyInfo.agentName || "");
    formData.append("email", info.email || companyInfo.email || "");
    formData.append("phone", info.phone || companyInfo.phone || "");
    formData.append("logoSrc", info.logoSrc ?? "");
    formData.append("profilePicSrc", info.profilePicSrc ?? "");
    if (logoFile) formData.append("logoFile", logoFile);
    if (profilePicFile) formData.append("profilePicFile", profilePicFile);

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
      console.log(
        "Updated company info:",
        updatedInfo,
        "Setting isEditing to false"
      );
      setCompanyInfo(updatedInfo);
      setIsEditing(false);
      return updatedInfo;
    } catch (err: any) {
      setError(err.message);
      console.error("Update error:", err);
      setIsEditing(false);
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

      console.log("Deleted company info, resetting to initial state");
      setCompanyInfo(initialCompanyInfo);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
      console.error("Delete error:", err);
      throw err;
    }
  };

  const toggleEdit = () => {
    console.log("Toggling edit, current isEditing:", isEditing);
    setIsEditing((prev) => {
      const newState = !prev;
      console.log("New isEditing state:", newState);
      return newState;
    });
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
