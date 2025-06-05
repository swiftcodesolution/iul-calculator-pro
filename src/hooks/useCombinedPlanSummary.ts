// hooks/useCombinedPlanSummary.ts
import { useMemo } from "react";
import { useTableStore } from "@/lib/store";
import { runGrossRetirementIncomeLoop, runTaxFreePlanLoop } from "@/lib/logics";

import type { CombinedResult } from "@/lib/types"; // or wherever it's defined

function sumCombinedTableColumns(
  results: CombinedResult[]
): Record<string, number> {
  const sums: Record<string, number> = {
    annualContribution: 0,
    tfpAnnualContribution: 0,
    grossRetirementIncome: 0,
    retirementTaxes: 0,
    retirementIncome: 0,
    tfpRetirementIncome: 0,
    managementFee: 0,
    interest: 0,
    endOfYearBalance: 0,
    tfpCumulativeBalance: 0,
    cumulativeIncome: 0,
    tfpCumulativeIncome: 0,
    cumulativeFees: 0,
    tfpCumulativeFees: 0,
    cumulativeTaxesDeferred: 0,
    deathBenefit: 0,
    tfpDeathBenefit: 0,
  };

  results.forEach((row) => {
    sums.annualContribution += Number(row.annualContribution) || 0;
    sums.tfpAnnualContribution += Number(row.tfpAnnualContribution) || 0;
    sums.grossRetirementIncome += Number(row.grossRetirementIncome) || 0;
    sums.retirementTaxes += Number(row.retirementTaxes) || 0;
    sums.retirementIncome += Number(row.retirementIncome) || 0;
    sums.tfpRetirementIncome += Number(row.tfpRetirementIncome) || 0;
    sums.managementFee += Number(row.managementFee) || 0;
    sums.interest += Number(row.interest) || 0;
    sums.endOfYearBalance += Number(row.endOfYearBalance) || 0;
    sums.tfpCumulativeBalance += Number(row.tfpCumulativeBalance) || 0;
    sums.cumulativeIncome += Number(row.cumulativeIncome) || 0;
    sums.tfpCumulativeIncome += Number(row.tfpCumulativeIncome) || 0;
    sums.cumulativeFees += Number(row.cumulativeFees) || 0;
    sums.tfpCumulativeFees += Number(row.tfpCumulativeFees) || 0;
    sums.cumulativeTaxesDeferred += Number(row.cumulativeTaxesDeferred) || 0;
    sums.deathBenefit += Number(row.deathBenefit) || 0;
    sums.tfpDeathBenefit += Number(row.tfpDeathBenefit) || 0;
  });

  return sums;
}

export function useCombinedPlanSummary(): Record<string, number> {
  const {
    tables = [],
    boxesData,
    yearsRunOutOfMoney = 0,
    startingBalance = 0,
    annualContributions = 0,
    annualEmployerMatch = 0,
  } = useTableStore();

  const parseInput = (
    value: string | number | undefined | null,
    fallback: number
  ): number => {
    if (value == null || value === "") return fallback;
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  const currentPlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 0),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoney, 0),
      annualContributions: parseInput(annualContributions, 0),
      currentPlanROR: parseInput(boxesData.currentPlanROR, 0),
      retirementTaxRate: parseInput(boxesData.retirementTaxRate, 0),
      currentPlanFees: parseInput(boxesData.currentPlanFees, 0),
      workingTaxRate: parseInput(boxesData.workingTaxRate, 0),
      startingBalance: parseInput(startingBalance, 0),
      annualEmployerMatch: parseInput(annualEmployerMatch, 0),
      retirementAge: parseInput(boxesData.retirementAge, 0),
      stopSavingAge: parseInput(boxesData.stopSavingAge, 0),
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
    boxesData,
    yearsRunOutOfMoney,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
  ]);

  const taxFreePlanResults = useMemo(() => {
    const currentAge = parseInput(boxesData.currentAge, 0);

    const yearsRunOutOfMoneyNumber = Number(yearsRunOutOfMoney);
    if (currentAge >= yearsRunOutOfMoneyNumber) return [];

    return runTaxFreePlanLoop(tables, currentAge, yearsRunOutOfMoneyNumber);
  }, [tables, boxesData.currentAge, yearsRunOutOfMoney]);

  const combinedResults = useMemo(() => {
    const maxLength = Math.max(
      currentPlanResults.length,
      taxFreePlanResults.length
    );
    const results: CombinedResult[] = [];

    for (let i = 0; i < maxLength; i++) {
      const current = currentPlanResults[i] || {
        year: i + 1,
        age: parseInput(boxesData.currentAge, 0) + i,
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

  return sumCombinedTableColumns(combinedResults);
}
