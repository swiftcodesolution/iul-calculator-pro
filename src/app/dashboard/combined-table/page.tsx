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
import { runGrossRetirementIncomeLoop, runTaxFreePlanLoop } from "@/lib/utils";

export default function CombinedPlanTable() {
  const {
    tables = [],
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

  // Compute Current Plan results
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

  // Compute Tax-Free Plan results
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

  // Combine results
  const combinedResults = useMemo(() => {
    const maxLength = Math.max(
      currentPlanResults.length,
      taxFreePlanResults.length
    );
    const results = [];

    for (let i = 0; i < maxLength; i++) {
      const current = currentPlanResults[i] || {
        year: i + 1,
        age: parseInput(boxesData.currentAge, 45) + i,
        annualContribution: 0,
        grossRetirementIncome: 0,
        retirementTaxes: 0,
        retirementIncome: 0,
        managementFees: 0,
        interest: 0,
        endOfYearBalance: 0,
        cumulativeIncome: 0,
        cumulativeFees: 0,
        cumulativeTaxesDeferred: 0,
        deathBenefit: 0,
      };
      const taxFree = taxFreePlanResults[i] || {
        annualContributions: 0,
        grossRetirementIncome: 0,
        incomeTax: 0,
        netRetirementIncome: 0,
        annualFees: "0",
        cumulativeNetIncome: 0,
        cumulativeFeesPaid: 0,
        cumulativeTaxesDeferred: 0,
        cumulativeAccountBalance: 0,
        deathBenefits: 0,
      };

      results.push({
        year: current.year,
        age: current.age,
        annualContribution: current.annualContribution,
        tfpAnnualContribution: taxFree.annualContributions,
        grossRetirementIncome: current.grossRetirementIncome,
        retirementTaxes: current.retirementTaxes,
        retirementIncome: current.retirementIncome,
        tfpRetirementIncome: taxFree.netRetirementIncome,
        managementFee: current.managementFees,
        tfpFee: taxFree.annualFees,
        interest: current.interest,
        endOfYearBalance: current.endOfYearBalance,
        tfpCumulativeBalance: taxFree.cumulativeAccountBalance,
        cumulativeIncome: current.cumulativeIncome,
        tfpCumulativeIncome: taxFree.cumulativeNetIncome,
        cumulativeFees: current.cumulativeFees,
        tfpCumulativeFees: taxFree.cumulativeFeesPaid,
        cumulativeTaxesDeferred: current.cumulativeTaxesDeferred,
        deathBenefit: current.deathBenefit,
        tfpDeathBenefit: taxFree.deathBenefits,
      });
    }

    return results;
  }, [currentPlanResults, taxFreePlanResults, boxesData.currentAge]);

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
            Combined Plan Yearly Results
          </h3>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Annual Contribution</TableHead>
                <TableHead>TFP Annual Contribution</TableHead>
                <TableHead>Gross Retirement Income</TableHead>
                <TableHead>Retirement Taxes</TableHead>
                <TableHead>Retirement Income</TableHead>
                <TableHead>TFP Retirement Income</TableHead>
                <TableHead>Management Fee</TableHead>
                <TableHead>TFP Fee</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>End of Year Balance</TableHead>
                <TableHead>TFP Cumulative Balance</TableHead>
                <TableHead>Cumulative Income</TableHead>
                <TableHead>TFP Cumulative Income</TableHead>
                <TableHead>Cumulative Fees</TableHead>
                <TableHead>TFP Cumulative Fees</TableHead>
                <TableHead>Cumulative Taxes Deferred</TableHead>
                <TableHead>Death Benefit</TableHead>
                <TableHead>TFP Death Benefit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedResults.map((result, index) => (
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
                    {formatValue(result.tfpAnnualContribution)}
                  </TableCell>
                  <TableCell>
                    {formatValue(result.grossRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.retirementTaxes)}</TableCell>
                  <TableCell>{formatValue(result.retirementIncome)}</TableCell>
                  <TableCell>
                    {formatValue(result.tfpRetirementIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.managementFee)}</TableCell>
                  <TableCell>{formatValue(result.tfpFee)}</TableCell>
                  <TableCell>{formatValue(result.interest)}</TableCell>
                  <TableCell>{formatValue(result.endOfYearBalance)}</TableCell>
                  <TableCell>
                    {formatValue(result.tfpCumulativeBalance)}
                  </TableCell>
                  <TableCell>{formatValue(result.cumulativeIncome)}</TableCell>
                  <TableCell>
                    {formatValue(result.tfpCumulativeIncome)}
                  </TableCell>
                  <TableCell>{formatValue(result.cumulativeFees)}</TableCell>
                  <TableCell>{formatValue(result.tfpCumulativeFees)}</TableCell>
                  <TableCell>
                    {formatValue(result.cumulativeTaxesDeferred)}
                  </TableCell>
                  <TableCell>{formatValue(result.deathBenefit)}</TableCell>
                  <TableCell>{formatValue(result.tfpDeathBenefit)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
