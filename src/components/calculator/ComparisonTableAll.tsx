"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Results } from "@/lib/types";
import { cn } from "@/lib/utils";

interface YearlyPlanTableProps {
  yearlyResults: Results[];
  highlightedRow: number | null;
  handleCellClick: (rowIndex: number) => void;
}

export function YearlyPlanTable({
  yearlyResults,
  highlightedRow,
  handleCellClick,
}: YearlyPlanTableProps) {
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

  const tableRows = useMemo(
    () => [
      { key: "startingBalance", label: "Starting Balance" },
      { key: "annualContributions", label: "Annual Contributions" },
      { key: "annualEmployerMatch", label: "Annual Employer Match" },
      { key: "annualFees", label: "Annual Fees" },
      { key: "grossRetirementIncome", label: "Gross Retirement Income" },
      { key: "incomeTax", label: "Income Tax" },
      { key: "netRetirementIncome", label: "Net Retirement Income" },
      { key: "cumulativeTaxesDeferred", label: "Cumulative Taxes Deferred" },
      { key: "cumulativeTaxesPaid", label: "Cumulative Taxes Paid" },
      { key: "cumulativeFeesPaid", label: "Cumulative Fees Paid" },
      { key: "cumulativeNetIncome", label: "Cumulative Net Income" },
      { key: "cumulativeAccountBalance", label: "Cumulative Account Balance" },
      { key: "taxesDue", label: "Taxes Due" },
      { key: "deathBenefits", label: "Death Benefits" },
    ],
    []
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Yearly Plan Results</h3>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {yearlyResults.map((result) => (
                <TableHead
                  key={result.xValue}
                  className="bg-blue-200 cursor-pointer text-black transition-colors duration-300"
                >
                  Age {result.xValue}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map(({ key, label }, index) => (
              <motion.tr
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <TableCell
                  className={cn(
                    "border cursor-pointer whitespace-nowrap",
                    highlightedRow === index ? "bg-red-300" : ""
                  )}
                  onClick={() => handleCellClick(index)}
                  aria-selected={highlightedRow === index}
                >
                  {label}
                </TableCell>
                {yearlyResults.map((result) => (
                  <TableCell
                    key={`${key}-${result.xValue}`}
                    className={cn(
                      "border cursor-pointer whitespace-nowrap",
                      highlightedRow === index ? "bg-red-300" : "bg-white",
                      "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleCellClick(index)}
                    aria-selected={highlightedRow === index}
                  >
                    {formatValue(
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
  );
}
