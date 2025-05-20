"use client";

import { useState } from "react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import { CompanyInfo } from "@/components/calculator/CompanyInfo";
import { TabManager } from "@/components/calculator/TabManager";
import { useTabs } from "@/hooks/useTabs";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import {
  Results,
  TaxesData,
  TabContent,
  TotalAdvantage,
  CompanyDetails,
  ImageAsset,
  BoxesData,
} from "@/lib/types";

const defaultResults: Results = {
  xValue: 0,
  startingBalance: 0,
  annualContributions: 0,
  annualEmployerMatch: "0",
  annualFees: "2%",
  grossRetirementIncome: 1000000,
  incomeTax: 280000,
  netRetirementIncome: 720000,
  cumulativeTaxesDeferred: 50000,
  cumulativeTaxesPaid: 300000,
  cumulativeFeesPaid: 20000,
  cumulativeNetIncome: 700000,
  cumulativeAccountBalance: 1500000,
  taxesDue: 28,
  deathBenefits: 500000,
  yearsRunOutOfMoney: 30,
  currentAge: 40,
};

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

const totalAdvantage: TotalAdvantage = {
  total: 1324000,
  taxes: 125000,
  fees: 78000,
  cumulativeIncome: 1279000,
  deathBenefits: 786000,
};

const companyDetails: CompanyDetails = {
  businessName: "IUL Calculator PRO",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "(760) 517-8105",
};

const defaultLogo: ImageAsset = { src: "/logo.png", name: "Company Logo" };
const defaultProfile: ImageAsset = {
  src: "/profile.jpg",
  name: "Agent Profile",
};

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
  const [boxesData, setBoxesData] = useState<BoxesData>({
    currentAge: 40,
    stopSavingAge: 60,
    retirementAge: 65,
    workingTaxRate: 25,
    retirementTaxRate: 15,
    inflationRate: 2.5,
    currentPlanFees: 1.0,
    currentPlanROR: 6.3,
    taxFreePlanROR: 6.3,
  });

  const handleBoxesDataValueChange = (updatedData: Partial<BoxesData>) => {
    setBoxesData((prev) => ({ ...prev, ...updatedData }));
  };

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
    editTabId, // eslint-disable-line @typescript-eslint/no-unused-vars
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
        <InputParameters
          data={boxesData}
          onUpdate={handleBoxesDataValueChange}
        />
        <ComparisonTable
          currentAge={boxesData.currentAge}
          defaultResults={defaultResults}
          taxesData={taxesData}
          columnTextWhite={columnTextWhite}
          highlightedRow={highlightedRow}
          isTableCollapsed={isTableCollapsed}
          isTableCardExpanded={isTableCardExpanded}
          setIsTableCollapsed={setIsTableCollapsed}
          setIsTableCardExpanded={setIsTableCardExpanded}
          handleHeaderClick={handleHeaderClick}
          handleCellClick={handleCellClick}
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
