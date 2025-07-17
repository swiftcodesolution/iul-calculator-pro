"use client";

import { use, useEffect, useState, useMemo } from "react";
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
import { ZoomIn, ZoomOut, Fullscreen, Minimize2 } from "lucide-react";
import { useTableStore } from "@/lib/store";
import { runGrossRetirementIncomeLoop, runTaxFreePlanLoop } from "@/lib/logics";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CombinedResult, ClientFile } from "@/lib/types";
import { debounce, cn } from "@/lib/utils";
import { useTableHighlight } from "@/hooks/useTableHighlight";
import { notFound } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Params = Promise<{ fileId: string }>;

export default function CombinedPlanTable({ params }: { params: Params }) {
  const { fileId } = use(params);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evenColumnColor, setEvenColumnColor] = useState("#e6f3ff");
  const [oddColumnColor, setOddColumnColor] = useState("#f0f0f0");
  const [highlightColor, setHighlightColor] = useState("#ffa1ad");
  const [zoomLevel, setZoomLevel] = useState(0.6);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    highlightedRows,
    highlightedColumns,
    handleRowClick,
    handleColumnClick,
  } = useTableHighlight();

  const router = useRouter();
  const fontSize = `${zoomLevel}rem`;
  const paddingSize = `${0.75 * zoomLevel}rem`;

  const {
    tables,
    setTables,
    boxesData,
    setBoxesData,
    startingBalance,
    setStartingBalance,
    annualContributions,
    setAnnualContributions,
    annualEmployerMatch,
    setAnnualEmployerMatch,
    yearsRunOutOfMoney,
    setYearsRunOutOfMoney,
    combinedResults,
    setCombinedResults,
    clearStore,
  } = useTableStore();

  // Auth and file check
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || !fileId) {
      setError("Unauthorized or invalid file ID");
      setLoading(false);
      return;
    }

    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        if (!response.ok) {
          if (response.status === 400 || response.status === 404) {
            setError("File not found");
            notFound();
          } else {
            setError("Failed to fetch file");
          }
          return;
        }
        const data: ClientFile = await response.json();
        console.log("Fetched data:", data); // Debug
        setBoxesData(data.boxesData || {});
        setTables(data.tablesData?.tables || []);
        setCombinedResults(data.combinedResults || []);
        // Only update if fetched data is valid (not 0 or undefined)
        setStartingBalance(
          data.tablesData?.startingBalance !== undefined &&
            data.tablesData?.startingBalance !== 0
            ? data.tablesData.startingBalance
            : startingBalance
        );
        setAnnualContributions(
          data.tablesData?.annualContributions !== undefined &&
            data.tablesData?.annualContributions !== 0
            ? data.tablesData.annualContributions
            : annualContributions
        );
        setAnnualEmployerMatch(
          data.tablesData?.annualEmployerMatch !== undefined &&
            data.tablesData?.annualEmployerMatch !== 0
            ? data.tablesData.annualEmployerMatch
            : annualEmployerMatch
        );
        setYearsRunOutOfMoney(
          data.tablesData?.yearsRunOutOfMoney !== undefined &&
            data.tablesData?.yearsRunOutOfMoney !== 0
            ? data.tablesData.yearsRunOutOfMoney
            : yearsRunOutOfMoney
        );
      } catch (err) {
        console.error("Fetch error:", err); // Debug
        setError("Error fetching file");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [
    fileId,
    session,
    status,
    setBoxesData,
    setTables,
    setCombinedResults,
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
    setYearsRunOutOfMoney,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    yearsRunOutOfMoney,
  ]);

  // Debounced save
  const saveChanges = debounce(
    async () => {
      if (!fileId || status !== "authenticated" || !session?.user?.id) return;
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boxesData,
            tablesData: {
              tables,
              startingBalance,
              annualContributions,
              annualEmployerMatch,
              yearsRunOutOfMoney,
            },
            combinedResults,
          }),
        });
        if (!response.ok) {
          console.error("Save failed:", response.status); // Debug
          setError("Failed to save changes");
        } else {
          console.log("Saved data:", {
            boxesData,
            tablesData: {
              tables,
              startingBalance,
              annualContributions,
              annualEmployerMatch,
              yearsRunOutOfMoney,
            },
            combinedResults,
          }); // Debug
        }
      } catch (err) {
        console.error("Save error:", err); // Debug
        setError("Error saving changes");
      }
    },
    1000,
    { leading: false, trailing: true }
  );

  // Save on state changes
  useEffect(() => {
    saveChanges();
    return () => saveChanges.cancel();
  }, [
    boxesData,
    tables,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    yearsRunOutOfMoney,
    combinedResults,
    saveChanges,
  ]);

  const handleZoomIn = () => setZoomLevel((prev) => prev + 0.2);
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.4));
  const handleFullScreenToggle = () => setIsFullScreen((prev) => !prev);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) =>
    setIsScrolled(e.currentTarget.scrollTop > 50);

  const getContrastingTextColor = (bgColor: string): string => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

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

  const taxFreePlanResults = useMemo(() => {
    const inputs = {
      currentAge: parseInput(boxesData.currentAge, 0),
      yearsRunOutOfMoney: parseInput(yearsRunOutOfMoney, 0),
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

  // Update combinedResults in store when dependencies change
  useEffect(() => {
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
        annualFees: "Included",
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
    console.log("Combined Results:", results);
    setCombinedResults(results);
  }, [
    currentPlanResults,
    taxFreePlanResults,
    boxesData.currentAge,
    setCombinedResults,
  ]);

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
        {combinedResults.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available. Please upload or input data in Import or
            Calculator.
          </div>
        )}
        {isScrolled && combinedResults.length > 0 && (
          <div className="absolute top-0 left-0 w-[99%] bg-white z-10 shadow-md">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  {headers.map((header) => {
                    const isTFP = header.includes("TFP");
                    const isFixed = header === "Year" || header === "Age";
                    const bgColor = highlightedColumns.has(header)
                      ? highlightColor
                      : isFixed
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
                        className={cn(
                          "whitespace-break-spaces border break-words text-wrap align-top text-sm text-center cursor-pointer",
                          highlightedColumns.has(header)
                            ? `bg-[${highlightColor}]`
                            : ""
                        )}
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          fontSize,
                          padding: paddingSize,
                          width: "70px",
                        }}
                        onClick={() => handleColumnClick(header)}
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
        {combinedResults.length > 0 && (
          <div className="w-full h-full overflow-auto" onScroll={handleScroll}>
            <div className="min-w-full">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => {
                      const isTFP = header.includes("TFP");
                      const isFixed = header === "Year" || header === "Age";
                      const bgColor = highlightedColumns.has(header)
                        ? highlightColor
                        : isFixed
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
                          className={cn(
                            "whitespace-break-spaces border break-words text-wrap align-top text-sm text-center cursor-pointer",
                            highlightedColumns.has(header)
                              ? `bg-[${highlightColor}]`
                              : ""
                          )}
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            fontSize,
                            padding: paddingSize,
                            width: "70px",
                          }}
                          onClick={() => handleColumnClick(header)}
                        >
                          {header}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedResults.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={cn(
                        highlightedRows.has(rowIndex)
                          ? `bg-[${highlightColor}]`
                          : ""
                      )}
                      onClick={() => handleRowClick(rowIndex)}
                    >
                      {headers.map((header, colIndex) => {
                        const isTFP = header.includes("TFP");
                        const isFixed = header === "Year" || header === "Age";
                        const bgColor =
                          highlightedRows.has(rowIndex) ||
                          highlightedColumns.has(header)
                            ? highlightColor
                            : isFixed
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
                            className={cn(
                              "border whitespace-nowrap text-sm",
                              highlightedColumns.has(header) ||
                                highlightedRows.has(rowIndex)
                                ? `bg-[${highlightColor}]`
                                : ""
                            )}
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
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col p-0">
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
          <div className="flex items-center gap-2">
            <Label htmlFor="highlight-color">Highlight</Label>
            <input
              id="highlight-color"
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-8 h-8 border rounded"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => {
                    clearStore();
                    router.push(`/dashboard/import/${fileId}`);
                  }}
                >
                  Clear
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear the current data and return to import</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  onClick={handleZoomIn}
                  className="cursor-pointer high-contrast:bg-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom in on the view</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  onClick={handleZoomOut}
                  className="cursor-pointer high-contrast:bg-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom out of the view</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  onClick={handleFullScreenToggle}
                  className="cursor-pointer high-contrast:bg-white"
                >
                  {isFullScreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Fullscreen className="h-4 w-4" />
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isFullScreen
                  ? "Exit full-screen mode"
                  : "Enter full-screen mode"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

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
