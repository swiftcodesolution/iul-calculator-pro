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
import { useTableStore } from "@/lib/store";
import { runRetirementPlanLoop } from "@/lib/utils";
// import { BoxesData } from "@/lib/types";

export default function CurrentPlanFullTable() {
  const {
    boxesData = {
      currentAge: "40",
      stopSavingAge: "65",
      retirementAge: "66",
      workingTaxRate: "22",
      retirementTaxRate: "22",
      inflationRate: "2",
      currentPlanFees: "2",
      currentPlanROR: "6",
      taxFreePlanROR: "6",
    },
    yearsRunOutOfMoney = 95,
    startingBalance = 0,
    annualContributions = 10000,
    annualEmployerMatch = 0,
  } = useTableStore();

  // Utility to parse input with fallback
  const parseInput = (
    value: string | number | undefined | null,
    fallback: number
  ): number => {
    if (value == null || value === "") return fallback;
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  // Compute results using runRetirementPlanLoop
  const currentPlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 40),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoney, 95),
      annualContributions: parseInput(annualContributions, 10000),
      currentPlanROR: parseInput(boxesData.currentPlanROR, 6),
      retirementTaxRate: parseInput(boxesData.retirementTaxRate, 22),
      currentPlanFees: parseInput(boxesData.currentPlanFees, 2),
      workingTaxRate: parseInput(boxesData.workingTaxRate, 22),
      startingBalance: parseInput(startingBalance, 0),
      annualEmployerMatch: parseInput(annualEmployerMatch, 0),
      retirementAge: parseInput(boxesData.retirementAge, 66),
      stopSavingAge: parseInput(boxesData.stopSavingAge, 65),
    };

    if (
      inputs.currentAge >= inputs.yearsRunOutOfMoney ||
      inputs.currentAge >= inputs.retirementAge ||
      inputs.currentAge >= inputs.stopSavingAge
    ) {
      return [];
    }

    return runRetirementPlanLoop(
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
  }, [
    boxesData.currentAge,
    boxesData.currentPlanROR,
    boxesData.retirementTaxRate,
    boxesData.currentPlanFees,
    boxesData.workingTaxRate,
    boxesData.retirementAge,
    boxesData.stopSavingAge,
    yearsRunOutOfMoney,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
  ]);

  // Format values for display
  const formatValue = (
    value: number | string | undefined,
    isPercentage: boolean = false
  ): string => {
    if (value == null) return "N/A";
    if (typeof value === "string") return value;
    if (isPercentage) return `${Number(value).toFixed(2)}%`;
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Current Plan Yearly Results</h3>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Age</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Gross Income</TableHead>
                <TableHead>Net Income</TableHead>
                <TableHead>Taxes Due</TableHead>
                <TableHead>Cumulative Taxes Deferred</TableHead>
                <TableHead>Cumulative Taxes Paid</TableHead>
                <TableHead>Cumulative Fees Paid</TableHead>
                <TableHead>Cumulative Net Income</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPlanResults.map((result, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <TableCell>{result.currentAge + index}</TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeAccountBalance)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.grossRetirementIncome)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.netRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.taxesDue, true)}</TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeTaxesDeferred)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeTaxesPaid)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeFeesPaid)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeNetIncome)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
