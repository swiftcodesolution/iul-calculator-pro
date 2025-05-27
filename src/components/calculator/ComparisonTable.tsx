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
  highlightedRow: number | null;
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
  highlightedRow,
  isTableCollapsed,
  isTableCardExpanded,
  currentAge = 40,
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

  const [futureAge, setFutureAge] = useState<number>(currentAge + 1);
  const [futureAgeInput, setFutureAgeInput] = useState<number | string>(
    futureAge
  );
  const [selectedRowData, setSelectedRowData] =
    useState<SelectedRowData | null>(null);

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
            yearsRunOutOfMoney: formatValue(age),
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

  const handleFutureAgeChange = (value: string) => {
    const age = Number(value);
    console.log("Selected futureAge:", age);
    if (!isNaN(age) && age >= 0) {
      setFutureAge(age);
      setFutureAgeInput(age);
      onFutureAgeChange(age);
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
      taxesDue:
        targetResult.grossRetirementIncome > 0
          ? (targetResult.retirementTaxes /
              targetResult.grossRetirementIncome) *
            100
          : 0,
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
  }, [tables, currentAge, yearsRunOutOfMoney]);

  const handleYearsRunOutOfMoneyChange = (value: string) => {
    const age = Number(value);
    if (!isNaN(age)) {
      setYearsRunOutOfMoney(age);
      setYearsRunOutOfMoneyInput(age);
    }
  };

  const handleStartingBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setStartingBalance(
      value === "" ? "" : Number(value) >= 0 ? Number(value) : ""
    );
  };

  const handleAnnualContributionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setAnnualContributions(
      value === "" ? "" : Number(value) >= 0 ? Number(value) : ""
    );
  };

  const handleAnnualEmployerMatchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setAnnualEmployerMatch(
      value === "" ? "" : Number(value) >= 0 ? Number(value) : ""
    );
  };

  const handleYearsRunOutOfMoneyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setYearsRunOutOfMoneyInput(value);
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > currentAge) {
      setYearsRunOutOfMoney(numValue);
    }
  };

  const formatValue = (
    value: number | string | undefined,
    isPercentage: boolean = false
  ): string => {
    if (value == null) return "N/A";
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
      {
        label: "Starting Balance",
        current: (
          <Input
            type="number"
            value={startingBalance}
            onChange={handleStartingBalanceChange}
            className={`w-32 ${
              Number(startingBalance) < 0 ? "border-red-500" : ""
            }`}
            min={0}
            aria-label="Starting Balance for Current Plan"
          />
        ),
        taxes: "",
        taxFree: selectedRowData
          ? selectedRowData.taxFree.startingBalance
          : formatValue(taxFreeResults.startingBalance),
      },
      {
        label: "Annual Contributions",
        current: (
          <Input
            type="number"
            value={annualContributions}
            onChange={handleAnnualContributionsChange}
            className={`w-32 ${
              Number(annualContributions) < 0 ? "border-red-500" : ""
            }`}
            min={0}
            aria-label="Annual Contributions for Current Plan"
          />
        ),
        taxes: formatValue(boxesData.workingTaxRate, true),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.annualContributions
          : formatValue(taxFreeResults.annualContributions),
      },
      {
        label: "Annual Employer Match",
        current: (
          <Input
            type="number"
            value={annualEmployerMatch}
            onChange={handleAnnualEmployerMatchChange}
            className={`w-32 ${
              Number(annualEmployerMatch) < 0 ? "border-red-500" : ""
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
        taxes: formatValue(boxesData.retirementTaxRate, true),
        taxFree: selectedRowData
          ? selectedRowData.taxFree.incomeTax
          : formatValue(taxFreeResults.incomeTax),
      },
      {
        label: "Net Retirement Income",
        current: selectedRowData
          ? selectedRowData.current.netRetirementIncome
          : formatValue(currentPlanResults.netRetirementIncome),
        taxes: formatValue(boxesData.retirementTaxRate, true),
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
        taxes: formatValue(boxesData.retirementTaxRate, true),
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
        taxes: formatValue(boxesData.retirementTaxRate, true),
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
          ) : (
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
          ),
        taxes: (
          <div className="flex items-center gap-4 text-black">
            <p>Future Age</p>
            <Select
              value={String(futureAge)}
              onValueChange={handleFutureAgeChange}
              aria-label="Select future age for Taxes"
              // disabled={futureAgeOptions.length === 0}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Age" />
              </SelectTrigger>
              <SelectContent>
                {futureAgeOptions.map((age) => (
                  <SelectItem key={age} value={String(age)}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
