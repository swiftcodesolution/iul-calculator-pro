"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, Upload, Crop } from "lucide-react";
import { CompanyInfo } from "@/lib/types";

const imageUploadVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, type: "spring", stiffness: 120 },
  },
};

interface CompanyInfoSectionProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  isEditing: boolean;
  toggleEdit: () => void;
  save: () => void;
  handleFileUpload: (file: File | null, type: "logo" | "profilePic") => void;
  handleCropExistingImage: (type: "logo" | "profilePic") => void;
}

export default function CompanyInfoSection({
  companyInfo,
  updateCompanyInfo,
  isEditing,
  toggleEdit,
  save,
  handleFileUpload,
  handleCropExistingImage,
}: CompanyInfoSectionProps) {
  const handleDeleteUpload = (type: "logo" | "profilePic") => {
    updateCompanyInfo(
      type === "logo" ? { logoSrc: undefined } : { profilePicSrc: undefined }
    );
  };

  return (
    <Card className="flex-1 p-2 gap-0 mb-2">
      <CardContent className="p-0 space-y-2 h-full">
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
                <div className="flex gap-2 mt-2 justify-center">
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
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCropExistingImage("logo")}
                    >
                      <Crop className="h-4 w-4 mr-1" /> Crop
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                className="h-[100px] bg-gray-200 flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null, "logo")
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
                <div className="flex gap-2 mt-2 justify-center">
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
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCropExistingImage("profilePic")}
                    >
                      <Crop className="h-4 w-4 mr-1" /> Crop
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                className="h-[100px] bg-gray-200 flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null, "profilePic")
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
          <div className="flex gap-2 w-full">
            <div className="grow">
              <Label className="text-xs">Business Name</Label>
              <motion.div
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
              >
                <Input
                  value={companyInfo.businessName}
                  onChange={(e) =>
                    updateCompanyInfo({ businessName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="h-6 text-xs"
                />
              </motion.div>
            </div>
            <div className="grow">
              <Label className="text-xs">Agent Name</Label>
              <motion.div
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
              >
                <Input
                  value={companyInfo.agentName}
                  onChange={(e) =>
                    updateCompanyInfo({ agentName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="h-6 text-xs"
                />
              </motion.div>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="grow">
              <Label className="text-xs">Email</Label>
              <motion.div
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
              >
                <Input
                  value={companyInfo.email}
                  onChange={(e) => updateCompanyInfo({ email: e.target.value })}
                  disabled={!isEditing}
                  className="h-6 text-xs"
                />
              </motion.div>
            </div>
            <div className="grow">
              <Label className="text-xs">Phone Number</Label>
              <motion.div
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #3b82f6" }}
              >
                <Input
                  value={companyInfo.phone}
                  onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
                  disabled={!isEditing}
                  className="h-6 text-xs"
                />
              </motion.div>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <motion.div
              whileHover={{
                scale: 1.1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="grow" size="sm" onClick={toggleEdit}>
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
                <Button className="grow" size="sm" onClick={save}>
                  Save
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
