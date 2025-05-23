"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Results, BoxesData } from "@/lib/types";
import { cn, extractCurrentPlanResultsAllYears } from "@/lib/utils";
import { useTableStore } from "@/lib/store";

interface AllYearsTableProps {
  currentAge: number;
  boxesData: BoxesData;
  highlightedRow: number | null;
  isTableCollapsed: boolean;
  isTableCardExpanded: boolean;
  setIsTableCollapsed: (value: boolean) => void;
  setIsTableCardExpanded: (value: boolean) => void;
  handleCellClick: (rowIndex: number) => void;
}

export function AllYearsTable({
  currentAge,
  boxesData,
  highlightedRow,
  isTableCollapsed,
  isTableCardExpanded,
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleCellClick,
}: AllYearsTableProps) {
  const { tables, yearsRunOutOfMoney, setYearsRunOutOfMoney } = useTableStore();

  // State for user inputs
  const [startingBalance, setStartingBalance] = useState<number | string>(0);
  const [annualContributions, setAnnualContributions] = useState<
    number | string
  >(12821);
  const [annualEmployerMatch, setAnnualEmployerMatch] = useState<
    number | string
  >(0);
  const [yearsRunOutOfMoneyInput, setYearsRunOutOfMoneyInput] =
    useState<number>(yearsRunOutOfMoney);

  // Extract age options for dropdown
  const ageOptions = useMemo(() => {
    const mainTable = tables[0]?.data || [];
    const ages = mainTable.map((row) => Number(row.Age)).sort((a, b) => a - b);
    return [...new Set(ages)];
  }, [tables]);

  // Set default yearsRunOutOfMoney
  useEffect(() => {
    if (ageOptions.length > 0 && !ageOptions.includes(yearsRunOutOfMoney)) {
      setYearsRunOutOfMoney(ageOptions[0]);
    }
  }, [ageOptions, yearsRunOutOfMoney, setYearsRunOutOfMoney]);

  // Compute yearly results
  const yearlyPlanResults = useMemo(() => {
    const inputs = {
      currentAge: Number(boxesData.currentAge) || currentAge,
      yearsRunOutOfMoney: yearsRunOutOfMoney,
      annualContributions: Number(annualContributions) || 12821,
      currentPlanROR: Number(boxesData.currentPlanROR) || 6.3,
      retirementTaxRate: Number(boxesData.retirementTaxRate) || 22,
      currentPlanFees: Number(boxesData.currentPlanFees) || 2,
      workingTaxRate: Number(boxesData.workingTaxRate) || 22,
      startingBalance: Number(startingBalance) || 0,
      annualEmployerMatch: Number(annualEmployerMatch) || 0,
      retirementAge: Number(boxesData.retirementAge) || 66,
      stopSavingAge: Number(boxesData.stopSavingAge) || 65,
    };
    console.log("All Years Calculation Inputs:", inputs);

    const results = extractCurrentPlanResultsAllYears(
      inputs.currentAge,
      inputs.yearsRunOutOfMoney,
      inputs.annualContributions,
      inputs.currentPlanROR,
      inputs.retirementTaxRate,
      inputs.currentPlanFees,
      inputs.workingTaxRate,
      inputs.startingBalance,
      inputs.annualEmployerMatch,
      inputs.retirementAge,
      inputs.stopSavingAge
    );
    console.log("All Years Calculation Results:", results);

    return results;
  }, [
    currentAge,
    yearsRunOutOfMoney,
    annualContributions,
    annualEmployerMatch,
    startingBalance,
    boxesData.currentAge,
    boxesData.currentPlanROR,
    boxesData.retirementTaxRate,
    boxesData.currentPlanFees,
    boxesData.workingTaxRate,
    boxesData.retirementAge,
    boxesData.stopSavingAge,
  ]);

  // Input handlers
  const handleStartingBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "") {
      setStartingBalance("");
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setStartingBalance(numValue);
      }
    }
  };

  const handleAnnualContributionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "") {
      setAnnualContributions("");
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setAnnualContributions(numValue);
      }
    }
  };

  const handleAnnualEmployerMatchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "") {
      setAnnualEmployerMatch("");
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setAnnualEmployerMatch(numValue);
      }
    }
  };

  const handleYearsRunOutOfMoneyChange = (value: string) => {
    const age = Number(value);
    if (!isNaN(age)) {
      setYearsRunOutOfMoney(age);
      setYearsRunOutOfMoneyInput(age);
    }
  };

  const handleYearsRunOutOfMoneyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value > currentAge) {
      setYearsRunOutOfMoneyInput(value);
      setYearsRunOutOfMoney(value);
    }
  };

  // Format values
  const formatValue = (
    value: number | string,
    isPercentage: boolean = false
  ): string => {
    if (typeof value === "string") {
      if (["included", "n/a"].includes(value.toLowerCase())) return value;
      return value;
    }
    if (isPercentage) {
      return `${Number(value).toFixed(2)}%`;
    }
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Define table rows
  const tableRows = useMemo(
    () => [
      {
        label: "Starting Balance",
        key: "startingBalance",
        input: (
          <Input
            type="number"
            value={startingBalance}
            onChange={handleStartingBalanceChange}
            className="w-32"
            min={0}
            aria-label="Starting Balance"
          />
        ),
      },
      {
        label: "Annual Contributions",
        key: "annualContributions",
        input: (
          <Input
            type="number"
            value={annualContributions}
            onChange={handleAnnualContributionsChange}
            className="w-32"
            min={0}
            aria-label="Annual Contributions"
          />
        ),
      },
      {
        label: "Annual Employer Match",
        key: "annualEmployerMatch",
        input: (
          <Input
            type="number"
            value={annualEmployerMatch}
            onChange={handleAnnualEmployerMatchChange}
            className="w-32"
            min={0}
            aria-label="Annual Employer Match"
          />
        ),
      },
      { label: "Annual Fees", key: "annualFees" },
      { label: "Gross Retirement Income", key: "grossRetirementIncome" },
      { label: "Income Tax", key: "incomeTax" },
      { label: "Net Retirement Income", key: "netRetirementIncome" },
      { label: "Cumulative Taxes Deferred", key: "cumulativeTaxesDeferred" },
      { label: "Cumulative Taxes Paid", key: "cumulativeTaxesPaid" },
      { label: "Cumulative Fees Paid", key: "cumulativeFeesPaid" },
      { label: "Cumulative Net Income", key: "cumulativeNetIncome" },
      { label: "Cumulative Account Balance", key: "cumulativeAccountBalance" },
      { label: "Taxes Due", key: "taxesDue" },
      { label: "Death Benefits", key: "deathBenefits" },
      {
        label: "Years You Run Out of Money",
        key: "yearsRunOutOfMoney",
        input:
          ageOptions.length === 0 ? (
            <Input
              type="number"
              value={yearsRunOutOfMoneyInput}
              onChange={handleYearsRunOutOfMoneyInputChange}
              className="w-32"
              min={currentAge + 1}
              aria-label="Years You Run Out of Money"
            />
          ) : (
            <Select
              value={yearsRunOutOfMoney.toString()}
              onValueChange={handleYearsRunOutOfMoneyChange}
              aria-label="Select years you run out of money"
              disabled={ageOptions.length === 0}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Age" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
      },
    ],
    [
      startingBalance,
      annualContributions,
      annualEmployerMatch,
      yearsRunOutOfMoney,
      yearsRunOutOfMoneyInput,
      ageOptions,
    ]
  );

  return (
    <AnimatePresence>
      {!isTableCardExpanded ? (
        <Card>
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer"
            onClick={() => setIsTableCollapsed(!isTableCollapsed)}
            aria-label="Toggle table visibility"
          >
            <h3 className="text-lg font-semibold">
              Yearly Current Plan Results
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTableCardExpanded(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {yearlyPlanResults.map((result) => (
                    <TableHead
                      key={result.xValue}
                      className="bg-red-200 cursor-pointer text-black transition-colors duration-300"
                    >
                      Age {result.xValue}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map(({ label, key, input }, index) => (
                  <motion.tr
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : ""
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {label}
                    </TableCell>
                    {yearlyPlanResults.map((result) => (
                      <TableCell
                        key={`${key}-${result.xValue}`}
                        className={cn(
                          "border cursor-pointer whitespace-nowrap",
                          highlightedRow === index
                            ? "bg-[#ffa1ad]"
                            : "bg-white",
                          "text-black",
                          "transition-colors duration-300"
                        )}
                        onClick={() => handleCellClick(index)}
                        aria-selected={highlightedRow === index}
                      >
                        {input && key === result[key as keyof Results]
                          ? input
                          : formatValue(
                              result[key as keyof Results],
                              key === "annualFees" || key === "taxesDue"
                            )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
        >
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">
                Yearly Current Plan Results
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTableCardExpanded(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {yearlyPlanResults.map((result) => (
                      <TableHead
                        key={result.xValue}
                        className="bg-red-200 cursor-pointer text-black transition-colors duration-300"
                      >
                        Age {result.xValue}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map(({ label, key, input }, index) => (
                    <TableRow key={label}>
                      <TableCell
                        className={cn(
                          "border cursor-pointer whitespace-nowrap",
                          highlightedRow === index ? "bg-[#ffa1ad]" : ""
                        )}
                        onClick={() => handleCellClick(index)}
                        aria-selected={highlightedRow === index}
                      >
                        {label}
                      </TableCell>
                      {yearlyPlanResults.map((result) => (
                        <TableCell
                          key={`${key}-${result.xValue}`}
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            "text-black",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {input && key === result[key as keyof Results]
                            ? input
                            : formatValue(
                                result[key as keyof Results],
                                key === "annualFees" || key === "taxesDue"
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
