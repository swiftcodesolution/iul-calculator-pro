import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BoxesData, BoxesInputField } from "@/lib/types";
import { useTableStore } from "@/lib/store";
import { useSession } from "next-auth/react";

interface InputParametersProps {
  data: BoxesData;
  onUpdate: (updatedData: Partial<BoxesData>) => void;
  readOnly?: boolean;
}

export function InputParameters({
  data,
  onUpdate,
  readOnly = false,
}: InputParametersProps) {
  const { fields } = useTableStore();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const handleInputChange = (key: keyof BoxesData, rawValue: string) => {
    const editableFieldsForUser: (keyof BoxesData)[] = [
      "workingTaxRate",
      "retirementTaxRate",
      "currentPlanFees",
      "currentPlanROR",
    ];

    if (
      readOnly &&
      !(userRole === "agent" && editableFieldsForUser.includes(key))
    )
      return;
    const parsed = rawValue === "" ? "" : parseFloat(rawValue);
    onUpdate({ [key]: parsed });
  };

  const decimalFields: (keyof BoxesData)[] = [
    "workingTaxRate",
    "retirementTaxRate",
    "inflationRate",
    "currentPlanFees",
    "currentPlanROR",
    "taxFreePlanROR",
  ];

  const isInvalid = (key: keyof BoxesData, value: string | number): boolean => {
    const stringValue = value.toString();
    if (stringValue === "") return false;
    const numValue = parseFloat(stringValue);
    if (isNaN(numValue)) return true;
    if (numValue < 0) return true;
    if (key === "stopSavingAge" || key === "retirementAge") {
      const currentAgeNum = parseFloat(data.currentAge.toString());
      return !isNaN(currentAgeNum) && numValue <= currentAgeNum;
    }
    return false;
  };

  const parsedAssumedRor = fields.assumed_ror
    ? parseFloat(fields.assumed_ror.replace("%", ""))
    : "";

  const isFieldEditable = (key: keyof BoxesData) => {
    if (!readOnly) return true;
    return (
      userRole === "agent" &&
      [
        "workingTaxRate",
        "retirementTaxRate",
        "currentPlanFees",
        "currentPlanROR",
      ].includes(key)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <Card className="p-2">
        <CardContent className="grid grid-cols-3 gap-6 p-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 120,
            }}
            className="flex flex-col gap-2"
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
                className="p-0 text-end flex items-center justify-between rounded-sm"
                whileHover={{ scale: isFieldEditable(key) ? 1.02 : 1 }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Input
                    className={`w-[100px] text-sm border-2 ${
                      isInvalid(key, value)
                        ? "border-red-500"
                        : isFieldEditable(key)
                        ? "border-gray-500"
                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                    }`}
                    value={value.toString()}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"}
                    min="0"
                    readOnly={!isFieldEditable(key)}
                    disabled={!isFieldEditable(key)}
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
            className="flex flex-col gap-2"
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
                className="p-0 text-end flex items-center justify-between rounded-sm"
                whileHover={{ scale: isFieldEditable(key) ? 1.02 : 1 }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="relative"
                >
                  <Input
                    className={`w-[100px] text-sm border-2 pr-6 ${
                      isInvalid(key, value)
                        ? "border-red-500"
                        : isFieldEditable(key)
                        ? "border-gray-500"
                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                    }`}
                    value={value.toString()}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"}
                    min="0"
                    readOnly={!isFieldEditable(key)}
                    disabled={!isFieldEditable(key)}
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
            className="flex flex-col gap-2"
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
                  value: parsedAssumedRor || "",
                },
              ] as BoxesInputField[]
            ).map(({ label, key, value }) => (
              <motion.div
                key={label}
                className="p-0 text-end flex items-center justify-between rounded-sm"
                whileHover={{ scale: isFieldEditable(key) ? 1.02 : 1 }}
              >
                <Label>{label}</Label>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="relative"
                >
                  <Input
                    className={`w-[100px] text-sm border-2 pr-6 ${
                      isInvalid(key, value)
                        ? "border-red-500"
                        : isFieldEditable(key)
                        ? "border-gray-500"
                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                    }`}
                    value={value.toString()}
                    onChange={(e) =>
                      key !== "taxFreePlanROR" &&
                      handleInputChange(key, e.target.value)
                    }
                    type="number"
                    step={decimalFields.includes(key) ? "0.1" : "1"}
                    min="0"
                    readOnly={!isFieldEditable(key)}
                    disabled={!isFieldEditable(key)}
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
