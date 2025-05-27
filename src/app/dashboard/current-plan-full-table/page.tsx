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
import { runGrossRetirementIncomeLoop } from "@/lib/logics";

export default function CurrentPlanFullTable() {
  const {
    boxesData = {
      currentAge: "45",
      stopSavingAge: "65",
      retirementAge: "66",
      workingTaxRate: "22",
      retirementTaxRate: "22",
      inflationRate: "2",
      currentPlanFees: "2",
      currentPlanROR: "6.3",
      taxFreePlanROR: "6",
    },
    yearsRunOutOfMoney = 95,
    startingBalance = 0,
    annualContributions = 12821,
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

  // Compute results using runGrossRetirementIncomeLoop
  const currentPlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 45),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoney, 95),
      annualContributions: parseInput(annualContributions, 12821),
      currentPlanROR: parseInput(boxesData.currentPlanROR, 6.3),
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

    return runGrossRetirementIncomeLoop(
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
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Annual Contributions</TableHead>
                <TableHead>Gross Retirement Income</TableHead>
                <TableHead>Retirement Taxes</TableHead>
                <TableHead>Retirement Income</TableHead>
                <TableHead>Management Fee</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>End of Year Balance</TableHead>
                <TableHead>Cumulative Income</TableHead>
                <TableHead>Cumulative Fees</TableHead>
                <TableHead>Cumulative Taxes Deferred</TableHead>
                <TableHead>Death Benefit</TableHead>
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
                  <TableCell>{result.year}</TableCell>
                  <TableCell>{result.age}</TableCell>
                  <TableCell>
                    {formatValue(result.annualContribution)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.grossRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.retirementTaxes)}</TableCell>
                  <TableCell>{formatValue(result.retirementIncome)}</TableCell>
                  <TableCell>{formatValue(result.managementFees)}</TableCell>
                  <TableCell>{formatValue(result.interest)}</TableCell>
                  <TableCell>{formatValue(result.endOfYearBalance)}</TableCell>
                  <TableCell>{formatValue(result.cumulativeIncome)}</TableCell>
                  <TableCell>{formatValue(result.cumulativeFees)}</TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeTaxesDeferred)}
                  </TableCell>
                  <TableCell>{formatValue(result.deathBenefit)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
