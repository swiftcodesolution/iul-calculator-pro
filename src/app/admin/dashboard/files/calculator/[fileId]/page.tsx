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
  } = useTableStore();

  const {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  } = useColumnHighlight();

  // Fetch file data
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

        // Only update if fetched data is valid (not 0 or undefined)
        setStartingBalance(
          data.tablesData?.startingBalance !== undefined &&
            data.tablesData?.startingBalance !== 0
            ? data.tablesData.startingBalance
            : startingBalance // Preserve existing value
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
