"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { getImageSrc } from "@/lib/utils";
import { useTableStore } from "@/lib/store";

export function CompanyInfo() {
  const { companyInfo, isLoading, error } = useCompanyInfo();
  const { dontWantLogo, dontWantProfilePic } = useTableStore();

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
      <Card className="">
        <CardContent className="h-[90px] px-4 py-2 flex items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="grow text-left w-1/3 flex flex-col gap-2"
          >
            <h3 className="font-bold text-xl">
              {companyInfo.businessName || "enter your company name on page 1"}
            </h3>
            <p className="text-sm">
              {companyInfo.agentName || "enter your name on page 1"}
            </p>
            <p className="text-sm">
              {companyInfo.phone || "enter phone number on page 1"}
            </p>
            <p className="text-sm">
              {companyInfo.email || "enter phone number on page 1"}
            </p>
          </motion.div>

          {/*
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
            // <h2 className="h-[80px] grow text-center text-lg font-bold flex items-center justify-center border rounded px-8 py-3 w-1/3">
            //   NO LOGO UPLOADED YET!
            // </h2>
            <div></div>
          )}
            */}

          {dontWantLogo ? (
            <div></div> // Hide logo section if checkbox is checked
          ) : logoSrc ? (
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
            <h2 className="h-[80px] grow text-center text-lg font-bold flex items-center justify-center border rounded px-8 py-3 w-1/3">
              Logo not uploaded yet
            </h2>
          )}

          {/*
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
            // <h2 className="h-[80px] grow text-center text-lg font-bold flex items-center justify-center border rounded px-8 py-3 w-1/3">
            //   NO PROFILE PICTURE UPLOADED YET!
            // </h2>
            <div></div>
          )}
           */}

          {dontWantProfilePic ? (
            <div></div> // Hide profile picture section if checkbox is checked
          ) : profilePicSrc ? (
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
            <h2 className="h-[80px] grow text-center text-lg font-bold flex items-center justify-center border rounded px-8 py-3 w-1/3">
              Profile pic not uploaded yet
            </h2>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
