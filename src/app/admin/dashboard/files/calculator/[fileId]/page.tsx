"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import TabManager from "@/components/calculator/TabManager";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import { TotalAdvantage, ClientFile } from "@/lib/types";
import { useTableStore } from "@/lib/store";
import { debounce } from "@/lib/utils";

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

  useEffect(() => {
    // Reset store on mount to prevent stale data
    clearEverythingForFreshFile();
    console.log("Store state after mount:", {
      boxesData,
      tables,
      startingBalance,
      annualContributions,
      annualEmployerMatch,
      yearsRunOutOfMoney,
    });

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
            setBoxesData({
              currentAge: "",
              stopSavingAge: "",
              retirementAge: "",
              workingTaxRate: "",
              retirementTaxRate: "",
              inflationRate: "",
              currentPlanFees: "",
              currentPlanROR: "",
              taxFreePlanROR: "",
            });
            setTables([]);
            setStartingBalance("");
            setAnnualContributions("");
            setAnnualEmployerMatch("");
            setYearsRunOutOfMoney("");
            setError("File not found, starting with empty fields");
            return;
          } else {
            setError("Failed to fetch file");
            return;
          }
        }
        const data: ClientFile = await response.json();
        console.log("Fetched data:", data);

        setBoxesData(
          data.boxesData && Object.keys(data.boxesData).length > 0
            ? data.boxesData
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
        setTables(data.tablesData?.tables || []);
        setStartingBalance(
          data.tablesData?.startingBalance !== undefined &&
            data.tablesData?.startingBalance !== ""
            ? data.tablesData.startingBalance
            : ""
        );
        setAnnualContributions(
          data.tablesData?.annualContributions !== undefined &&
            data.tablesData?.annualContributions !== ""
            ? data.tablesData.annualContributions
            : ""
        );
        setAnnualEmployerMatch(
          data.tablesData?.annualEmployerMatch !== undefined &&
            data.tablesData?.annualEmployerMatch !== ""
            ? data.tablesData.annualEmployerMatch
            : ""
        );
        setYearsRunOutOfMoney(
          data.tablesData?.yearsRunOutOfMoney !== undefined &&
            data.tablesData?.yearsRunOutOfMoney !== ""
            ? data.tablesData.yearsRunOutOfMoney
            : ""
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
        }
      } catch (err) {
        console.error("Save error:", err);
        setError("Error saving changes");
      }
    },
    1000,
    { leading: false, trailing: true }
  );

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
    saveChanges,
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4 relative">
        <InputParameters data={boxesData} onUpdate={setBoxesData} />
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
