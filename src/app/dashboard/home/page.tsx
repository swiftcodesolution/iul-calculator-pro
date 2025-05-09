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
import { motion, AnimatePresence } from "motion/react";
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
      const newClient: ClientFile = {
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
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

  // Animation Variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    collapsed: {
      x: "-100%",
      opacity: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const contentVariants = {
    open: {
      marginLeft: "0px",
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    collapsed: {
      marginLeft: "50px",
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
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

  const newClientVariant = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, type: "spring", stiffness: 120 },
    },
  };

  const imageUploadVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 120 },
    },
  };

  return (
    <div className="min-h-[95vh] flex gap-4">
      {/* Sidebar */}
      <div
        className={`relative ${
          !isSidebarCollapsed ? "w-[450px] h-full" : "w-[0px]"
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
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ArrowRight /> : <ArrowLeft />}
          </Button>
        </motion.div>
        <AnimatePresence>
          <motion.aside
            className={`h-full flex flex-col gap-4 ${
              isSidebarCollapsed ? "w-[50px]" : "w-[450px]"
            }`}
            variants={sidebarVariants}
            initial="open"
            animate={isSidebarCollapsed ? "collapsed" : "open"}
            exit="collapsed"
          >
            <motion.div variants={contentVisibility} className="flex">
              <Card className="flex-1">
                <CardContent className="space-y-2 h-full">
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Image
                              src={companyInfo.logoSrc}
                              alt="Company Logo"
                              width={300}
                              height={300}
                              className="object-contain w-[200px] h-[100px]"
                            />
                          </motion.div>
                          <div className="flex gap-2 mt-2">
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUpload("logo")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
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
                            </motion.div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "#e5e7eb",
                          }}
                          className="h-[100px] bg-gray-200 flex flex-col items-center justify-center"
                        >
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
                        </motion.div>
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Image
                              src={companyInfo.profilePicSrc}
                              alt="Agent Profile"
                              width={300}
                              height={300}
                              className="object-cover rounded-full w-[100px] h-[100px]"
                            />
                          </motion.div>
                          <div className="flex gap-2 mt-2">
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUpload("profilePic")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
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
                            </motion.div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "#e5e7eb",
                          }}
                          className="h-[100px] bg-gray-200 flex flex-col items-center justify-center"
                        >
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
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex gap-2">
                      <div>
                        <Label>Business Name</Label>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
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
                        </motion.div>
                      </div>
                      <div>
                        <Label>Agent Name</Label>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
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
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label>Email</Label>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
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
                        </motion.div>
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
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
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="sm" onClick={handleEditToggle}>
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                      </motion.div>
                      {isEditing && (
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button size="sm" onClick={handleSave}>
                            Save
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1 mt-4">
                <CardContent className="space-y-2 h-full">
                  <h3 className="font-bold text-sm mb-4">
                    List of the Insurance Companies
                  </h3>
                  <motion.div
                    className="flex flex-wrap gap-2 mb-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {insuranceCompanies.map((company) => (
                      <motion.div
                        key={company}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", stiffness: 120 },
                          },
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-2 py-1 hover:bg-gray-100 transition-colors"
                          onClick={() => handleInsuranceClick(company)}
                        >
                          {company}
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="default" size="sm" className="w-full">
                      Request Provider
                    </Button>
                  </motion.div>
                  <h3 className="font-bold text-sm mt-4">Training</h3>
                  {trainingResources.map((resource) => (
                    <motion.div
                      key={resource}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 120 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full" variant="default" size="sm">
                        {resource}
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.aside>
        </AnimatePresence>
      </div>
      {/* Main Content */}
      <AnimatePresence>
        <motion.div
          variants={contentVariants}
          initial="open"
          animate={isSidebarCollapsed ? "collapsed" : "open"}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className="flex-1"
        >
          <Card className="h-full">
            <CardContent className="space-y-4 h-4 flex flex-col h-full">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                className="text-xl font-bold"
              >
                IUL Client Files Without a Pension
              </motion.h2>
              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                className="w-min"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClientAction("latest")}
                >
                  Get Latest
                </Button>
              </motion.div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {[
                  "Pro Sample Files",
                  "Your Sample Files",
                  "Your Prospect Files",
                  "Your Closed Sales",
                ].map((category) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 120,
                    }}
                    whileHover={{ scale: 1, backgroundColor: "#f5f5f5" }}
                    className="border p-1 bg-gray-100 overflow-hidden"
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                      e.preventDefault()
                    }
                    onDrop={(e: React.DragEvent<HTMLDivElement>) =>
                      handleDrop(e, category as ClientFile["category"])
                    }
                    style={{ maxHeight: "100%" }}
                  >
                    <motion.h3
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="font-semibold text-sm"
                    >
                      {category}
                    </motion.h3>
                    <div
                      className="overflow-y-auto scrollbar-none"
                      style={{ maxHeight: "max-content" }}
                    >
                      {clientFiles
                        .filter((file) => file.category === category)
                        .map((file) => (
                          <motion.div
                            key={file.id}
                            variants={newClientVariant}
                            initial="hidden"
                            animate="visible"
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "#e5e7eb",
                            }}
                            whileDrag={{ scale: 1.1, opacity: 0.8 }}
                            className="p-1 border-b cursor-move text-sm"
                            draggable="true"
                            onDragStartCapture={(
                              e: React.DragEvent<HTMLDivElement>
                            ) => handleDragStart(e, file.id)}
                          >
                            {file.name}{" "}
                            {file.size !== "N/A" && `(${file.size})`}
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="flex gap-2 justify-end"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { type: "spring", stiffness: 120 },
                        },
                      }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        onClick={() => handleClientAction("new")}
                      >
                        New
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 120,
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="mb-2">
                          Start New Client
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
                          <Input
                            placeholder="Client Name"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="h-8"
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="w-min"
                        >
                          <Button
                            size="sm"
                            onClick={() => handleClientAction("new")}
                          >
                            Open
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
                {["open", "copy", "rename", "delete"].map((action) => (
                  <motion.div
                    key={action}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", stiffness: 120 },
                      },
                    }}
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      onClick={() => handleClientAction(action)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
