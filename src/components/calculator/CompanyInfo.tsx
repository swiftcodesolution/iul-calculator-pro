"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { type CompanyInfo } from "@/lib/types"; // Type-only import

interface CompanyInfoProps {
  companyInfo: CompanyInfo;
}

export function CompanyInfo({ companyInfo }: CompanyInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <Card className="p-2">
        <CardContent className="p-0 flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-2/5 text-center"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="font-bold"
            >
              {companyInfo.businessName}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {companyInfo.agentName}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {companyInfo.phone}
            </motion.p>
          </motion.div>
          {companyInfo.logoSrc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={companyInfo.logoSrc}
                alt="Logo"
                width={300}
                height={300}
                className="object-contain w-full border border-black"
              />
            </motion.div>
          ) : (
            <div className="w-[300px] h-[300px] bg-gray-200 border border-black flex items-center justify-center">
              No Logo
            </div>
          )}
          {companyInfo.profilePicSrc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Image
                src={companyInfo.profilePicSrc}
                width={200}
                height={200}
                alt="Profile Picture"
                className="w-[120px] h-[120px] object-cover rounded-full border border-black"
              />
            </motion.div>
          ) : (
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-full border border-black flex items-center justify-center">
              No Profile
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
