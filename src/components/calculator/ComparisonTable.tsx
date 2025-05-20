"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Results, TaxesData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTableStore } from "@/lib/store";
import { extractTaxFreeResults } from "@/lib/utils";

interface ComparisonTableProps {
  defaultResults: Results;
  taxesData: TaxesData;
  columnTextWhite: {
    currentPlan: boolean;
    taxes: boolean;
    taxFreePlan: boolean;
  };
  highlightedRow: number | null;
  isTableCollapsed: boolean;
  isTableCardExpanded: boolean;
  currentAge: number; // Added prop for currentAge
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
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleHeaderClick,
  handleCellClick,
}: ComparisonTableProps) {
  const { tables } = useTableStore();
  const [yearsRunOutOfMoney, setYearsRunOutOfMoney] = useState<number>(
    defaultResults.yearsRunOutOfMoney
  );

  // Compute taxFreeResults dynamically based on yearsRunOutOfMoney
  const taxFreeResults = useMemo(
    () => extractTaxFreeResults(tables, currentAge, yearsRunOutOfMoney),
    [tables, currentAge, yearsRunOutOfMoney]
  );

  const handleYearsRunOutOfMoneyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setYearsRunOutOfMoney(value);
    }
  };

  const tableRows = useMemo(
    () => [
      {
        label: "Starting Balance",
        current: `$${defaultResults.startingBalance.toLocaleString()}`,
        taxes: taxesData.startingBalance,
        taxFree: `$${taxFreeResults.startingBalance.toLocaleString()}`,
      },
      {
        label: "Annual Contributions",
        current: `$${defaultResults.annualContributions.toLocaleString()}`,
        taxes: taxesData.annualContributions,
        taxFree: `$${taxFreeResults.annualContributions.toLocaleString()}`,
      },
      {
        label: "Annual Employer Match",
        current:
          typeof defaultResults.annualEmployerMatch === "number"
            ? `$${defaultResults.annualEmployerMatch}`
            : defaultResults.annualEmployerMatch,
        taxes: taxesData.annualEmployerMatch,
        taxFree: taxFreeResults.annualEmployerMatch,
      },
      {
        label: "Annual Fees",
        current:
          typeof defaultResults.annualFees === "number"
            ? `${defaultResults.annualFees}%`
            : defaultResults.annualFees,
        taxes: taxesData.annualFees,
        taxFree: taxFreeResults.annualFees,
      },
      {
        label: "Gross Retirement Income",
        current: `$${defaultResults.grossRetirementIncome.toLocaleString()}`,
        taxes: taxesData.grossRetirementIncome,
        taxFree: `$${taxFreeResults.grossRetirementIncome.toLocaleString()}`,
      },
      {
        label: "Income Tax",
        current: `$${defaultResults.incomeTax.toLocaleString()}`,
        taxes: taxesData.incomeTax,
        taxFree: `$${taxFreeResults.incomeTax.toLocaleString()}`,
      },
      {
        label: "Net Retirement Income",
        current: `$${defaultResults.netRetirementIncome.toLocaleString()}`,
        taxes: taxesData.netRetirementIncome,
        taxFree: `$${taxFreeResults.netRetirementIncome.toLocaleString()}`,
      },
      {
        label: "Cumulative Taxes Deferred",
        current: `$${defaultResults.cumulativeTaxesDeferred.toLocaleString()}`,
        taxes: taxesData.cumulativeTaxesDeferred,
        taxFree: `$${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}`,
      },
      {
        label: "Cumulative Taxes Paid",
        current: `$${defaultResults.cumulativeTaxesPaid.toLocaleString()}`,
        taxes: taxesData.cumulativeTaxesPaid,
        taxFree: `$${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}`,
      },
      {
        label: "Cumulative Fees Paid",
        current: `$${defaultResults.cumulativeFeesPaid.toLocaleString()}`,
        taxes: taxesData.cumulativeFeesPaid,
        taxFree: `$${taxFreeResults.cumulativeFeesPaid.toLocaleString()}`,
      },
      {
        label: "Cumulative Net Income",
        current: `$${defaultResults.cumulativeNetIncome.toLocaleString()}`,
        taxes: taxesData.cumulativeNetIncome,
        taxFree: `$${taxFreeResults.cumulativeNetIncome.toLocaleString()}`,
      },
      {
        label: "Cumulative Account Balance",
        current: `$${defaultResults.cumulativeAccountBalance.toLocaleString()}`,
        taxes: taxesData.cumulativeAccountBalance,
        taxFree: `$${taxFreeResults.cumulativeAccountBalance.toLocaleString()}`,
      },
      {
        label: "Taxes Due",
        current: `${defaultResults.taxesDue}%`,
        taxes: taxesData.taxesDue,
        taxFree: `${taxFreeResults.taxesDue}%`,
      },
      {
        label: "Death Benefits",
        current: `$${defaultResults.deathBenefits.toLocaleString()}`,
        taxes: taxesData.deathBenefits,
        taxFree: `$${taxFreeResults.deathBenefits.toLocaleString()}`,
      },
      {
        label: "Years You Run Out of Money",
        current: (
          <Input
            type="number"
            value={yearsRunOutOfMoney}
            onChange={handleYearsRunOutOfMoneyChange}
            className="w-20"
            min={0}
            aria-label="Years you run out of money for Current Plan"
          />
        ),
        taxes: taxesData.yearsRunOutOfMoney,
        taxFree: `${taxFreeResults.yearsRunOutOfMoney}`,
      },
    ],
    [defaultResults, taxesData, taxFreeResults, yearsRunOutOfMoney]
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
