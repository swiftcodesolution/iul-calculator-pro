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
import { debounce } from "@/lib/utils";
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
  const [isReadOnly, setIsReadOnly] = useState(false); // New state for read-only mode
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

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
  } = useTableStore();

  const {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  } = useColumnHighlight();

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

        // setBoxesData(data.boxesData || {});
        setBoxesData(
          data.boxesData && Object.keys(data.boxesData).length > 0
            ? data.boxesData
            : {}
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

  // Debounced save (skip if read-only)
  const saveChanges = debounce(
    async (manualSave: boolean = false) => {
      if (
        !fileId ||
        status !== "authenticated" ||
        !session?.user?.id ||
        isReadOnly
      ) {
        console.log("Skipping save due to read-only mode or invalid state");
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
          }); // Debug
          if (manualSave) {
            setIsSaveDialogOpen(true); // Open dialog on manual save
          }
        }
      } catch (err) {
        console.error("Save error:", err); // Debug
        setError("Error saving changes");
      }
    },
    1000,
    { leading: false, trailing: true }
  );

  // Save on state changes (only if not read-only)
  useEffect(() => {
    if (!isReadOnly) {
      saveChanges();
    }
    return () => saveChanges.cancel();
  }, [
    boxesData,
    tables,
    startingBalance,
    annualContributions,
    annualEmployerMatch,
    yearsRunOutOfMoney,
    saveChanges,
    isReadOnly,
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      <div className="fixed bottom-5 left-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => saveChanges(true)} // Trigger manual save
                  disabled={status !== "authenticated" || !fileId || loading}
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
