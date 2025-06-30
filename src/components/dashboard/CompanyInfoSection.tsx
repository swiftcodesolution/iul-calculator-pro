"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, Upload, Crop } from "lucide-react";
import { CompanyInfo, companyInfoSchema } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react"; // Added useState for error handling
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const imageUploadVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, type: "spring", stiffness: 120 },
  },
};

interface CompanyInfoSectionProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (
    info: Partial<CompanyInfo>,
    logoFile?: File | null,
    profilePicFile?: File | null
  ) => Promise<void>;
  deleteCompanyInfo: () => Promise<void>;
  isEditing: boolean;
  toggleEdit: () => void;
  isLoading: boolean;
  error: null | string;
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

export default function CompanyInfoSection({
  companyInfo,
  updateCompanyInfo,
  deleteCompanyInfo,
  isEditing,
  toggleEdit,
  isLoading,
  error: propError,
  handleFileUpload,
  handleCropExistingImage,
}: CompanyInfoSectionProps) {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const form = useForm<CompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: companyInfo,
  });

  useEffect(() => {
    form.reset(companyInfo);
  }, [companyInfo, form]);

  const handleDeleteUpload = async (type: "logo" | "profilePic") => {
    const field = type === "logo" ? "logoSrc" : "profilePicSrc";
    form.setValue(field, "");
    try {
      await updateCompanyInfo(
        { [field]: "" },
        type === "logo" ? null : undefined,
        type === "profilePic" ? null : undefined
      );
    } catch (err) {
      setSubmissionError("Failed to delete image");
      console.error("Error deleting image:", err);
    }
  };

  const onSubmit = async (data: CompanyInfo) => {
    try {
      setSubmissionError(null);
      const logoFile = data.logoSrc instanceof File ? data.logoSrc : null;
      const profilePicFile =
        data.profilePicSrc instanceof File ? data.profilePicSrc : null;
      await updateCompanyInfo(
        {
          businessName: data.businessName,
          agentName: data.agentName,
          email: data.email,
          phone: data.phone,
          logoSrc: typeof data.logoSrc === "string" ? data.logoSrc : "",
          profilePicSrc:
            typeof data.profilePicSrc === "string" ? data.profilePicSrc : "",
        },
        logoFile,
        profilePicFile
      );
      form.reset(data); // Reset form to current values
      toggleEdit(); // Exit edit mode
    } catch (err) {
      setSubmissionError("Failed to update company info");
      console.error("Error submitting form:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getImageKey = (src: string | File | undefined | null): string => {
    if (src instanceof File) {
      return `file-${Date.now()}`;
    }
    return src || `empty-${Date.now()}`;
  };

  const getImageSrc = (src: string | File | undefined | null): string => {
    if (src instanceof File) {
      return URL.createObjectURL(src);
    }
    return src || "";
  };

  return (
    <Card className="flex-1 p-2 gap-0 mb-2">
      <CardContent className="p-0 space-y-2">
        {(propError || submissionError) && (
          <div className="text-red-500 text-sm">
            {propError || submissionError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex gap-2">
              {/* Company Logo */}
              <div className="flex flex-col items-center w-full">
                {form.watch("logoSrc") ? (
                  <motion.div
                    key={getImageKey(form.watch("logoSrc"))}
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
                        src={getImageSrc(form.watch("logoSrc"))}
                        alt="Company Logo"
                        width={300}
                        height={300}
                        className="object-contain w-[200px] h-[100px]"
                      />
                    </motion.div>
                    {isEditing && (
                      <div className="flex gap-2 mt-2 justify-center">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUpload("logo")}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button asChild variant="outline" size="sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                              Replace
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileUpload(
                                    file,
                                    "logo",
                                    (field, value) => {
                                      form.setValue(
                                        field as keyof CompanyInfo,
                                        value
                                      );
                                    }
                                  );
                                }}
                                disabled={!isEditing}
                              />
                            </label>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => {
                              const logoSrc = form.watch("logoSrc");
                              if (typeof logoSrc === "string") {
                                handleCropExistingImage("logo", logoSrc);
                              }
                            }}
                          >
                            <Crop className="h-4 w-4 mr-1" /> Crop
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                    className="h-[100px] w-full bg-slate-200 flex items-center justify-center text-center rounded-sm"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload(file, "logo", (field, value) => {
                          form.setValue(field as keyof CompanyInfo, value);
                        });
                      }}
                      id="logo-upload"
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`cursor-pointer p-2 rounded text-sm font-bold text-gray-400 text-center ${
                        !isEditing ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      upload company logo
                    </label>
                  </motion.div>
                )}
              </div>
              {/* Agent Profile Pic */}
              <div className="flex flex-col items-center w-full">
                {form.watch("profilePicSrc") ? (
                  <motion.div
                    key={getImageKey(form.watch("profilePicSrc"))}
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
                        src={getImageSrc(form.watch("profilePicSrc"))}
                        alt="Agent Profile"
                        width={300}
                        height={300}
                        className="object-cover rounded-full w-[100px] h-[100px]"
                      />
                    </motion.div>
                    {isEditing && (
                      <div className="flex gap-2 mt-2 justify-center">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUpload("profilePic")}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button asChild variant="outline" size="sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                              Replace
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileUpload(
                                    file,
                                    "profilePic",
                                    (field, value) => {
                                      form.setValue(
                                        field as keyof CompanyInfo,
                                        value
                                      );
                                    }
                                  );
                                }}
                                disabled={!isEditing}
                              />
                            </label>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => {
                              const profilePicSrc = form.watch("profilePicSrc");
                              if (typeof profilePicSrc === "string") {
                                handleCropExistingImage(
                                  "profilePic",
                                  profilePicSrc
                                );
                              }
                            }}
                          >
                            <Crop className="h-4 w-4 mr-1" /> Crop
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                    className="h-[100px] w-full bg-slate-200 flex items-center justify-center text-center rounded-sm"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload(file, "profilePic", (field, value) => {
                          form.setValue(field as keyof CompanyInfo, value);
                        });
                      }}
                      id="profile-upload"
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor="profile-upload"
                      className={`cursor-pointer p-2 rounded text-sm font-bold text-gray-400 text-center ${
                        !isEditing ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      upload profile picture
                    </label>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex gap-2 w-full">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel className="text-xs">Business Name</FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="h-6 text-xs"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agentName"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel className="text-xs">Agent Name</FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="h-6 text-xs"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="h-6 text-xs"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel className="text-xs">Phone Number</FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 0 2px #3b82f6",
                          }}
                        >
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="h-6 text-xs"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2 w-full">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Button
                    type="button"
                    className="grow"
                    size="sm"
                    onClick={toggleEdit}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </motion.div>
                {isEditing && (
                  <>
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Button type="submit" className="grow" size="sm">
                        Save
                      </Button>
                    </motion.div>
                    {companyInfo.id && (
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Button
                          variant="destructive"
                          className="grow"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteCompanyInfo();
                              form.reset(); // Reset form after deletion
                            } catch (err) {
                              setSubmissionError(
                                "Failed to delete company info"
                              );
                              console.error(
                                "Error deleting company info:",
                                err
                              );
                            }
                          }}
                          type="button"
                        >
                          Delete
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
