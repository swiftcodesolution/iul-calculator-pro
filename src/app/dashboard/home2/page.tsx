"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, ArrowLeft, ArrowRight, Upload } from "lucide-react";

// Define types
type CompanyInfo = {
  businessName: string;
  agentName: string;
  email: string;
  phone: string;
  logoSrc?: string;
  profilePicSrc?: string;
};

type ClientFile = {
  id: string;
  name: string;
  size: string;
  category:
    | "Pro Sample Files"
    | "Your Sample Files"
    | "Your Prospect Files"
    | "Your Closed Sales";
};

const initialCompanyInfo: CompanyInfo = {
  businessName: "IUL Calculator Pro",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "760-517-8105",
  logoSrc: "/logo.png", // Placeholder
  profilePicSrc: "/profile.jpg", // Placeholder
};

const initialClientFiles: ClientFile[] = [
  { id: "1", name: "Age 30-65", size: "20k", category: "Pro Sample Files" },
  { id: "2", name: "Age 35-65", size: "10k", category: "Pro Sample Files" },
  { id: "3", name: "Age 40-65", size: "10k", category: "Pro Sample Files" },
  { id: "4", name: "test", size: "N/A", category: "Your Sample Files" },
];

const insuranceCompanies = [
  "Allianz",
  "Corebridge",
  "Lincoln",
  "Midland",
  "Minnesota",
  "National Life",
  "National Life",
  "National Life",
  "National Life",
];
const trainingResources = ["View the Training Page", "Downloads"];

export default function DashboardPage() {
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfo>(initialCompanyInfo);
  const [clientFiles, setClientFiles] =
    useState<ClientFile[]>(initialClientFiles);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const handleFileUpload = (file: File | null, type: "logo" | "profilePic") => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        setCompanyInfo((prev) =>
          type === "logo"
            ? { ...prev, logoSrc: src }
            : { ...prev, profilePicSrc: src }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteUpload = (type: "logo" | "profilePic") => {
    setCompanyInfo((prev) =>
      type === "logo"
        ? { ...prev, logoSrc: undefined }
        : { ...prev, profilePicSrc: undefined }
    );
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleClientAction = (action: string, id?: string) => {
    if (action === "new" && newClientName) {
      const newClient = {
        id: Date.now().toString(),
        name: newClientName,
        size: "N/A",
        category: "Your Prospect Files",
      };
      setClientFiles((prev) => [...prev, newClient]);
      setNewClientName("");
    } else if (id) {
      console.log(`${action} clicked for client ${id}`); // Placeholder for Open, Copy, Rename, Delete actions
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetCategory: ClientFile["category"]
  ) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setClientFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, category: targetCategory } : file
      )
    );
  };

  const handleInsuranceClick = (company: string) => {
    console.log(`Clicked on insurance company: ${company}`); // Placeholder for click action
  };

  // Updated animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    collapsed: {
      x: "-100%", // Slide out to the left
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const contentVariants = {
    open: {
      marginLeft: "0px", // Fixed sidebar width when open
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    collapsed: {
      marginLeft: "50px", // Fixed sidebar width when collapsed
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const contentVisibility = {
    open: {
      opacity: 1,
      display: "block",
      transition: { delay: 0.1, duration: 0.3 },
    },
    collapsed: {
      opacity: 0,
      transition: { duration: 0.3 },
      transitionEnd: { display: "none" },
    },
  };

  const newClientVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const imageUploadVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div className="container mx-auto p-4 flex gap-4" style={{}}>
      <div
        className={`relative ${!isSidebarCollapsed ? "w-[450px]" : "w-[0px]"}`}
      >
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ArrowRight /> : <ArrowLeft />}
        </Button>
        <AnimatePresence>
          <motion.aside
            className={isSidebarCollapsed ? "w-[50px]" : "w-[450px]"} // Fixed widths
            variants={sidebarVariants}
            initial="open"
            animate={isSidebarCollapsed ? "collapsed" : "open"}
            exit="collapsed"
          >
            <motion.div variants={contentVisibility}>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="flex flex-col items-center">
                      {companyInfo.logoSrc ? (
                        <motion.div
                          key={companyInfo.logoSrc}
                          variants={imageUploadVariant}
                          initial="hidden"
                          animate="visible"
                          className="flex flex-col items-center"
                        >
                          <Image
                            src={companyInfo.logoSrc}
                            alt="Company Logo"
                            width={300}
                            height={300}
                            className="object-contain w-[200px] h-[100px]"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUpload("logo")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                Replace
                                <Upload className="h-4 w-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      e.target.files?.[0] || null,
                                      "logo"
                                    )
                                  }
                                />
                              </label>
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-[100px] bg-gray-200 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0] || null,
                                "logo"
                              )
                            }
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer p-2 rounded text-sm"
                          >
                            Drag and Drop Logo
                          </label>
                        </div>
                      )}
                    </div>
                    {/* Agent Profile Pic */}
                    <div className="flex flex-col items-center">
                      {companyInfo.profilePicSrc ? (
                        <motion.div
                          key={companyInfo.profilePicSrc}
                          variants={imageUploadVariant}
                          initial="hidden"
                          animate="visible"
                          className="flex flex-col items-center"
                        >
                          <Image
                            src={companyInfo.profilePicSrc}
                            alt="Agent Profile"
                            width={300}
                            height={300}
                            className="object-cover rounded-full w-[100px] h-[100px]"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUpload("profilePic")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                Replace
                                <Upload className="h-4 w-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      e.target.files?.[0] || null,
                                      "profilePic"
                                    )
                                  }
                                />
                              </label>
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-[100px] bg-gray-200 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0] || null,
                                "profilePic"
                              )
                            }
                            id="profile-upload"
                          />
                          <label
                            htmlFor="profile-upload"
                            className="cursor-pointer p-2 rounded text-sm"
                          >
                            Drag and Drop Profile Pic
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label>Business Name</Label>
                      <Input
                        value={companyInfo.businessName}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            businessName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label>Agent Name</Label>
                      <Input
                        value={companyInfo.agentName}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            agentName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={companyInfo.phone}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditToggle}>
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                      {isEditing && (
                        <Button size="sm" onClick={handleSave}>
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="space-y-2 p-4">
                  <h3 className="font-bold text-sm mb-4">
                    List of the Insurance Companies
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {insuranceCompanies.map((company) => (
                      <Button
                        key={company}
                        variant="outline"
                        size="sm"
                        className="text-sm px-2 py-1 hover:bg-gray-100 transition-colors"
                        onClick={() => handleInsuranceClick(company)}
                      >
                        {company}
                      </Button>
                    ))}
                  </div>
                  <Button variant="default" size="sm" className="w-full">
                    Request Provider
                  </Button>
                  <h3 className="font-bold text-sm mt-4">Training</h3>
                  {trainingResources.map((resource) => (
                    <>
                      <Button
                        className="w-full"
                        variant="default"
                        size="sm"
                        key={resource}
                      >
                        {resource}
                      </Button>
                    </>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.aside>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <motion.div
          variants={contentVariants}
          initial="open"
          animate={isSidebarCollapsed ? "collapsed" : "open"}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1" // Ensure the content takes up remaining space
        >
          <Card className="h-full">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-bold">
                IUL Client Files Without a Pension
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientAction("latest")}
              >
                Get Latest
              </Button>
              <div className="grid grid-cols-4 gap-2 h-[600px]">
                {[
                  "Pro Sample Files",
                  "Your Sample Files",
                  "Your Prospect Files",
                  "Your Closed Sales",
                ].map((category) => (
                  <div
                    key={category}
                    className="border p-1 bg-gray-100 overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) =>
                      handleDrop(e, category as ClientFile["category"])
                    }
                    style={{ maxHeight: "100%" }}
                  >
                    <h3 className="font-semibold text-sm">{category}</h3>
                    <div
                      className="overflow-y-auto"
                      style={{ maxHeight: "500px" }}
                    >
                      {clientFiles
                        .filter((file) => file.category === category)
                        .map((file) => (
                          <motion.div
                            key={file.id}
                            variants={newClientVariant}
                            initial="hidden"
                            animate="visible"
                            className="p-1 border-b cursor-move text-sm"
                            draggable
                            onDragStart={(e) => handleDragStart(e, file.id)}
                          >
                            {file.name}{" "}
                            {file.size !== "N/A" && `(${file.size})`}
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => handleClientAction("new")}>
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Input
                        placeholder="Client Name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleClientAction("new")}
                      >
                        Open
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" onClick={() => handleClientAction("open")}>
                  Open
                </Button>
                <Button size="sm" onClick={() => handleClientAction("copy")}>
                  Copy
                </Button>
                <Button size="sm" onClick={() => handleClientAction("rename")}>
                  Rename
                </Button>
                <Button size="sm" onClick={() => handleClientAction("delete")}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
