"use client";

import { useState } from "react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import { CompanyInfo } from "@/components/calculator/CompanyInfo";
import { TabManager } from "@/components/calculator/TabManager";
import { useTabs } from "@/hooks/useTabs";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import {
  TaxesData,
  TabContent,
  TotalAdvantage,
  CompanyDetails,
  ImageAsset,
  // BoxesData,
} from "@/lib/types";
import { useTableStore } from "@/lib/store";

// Static data for Taxes column (yellow); replace with dynamic logic if needed
const taxesData: TaxesData = {
  startingBalance: "10%",
  annualContributions: "22%",
  annualEmployerMatch: "",
  annualFees: "",
  grossRetirementIncome: "",
  incomeTax: "28%",
  netRetirementIncome: "28%",
  cumulativeTaxesDeferred: "",
  cumulativeTaxesPaid: "10%",
  cumulativeFeesPaid: "",
  cumulativeNetIncome: "",
  cumulativeAccountBalance: "",
  taxesDue: "28%",
  deathBenefits: "",
  yearsRunOutOfMoney: "",
};

// Static data for Total Advantage tab
const totalAdvantage: TotalAdvantage = {
  total: 1324000,
  taxes: 125000,
  fees: 78000,
  cumulativeIncome: 1279000,
  deathBenefits: 786000,
};

// Company details for display
const companyDetails: CompanyDetails = {
  businessName: "IUL Calculator PRO",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "(760) 517-8105",
};

// Default logo and profile images
const defaultLogo: ImageAsset = { src: "/logo.png", name: "Company Logo" };
const defaultProfile: ImageAsset = {
  src: "/profile.jpg",
  name: "Agent Profile",
};

// Initial tabs for TabManager
const initialTabs: TabContent[] = [
  {
    id: "total-advantage",
    name: "Total Advantage",
    type: "totalAdvantage",
    isVisible: true,
  },
  {
    id: "calculator",
    name: "Calculator",
    type: "calculator",
    isVisible: true,
  },
];

export default function CalculatorPage() {
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [isTableCardExpanded, setIsTableCardExpanded] = useState(false);
  const [isTabCardExpanded, setIsTabCardExpanded] = useState(false);

  const { boxesData, setBoxesData } = useTableStore();
  // // Update boxesData when inputs change
  // const handleBoxesDataValueChange = (updatedData: Partial<BoxesData>) => {
  //   setBoxesData((prev) => ({ ...prev, ...updatedData }));
  // };

  // Tab management hooks
  const {
    tabs,
    setTabs,
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
  } = useTabs(initialTabs);

  // Column and row highlight hooks
  const {
    columnTextWhite,
    highlightedRow,
    handleHeaderClick,
    handleCellClick,
  } = useColumnHighlight();

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      {/* Left Column */}
      <div className="flex flex-col gap-4">
        <InputParameters data={boxesData} onUpdate={setBoxesData} />
        <ComparisonTable
          currentAge={Number(boxesData.currentAge) || 0}
          boxesData={boxesData} // Pass boxesData for dynamic calculations
          taxesData={taxesData}
          columnTextWhite={columnTextWhite}
          highlightedRow={highlightedRow}
          isTableCollapsed={isTableCollapsed}
          isTableCardExpanded={isTableCardExpanded}
          setIsTableCollapsed={setIsTableCollapsed}
          setIsTableCardExpanded={setIsTableCardExpanded}
          handleHeaderClick={handleHeaderClick}
          handleCellClick={handleCellClick}
          defaultResults={boxesData as never}
        />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 relative">
        <div className="flex gap-4">
          <CompanyInfo
            companyDetails={companyDetails}
            defaultLogo={defaultLogo}
            defaultProfile={defaultProfile}
          />
        </div>
        <TabManager
          tabs={tabs}
          setTabs={setTabs}
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
        />
      </div>
    </div>
  );
}
