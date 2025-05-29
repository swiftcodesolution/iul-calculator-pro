"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { useTableStore } from "@/lib/store";
import { runGrossRetirementIncomeLoop, runTaxFreePlanLoop } from "@/lib/logics";

interface CombinedResult {
  year: number;
  age: number;
  annualContribution: number;
  tfpAnnualContribution: number;
  grossRetirementIncome: number;
  retirementTaxes: number;
  retirementIncome: number;
  tfpRetirementIncome: number;
  managementFee: number;
  tfpFee: string | number;
  interest: number;
  endOfYearBalance: number;
  tfpCumulativeBalance: number;
  cumulativeIncome: number;
  tfpCumulativeIncome: number;
  cumulativeFees: number;
  tfpCumulativeFees: number;
  cumulativeTaxesDeferred: number;
  deathBenefit: number;
  tfpDeathBenefit: number;
  [key: string]: number | string;
}

export default function CombinedPlanTable() {
  const [evenColumnColor, setEvenColumnColor] = useState("#e6f3ff"); // TFP columns
  const [oddColumnColor, setOddColumnColor] = useState("#f0f0f0"); // Current Plan columns
  const [zoomLevel, setZoomLevel] = useState(0.6); // Zoom scale (1 = normal)
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const fontSize = `${zoomLevel}rem`;
  const paddingSize = `${0.75 * zoomLevel}rem`;

  const handleZoomIn = () => setZoomLevel((prev) => prev + 0.2);
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.4)); // Minimum zoom 0.4
  const handleFullScreenToggle = () => setIsFullScreen((prev) => !prev);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 50);
  };

  function getContrastingTextColor(bgColor: string): string {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  const {
    tables = [],
    boxesData = {
      currentAge: "",
      stopSavingAge: "",
      retirementAge: "",
      workingTaxRate: "",
      retirementTaxRate: "",
      inflationRate: "",
      currentPlanFees: "",
      currentPlanROR: "",
      taxFreePlanROR: "",
    },
    yearsRunOutOfMoney = 0,
    startingBalance = 0,
    annualContributions = 0,
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
  const combinedResults = useMemo<CombinedResult[]>(() => {
    const maxLength = Math.max(
      currentPlanResults.length,
      taxFreePlanResults.length
    );
    const results: CombinedResult[] = [];

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
    isPercentage: boolean = false,
    isPlainNumber: boolean = false
  ): string => {
    if (value == null) return "N/A";
    if (typeof value === "string") return value;
    if (isPercentage) return `${Number(value).toFixed(2)}%`;
    if (isPlainNumber)
      return `${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const headers = [
    "Year",
    "Age",
    "Annual Contribution",
    "TFP Annual Contribution",
    "Gross Retirement Income",
    "Retirement Taxes",
    "Retirement Income",
    "TFP Retirement Income",
    "Management Fee",
    "TFP Fee",
    "Interest",
    "End of Year Balance",
    "TFP Cumulative Balance",
    "Cumulative Income",
    "TFP Cumulative Income",
    "Cumulative Fees",
    "TFP Cumulative Fees",
    "Cumulative Taxes Deferred",
    "Death Benefit",
    "TFP Death Benefit",
  ];

  const headerToKey: Record<string, keyof CombinedResult> = {
    Year: "year",
    Age: "age",
    "Annual Contribution": "annualContribution",
    "TFP Annual Contribution": "tfpAnnualContribution",
    "Gross Retirement Income": "grossRetirementIncome",
    "Retirement Taxes": "retirementTaxes",
    "Retirement Income": "retirementIncome",
    "TFP Retirement Income": "tfpRetirementIncome",
    "Management Fee": "managementFee",
    "TFP Fee": "tfpFee",
    Interest: "interest",
    "End of Year Balance": "endOfYearBalance",
    "TFP Cumulative Balance": "tfpCumulativeBalance",
    "Cumulative Income": "cumulativeIncome",
    "TFP Cumulative Income": "tfpCumulativeIncome",
    "Cumulative Fees": "cumulativeFees",
    "TFP Cumulative Fees": "tfpCumulativeFees",
    "Cumulative Taxes Deferred": "cumulativeTaxesDeferred",
    "Death Benefit": "deathBenefit",
    "TFP Death Benefit": "tfpDeathBenefit",
  };

  const renderTable = () => (
    <Card className="w-full h-[85vh] flex flex-col p-2 gap-2">
      <CardHeader className="p-0">
        <CardTitle>Combined Plan Yearly Results</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        {isScrolled && (
          <div
            className="absolute top-0 left-0 w-full bg-white z-10 shadow-md"
            style={{ width: "99%" }}
          >
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  {headers.map((header) => {
                    const isTFP = header.includes("TFP");
                    const isFixed = header === "Year" || header === "Age";
                    const bgColor = isFixed
                      ? "#FFFFFF"
                      : isTFP
                      ? evenColumnColor
                      : oddColumnColor;
                    const textColor = isFixed
                      ? "#000000"
                      : getContrastingTextColor(bgColor);
                    return (
                      <TableHead
                        key={header}
                        className="whitespace-break-spaces border break-words text-wrap align-top text-sm text-center"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          fontSize,
                          padding: paddingSize,
                          width: "70px",
                        }}
                      >
                        {header}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
            </Table>
          </div>
        )}
        <div className="w-full h-full overflow-auto" onScroll={handleScroll}>
          <div className="min-w-full">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  {headers.map((header) => {
                    const isTFP = header.includes("TFP");
                    const isFixed = header === "Year" || header === "Age";

                    const bgColor = isFixed
                      ? "#FFFFFF"
                      : isTFP
                      ? evenColumnColor
                      : oddColumnColor;

                    const textColor = isFixed
                      ? "#000000"
                      : getContrastingTextColor(bgColor);
                    return (
                      <TableHead
                        key={header}
                        className="whitespace-break-spaces border break-words text-wrap align-top text-sm text-center"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          fontSize,
                          padding: paddingSize,
                          width: "70px",
                        }}
                      >
                        {header}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedResults.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, colIndex) => {
                      const isTFP = header.includes("TFP");
                      const isFixed = header === "Year" || header === "Age";

                      const bgColor = isFixed
                        ? "#FFFFFF"
                        : isTFP
                        ? evenColumnColor
                        : oddColumnColor;

                      const textColor = isFixed
                        ? "#000000"
                        : getContrastingTextColor(bgColor);

                      return (
                        <TableCell
                          key={`${rowIndex}-${colIndex}`}
                          className="border whitespace-nowrap text-sm"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            fontSize,
                            padding: paddingSize,
                            width: "70px",
                          }}
                        >
                          {formatValue(
                            row[headerToKey[header]],
                            false,
                            header === "Year" || header === "Age"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col p-0">
      {/* Header Controls */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="odd-column-color">Current Plan</Label>
            <input
              id="odd-column-color"
              type="color"
              value={oddColumnColor}
              onChange={(e) => setOddColumnColor(e.target.value)}
              className="w-8 h-8 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="even-column-color">Tax Free Plan</Label>
            <input
              id="even-column-color"
              type="color"
              value={evenColumnColor}
              onChange={(e) => setEvenColumnColor(e.target.value)}
              className="w-8 h-8 border rounded"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" className="cursor-pointer">
            Clear
          </Button>
          <Button
            variant="default"
            onClick={handleZoomIn}
            className="cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            onClick={handleZoomOut}
            className="cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="outline"
            onClick={handleFullScreenToggle}
            className="cursor-pointer"
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Fullscreen className="h-4 w-4" />
            )}
          </Button> */}
        </div>
      </div>

      {/* Table Section */}
      <AnimatePresence>
        {!isFullScreen ? (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderTable()}
          </motion.div>
        ) : (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-white p-6"
          >
            <Card className="gap-0 p-0 flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-end">
                <Button variant="outline" onClick={handleFullScreenToggle}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto flex-1">
                {renderTable()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
