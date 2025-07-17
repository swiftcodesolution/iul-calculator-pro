"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, Upload, Crop } from "lucide-react";
import { CompanyInfo } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
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
  ) => Promise<CompanyInfo>;
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
  form: UseFormReturn<CompanyInfo>;
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
  form,
}: CompanyInfoSectionProps) {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteUpload = (type: "logo" | "profilePic") => {
    const field = type === "logo" ? "logoSrc" : "profilePicSrc";
    form.setValue(field, "");
    console.log(`Deleted ${type} from form state`);
  };

  const onSubmit = async (data: CompanyInfo) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    console.log("Submitting form with data:", data, "isEditing:", isEditing);
    try {
      const logoFile = data.logoSrc instanceof File ? data.logoSrc : null;
      const profilePicFile =
        data.profilePicSrc instanceof File ? data.profilePicSrc : null;
      const updatedInfo = await updateCompanyInfo(
        {
          businessName: data.businessName,
          agentName: data.agentName,
          email: data.email,
          phone: data.phone,
          logoSrc:
            data.logoSrc === ""
              ? ""
              : typeof data.logoSrc === "string"
              ? data.logoSrc
              : undefined,
          profilePicSrc:
            data.profilePicSrc === ""
              ? ""
              : typeof data.profilePicSrc === "string"
              ? data.profilePicSrc
              : undefined,
        },
        logoFile,
        profilePicFile
      );
      console.log("Form submitted successfully, updatedInfo:", updatedInfo);
      form.reset(updatedInfo);
    } catch (err) {
      setSubmissionError("Failed to update company info");
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
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
    <Card className="flex-1 p-2 pt-18 gap-0 mb-2">
      <CardContent className="p-0 space-y-2">
        {(propError || submissionError) && (
          <div className="text-red-500 text-sm">
            {propError || submissionError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex gap-2">
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
                            disabled={isSubmitting}
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
                                id="logo-replace-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  console.log(
                                    "Logo replace input file selected:",
                                    file
                                  );
                                  handleFileUpload(
                                    file,
                                    "logo",
                                    (field, value) => {
                                      console.log(
                                        `Setting form value: ${field}=`,
                                        value
                                      );
                                      form.setValue(
                                        field as keyof CompanyInfo,
                                        value
                                      );
                                    }
                                  );
                                }}
                                disabled={!isEditing || isSubmitting}
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
                                console.log(
                                  "Opening crop dialog for existing logo:",
                                  logoSrc
                                );
                                handleCropExistingImage("logo", logoSrc);
                              }
                            }}
                            disabled={isSubmitting || !form.watch("logoSrc")}
                          >
                            <Crop className="h-4 w-4 mr-1" /> Crop
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                      className="h-[100px] w-full bg-slate-200 flex items-center justify-center text-center rounded-sm"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log("Logo input file selected:", file);
                          handleFileUpload(file, "logo", (field, value) => {
                            console.log(`Setting form value: ${field}=`, value);
                            form.setValue(field as keyof CompanyInfo, value);
                          });
                        }}
                        disabled={!isEditing || isSubmitting}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`cursor-pointer p-2 rounded text-sm font-bold text-gray-400 text-center ${
                          !isEditing || isSubmitting
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        upload company logo
                      </label>
                    </motion.div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Don&apos;t want to upload
                    </label>
                  </div>
                )}
              </div>
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
                            disabled={isSubmitting}
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
                                id="profile-replace-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  console.log(
                                    "Profile input file selected:",
                                    file
                                  );
                                  handleFileUpload(
                                    file,
                                    "profilePic",
                                    (field, value) => {
                                      console.log(
                                        `Setting form value: ${field}=`,
                                        value
                                      );
                                      form.setValue(
                                        field as keyof CompanyInfo,
                                        value
                                      );
                                    }
                                  );
                                }}
                                disabled={!isEditing || isSubmitting}
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
                                console.log(
                                  "Opening crop dialog for existing profilePic:",
                                  profilePicSrc
                                );
                                handleCropExistingImage(
                                  "profilePic",
                                  profilePicSrc
                                );
                              }
                            }}
                            disabled={
                              isSubmitting || !form.watch("profilePicSrc")
                            }
                          >
                            <Crop className="h-4 w-4 mr-1" /> Crop
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                      className="h-[100px] w-full bg-slate-200 flex items-center justify-center text-center rounded-sm"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="profile-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log("Profile input file selected:", file);
                          handleFileUpload(
                            file,
                            "profilePic",
                            (field, value) => {
                              console.log(
                                `Setting form value: ${field}=`,
                                value
                              );
                              form.setValue(field as keyof CompanyInfo, value);
                            }
                          );
                        }}
                        disabled={!isEditing || isSubmitting}
                      />
                      <label
                        htmlFor="profile-upload"
                        className={`cursor-pointer p-2 rounded text-sm font-bold text-gray-400 text-center ${
                          !isEditing || isSubmitting
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        upload profile picture
                      </label>
                    </motion.div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Don&apos;t want to upload
                    </label>
                  </div>
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
                            disabled={!isEditing || isSubmitting}
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
                            disabled={!isEditing || isSubmitting}
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
                            disabled={!isEditing || isSubmitting}
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
                            disabled={!isEditing || isSubmitting}
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
                    onClick={() => {
                      console.log("Cancel/Edit clicked, isEditing:", isEditing);
                      form.reset(companyInfo);
                      toggleEdit();
                    }}
                    disabled={isSubmitting}
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
                      <Button
                        type="submit"
                        className="grow"
                        size="sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save"}
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
                            setIsSubmitting(true);
                            try {
                              await deleteCompanyInfo();
                              form.reset();
                            } catch (err) {
                              setSubmissionError(
                                "Failed to delete company info"
                              );
                              console.error(
                                "Error deleting company info:",
                                err
                              );
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          type="button"
                          disabled={isSubmitting}
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
