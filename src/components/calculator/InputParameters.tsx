import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalculatorData } from "@/lib/types";

interface InputParametersProps {
  data: CalculatorData;
}

export function InputParameters({ data }: InputParametersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 pt-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 120,
            }}
            className="flex flex-col space-y-2"
          >
            {[
              { label: "Current Age", value: data.currentAge },
              { label: "Stop Saving Age", value: data.stopSavingAge },
              { label: "Retirement Age", value: data.retirementAge },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Input
                    className="w-[50px] text-sm border-gray-500 border-2"
                    value={value}
                  />
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.3,
              type: "spring",
              stiffness: 120,
            }}
            className="flex flex-col space-y-2"
          >
            {[
              { label: "Working Tax Rate", value: `${data.workingTaxRate}%` },
              {
                label: "Retirement Tax Rate",
                value: `${data.retirementTaxRate}%`,
              },
              { label: "Inflation Rate", value: `${data.inflationRate}%` },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Input
                    className="w-[60px] text-sm border-gray-500 border-2"
                    value={value}
                  />
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.3,
              type: "spring",
              stiffness: 120,
            }}
            className="flex flex-col space-y-2"
          >
            {[
              { label: "Current Plan Fees", value: `${data.currentPlanFees}%` },
              { label: "Current Plan ROR", value: "6.3%" },
              { label: "Tax Free Plan ROR", value: "6.3%" },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Input
                    className="w-[60px] text-sm border-gray-500 border-2"
                    value={value}
                  />
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
