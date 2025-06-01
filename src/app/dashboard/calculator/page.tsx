"use client";

import { useState } from "react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import { CompanyInfo } from "@/components/calculator/CompanyInfo";
import TabManager from "@/components/calculator/TabManager";
import { useTabs } from "@/hooks/useTabs";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import { TotalAdvantage } from "@/lib/types";
import { useTableStore } from "@/lib/store";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

export default function CalculatorPage() {
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [isTableCardExpanded, setIsTableCardExpanded] = useState(false);
  const [isTabCardExpanded, setIsTabCardExpanded] = useState(false);

  const [totalAdvantage, setTotalAdvantage] = useState<TotalAdvantage>({
    total: 1324000,
    taxes: 125000,
    fees: 78000,
    cumulativeIncome: 1279000,
    deathBenefits: 786000,
  });

  const { boxesData, setBoxesData } = useTableStore();

  // Tab management hooks
  const {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isManageDialogOpen,
    setIsManageDialogOpen,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editTabId,
    setEditTabId,
    newTabName,
    setNewTabName,
    newTabFile,
    setNewTabFile,
    handleAddTab,
    handleEditTab,
    handleDeleteTab,
    handleToggleVisibility,
    handleMoveUp,
    handleMoveDown,
  } = useTabs();

  // Column and row highlight hooks
  const {
    columnTextWhite,
    highlightedRows,
    handleHeaderClick,
    handleCellClick,
  } = useColumnHighlight();

  const { companyInfo } = useCompanyInfo();

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      {/* Left Column */}
      <div className="flex flex-col gap-4">
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

      {/* Right Column */}
      <div className="flex flex-col gap-4 relative">
        <div className="flex gap-4">
          <CompanyInfo companyInfo={companyInfo} />
        </div>
        <TabManager
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isTabCardExpanded={isTabCardExpanded}
          setIsTabCardExpanded={setIsTabCardExpanded}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          isManageDialogOpen={isManageDialogOpen}
          setIsManageDialogOpen={setIsManageDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          setEditTabId={setEditTabId}
          newTabName={newTabName}
          setNewTabName={setNewTabName}
          newTabFile={newTabFile}
          setNewTabFile={setNewTabFile}
          handleAddTab={handleAddTab}
          handleEditTab={handleEditTab}
          handleDeleteTab={handleDeleteTab}
          handleToggleVisibility={handleToggleVisibility}
          handleMoveUp={handleMoveUp}
          handleMoveDown={handleMoveDown}
          totalAdvantage={totalAdvantage}
          handleCellClick={handleCellClick}
        />
      </div>
    </div>
  );
}
