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
import {
  Results,
  TaxesData,
  BoxesData,
  SelectedRowData,
  TotalAdvantage,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  getEmptyResults,
  extractTaxFreeResults,
  runTaxFreePlanLoop,
  runGrossRetirementIncomeLoop,
} from "@/lib/logics";
import { useTableStore } from "@/lib/store";

interface ComparisonTableProps {
  defaultResults?: Results;
  taxesData?: TaxesData;
  columnTextWhite: {
    currentPlan: boolean;
    taxes: boolean;
    taxFreePlan: boolean;
  };
  highlightedRows: Set<number>;
  isTableCollapsed: boolean;
  isTableCardExpanded: boolean;
  currentAge?: number;
  boxesData?: BoxesData;
  setIsTableCollapsed: (value: boolean) => void;
  setIsTableCardExpanded: (value: boolean) => void;
  handleHeaderClick: (column: "currentPlan" | "taxes" | "taxFreePlan") => void;
  handleCellClick: (rowIndex: number) => void;
  onTotalAdvantageChange?: (totalAdvantage: TotalAdvantage) => void;
}

export function ComparisonTable({
  columnTextWhite,
  highlightedRows,
  isTableCollapsed,
  isTableCardExpanded,
  currentAge = 0,
  boxesData = {
    currentAge: 0,
    stopSavingAge: 0,
    retirementAge: 0,
    workingTaxRate: 0,
    retirementTaxRate: 0,
    inflationRate: 0,
    currentPlanFees: 0,
    currentPlanROR: 0,
    taxFreePlanROR: 0,
  },
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleHeaderClick,
  handleCellClick,
  onTotalAdvantageChange,
}: ComparisonTableProps) {
  const {
    tables = [],
    yearsRunOutOfMoney,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    withdrawalAmount,
    iulStartingBalance,
    calculatorAge,
    calculatorTaxRate,
    setYearsRunOutOfMoney,
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
    setIulStartingBalance,
  } = useTableStore();

  // const [hasInitializedIulBalance, setHasInitializedIulBalance] =
  //   useState(false);
  const [lastInputYearsRunOut, setLastInputYearsRunOut] = useState<
    number | string
  >(yearsRunOutOfMoney);
  const [yearsRunOutOfMoneyInput, setYearsRunOutOfMoneyInput] = useState<
    number | string
  >(yearsRunOutOfMoney);
  const [selectedRowData, setSelectedRowData] =
    useState<SelectedRowData | null>(null);
  // const [futureAge, setFutureAge] = useState<number>(currentAge);
  // const [futureAgeInput, setFutureAgeInput] = useState<number | string>(
  //   futureAge
  // );
  // const [futureAgeError, setFutureAgeError] = useState<string | null>(null);
  // const [activeInput, setActiveInput] = useState<
  //   "futureAge" | "yearsRunOutOfMoney" | null
  // >(null);

  const calculateNetWithdrawal = (amount: number | string): number => {
    const amountNum = typeof amount === "number" ? amount : 0;
    const age = parseFloat(String(calculatorAge)) || 45;
    const taxRate = parseFloat(String(calculatorTaxRate)) || 22;
    const penalty = age < 59.5 ? amountNum * 0.1 : 0;
    const taxes = (amountNum - penalty) * (taxRate / 100);
    return amountNum - penalty - taxes;
  };

  useEffect(() => {
    // if (!hasInitializedIulBalance && withdrawalAmount) {
    const netWithdrawal = calculateNetWithdrawal(withdrawalAmount);
    setIulStartingBalance(netWithdrawal);
    // setHasInitializedIulBalance(true);
    // }
  }, [
    withdrawalAmount,
    calculatorAge,
    calculatorTaxRate,
    setIulStartingBalance,
  ]);

  // const isFutureAgeInvalid = (value: string | number): boolean => {
  //   if (value === "") return true;
  //   const numValue = Number(value);
  //   if (isNaN(numValue)) return true;
  //   if (numValue <= currentAge - 1) return true;
  //   return false;
  // };

  // const onFutureAgeChange = (age: number) => {
  //   if (!isNaN(age) || age > currentAge || tables[0]?.data?.length > 0) {
  //     setFutureAge(age);
  //     setFutureAgeInput(age);
  //     setFutureAgeError(null);
  //     const currentPlanTable = runGrossRetirementIncomeLoop(
  //       parseInput(boxesData.currentAge, 0),
  //       parseInput(yearsRunOutOfMoneyInput, 0),
  //       parseInput(annualContributions, 0),
  //       parseInput(boxesData.currentPlanROR, 0),
  //       parseInput(boxesData.retirementTaxRate, 0),
  //       parseInput(boxesData.currentPlanFees, 0),
  //       parseInput(boxesData.workingTaxRate, 0),
  //       parseInput(startingBalance, 0),
  //       parseInput(annualEmployerMatch, 0),
  //       parseInput(boxesData.retirementAge, 0),
  //       parseInput(boxesData.stopSavingAge, 0)
  //     );
  //     const taxFreeTable = runTaxFreePlanLoop(tables, currentAge, age);
  //     const currentRow = currentPlanTable.find((r) => r.age === age);
  //     const taxFreeRow = taxFreeTable.find((r) => r.yearsRunOutOfMoney === age);
  //
  //     const taxesDueSum = currentPlanTable
  //       .filter((row) => {
  //         const inRange =
  //           row.age >= age && row.age <= parseInput(yearsRunOutOfMoneyInput, 0);
  //         console.log(
  //           "Filter: Age",
  //           row.age,
  //           "InRange",
  //           inRange,
  //           "RetirementTaxes",
  //           row.retirementTaxes
  //         );
  //         return inRange;
  //       })
  //       .reduce((sum, row) => sum + row.retirementTaxes, 0);
  //     console.log(
  //       "TaxesDueSum:",
  //       taxesDueSum,
  //       "FutureAge:",
  //       age,
  //       "YearsRunOut:",
  //       yearsRunOutOfMoneyInput
  //     );
  //
  //     if (currentRow && taxFreeRow) {
  //       setSelectedRowData({
  //         current: {
  //           startingBalance: formatValue(startingBalance),
  //           annualContributions: formatValue(annualContributions),
  //           annualEmployerMatch: formatValue(annualEmployerMatch),
  //           annualFees: formatValue(currentPlanResults.annualFees, true),
  //           grossRetirementIncome: formatValue(
  //             currentRow.grossRetirementIncome
  //           ),
  //           incomeTax: formatValue(currentRow.retirementTaxes),
  //           netRetirementIncome: formatValue(currentRow.retirementIncome),
  //           cumulativeTaxesDeferred: formatValue(
  //             currentRow.cumulativeTaxesDeferred
  //           ),
  //           cumulativeTaxesPaid: formatValue(
  //             currentRow.retirementTaxes *
  //               (age - parseInput(boxesData.retirementAge, 0) + 1)
  //           ),
  //           cumulativeFeesPaid: formatValue(currentRow.cumulativeFees),
  //           cumulativeNetIncome: formatValue(currentRow.cumulativeIncome),
  //           cumulativeAccountBalance: formatValue(currentRow.endOfYearBalance),
  //           taxesDue: formatValue(taxesDueSum),
  //           deathBenefits: formatValue(currentRow.deathBenefit),
  //           yearsRunOutOfMoney: formatValue(age),
  //         },
  //         taxFree: {
  //           startingBalance: formatValue(iulStartingBalance),
  //           annualContributions: formatValue(taxFreeRow.annualContributions),
  //           annualEmployerMatch: formatValue(taxFreeRow.annualEmployerMatch),
  //           annualFees: formatValue(taxFreeRow.annualFees),
  //           grossRetirementIncome: formatValue(
  //             taxFreeRow.grossRetirementIncome
  //           ),
  //           incomeTax: formatValue(taxFreeRow.incomeTax),
  //           netRetirementIncome: formatValue(taxFreeRow.netRetirementIncome),
  //           cumulativeTaxesDeferred: formatValue(
  //             taxFreeRow.cumulativeTaxesDeferred
  //           ),
  //           cumulativeTaxesPaid: formatValue(taxFreeRow.cumulativeTaxesPaid),
  //           cumulativeFeesPaid: formatValue(taxFreeRow.cumulativeFeesPaid),
  //           cumulativeNetIncome: formatValue(taxFreeRow.cumulativeNetIncome),
  //           cumulativeAccountBalance: formatValue(
  //             taxFreeRow.cumulativeAccountBalance
  //           ),
  //           taxesDue: formatValue(taxFreeRow.taxesDue),
  //           deathBenefits: formatValue(taxFreeRow.deathBenefits),
  //           yearsRunOutOfMoney: age.toString(),
  //         },
  //       });
  //     } else {
  //       setSelectedRowData(null);
  //     }
  //   } else {
  //     setSelectedRowData(null);
  //     setFutureAgeInput(currentAge);
  //   }
  // };

  const ageOptions = useMemo(() => {
    const mainTable = tables[0]?.data || [];
    const ages = mainTable
      .map((row) => Number(row?.Age))
      .filter((age) => !isNaN(age))
      .sort((a, b) => a - b);
    return [...new Set(ages)];
  }, [tables]);

  // const futureAgeOptions = useMemo(() => {
  //   const start = Number(boxesData.currentAge) || currentAge;
  //   const end = Number(yearsRunOutOfMoney || yearsRunOutOfMoneyInput) || 0;
  //   return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  // }, [
  //   boxesData.currentAge,
  //   yearsRunOutOfMoneyInput,
  //   yearsRunOutOfMoney,
  //   currentAge,
  // ]);

  // const handleFutureAgeChange = (value: string) => {
  //   const age = Number(value);
  //   if (!isNaN(age) && age >= 0) {
  //     setFutureAge(age);
  //     setFutureAgeInput(age);
  //     onFutureAgeChange(age);
  //     setActiveInput("futureAge");
  //   }
  // };

  // const handleFutureAgeInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const value = e.target.value;
  //   setFutureAgeInput(value);
  //   setActiveInput("futureAge");
  //   if (value === "") {
  //     setFutureAgeError("Future age cannot be empty");
  //     setSelectedRowData(null);
  //     return;
  //   }
  //   const numValue = Number(value);
  //   if (isFutureAgeInvalid(numValue)) {
  //     setFutureAgeError("Future age must be greater than current age");
  //     setSelectedRowData(null);
  //   } else {
  //     setFutureAgeError(null);
  //     setFutureAge(numValue);
  //     onFutureAgeChange(numValue);
  //   }
  // };

  const yearsRunOutOfMoneyNumber = Number(yearsRunOutOfMoney);

  useEffect(() => {
    if (ageOptions.length === 0 && yearsRunOutOfMoneyInput !== "") {
      setLastInputYearsRunOut(yearsRunOutOfMoneyInput);
    }
    if (ageOptions.length > 0) {
      const currentYearsRunOut = Number(yearsRunOutOfMoney);
      const lastInputNum = Number(lastInputYearsRunOut);
      if (
        !isNaN(lastInputNum) &&
        lastInputNum > currentAge &&
        ageOptions.includes(lastInputNum)
      ) {
        setYearsRunOutOfMoney(lastInputNum);
        setYearsRunOutOfMoneyInput(lastInputNum);
      } else if (
        isYearsRunOutOfMoneyInvalid(currentYearsRunOut) ||
        !ageOptions.includes(currentYearsRunOut)
      ) {
        const closestAge = ageOptions.reduce((prev, curr) =>
          Math.abs(curr - (lastInputNum || currentAge + 1)) <
          Math.abs(prev - (lastInputNum || currentAge + 1))
            ? curr
            : prev
        );
        setYearsRunOutOfMoney(closestAge);
        setYearsRunOutOfMoneyInput(closestAge);
      }
    }
  }, [
    ageOptions,
    yearsRunOutOfMoney,
    yearsRunOutOfMoneyInput,
    currentAge,
    setYearsRunOutOfMoney,
    lastInputYearsRunOut,
  ]);

  const parseInput = (
    value: string | number | undefined | null,
    fallback: number
  ): number => {
    if (value == null || value === "") return fallback;
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  const isYearsRunOutOfMoneyInvalid = (
    value: string | number | undefined | null
  ): boolean => {
    if (value == null || value === "") return false;
    const numValue = parseFloat(String(value));
    if (isNaN(numValue)) return true;
    if (numValue <= currentAge) return true;
    return false;
  };

  const currentPlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 0),
      retirementAge: parseInput(boxesData.retirementAge, 0),
      stopSavingAge: parseInput(boxesData.stopSavingAge, 0),
      currentPlanROR: parseInput(boxesData.currentPlanROR, 0),
      retirementTaxRate: parseInput(boxesData.retirementTaxRate, 0),
      currentPlanFees: parseInput(boxesData.currentPlanFees, 0),
      workingTaxRate: parseInput(boxesData.workingTaxRate, 0),
      startingBalance: parseInput(startingBalance, 0),
      annualContributions: parseInput(annualContributions, 0),
      annualEmployerMatch: parseInput(annualEmployerMatch, 0),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoneyInput, 0),
    };

    if (
      inputs.currentAge >= inputs.yearsRunOutOfMoney ||
      inputs.currentAge >= inputs.retirementAge ||
      inputs.currentAge >= inputs.stopSavingAge
    ) {
      return {
        startingBalance: 0,
        annualContributions: 0,
        annualEmployerMatch: 0,
        annualFees: 0,
        grossRetirementIncome: 0,
        incomeTax: 0,
        netRetirementIncome: 0,
        cumulativeTaxesDeferred: 0,
        cumulativeTaxesPaid: 0,
        cumulativeFeesPaid: 0,
        cumulativeNetIncome: 0,
        cumulativeAccountBalance: 0,
        taxesDue: 0,
        deathBenefits: 0,
        yearsRunOutOfMoney: inputs.yearsRunOutOfMoney,
      };
    }

    const loopResults = runGrossRetirementIncomeLoop(
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

    const targetResult =
      loopResults.find((result) => result.age === inputs.yearsRunOutOfMoney) ||
      loopResults[loopResults.length - 1] ||
      getEmptyResults();

    const taxesDueSum = loopResults
      .filter((row) => row.age === inputs.yearsRunOutOfMoney)
      .reduce((sum, row) => sum + row.retirementTaxes, 0);

    return {
      xValue: targetResult.age,
      startingBalance: inputs.startingBalance,
      annualContributions: inputs.annualContributions,
      annualEmployerMatch: inputs.annualEmployerMatch,
      annualFees: `${inputs.currentPlanFees.toFixed(2)}%`,
      grossRetirementIncome: targetResult.grossRetirementIncome,
      incomeTax: targetResult.retirementTaxes,
      netRetirementIncome: targetResult.retirementIncome,
      cumulativeTaxesDeferred: targetResult.cumulativeTaxesDeferred,
      cumulativeTaxesPaid:
        targetResult.retirementTaxes *
        (inputs.yearsRunOutOfMoney - inputs.retirementAge + 1),
      cumulativeFeesPaid: targetResult.cumulativeFees,
      cumulativeNetIncome: targetResult.cumulativeIncome,
      cumulativeAccountBalance: targetResult.endOfYearBalance,
      taxesDue: taxesDueSum,
      taxesDuePercentage:
        (targetResult.retirementTaxes / targetResult.grossRetirementIncome) *
        100,
      deathBenefits: targetResult.deathBenefit,
      yearsRunOutOfMoney: inputs.yearsRunOutOfMoney,
      currentAge: inputs.currentAge,
    };
  }, [
    boxesData.currentAge,
    boxesData.currentPlanROR,
    boxesData.retirementTaxRate,
    boxesData.currentPlanFees,
    boxesData.workingTaxRate,
    boxesData.retirementAge,
    boxesData.stopSavingAge,
    yearsRunOutOfMoneyInput,
    yearsRunOutOfMoney,
    annualContributions,
    annualEmployerMatch,
    startingBalance,
    // futureAgeInput,
  ]);

  const taxFreeResults = useMemo(() => {
    const contributionNum = parseInput(annualContributions, 0);
    const taxRateNum = parseInput(calculatorTaxRate, 0);
    const taxes = contributionNum * (taxRateNum / 100);
    const netContribution = contributionNum - taxes;

    if (!tables || !tables[0]?.data || tables[0].data.length === 0) {
      return {
        startingBalance: parseInput(iulStartingBalance, 0),
        annualContributions: netContribution,
        annualEmployerMatch: 0,
        annualFees: 0,
        grossRetirementIncome: 0,
        incomeTax: 0,
        netRetirementIncome: 0,
        cumulativeTaxesDeferred: 0,
        cumulativeTaxesPaid: 0,
        cumulativeFeesPaid: 0,
        cumulativeNetIncome: 0,
        cumulativeAccountBalance: 0,
        taxesDue: 0,
        deathBenefits: 0,
        yearsRunOutOfMoney,
      };
    }
    const results = extractTaxFreeResults(
      tables,
      currentAge,
      yearsRunOutOfMoneyNumber
    );
    return {
      ...results,
      startingBalance: parseInput(iulStartingBalance, results.startingBalance),
    };
  }, [
    tables,
    currentAge,
    yearsRunOutOfMoneyInput,
    yearsRunOutOfMoneyNumber,
    iulStartingBalance,
  ]);

  const handleYearsRunOutOfMoneyChange = (value: string) => {
    const age = Number(value);
    if (!isNaN(age)) {
      setYearsRunOutOfMoney(age);
      setYearsRunOutOfMoneyInput(age);
      setLastInputYearsRunOut(age);
      // setActiveInput("yearsRunOutOfMoney");
      refreshResults();
    }
  };

  const formatInputValue = (value: string | number): string => {
    if (value === "" || value == null) return "";
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "";
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseInputValue = (value: string): number | string => {
    if (value === "") return "";
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(num) || num < 0 ? "0" : num;
  };

  const handleStartingBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInputValue(e.target.value);
    setStartingBalance(value);
  };

  const handleAnnualContributionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInputValue(e.target.value);
    setAnnualContributions(value);
  };

  const handleAnnualEmployerMatchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInputValue(e.target.value);
    setAnnualEmployerMatch(value);
  };

  const handleYearsRunOutOfMoneyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setYearsRunOutOfMoneyInput(value);
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > currentAge) {
      setYearsRunOutOfMoney(numValue);
      // onFutureAgeChange(futureAge);
      // setActiveInput("yearsRunOutOfMoney");
      refreshResults();
    }
  };

  const refreshResults = () => {
    const ageToUse = Number(yearsRunOutOfMoneyInput);

    if (!isNaN(ageToUse) && ageToUse > currentAge) {
      // setFutureAgeError(null);
      const currentPlanTable = runGrossRetirementIncomeLoop(
        parseInput(boxesData.currentAge, 0),
        ageToUse,
        parseInput(annualContributions, 0),
        parseInput(boxesData.currentPlanROR, 0),
        parseInput(boxesData.retirementTaxRate, 0),
        parseInput(boxesData.currentPlanFees, 0),
        parseInput(boxesData.workingTaxRate, 0),
        parseInput(startingBalance, 0),
        parseInput(annualEmployerMatch, 0),
        parseInput(boxesData.retirementAge, 0),
        parseInput(boxesData.stopSavingAge, 0)
      );
      const taxFreeTable = runTaxFreePlanLoop(tables, currentAge, ageToUse);
      const currentRow = currentPlanTable.find((r) => r.age === ageToUse);
      const taxFreeRow = taxFreeTable.find(
        (r) => r.yearsRunOutOfMoney === ageToUse
      );

      const taxesDueSum = currentPlanTable
        .filter((row) => row.age === ageToUse)
        .reduce((sum, row) => sum + row.retirementTaxes, 0);

      if (currentRow && taxFreeRow) {
        setSelectedRowData({
          current: {
            startingBalance: formatValue(startingBalance),
            annualContributions: formatValue(annualContributions),
            annualEmployerMatch: formatValue(annualEmployerMatch),
            annualFees: formatValue(currentPlanResults.annualFees, true),
            grossRetirementIncome: formatValue(
              currentRow.grossRetirementIncome
            ),
            incomeTax: formatValue(currentRow.retirementTaxes),
            netRetirementIncome: formatValue(currentRow.retirementIncome),
            cumulativeTaxesDeferred: formatValue(
              currentRow.cumulativeTaxesDeferred
            ),
            cumulativeTaxesPaid: formatValue(
              currentRow.retirementTaxes *
                (ageToUse - parseInput(boxesData.retirementAge, 0) + 1)
            ),
            cumulativeFeesPaid: formatValue(currentRow.cumulativeFees),
            cumulativeNetIncome: formatValue(currentRow.cumulativeIncome),
            cumulativeAccountBalance: formatValue(currentRow.endOfYearBalance),
            taxesDue: formatValue(taxesDueSum),
            deathBenefits: formatValue(currentRow.deathBenefit),
            yearsRunOutOfMoney: formatValue(ageToUse),
          },
          taxFree: {
            startingBalance: formatValue(taxFreeRow.startingBalance),
            annualContributions: formatValue(taxFreeRow.annualContributions),
            annualEmployerMatch: formatValue(taxFreeRow.annualEmployerMatch),
            annualFees: formatValue(taxFreeRow.annualFees),
            grossRetirementIncome: formatValue(
              taxFreeRow.grossRetirementIncome
            ),
            incomeTax: formatValue(taxFreeRow.incomeTax),
            netRetirementIncome: formatValue(taxFreeRow.netRetirementIncome),
            cumulativeTaxesDeferred: formatValue(
              taxFreeRow.cumulativeTaxesDeferred
            ),
            cumulativeTaxesPaid: formatValue(taxFreeRow.cumulativeTaxesPaid),
            cumulativeFeesPaid: formatValue(taxFreeRow.cumulativeFeesPaid),
            cumulativeNetIncome: formatValue(taxFreeRow.cumulativeNetIncome),
            cumulativeAccountBalance: formatValue(
              taxFreeRow.cumulativeAccountBalance
            ),
            taxesDue: formatValue(taxFreeRow.taxesDue, true),
            deathBenefits: formatValue(taxFreeRow.deathBenefits),
            yearsRunOutOfMoney: ageToUse.toString(),
          },
        });
      } else {
        setSelectedRowData(null);
      }
    } else {
      // setFutureAgeError(
      //   activeInput === "futureAge"
      //     ? isFutureAgeInvalid(futureAgeInput)
      //       ? futureAgeInput === ""
      //         ? "Future age cannot be empty"
      //         : Number(futureAgeInput) <= currentAge
      //         ? "Future age must be greater than current age"
      //         : "Future age cannot exceed year run out of money"
      //       : "Invalid future age"
      //     : isYearsRunOutOfMoneyInvalid(yearsRunOutOfMoneyInput)
      //     ? yearsRunOutOfMoneyInput === ""
      //       ? "year run out of money cannot be empty"
      //       : "year run out of money must be greater than current age"
      //     : "Invalid year run out of money"
      // );
      setSelectedRowData(null);
    }
  };

  const formatValue = (
    value: number | string | undefined,
    isPercentage: boolean = false
  ): string => {
    if (value == null || value === "") return "N/A";
    if (typeof value === "string") {
      const lowered = value.toLowerCase();
      if (["included", "n/a"].includes(lowered)) return lowered;
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return value;
      value = parsed;
    }
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return isPercentage
      ? `${rounded.toFixed(2)}%`
      : `$${rounded.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  const tableRows = useMemo(
    () => [
      {
        label: "Starting Balance",
        current: (
          <Input
            type="text"
            value={formatInputValue(startingBalance)}
            onChange={handleStartingBalanceChange}
            className={`p-1 h-fit w-32 ${
              Number(parseInputValue(String(startingBalance))) < 0
                ? "border-red-500"
                : ""
            }`}
            min={0}
            aria-label="Starting Balance for Current Plan"
          />
        ),
        taxes: "0.00%",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.startingBalance
          : formatValue(taxFreeResults.startingBalance),
      },
      {
        label: "Annual Contributions",
        current: (
          <Input
            type="text"
            value={formatInputValue(annualContributions)}
            onChange={handleAnnualContributionsChange}
            className={`p-1 h-fit w-32 ${
              Number(parseInputValue(String(annualContributions))) < 0
                ? "border-red-500"
                : ""
            }`}
            min={0}
            aria-label="Annual Contributions for Current Plan"
          />
        ),
        taxes: formatValue(parseInput(boxesData.workingTaxRate, 0), true),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.annualContributions
          : formatValue(taxFreeResults.annualContributions),
      },
      {
        label: "Annual Employer Match",
        current: (
          <Input
            type="text"
            value={formatInputValue(annualEmployerMatch)}
            onChange={handleAnnualEmployerMatchChange}
            className={`p-1 h-fit w-32 ${
              Number(parseInputValue(String(annualEmployerMatch))) < 0
                ? "border-red-500"
                : ""
            }`}
            min={0}
            aria-label="Annual Employer Match for Current Plan"
          />
        ),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.annualEmployerMatch
          : formatValue(taxFreeResults.annualEmployerMatch),
      },
      {
        label: "Annual Fees",
        current: selectedRowData
          ? selectedRowData.current.annualFees
          : formatValue(currentPlanResults.annualFees, true),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.annualFees
          : formatValue(taxFreeResults.annualFees),
      },
      {
        label: "Gross Retirement Income",
        current: selectedRowData
          ? selectedRowData.current.grossRetirementIncome
          : formatValue(currentPlanResults.grossRetirementIncome),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.grossRetirementIncome
          : formatValue(taxFreeResults.grossRetirementIncome),
      },
      {
        label: "Income Tax",
        current: selectedRowData
          ? selectedRowData.current.incomeTax
          : formatValue(currentPlanResults.incomeTax),
        taxes: formatValue(parseInput(boxesData.retirementTaxRate, 0), true),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.incomeTax
          : formatValue(taxFreeResults.incomeTax),
      },
      {
        label: "Net Retirement Income",
        current: selectedRowData
          ? selectedRowData.current.netRetirementIncome
          : formatValue(currentPlanResults.netRetirementIncome),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.netRetirementIncome
          : formatValue(taxFreeResults.netRetirementIncome),
      },
      {
        label: "Cumulative Taxes Deferred",
        current: selectedRowData
          ? selectedRowData.current.cumulativeTaxesDeferred
          : formatValue(currentPlanResults.cumulativeTaxesDeferred),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.cumulativeTaxesDeferred
          : formatValue(taxFreeResults.cumulativeTaxesDeferred),
      },
      {
        label: "Cumulative Taxes Paid",
        current: selectedRowData
          ? selectedRowData.current.cumulativeTaxesPaid
          : formatValue(currentPlanResults.cumulativeTaxesPaid),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.cumulativeTaxesPaid
          : formatValue(taxFreeResults.cumulativeTaxesPaid),
      },
      {
        label: "Cumulative Fees Paid",
        current: selectedRowData
          ? selectedRowData.current.cumulativeFeesPaid
          : formatValue(currentPlanResults.cumulativeFeesPaid),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.cumulativeFeesPaid
          : formatValue(taxFreeResults.cumulativeFeesPaid),
      },
      {
        label: "Cumulative Net Income",
        current: selectedRowData
          ? selectedRowData.current.cumulativeNetIncome
          : formatValue(currentPlanResults.cumulativeNetIncome),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.cumulativeNetIncome
          : formatValue(taxFreeResults.cumulativeNetIncome),
      },
      {
        label: "Cumulative Account Balance",
        current: selectedRowData
          ? selectedRowData.current.cumulativeAccountBalance
          : formatValue(currentPlanResults.cumulativeAccountBalance),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.cumulativeAccountBalance
          : formatValue(taxFreeResults.cumulativeAccountBalance),
      },
      {
        label: "Taxes Due",
        current: selectedRowData
          ? selectedRowData.current.taxesDue
          : formatValue(currentPlanResults.taxesDue),
        taxes: selectedRowData
          ? selectedRowData.current.taxesDuePercentage
          : formatValue(currentPlanResults.taxesDuePercentage, true),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.taxesDue
          : formatValue(taxFreeResults.taxesDue),
      },
      {
        label: "Death Benefits",
        current: selectedRowData
          ? selectedRowData.current.deathBenefits
          : formatValue(currentPlanResults.deathBenefits),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.deathBenefits
          : formatValue(taxFreeResults.deathBenefits),
      },
      {
        label: "Years You Run Out of Money",
        current:
          ageOptions.length === 0 ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={yearsRunOutOfMoneyInput}
                onChange={handleYearsRunOutOfMoneyInputChange}
                className={`p-1 h-fit w-32 ${
                  isYearsRunOutOfMoneyInvalid(yearsRunOutOfMoneyInput)
                    ? "border-red-500"
                    : ""
                }`}
                min={currentAge + 1}
                aria-label="Years You Run Out of Money for Current Plan"
              />
              <Button
                size="sm"
                variant="default"
                onClick={refreshResults}
                className="cursor-pointer p-1 h-fit"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                value={String(yearsRunOutOfMoney)}
                onValueChange={handleYearsRunOutOfMoneyChange}
                aria-label="Select years you run out of money for Current Plan"
                disabled={ageOptions.length === 0}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Age" />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((age) => (
                    <SelectItem key={age} value={String(age)}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="default"
                onClick={refreshResults}
                className="cursor-pointer p-1 h-fit"
              >
                Refresh
              </Button>
            </div>
          ),
        taxes: "", // Commented out Future Age input
        // taxes: (
        //   <div className="flex flex-col items-center justify-center gap-0">
        //     <p>Future Age</p>
        //     <div className="w-full max-w-[80px] relative">
        //       <Input
        //         type="text"
        //         value={futureAgeInput}
        //         onChange={handleFutureAgeInputChange}
        //         className={`p-1 h-fit text-center ${
        //           futureAgeError ? "border-red-500" : ""
        //         }`}
        //         aria-label="Future Age for Taxes"
        //         placeholder="Enter age"
        //       />
        //       {futureAgeError && (
        //         <p className="text-red-500 text-sm mt-1 text-wrap">
        //           {futureAgeError}
        //         </p>
        //       )}
        //     </div>
        //   </div>
        // ),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.yearsRunOutOfMoney
          : taxFreeResults.yearsRunOutOfMoney,
      },
    ],
    [
      currentPlanResults,
      boxesData,
      taxFreeResults,
      yearsRunOutOfMoney,
      yearsRunOutOfMoneyInput,
      ageOptions,
      startingBalance,
      annualContributions,
      annualEmployerMatch,
      selectedRowData,
      // futureAge,
      // futureAgeInput,
      currentAge,
    ]
  );

  useEffect(() => {
    // if (
    //   activeInput === "yearsRunOutOfMoney" &&
    //   yearsRunOutOfMoneyInput !== ""
    // ) {
    if (yearsRunOutOfMoneyInput !== "") {
      const currentTaxesPaid = selectedRowData?.current.cumulativeTaxesPaid
        ? parseFloat(
            selectedRowData.current.cumulativeTaxesPaid.replace(/[^0-9.]/g, "")
          )
        : currentPlanResults.cumulativeTaxesPaid;
      const taxFreeTaxesPaid = selectedRowData?.taxFree.cumulativeTaxesPaid
        ? parseFloat(
            selectedRowData.taxFree.cumulativeTaxesPaid.replace(/[^0-9.]/g, "")
          )
        : taxFreeResults.cumulativeTaxesPaid;
      const currentFees = selectedRowData?.current.cumulativeFeesPaid
        ? parseFloat(
            selectedRowData.current.cumulativeFeesPaid.replace(/[^0-9.]/g, "")
          )
        : currentPlanResults.cumulativeFeesPaid;
      const taxFreeFees = selectedRowData?.taxFree.cumulativeFeesPaid
        ? parseFloat(
            selectedRowData.taxFree.cumulativeFeesPaid.replace(/[^0-9.]/g, "")
          )
        : taxFreeResults.cumulativeFeesPaid;
      const currentIncome = selectedRowData?.current.cumulativeNetIncome
        ? parseFloat(
            selectedRowData.current.cumulativeNetIncome.replace(/[^0-9.]/g, "")
          )
        : currentPlanResults.cumulativeNetIncome;
      const taxFreeIncome = selectedRowData?.taxFree.cumulativeNetIncome
        ? parseFloat(
            selectedRowData.taxFree.cumulativeNetIncome.replace(/[^0-9.]/g, "")
          )
        : taxFreeResults.cumulativeNetIncome;
      const currentDeathBenefits = selectedRowData?.current.deathBenefits
        ? parseFloat(
            selectedRowData.current.deathBenefits.replace(/[^0-9.]/g, "")
          )
        : currentPlanResults.deathBenefits;
      const taxFreeDeathBenefits = selectedRowData?.taxFree.deathBenefits
        ? parseFloat(
            selectedRowData.taxFree.deathBenefits.replace(/[^0-9.]/g, "")
          )
        : taxFreeResults.deathBenefits;

      const cumulativeTaxesPaid = Math.abs(taxFreeTaxesPaid - currentTaxesPaid);
      const fees = currentFees - taxFreeFees;
      const cumulativeIncome = taxFreeIncome - currentIncome;
      const deathBenefits = Math.abs(
        taxFreeDeathBenefits - currentDeathBenefits
      );

      const totalAdvantage: TotalAdvantage = {
        total: cumulativeTaxesPaid + fees + cumulativeIncome + deathBenefits,
        cumulativeTaxesPaid,
        fees,
        cumulativeIncome,
        deathBenefits,
      };

      onTotalAdvantageChange?.(totalAdvantage);
    }
  }, [
    yearsRunOutOfMoneyInput,
    selectedRowData,
    currentPlanResults,
    taxFreeResults,
    onTotalAdvantageChange,
  ]);

  useEffect(() => {
    const validStartingBalance = parseInput(startingBalance, 0);
    const validContributions = parseInput(annualContributions, 0);
    const validEmployerMatch = parseInput(annualEmployerMatch, 0);
    setStartingBalance(validStartingBalance);
    setAnnualContributions(validContributions);
    setAnnualEmployerMatch(validEmployerMatch);

    if (isNaN(Number(startingBalance)) || Number(startingBalance) < 0) {
      setStartingBalance(validStartingBalance);
    }
    if (isNaN(Number(annualContributions)) || Number(annualContributions) < 0) {
      setAnnualContributions(validContributions);
    }
    if (isNaN(Number(annualEmployerMatch)) || Number(annualEmployerMatch) < 0) {
      setAnnualEmployerMatch(validEmployerMatch);
    }

    const initialAge = parseInput(yearsRunOutOfMoney, currentAge + 1);
    if (!isYearsRunOutOfMoneyInvalid(initialAge)) {
      setYearsRunOutOfMoney(initialAge);
      setYearsRunOutOfMoneyInput(initialAge);
      setLastInputYearsRunOut(initialAge);
    }
  }, [
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    yearsRunOutOfMoney,
    currentAge,
  ]);

  return (
    <AnimatePresence>
      {!isTableCardExpanded ? (
        <Card className="p-2 gap-2 grow">
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer p-0"
            onClick={() => setIsTableCollapsed(!isTableCollapsed)}
            aria-label="Toggle table visibility"
          >
            <h3 className="text-lg font-semibold">Comparison Table</h3>
            {/* {activeInput && (
              <p
                className={cn(
                  "text-sm",
                  activeInput === "futureAge"
                    ? "text-zinc-900"
                    : "text-zinc-900"
                )}
              >
                Data displayed based on{" "}
                {activeInput === "futureAge"
                  ? `Future Age: ${futureAge}`
                  : `year run out of money: ${yearsRunOutOfMoney}`}
              </p>
            )} */}
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
          <CardContent className="p-0 h-full">
            <Table className="w-full table-fixed text-sm h-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]"></TableHead>
                  <TableHead
                    className={cn(
                      "bg-red-200 cursor-pointer text-center",
                      columnTextWhite.currentPlan
                        ? "text-red-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("currentPlan")}
                    aria-label="Toggle Current Plan column text color"
                  >
                    Current Plan <br />
                    <span className="text-sm">TSP, 401k, 403b, IRA</span>
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-yellow-200 cursor-pointer text-center w-[100px]",
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
                      "bg-green-200 cursor-pointer text-center",
                      columnTextWhite.taxFreePlan
                        ? "text-green-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("taxFreePlan")}
                    aria-label="Toggle Tax Free Plan column text color"
                  >
                    Tax Free Plan
                    <br /> <span className="text-sm">IRS (IRC) 7702</span>
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
                        highlightedRows.has(index)
                          ? "bg-[#ffa1ad] text-black"
                          : ""
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRows.has(index)}
                    >
                      {label}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRows.has(index)
                          ? "bg-[#ffa1ad] text-black"
                          : "",
                        columnTextWhite.currentPlan
                          ? "text-white opacity-0"
                          : "",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRows.has(index)}
                    >
                      {current}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap text-center",
                        highlightedRows.has(index)
                          ? "bg-[#ffa1ad] text-black"
                          : "",
                        columnTextWhite.taxes
                          ? "text-white opacity-0"
                          : "text-red-600",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRows.has(index)}
                    >
                      {taxes}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRows.has(index) ? "bg-[#ffa1ad]" : "",
                        columnTextWhite.taxFreePlan
                          ? "text-white opacity-0"
                          : "",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRows.has(index)}
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
          className="fixed inset-0 z-50 p-6 flex flex-col"
        >
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Comparison Table</h3>
              {/* {activeInput && (
                <p
                  className={cn(
                    "text-sm",
                    activeInput === "futureAge" ? "" : ""
                  )}
                >
                  Data displayed based on{" "}
                  {activeInput === "futureAge"
                    ? `Future Age: ${futureAge}`
                    : `year run out of money: ${yearsRunOutOfMoney}`}
                </p>
              )} */}
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
                            highlightedRows.has(index) ? "bg-[#ffa1ad]" : ""
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRows.has(index)}
                        >
                          {label}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRows.has(index) ? "bg-[#ffa1ad]" : "",
                            columnTextWhite.currentPlan
                              ? "text-white opacity-0"
                              : "",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRows.has(index)}
                        >
                          {current}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRows.has(index) ? "bg-[#ffa1ad]" : "",
                            columnTextWhite.taxes
                              ? "text-white opacity-0"
                              : "text-red-600",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRows.has(index)}
                        >
                          {taxes}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRows.has(index) ? "bg-[#ffa1ad]" : "",
                            columnTextWhite.taxFreePlan
                              ? "text-white opacity-0"
                              : "",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRows.has(index)}
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
