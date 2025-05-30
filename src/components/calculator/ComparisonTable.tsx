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
import { Results, TaxesData, BoxesData, SelectedRowData } from "@/lib/types";
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
}

export function ComparisonTable({
  columnTextWhite,
  highlightedRows,
  isTableCollapsed,
  isTableCardExpanded,
  currentAge = 40,
  boxesData = {
    currentAge: 40,
    stopSavingAge: 65,
    retirementAge: 66,
    workingTaxRate: 22,
    retirementTaxRate: 22,
    inflationRate: 0,
    currentPlanFees: 2,
    currentPlanROR: 6.3,
    taxFreePlanROR: 6.3,
  },
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleHeaderClick,
  handleCellClick,
}: ComparisonTableProps) {
  const {
    tables = [],
    yearsRunOutOfMoney = 95,
    setYearsRunOutOfMoney,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
  } = useTableStore();

  const [yearsRunOutOfMoneyInput, setYearsRunOutOfMoneyInput] = useState<
    number | string
  >(yearsRunOutOfMoney);

  const [futureAge, setFutureAge] = useState<number>(currentAge);
  const [futureAgeInput, setFutureAgeInput] = useState<number | string>(
    futureAge
  );
  const [selectedRowData, setSelectedRowData] =
    useState<SelectedRowData | null>(null);

  const [activeInput, setActiveInput] = useState<
    "futureAge" | "yearsRunOutOfMoney" | null
  >(null);

  const [futureAgeError, setFutureAgeError] = useState<string | null>(null);

  const isFutureAgeInvalid = (value: string | number): boolean => {
    if (value === "") return true;
    const numValue = Number(value);
    if (isNaN(numValue)) return true;
    if (numValue <= currentAge - 1) return true;
    if (numValue > Number(yearsRunOutOfMoney || yearsRunOutOfMoneyInput))
      return true;
    return false;
  };

  const onFutureAgeChange = (age: number) => {
    console.log("onFutureAgeChange called with age:", age, "tables:", tables);
    if (!isNaN(age) || age > currentAge || tables[0]?.data?.length > 0) {
      setFutureAge(age);
      setFutureAgeInput(age);
      const currentPlanTable = runGrossRetirementIncomeLoop(
        parseInput(boxesData.currentAge, 40),
        parseInput(yearsRunOutOfMoneyInput, 95),
        parseInput(annualContributions, 10000),
        parseInput(boxesData.currentPlanROR, 6),
        parseInput(boxesData.retirementTaxRate, 22),
        parseInput(boxesData.currentPlanFees, 2),
        parseInput(boxesData.workingTaxRate, 22),
        parseInput(startingBalance, 0),
        parseInput(annualEmployerMatch, 0),
        parseInput(boxesData.retirementAge, 66),
        parseInput(boxesData.stopSavingAge, 65)
      );
      const taxFreeTable = runTaxFreePlanLoop(tables, currentAge, age);
      const currentRow = currentPlanTable.find((r) => r.age === age);
      const taxFreeRow = taxFreeTable.find((r) => r.yearsRunOutOfMoney === age);

      console.log("Rows found:", { currentRow, taxFreeRow });

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
                (age - parseInput(boxesData.retirementAge, 66) + 1)
            ),
            cumulativeFeesPaid: formatValue(currentRow.cumulativeFees),
            cumulativeNetIncome: formatValue(currentRow.cumulativeIncome),
            cumulativeAccountBalance: formatValue(currentRow.endOfYearBalance),
            taxesDue: formatValue(currentPlanResults.taxesDue, true),
            deathBenefits: formatValue(currentRow.deathBenefit),
            yearsRunOutOfMoney: formatValue(age),
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
            yearsRunOutOfMoney: age.toString(),
          },
        });
      } else {
        setSelectedRowData(null);

        console.log("No matching rows for age:", age);
      }
    } else {
      setSelectedRowData(null);
      setFutureAge(currentAge);
      setFutureAgeInput(currentAge);
    }
  };
  // 26 monday

  const ageOptions = useMemo(() => {
    const mainTable = tables[0]?.data || [];
    const ages = mainTable
      .map((row) => Number(row?.Age))
      .filter((age) => !isNaN(age))
      .sort((a, b) => a - b);
    return [...new Set(ages)];
  }, [tables]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const futureAgeOptions = useMemo(() => {
    const start = Number(boxesData.currentAge) || currentAge;
    const end = Number(yearsRunOutOfMoney || yearsRunOutOfMoneyInput) || 95;
    console.log("Future age options:", { start, end });
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [
    boxesData.currentAge,
    yearsRunOutOfMoneyInput,
    yearsRunOutOfMoney,
    currentAge,
  ]);

  // const isFutureAgeInvalid = (
  //   value: string | number | undefined | null
  // ): boolean => {
  //   if (value == null || value === "") return false;
  //   const numValue = parseFloat(String(value));
  //   if (isNaN(numValue)) return true;
  //   if (numValue <= currentAge) return true;
  //   return false;
  // };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFutureAgeChange = (value: string) => {
    const age = Number(value);
    console.log("Selected futureAge:", age);
    if (!isNaN(age) && age >= 0) {
      setFutureAge(age);
      setFutureAgeInput(age);
      onFutureAgeChange(age);
      setActiveInput("futureAge");
    }
  };

  // const handleFutureAgeInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const value = e.target.value;
  //   setFutureAgeInput(value);
  //   const numValue = Number(value);
  //   if (!isNaN(numValue) && numValue > currentAge) {
  //     onFutureAgeChange(numValue);
  //   } else {
  //     setSelectedRowData(null);
  //     setFutureAge(currentAge + 1);
  //   }
  // };

  const handleFutureAgeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFutureAgeInput(value);
    setActiveInput("futureAge");

    if (value === "") {
      setFutureAgeError("Future age cannot be empty");
      setSelectedRowData(null);
      return;
    }

    const numValue = Number(value);
    if (isFutureAgeInvalid(numValue)) {
      if (numValue <= currentAge) {
        setFutureAgeError("Future age must be greater than current age");
      } else if (
        numValue > Number(yearsRunOutOfMoney || yearsRunOutOfMoneyInput)
      ) {
        setFutureAgeError("Future age cannot exceed years run out of money");
      } else {
        setFutureAgeError("Invalid future age");
      }
      setSelectedRowData(null);
    } else {
      setFutureAgeError(null);
      setFutureAge(numValue);
      onFutureAgeChange(numValue);
    }
  };

  useEffect(() => {
    if (ageOptions.length > 0 && !ageOptions.includes(yearsRunOutOfMoney)) {
      const newAge = ageOptions[0] || 95;
      setYearsRunOutOfMoney(newAge);
      setYearsRunOutOfMoneyInput(newAge);
    }
  }, [ageOptions, yearsRunOutOfMoney, setYearsRunOutOfMoney]);

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

  // Validation function for yearsRunOutOfMoneyInput
  const isYearsRunOutOfMoneyInvalid = (
    value: string | number | undefined | null
  ): boolean => {
    if (value == null || value === "") return false;
    const numValue = parseFloat(String(value));
    if (isNaN(numValue)) return true;
    if (numValue <= currentAge) return true;
    return false;
  };

  // Compute 401(k) results for Current Plan (red column) with fallback values
  const currentPlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 45),
      retirementAge: parseInput(boxesData.retirementAge, 66),
      stopSavingAge: parseInput(boxesData.stopSavingAge, 65),
      currentPlanROR: parseInput(boxesData.currentPlanROR, 6),
      retirementTaxRate: parseInput(boxesData.retirementTaxRate, 22),
      currentPlanFees: parseInput(boxesData.currentPlanFees, 2),
      workingTaxRate: parseInput(boxesData.workingTaxRate, 22),
      startingBalance: parseInput(startingBalance, 0),
      annualContributions: parseInput(annualContributions, 45),
      annualEmployerMatch: parseInput(annualEmployerMatch, 0),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoneyInput, 95),
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
      // taxesDue:
      //   targetResult.grossRetirementIncome > 0
      //     ? (targetResult.retirementTaxes /
      //         targetResult.grossRetirementIncome) *
      //       100
      //     : 0,
      taxesDue:
        (targetResult.retirementTaxes / targetResult.grossRetirementIncome) *
        100,
      // taxesDue: boxesData.currentPlanFees,
      deathBenefits: targetResult.deathBenefit,
      yearsRunOutOfMoney: inputs.yearsRunOutOfMoney,
      currentAge: inputs.currentAge,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  ]);

  // Handle missing tables data during SSG
  const taxFreeResults = useMemo(() => {
    if (!tables || !tables[0]?.data || tables[0].data.length === 0) {
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
        yearsRunOutOfMoney,
      };
    }
    return extractTaxFreeResults(tables, currentAge, yearsRunOutOfMoney);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables, currentAge, yearsRunOutOfMoneyInput, yearsRunOutOfMoney]);

  const handleYearsRunOutOfMoneyChange = (value: string) => {
    const age = Number(value);
    if (!isNaN(age)) {
      setYearsRunOutOfMoney(age);
      setYearsRunOutOfMoneyInput(age);
      onFutureAgeChange(age);
      setActiveInput("yearsRunOutOfMoney");
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
      onFutureAgeChange(futureAge);
      setActiveInput("yearsRunOutOfMoney");
    }
  };

  // 29 MAY
  const refreshResults = () => {
    const ageToUse =
      activeInput === "futureAge"
        ? Number(futureAgeInput)
        : Number(yearsRunOutOfMoneyInput);

    const maxAge = Number(yearsRunOutOfMoneyInput); // Convert to number explicitly

    if (!isNaN(ageToUse) && ageToUse > currentAge && ageToUse <= maxAge) {
      setFutureAgeError(null);
      setFutureAge(ageToUse);
      setYearsRunOutOfMoney(ageToUse);
      setYearsRunOutOfMoneyInput(ageToUse);

      // Run calculation for Current Plan
      const currentPlanTable = runGrossRetirementIncomeLoop(
        parseInput(boxesData.currentAge, 40),
        ageToUse,
        parseInput(annualContributions, 10000),
        parseInput(boxesData.currentPlanROR, 6),
        parseInput(boxesData.retirementTaxRate, 22),
        parseInput(boxesData.currentPlanFees, 2),
        parseInput(boxesData.workingTaxRate, 22),
        parseInput(startingBalance, 0),
        parseInput(annualEmployerMatch, 0),
        parseInput(boxesData.retirementAge, 66),
        parseInput(boxesData.stopSavingAge, 65)
      );

      // Find row for Current Plan
      const currentRow = currentPlanTable.find((r) => r.age === ageToUse);

      // Get Tax Free Plan data
      const taxFreeTable = runTaxFreePlanLoop(tables, currentAge, ageToUse);
      const taxFreeRow = taxFreeTable.find(
        (r) => r.yearsRunOutOfMoney === ageToUse
      );

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
                (ageToUse - parseInput(boxesData.retirementAge, 66) + 1)
            ),
            cumulativeFeesPaid: formatValue(currentRow.cumulativeFees),
            cumulativeNetIncome: formatValue(currentRow.cumulativeIncome),
            cumulativeAccountBalance: formatValue(currentRow.endOfYearBalance),
            taxesDue: formatValue(currentPlanResults.taxesDue, true),
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
      setFutureAgeError(
        activeInput === "futureAge"
          ? isFutureAgeInvalid(futureAgeInput)
            ? futureAgeInput === ""
              ? "Future age cannot be empty"
              : Number(futureAgeInput) <= currentAge
              ? "Future age must be greater than current age"
              : "Future age cannot exceed years run out of money"
            : "Invalid future age"
          : isYearsRunOutOfMoneyInvalid(yearsRunOutOfMoneyInput)
          ? yearsRunOutOfMoneyInput === ""
            ? "Years run out of money cannot be empty"
            : "Years run out of money must be greater than current age"
          : "Invalid years run out of money"
      );
      setSelectedRowData(null);
    }
  };
  // 29 MAY

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
            className={`w-32 ${
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
            className={`w-32 ${
              Number(parseInputValue(String(annualContributions))) < 0
                ? "border-red-500"
                : ""
            }`}
            min={0}
            aria-label="Annual Contributions for Current Plan"
          />
        ),

        taxes: formatValue(parseInput(boxesData.workingTaxRate, 22), true),

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
            className={`w-32 ${
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

        taxes: formatValue(parseInput(boxesData.retirementTaxRate, 28), true),

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
          : formatValue(currentPlanResults.taxesDue, true),

        taxes: "",

        taxFree: selectedRowData
          ? selectedRowData.taxFree.taxesDue
          : formatValue(taxFreeResults.taxesDue, true),
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
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={yearsRunOutOfMoneyInput}
                onChange={handleYearsRunOutOfMoneyInputChange}
                className={`w-32 ${
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
                className="cursor-pointer"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
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
                className="cursor-pointer"
              >
                Refresh
              </Button>
            </div>
          ),

        taxes: (
          // <div className="flex items-center justify-center gap-4 text-black">
          //   <p>Future Age</p>
          //   <Select
          //     value={String(futureAge)}
          //     onValueChange={handleFutureAgeChange}
          //     aria-label="Select future age for Taxes"
          //     // disabled={futureAgeOptions.length === 0}
          //   >
          //     <SelectTrigger className="">
          //       <SelectValue placeholder="Select Age" />
          //     </SelectTrigger>
          //     <SelectContent>
          //       {futureAgeOptions.map((age) => (
          //         <SelectItem key={age} value={String(age)}>
          //           {age}
          //         </SelectItem>
          //       ))}
          //     </SelectContent>
          //   </Select>
          // </div>

          <div className="flex flex-col items-center justify-center gap-2 text-black">
            <p>Future Age</p>
            <div className="w-[160px] relative">
              <Input
                type="text"
                value={futureAgeInput}
                onChange={handleFutureAgeInputChange}
                className={`text-center ${
                  futureAgeError ? "border-red-500" : ""
                }`}
                aria-label="Future Age for Taxes"
                placeholder="Enter age"
              />
              {futureAgeError && (
                <p className="text-red-500 text-xs mt-1 text-wrap">
                  {futureAgeError}
                </p>
              )}
            </div>
          </div>
        ),

        taxFree: selectedRowData
          ? selectedRowData.taxFree.yearsRunOutOfMoney
          : taxFreeResults.yearsRunOutOfMoney,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      futureAge,
      futureAgeInput,
      currentAge,
    ]
  );

  return (
    <AnimatePresence>
      {!isTableCardExpanded ? (
        <Card className="p-2 gap-2">
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer p-0"
            onClick={() => setIsTableCollapsed(!isTableCollapsed)}
            aria-label="Toggle table visibility"
          >
            <h3 className="text-lg font-semibold">Comparison Table</h3>
            {activeInput && (
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
                  : `Years Run Out of Money: ${yearsRunOutOfMoney}`}
              </p>
            )}
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
          <CardContent className="p-0">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
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
                    <span className="text-xs">TSP, 401k, 403b, IRA</span>
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-yellow-200 cursor-pointer text-center w-[180px]",
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
                    <br /> <span className="text-xs">IRS (IRC) 7702</span>
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
                        highlightedRows.has(index)
                          ? "bg-[#ffa1ad]"
                          : "bg-white",
                        columnTextWhite.currentPlan
                          ? "text-white opacity-0"
                          : "text-black",
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
                          ? "bg-[#ffa1ad]"
                          : "bg-white",
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
                        highlightedRows.has(index)
                          ? "bg-[#ffa1ad]"
                          : "bg-white",
                        columnTextWhite.taxFreePlan
                          ? "text-white opacity-0"
                          : "text-black",
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
          className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
        >
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Comparison Table</h3>
              {activeInput && (
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
                    : `Years Run Out of Money: ${yearsRunOutOfMoney}`}
                </p>
              )}
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
                            highlightedRows.has(index)
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.currentPlan
                              ? "text-white opacity-0"
                              : "text-black",
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
                            highlightedRows.has(index)
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
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
                            highlightedRows.has(index)
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.taxFreePlan
                              ? "text-white opacity-0"
                              : "text-black",
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
