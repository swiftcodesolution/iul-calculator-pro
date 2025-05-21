import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BoxesData, BoxesInputField } from "@/lib/types";

interface InputParametersProps {
  data: BoxesData;
  onUpdate: (updatedData: Partial<BoxesData>) => void;
}

export function InputParameters({ data, onUpdate }: InputParametersProps) {
  const handleInputChange = (key: keyof BoxesData, value: string) => {
    if (value === "") {
      onUpdate({ [key]: "" }); // Allow empty string to clear input
      return;
    }
    const parsedValue = parseFloat(value); // Use parseFloat to handle decimals
    if (!isNaN(parsedValue)) {
      onUpdate({ [key]: parsedValue }); // Update with parsed number
    }
  };

  // Define which fields should allow decimals
  const decimalFields: (keyof BoxesData)[] = [
    "workingTaxRate",
    "retirementTaxRate",
    "inflationRate",
    "currentPlanFees",
    "currentPlanROR",
    "taxFreePlanROR",
  ];

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
            {(
              [
                {
                  label: "Current Age",
                  key: "currentAge",
                  value: data.currentAge,
                },
                {
                  label: "Stop Saving Age",
                  key: "stopSavingAge",
                  value: data.stopSavingAge,
                },
                {
                  label: "Retirement Age",
                  key: "retirementAge",
                  value: data.retirementAge,
                },
              ] as BoxesInputField[]
            ).map(({ label, key, value }) => (
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
                    className="w-[80px] text-sm border-gray-500 border-2"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"} // Use decimalFields to set step
                    min="0" // Prevent negative values
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
            {(
              [
                {
                  label: "Working Tax Rate",
                  key: "workingTaxRate",
                  value: data.workingTaxRate,
                },
                {
                  label: "Retirement Tax Rate",
                  key: "retirementTaxRate",
                  value: data.retirementTaxRate,
                },
                {
                  label: "Inflation Rate",
                  key: "inflationRate",
                  value: data.inflationRate,
                },
              ] as BoxesInputField[]
            ).map(({ label, key, value }) => (
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
                  className="relative"
                >
                  <Input
                    className="w-[80px] text-sm border-gray-500 border-2 pr-6"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"} // Use decimalFields to set step
                    min="0" // Prevent negative values
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
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
            {(
              [
                {
                  label: "Current Plan Fees",
                  key: "currentPlanFees",
                  value: data.currentPlanFees,
                },
                {
                  label: "Current Plan ROR",
                  key: "currentPlanROR",
                  value: data.currentPlanROR,
                },
                {
                  label: "Tax Free Plan ROR",
                  key: "taxFreePlanROR",
                  value: data.taxFreePlanROR,
                },
              ] as BoxesInputField[]
            ).map(({ label, key, value }) => (
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
                  className="relative"
                >
                  <Input
                    className="w-[80px] text-sm border-gray-500 border-2 pr-6"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"} // Use decimalFields to set step
                    min="0" // Prevent negative values
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
