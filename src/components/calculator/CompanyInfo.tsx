"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { getImageSrc } from "@/lib/utils";

export function CompanyInfo() {
  const { companyInfo, isLoading, error } = useCompanyInfo();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const logoSrc = getImageSrc(companyInfo.logoSrc);
  const profilePicSrc = getImageSrc(companyInfo.profilePicSrc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <Card className="p-4">
        <CardContent className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="grow text-left w-1/3"
          >
            <h3 className="font-bold text-2xl">
              {companyInfo.businessName || "enter your company name on page 1"}
            </h3>
            <p>{companyInfo.agentName || "enter your name on page 1"}</p>
            <p>{companyInfo.phone || "enter phone number on page 1"}</p>
          </motion.div>
          {logoSrc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="grow w-10/12"
            >
              <Image
                src={logoSrc}
                alt="Logo"
                width={300}
                height={300}
                className="object-contain w-full h-[120px]"
              />
            </motion.div>
          ) : (
            <h2 className="grow text-center text-lg font-bold bg-slate-100 px-8 py-3 w-1/3">
              NO LOGO UPLOADED YET!
            </h2>
          )}
          {profilePicSrc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="grow w-1/3"
            >
              <Image
                src={profilePicSrc}
                width={200}
                height={200}
                alt="Profile Picture"
                className="w-[120px] h-[120px] ml-auto object-cover rounded-[900px]"
              />
            </motion.div>
          ) : (
            <h2 className="grow text-center text-lg font-bold bg-slate-100 px-8 py-3 w-1/3">
              NO PROFILE PICTURE UPLOADED YET!
            </h2>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
