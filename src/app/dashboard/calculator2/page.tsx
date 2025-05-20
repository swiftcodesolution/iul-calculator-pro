"use client";

import { useState } from "react";
import { InputParameters } from "@/components/calculator/InputParameters";
import { ComparisonTable } from "@/components/calculator/ComparisonTable";
import { CompanyInfo } from "@/components/calculator/CompanyInfo";
import { TabManager } from "@/components/calculator/TabManager";
import { useTabs } from "@/hooks/useTabs";
import { useColumnHighlight } from "@/hooks/useColumnHighlight";
import {
  CalculatorData,
  Results,
  TaxesData,
  TabContent,
  TotalAdvantage,
  CompanyDetails,
  ImageAsset,
} from "@/lib/types";

// Default data (unchanged)
const defaultData: CalculatorData = {
  currentAge: 40,
  stopSavingAge: 65,
  retirementAge: 66,
  workingTaxRate: 22,
  retirementTaxRate: 22,
  inflationRate: 0,
  currentPlanFees: 2,
  currentPlan: {
    startingBalance: 0,
    annualContribution: 25641,
    annualEmployerMatch: 0,
    annualFees: 2,
    rateOfReturn: 6.3,
  },
  taxFreePlan: {
    startingBalance: 0,
    annualContribution: 20000,
    annualEmployerMatch: 0,
    annualFees: "Included",
    rateOfReturn: 6.3,
  },
  futureAgeYears: 1,
};

const defaultResults: Results = {
  startingBalance: 0,
  annualContributions: 25641,
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
  currentAge: 65, // Example value
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

export default function CalculatorPageV2() {
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [isTableCardExpanded, setIsTableCardExpanded] = useState(false);
  const [isTabCardExpanded, setIsTabCardExpanded] = useState(false);

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
        <InputParameters data={defaultData} />
        <ComparisonTable
          currentAge={40}
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
