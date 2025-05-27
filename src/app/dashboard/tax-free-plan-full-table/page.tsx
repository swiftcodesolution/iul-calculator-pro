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
import { runTaxFreePlanLoop } from "@/lib/logics";

export default function TaxFreePlanFullTable() {
  const {
    tables = [],
    yearsRunOutOfMoney = 95,
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

  // Compute results using runTaxFreePlanLoop
  const taxFreePlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 45),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoney, 95),
    };

    if (inputs.currentAge >= inputs.yearsRunOutOfMoney) {
      return [];
    }

    return runTaxFreePlanLoop(
      tables,
      inputs.currentAge,
      inputs.yearsRunOutOfMoney
    );
  }, [tables, boxesData.currentAge, yearsRunOutOfMoney]);

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
          <h3 className="text-lg font-semibold">
            Tax-Free Plan Yearly Results
          </h3>
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
                <TableHead>Cumulative Income</TableHead>
                <TableHead>Cumulative Fees</TableHead>
                <TableHead>Cumulative Taxes Deferred</TableHead>
                <TableHead>End of Year Balance</TableHead>
                <TableHead>Death Benefit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxFreePlanResults.map((result, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <TableCell>{result.currentAge + index}</TableCell>
                  <TableCell>{result.currentAge + index}</TableCell>
                  <TableCell>
                    {formatValue(result.annualContributions)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.grossRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.incomeTax)}</TableCell>
                  <TableCell>
                    {formatValue(result.netRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.annualFees)}</TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeNetIncome)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeFeesPaid)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeTaxesDeferred)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeAccountBalance)}
                  </TableCell>
                  <TableCell>{formatValue(result.deathBenefits)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
