import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { CompanyDetails, ImageAsset } from "@/lib/types";

interface CompanyInfoProps {
  companyDetails: CompanyDetails;
  defaultLogo: ImageAsset;
  defaultProfile: ImageAsset;
}

export function CompanyInfo({
  companyDetails,
  defaultLogo,
  defaultProfile,
}: CompanyInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
      className="grow"
    >
      <Card>
        <CardContent className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-2/5"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="font-bold"
            >
              {companyDetails.businessName}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {companyDetails.agentName}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {companyDetails.phone}
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={defaultLogo.src}
              alt="Logo"
              width={300}
              height={300}
              className="object-contain w-full"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Image
              src={defaultProfile.src}
              width={200}
              height={200}
              alt={defaultProfile.name}
              className="w-[120px] h-[120px] object-cover rounded-full"
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
