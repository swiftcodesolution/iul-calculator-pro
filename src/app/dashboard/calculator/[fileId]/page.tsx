/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import { CompanyInfo } from "@/components/calculator/CompanyInfo";
import TabManager from "@/components/calculator/TabManager";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import { TotalAdvantage, ClientFile } from "@/lib/types";
import { useTableStore } from "@/lib/store";
import { notFound } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

type Params = Promise<{ fileId: string }>;

export default function CalculatorPage({ params }: { params: Params }) {
  const { fileId } = use(params);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [isTableCardExpanded, setIsTableCardExpanded] = useState(false);
  const [isTabCardExpanded, setIsTabCardExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [totalAdvantage, setTotalAdvantage] = useState<TotalAdvantage>({
    total: 0,
    cumulativeTaxesPaid: 0,
    fees: 0,
    cumulativeIncome: 0,
    deathBenefits: 0,
  });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<{
    boxesData: any;
    tablesData: {
      tables: any[];
      startingBalance: number | string;
      annualContributions: number | string;
      annualEmployerMatch: number | string;
      yearsRunOutOfMoney: number | string;
    };
    withdrawalAmount: number | string; // Added
    calculatorAge: number | string; // Added
    calculatorTaxRate: number | string; // Added
  } | null>(null);

  const {
    boxesData,
    setBoxesData,
    tables,
    setTables,
    startingBalance,
    setStartingBalance,
    annualContributions,
    setAnnualContributions,
    annualEmployerMatch,
    setAnnualEmployerMatch,
    yearsRunOutOfMoney,
    setYearsRunOutOfMoney,
    clearEverythingForFreshFile,
    withdrawalAmount,
    setWithdrawalAmount,
    calculatorAge,
    setCalculatorAge,
    calculatorTaxRate,
    setCalculatorTaxRate,
  } = useTableStore();

  const {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  } = useColumnHighlight();

  /*
  // Fetch file data and determine read-only status
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
            clearEverythingForFreshFile();
            setError("File not found");
            notFound();
          } else {
            setError("Failed to fetch file");
          }
          return;
        }
        const data: ClientFile = await response.json();

        console.log("Fetched data:", data); // Debug

        // Set read-only if user is agent and file is Pro Sample Files
        setIsReadOnly(
          data.createdByRole === "admin" ||
            (session.user.role === "agent" &&
              data.category === "Pro Sample Files")
        );

        // setBoxesData(
        //   data.boxesData && Object.keys(data.boxesData).length > 0
        //     ? data.boxesData
        //     : {}
        // );

        setBoxesData(
          data.boxesData && Object.keys(data.boxesData).length > 0
            ? {
                currentAge: data.boxesData.currentAge || "",
                stopSavingAge: data.boxesData.stopSavingAge || "",
                retirementAge: data.boxesData.retirementAge || "",
                workingTaxRate: data.boxesData.workingTaxRate || "",
                retirementTaxRate: data.boxesData.retirementTaxRate || "",
                inflationRate: data.boxesData.inflationRate || "",
                currentPlanFees: data.boxesData.currentPlanFees || "",
                currentPlanROR: data.boxesData.currentPlanROR || "",

                // taxFreePlanROR: data.fields?.assumed_ror
                //   ? parseFloat(data.fields.assumed_ror.replace("%", ""))
                //   : data.boxesData?.taxFreePlanROR || "",
              }
            : {
                currentAge: "",
                stopSavingAge: "",
                retirementAge: "",
                workingTaxRate: "",
                retirementTaxRate: "",
                inflationRate: "",
                currentPlanFees: "",
                currentPlanROR: "",

                // taxFreePlanROR: data.fields?.assumed_ror
                //   ? parseFloat(data.fields.assumed_ror.replace("%", ""))
                //   : "",

                taxFreePlanROR:
                  data.fields?.assumed_ror &&
                  data.fields.assumed_ror.trim() !== ""
                    ? parseFloat(
                        data.fields.assumed_ror.replace("%", "")
                      ).toString()
                    : "",
              }
        );

        setTables(data.tablesData?.tables || []);

        // Only update if the fetched data is valid (not 0 or undefined)
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
        console.error("Fetch error:", err);
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
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
    setYearsRunOutOfMoney,
  ]);
  */

  /*
  // Fetch file data and determine read-only status
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
            clearEverythingForFreshFile();
            setError("File not found");
            notFound();
          } else {
            setError("Failed to fetch file");
          }
          return;
        }
        const data: ClientFile = await response.json();

        console.log("Fetched data:", data); // Debug

        // Set read-only if user is agent and file is Pro Sample Files
        setIsReadOnly(
          data.createdByRole === "admin" ||
            (session.user.role === "agent" &&
              data.category === "Pro Sample Files")
        );

        // Set boxesData with defaults for missing fields
        setBoxesData(
          data.boxesData && Object.keys(data.boxesData).length > 0
            ? {
                currentAge: data.boxesData.currentAge || "",
                stopSavingAge: data.boxesData.stopSavingAge || "",
                retirementAge: data.boxesData.retirementAge || "",
                workingTaxRate: data.boxesData.workingTaxRate || "",
                retirementTaxRate: data.boxesData.retirementTaxRate || "",
                inflationRate: data.boxesData.inflationRate || "",
                currentPlanFees: data.boxesData.currentPlanFees || "",
                currentPlanROR: data.boxesData.currentPlanROR || "",
                taxFreePlanROR:
                  data.fields?.assumed_ror &&
                  data.fields.assumed_ror.trim() !== ""
                    ? parseFloat(
                        data.fields.assumed_ror.replace("%", "")
                      ).toString()
                    : "",
              }
            : {
                currentAge: "",
                stopSavingAge: "",
                retirementAge: "",
                workingTaxRate: "",
                retirementTaxRate: "",
                inflationRate: "",
                currentPlanFees: "",
                currentPlanROR: "",
                taxFreePlanROR: "",
              }
        );

        // Set tables data
        setTables(data.tablesData?.tables || []);

        // Set fields to 0 if missing or undefined
        setStartingBalance(data.tablesData?.startingBalance ?? 0);
        setAnnualContributions(data.tablesData?.annualContributions ?? 0);
        setAnnualEmployerMatch(data.tablesData?.annualEmployerMatch ?? 0);
        setYearsRunOutOfMoney(data.tablesData?.yearsRunOutOfMoney ?? 0);

        console.log("Set table data:", {
          startingBalance: data.tablesData?.startingBalance ?? 0,
          annualContributions: data.tablesData?.annualContributions ?? 0,
          annualEmployerMatch: data.tablesData?.annualEmployerMatch ?? 0,
          yearsRunOutOfMoney: data.tablesData?.yearsRunOutOfMoney ?? 0,
        }); // Debug
      } catch (err) {
        console.error("Fetch error:", err);
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
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
    setYearsRunOutOfMoney,
  ]);
  */

  // Update fetch useEffect to initialize lastSavedData
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
            clearEverythingForFreshFile();
            setError("File not found");
            notFound();
          } else {
            setError("Failed to fetch file");
          }
          return;
        }
        const data: ClientFile = await response.json();

        console.log("Fetched data:", data); // Debug

        // Set read-only if user is agent and file is Pro Sample Files
        setIsReadOnly(
          data.createdByRole === "admin" ||
            (session.user.role === "agent" &&
              data.category === "Pro Sample Files")
        );

        // Set boxesData with defaults for missing fields
        const newBoxesData =
          data.boxesData && Object.keys(data.boxesData).length > 0
            ? {
                currentAge: data.boxesData.currentAge || "",
                stopSavingAge: data.boxesData.stopSavingAge || "",
                retirementAge: data.boxesData.retirementAge || "",
                workingTaxRate: data.boxesData.workingTaxRate || "",
                retirementTaxRate: data.boxesData.retirementTaxRate || "",
                inflationRate: data.boxesData.inflationRate || "",
                currentPlanFees: data.boxesData.currentPlanFees || "",
                currentPlanROR: data.boxesData.currentPlanROR || "",
                taxFreePlanROR:
                  data.fields?.assumed_ror &&
                  data.fields.assumed_ror.trim() !== ""
                    ? parseFloat(
                        data.fields.assumed_ror.replace("%", "")
                      ).toString()
                    : "",
              }
            : {
                currentAge: "",
                stopSavingAge: "",
                retirementAge: "",
                workingTaxRate: "",
                retirementTaxRate: "",
                inflationRate: "",
                currentPlanFees: "",
                currentPlanROR: "",
                taxFreePlanROR: "",
              };

        const newTables = data.tablesData?.tables || [];
        const newStartingBalance = data.tablesData?.startingBalance ?? 0;
        const newAnnualContributions =
          data.tablesData?.annualContributions ?? 0;
        const newAnnualEmployerMatch =
          data.tablesData?.annualEmployerMatch ?? 0;
        const newYearsRunOutOfMoney = data.tablesData?.yearsRunOutOfMoney ?? 0;

        setBoxesData(newBoxesData);
        setTables(newTables);
        setStartingBalance(newStartingBalance);
        setAnnualContributions(newAnnualContributions);
        setAnnualEmployerMatch(newAnnualEmployerMatch);
        setYearsRunOutOfMoney(newYearsRunOutOfMoney);

        setWithdrawalAmount(data.withdrawalAmount ?? 0); // Added
        setCalculatorAge(data.calculatorAge ?? 0); // Added
        setCalculatorTaxRate(data.calculatorTaxRate ?? 0); // Added

        // Initialize last saved data
        setLastSavedData({
          boxesData: newBoxesData,
          tablesData: {
            tables: newTables,
            startingBalance: Number(newStartingBalance),
            annualContributions: Number(newAnnualContributions),
            annualEmployerMatch: Number(newAnnualEmployerMatch),
            yearsRunOutOfMoney: Number(newYearsRunOutOfMoney),
          },
          withdrawalAmount: data.withdrawalAmount ?? 0, // Added
          calculatorAge: data.calculatorAge ?? 0, // Added
          calculatorTaxRate: data.calculatorTaxRate ?? 0, // Added
        });

        console.log("Set table data:", {
          startingBalance: newStartingBalance,
          annualContributions: newAnnualContributions,
          annualEmployerMatch: newAnnualEmployerMatch,
          yearsRunOutOfMoney: newYearsRunOutOfMoney,
        }); // Debug
      } catch (err) {
        console.error("Fetch error:", err);
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
    setStartingBalance,
    setAnnualContributions,
    setAnnualEmployerMatch,
    setYearsRunOutOfMoney,
    setWithdrawalAmount,
    setCalculatorAge,
    setCalculatorTaxRate,
    clearEverythingForFreshFile,
  ]);

  useEffect(() => {
    if (!lastSavedData || isReadOnly) {
      setHasUnsavedChanges(false); // No unsaved changes in read-only mode
      return;
    }

    const hasChanges =
      JSON.stringify(boxesData) !== JSON.stringify(lastSavedData.boxesData) ||
      JSON.stringify(tables) !==
        JSON.stringify(lastSavedData.tablesData.tables) ||
      startingBalance !== lastSavedData.tablesData.startingBalance ||
      annualContributions !== lastSavedData.tablesData.annualContributions ||
      annualEmployerMatch !== lastSavedData.tablesData.annualEmployerMatch ||
      yearsRunOutOfMoney !== lastSavedData.tablesData.yearsRunOutOfMoney ||
      withdrawalAmount !== lastSavedData.withdrawalAmount || // Added
      calculatorAge !== lastSavedData.calculatorAge || // Added
      calculatorTaxRate !== lastSavedData.calculatorTaxRate; // Added

    setHasUnsavedChanges(hasChanges);
  }, [
    boxesData,
    tables,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    yearsRunOutOfMoney,
    withdrawalAmount,
    calculatorAge,
    calculatorTaxRate,
    lastSavedData,
    isReadOnly,
  ]);

  /*
  // Manual save function
  const saveChanges = async () => {
    if (
      !fileId ||
      status !== "authenticated" ||
      !session?.user?.id ||
      isReadOnly
    ) {
      console.log("Skipping save due to read-only mode or invalid state");
      setError("Cannot save: Unauthorized, invalid file ID, or read-only mode");
      return;
    }
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
        }),
      });
      if (!response.ok) {
        console.error("Save failed:", response.status);
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
        });
        setIsSaveDialogOpen(true); // Open dialog on successful save
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Error saving changes");
    }
  };
  */

  const saveChanges = async () => {
    if (
      !fileId ||
      status !== "authenticated" ||
      !session?.user?.id ||
      isReadOnly
    ) {
      console.log("Skipping save due to read-only mode or invalid state");
      setError("Cannot save: Unauthorized, invalid file ID, or read-only mode");
      return;
    }
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
          withdrawalAmount, // Added
          calculatorAge, // Added
          calculatorTaxRate, // Added
        }),
      });
      if (!response.ok) {
        console.error("Save failed:", response.status);
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
        });
        // Update last saved data
        setLastSavedData({
          boxesData: { ...boxesData },
          tablesData: {
            tables: [...tables],
            startingBalance,
            annualContributions,
            annualEmployerMatch,
            yearsRunOutOfMoney,
          },
          withdrawalAmount, // Added
          calculatorAge, // Added
          calculatorTaxRate, // Added
        });
        setIsSaveDialogOpen(true); // Open dialog on successful save
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Error saving changes");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      <div className="absolute bottom-4 left-4 z-50 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={saveChanges}
                  disabled={
                    status !== "authenticated" ||
                    !fileId ||
                    loading ||
                    isReadOnly
                  }
                  className="cursor-pointer high-contrast:bg-white high-contrast:text-black!"
                  variant="default"
                >
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Successful</DialogTitle>
                  <DialogDescription className="high-contrast:text-gray-200">
                    Your changes have been successfully saved!
                  </DialogDescription>
                </DialogHeader>
                <Button
                  onClick={() => setIsSaveDialogOpen(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Close
                </Button>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save your changes</p>
          </TooltipContent>
        </Tooltip>

        {hasUnsavedChanges && !isReadOnly && (
          <Button className="text-white flex items-center justify-center text-sm gap-1 p-2 bg-red-500">
            <ArrowLeftIcon className="h-4" />
            <p>You have unsaved changes!</p>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 relative">
        <InputParameters
          data={boxesData}
          onUpdate={setBoxesData}
          readOnly={isReadOnly}
        />
        <ComparisonTable
          currentAge={Number(boxesData.currentAge) || 0}
          boxesData={boxesData}
          columnTextWhite={columnTextWhite}
          highlightedRows={highlightedRows}
          isTableCollapsed={isTableCollapsed}
          isTableCardExpanded={isTableCardExpanded}
          setIsTableCollapsed={setIsTableCollapsed}
          setIsTableCardExpanded={setIsTableCardExpanded}
          handleHeaderClick={handleHeaderClick}
          handleCellClick={handleCellClick}
          defaultResults={boxesData as never}
          onTotalAdvantageChange={setTotalAdvantage}
        />
      </div>
      <div className="flex flex-col gap-4 relative">
        <CompanyInfo />
        <TabManager
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isTabCardExpanded={isTabCardExpanded}
          setIsTabCardExpanded={setIsTabCardExpanded}
          totalAdvantage={totalAdvantage}
          handleCellClick={handleCellClick}
        />
      </div>
    </div>
  );
}
