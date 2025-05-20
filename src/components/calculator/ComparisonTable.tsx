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
import { Results, TaxesData, BoxesData } from "@/lib/types";
import {
  cn,
  extractTaxFreeResults,
  extractCurrentPlanResults,
} from "@/lib/utils";
import { useTableStore } from "@/lib/store";

interface ComparisonTableProps {
  defaultResults: Results; // Static prop for compatibility (not used directly)
  taxesData: TaxesData; // Data for yellow column
  columnTextWhite: {
    currentPlan: boolean;
    taxes: boolean;
    taxFreePlan: boolean;
  };
  highlightedRow: number | null;
  isTableCollapsed: boolean;
  isTableCardExpanded: boolean;
  currentAge: number; // From boxesData
  boxesData: BoxesData; // Input parameters from page
  setIsTableCollapsed: (value: boolean) => void;
  setIsTableCardExpanded: (value: boolean) => void;
  handleHeaderClick: (column: "currentPlan" | "taxes" | "taxFreePlan") => void;
  handleCellClick: (rowIndex: number) => void;
}

export function ComparisonTable({
  defaultResults,
  taxesData,
  columnTextWhite,
  highlightedRow,
  isTableCollapsed,
  isTableCardExpanded,
  currentAge,
  boxesData,
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleHeaderClick,
  handleCellClick,
}: ComparisonTableProps) {
  const { tables, yearsRunOutOfMoney, setYearsRunOutOfMoney } = useTableStore();
  // State for user inputs in the table
  const [startingBalance, setStartingBalance] = useState<number>(
    defaultResults.startingBalance
  );
  const [annualContributions, setAnnualContributions] = useState<number>(
    10000 // Default to client’s $10,000
  );
  const [annualEmployerMatch, setAnnualEmployerMatch] = useState<number>(
    0 // Client specified no match
  );

  // Extract unique Age values from mainTable for dropdown
  const ageOptions = useMemo(() => {
    const mainTable = tables[0]?.data || [];
    const ages = mainTable.map((row) => Number(row.Age)).sort((a, b) => a - b);
    return [...new Set(ages)];
  }, [tables]);

  // Set default yearsRunOutOfMoney when tables are populated
  useEffect(() => {
    if (ageOptions.length > 0 && !ageOptions.includes(yearsRunOutOfMoney)) {
      setYearsRunOutOfMoney(ageOptions[0]);
    }
  }, [ageOptions, yearsRunOutOfMoney, setYearsRunOutOfMoney]);

  // Compute 401(k) results for Current Plan (red column) dynamically
  const currentPlanResults = useMemo(
    () =>
      extractCurrentPlanResults(
        currentAge,
        yearsRunOutOfMoney,
        annualContributions, // From table input
        boxesData.currentPlanROR / 100, // Convert percentage to decimal
        boxesData.retirementTaxRate / 100, // Convert percentage to decimal
        boxesData.currentPlanFees / 100, // Convert percentage to decimal
        boxesData.workingTaxRate / 100 // Convert percentage to decimal
      ),
    [
      currentAge,
      yearsRunOutOfMoney,
      annualContributions,
      boxesData.currentPlanROR,
      boxesData.retirementTaxRate,
      boxesData.currentPlanFees,
      boxesData.workingTaxRate,
    ]
  );

  // Compute tax-free results for IRS 7702 (green column)
  const taxFreeResults = useMemo(
    () => extractTaxFreeResults(tables, currentAge, yearsRunOutOfMoney),
    [tables, currentAge, yearsRunOutOfMoney]
  );

  // Handle dropdown change for yearsRunOutOfMoney
  const handleYearsRunOutOfMoneyChange = (value: string) => {
    const age = Number(value);
    if (!isNaN(age)) {
      setYearsRunOutOfMoney(age);
    }
  };

  // Handle input changes for Starting Balance
  const handleStartingBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setStartingBalance(value);
    }
  };

  // Handle input changes for Annual Contributions
  const handleAnnualContributionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAnnualContributions(value);
    }
  };

  // Handle input changes for Annual Employer Match
  const handleAnnualEmployerMatchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAnnualEmployerMatch(value);
    }
  };

  // Define table rows with data for all columns
  const tableRows = useMemo(
    () => [
      {
        label: "Starting Balance",
        current: (
          <Input
            type="number"
            value={startingBalance}
            onChange={handleStartingBalanceChange}
            className="w-32"
            min={0}
            aria-label="Starting Balance for Current Plan"
          />
        ),
        taxes: taxesData.startingBalance,
        taxFree: `$${taxFreeResults.startingBalance.toLocaleString()}`,
      },
      {
        label: "Annual Contributions",
        current: (
          <Input
            type="number"
            value={annualContributions}
            onChange={handleAnnualContributionsChange}
            className="w-32"
            min={0}
            aria-label="Annual Contributions for Current Plan"
          />
        ),
        taxes: taxesData.annualContributions,
        taxFree: `$${taxFreeResults.annualContributions.toLocaleString()}`,
      },
      {
        label: "Annual Employer Match",
        current: (
          <Input
            type="number"
            value={annualEmployerMatch}
            onChange={handleAnnualEmployerMatchChange}
            className="w-32"
            min={0}
            aria-label="Annual Employer Match for Current Plan"
          />
        ),
        taxes: taxesData.annualEmployerMatch,
        taxFree: taxFreeResults.annualEmployerMatch,
      },
      {
        label: "Annual Fees",
        current: currentPlanResults.annualFees,
        taxes: taxesData.annualFees,
        taxFree: taxFreeResults.annualFees,
      },
      {
        label: "Gross Retirement Income",
        current: `$${currentPlanResults.grossRetirementIncome.toLocaleString()}`,
        taxes: taxesData.grossRetirementIncome,
        taxFree: `$${taxFreeResults.grossRetirementIncome.toLocaleString()}`,
      },
      {
        label: "Income Tax",
        current: `$${currentPlanResults.incomeTax.toLocaleString()}`,
        taxes: taxesData.incomeTax,
        taxFree: `$${taxFreeResults.incomeTax.toLocaleString()}`,
      },
      {
        label: "Net Retirement Income",
        current: `$${currentPlanResults.netRetirementIncome.toLocaleString()}`,
        taxes: taxesData.netRetirementIncome,
        taxFree: `$${taxFreeResults.netRetirementIncome.toLocaleString()}`,
      },
      {
        label: "Cumulative Taxes Deferred",
        current: `$${currentPlanResults.cumulativeTaxesDeferred.toLocaleString()}`,
        taxes: taxesData.cumulativeTaxesDeferred,
        taxFree: `$${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}`,
      },
      {
        label: "Cumulative Taxes Paid",
        current: `$${currentPlanResults.cumulativeTaxesPaid.toLocaleString()}`,
        taxes: taxesData.cumulativeTaxesPaid,
        taxFree: `$${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}`,
      },
      {
        label: "Cumulative Fees Paid",
        current: `$${currentPlanResults.cumulativeFeesPaid.toLocaleString()}`,
        taxes: taxesData.cumulativeFeesPaid,
        taxFree: `$${taxFreeResults.cumulativeFeesPaid.toLocaleString()}`,
      },
      {
        label: "Cumulative Net Income",
        current: `$${currentPlanResults.cumulativeNetIncome.toLocaleString()}`,
        taxes: taxesData.cumulativeNetIncome,
        taxFree: `$${taxFreeResults.cumulativeNetIncome.toLocaleString()}`,
      },
      {
        label: "Cumulative Account Balance",
        current: `$${currentPlanResults.cumulativeAccountBalance.toLocaleString()}`,
        taxes: taxesData.cumulativeAccountBalance,
        taxFree: `$${taxFreeResults.cumulativeAccountBalance.toLocaleString()}`,
      },
      {
        label: "Taxes Due",
        current: `${currentPlanResults.taxesDue}%`,
        taxes: taxesData.taxesDue,
        taxFree: `${taxFreeResults.taxesDue}%`,
      },
      {
        label: "Death Benefits",
        current: `$${currentPlanResults.deathBenefits.toLocaleString()}`,
        taxes: taxesData.deathBenefits,
        taxFree: `$${taxFreeResults.deathBenefits.toLocaleString()}`,
      },
      {
        label: "Years You Run Out of Money",
        current: (
          <Select
            value={yearsRunOutOfMoney.toString()}
            onValueChange={handleYearsRunOutOfMoneyChange}
            aria-label="Select years you run out of money for Current Plan"
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
        taxes: taxesData.yearsRunOutOfMoney,
        taxFree: `${taxFreeResults.yearsRunOutOfMoney}`,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentPlanResults,
      taxesData,
      taxFreeResults,
      yearsRunOutOfMoney,
      ageOptions,
      startingBalance,
      annualContributions,
      annualEmployerMatch,
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
            <h3 className="text-lg font-semibold">Comparison Table</h3>
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
          <CardContent>
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead
                    className={cn(
                      "bg-red-200 cursor-pointer",
                      columnTextWhite.currentPlan
                        ? "text-red-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("currentPlan")}
                    aria-label="Toggle Current Plan column text color"
                  >
                    Current Plan <br /> TSP, 401k, 403b, IRA
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-yellow-200 cursor-pointer",
                      columnTextWhite.taxes ? "text-yellow-200" : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("taxes")}
                    aria-label="Toggle Taxes column text color"
                  >
                    Taxes
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-green-200 cursor-pointer",
                      columnTextWhite.taxFreePlan
                        ? "text-green-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("taxFreePlan")}
                    aria-label="Toggle Tax Free Plan column text color"
                  >
                    IRS (IRC) 7702 <br /> Tax Free Plan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map(({ label, current, taxes, taxFree }, index) => (
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
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.currentPlan
                          ? "text-white opacity-0"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {current}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.taxes
                          ? "text-white opacity-0"
                          : "text-red-600",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {taxes}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.taxFreePlan
                          ? "text-white opacity-0"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {taxFree}
                    </TableCell>
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
              <h3 className="text-lg font-semibold">Comparison Table</h3>
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
                    <TableHead></TableHead>
                    <TableHead
                      className={cn(
                        "bg-red-200 cursor-pointer",
                        columnTextWhite.currentPlan
                          ? "text-red-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("currentPlan")}
                      aria-label="Toggle Current Plan column text color"
                    >
                      Current Plan <br /> TSP, 401k, 403b, IRA
                    </TableHead>
                    <TableHead
                      className={cn(
                        "bg-yellow-200 cursor-pointer",
                        columnTextWhite.taxes
                          ? "text-yellow-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("taxes")}
                      aria-label="Toggle Taxes column text color"
                    >
                      Taxes
                    </TableHead>
                    <TableHead
                      className={cn(
                        "bg-green-200 cursor-pointer",
                        columnTextWhite.taxFreePlan
                          ? "text-green-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("taxFreePlan")}
                      aria-label="Toggle Tax Free Plan column text color"
                    >
                      IRS (IRC) 7702 <br /> Tax Free Plan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map(
                    ({ label, current, taxes, taxFree }, index) => (
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
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.currentPlan
                              ? "text-white opacity-0"
                              : "text-black",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {current}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.taxes
                              ? "text-white opacity-0"
                              : "text-red-600",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {taxes}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.taxFreePlan
                              ? "text-white opacity-0"
                              : "text-black",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {taxFree}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
