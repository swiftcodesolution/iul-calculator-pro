"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const insuranceCompanies = [
  "Allianz",
  "Corebridge",
  "Lincoln",
  "Midland",
  "Minnesota",
  "National Life",
];

export default function InsuranceCompaniesSection() {
  const handleInsuranceClick = (company: string) => {
    console.log(`Clicked on insurance company: ${company}`);
  };

  return (
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
              transition: { staggerChildren: 0.1 },
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
          whileHover={{ scale: 1.05, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="default" size="sm" className="w-full">
            Request Provider
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
