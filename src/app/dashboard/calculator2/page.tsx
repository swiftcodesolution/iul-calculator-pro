"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Pencil,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import TabCalculator from "@/components/TabCalculator";

// Define types for the data structure
type Plan = {
  startingBalance: number;
  annualContribution: number;
  annualEmployerMatch: number;
  annualFees: number | "Included";
  rateOfReturn: number;
};

type CalculatorData = {
  currentAge: number;
  stopSavingAge: number;
  retirementAge: number;
  workingTaxRate: number;
  retirementTaxRate: number;
  inflationRate: number;
  currentPlanFees: number;
  currentPlan: Plan;
  taxFreePlan: Plan;
  futureAgeYears: number;
};

type Results = {
  grossRetirementIncome: number;
  incomeTax: number;
  netRetirementIncome: number;
  cumulativeTaxesDeferred: number;
  cumulativeTaxesPaid: number;
  cumulativeFeesPaid: number;
  cumulativeNetIncome: number;
  cumulativeAccountBalance: number;
  taxesDue: number;
  deathBenefits: number;
  yearsRunOutOfMoney: number;
};

type TabContent = {
  id: string;
  name: string;
  file?: File;
  src?: string;
  type: "image" | "video" | "pdf" | "other" | "totalAdvantage" | "calculator";
  isVisible: boolean; // Added to track tab visibility
};

// Default data
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
  grossRetirementIncome: 67817,
  incomeTax: 18989,
  netRetirementIncome: 48828,
  cumulativeTaxesDeferred: 0,
  cumulativeTaxesPaid: 569661,
  cumulativeFeesPaid: 725982,
  cumulativeNetIncome: 1464844,
  cumulativeAccountBalance: 57490,
  taxesDue: 28,
  deathBenefits: 41393,
  yearsRunOutOfMoney: 95,
};

const taxFreeResults: Results = {
  grossRetirementIncome: 0,
  incomeTax: 0,
  netRetirementIncome: 96251,
  cumulativeTaxesDeferred: 0,
  cumulativeTaxesPaid: 0,
  cumulativeFeesPaid: 272966,
  cumulativeNetIncome: 2887530,
  cumulativeAccountBalance: 6480275,
  taxesDue: 0,
  deathBenefits: 466114,
  yearsRunOutOfMoney: 119,
};

const totalAdvantage = {
  total: 1324000,
  taxes: 125000,
  fees: 78000,
  cumulativeIncome: 1279000,
  deathBenefits: 786000,
};

const companyDetails = {
  businessName: "IUL Calculator PRO",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "(760) 517-8105",
};
const defaultLogo = { src: "/logo.png", name: "Company Logo" };
const defaultProfile = { src: "/profile.jpg", name: "Agent Profile" };

export default function CalculatorPageV2() {
  const [data, setData] = useState<CalculatorData>(defaultData);
  const [futureAge, setFutureAge] = useState(data.futureAgeYears);
  const [tabs, setTabs] = useState<TabContent[]>([
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
  ]);
  const [activeTab, setActiveTab] = useState<string | null>("total-advantage");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false); // Added for manage dialog
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [isTableCardExpanded, setIsTableCardExpanded] = useState(false);
  const [isTabCardExpanded, setIsTabCardExpanded] = useState(false);
  const [columnTextWhite, setColumnTextWhite] = useState({
    currentPlan: false,
    taxes: false,
    taxFreePlan: false,
  });
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  const handleHeaderClick = (column: keyof typeof columnTextWhite) => {
    setColumnTextWhite((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleCellClick = (rowIndex: number) => {
    setHighlightedRow((prev) => (prev === rowIndex ? null : rowIndex));
  };

  const handleFutureAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value);
    if (!isNaN(newAge)) {
      setFutureAge(newAge);
      setData((prev) => ({ ...prev, futureAgeYears: newAge }));
    }
  };

  const handleAddTab = () => {
    if (newTabName && newTabFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        const type = newTabFile.type.startsWith("image")
          ? "image"
          : newTabFile.type.startsWith("video")
          ? "video"
          : newTabFile.type === "application/pdf"
          ? "pdf"
          : "other";
        const newTab: TabContent = {
          id: Date.now().toString(),
          name: newTabName,
          file: newTabFile,
          src,
          type,
          isVisible: true, // New tabs are visible by default
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTab(newTab.id);
        setIsAddDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
      };
      reader.readAsDataURL(newTabFile);
    }
  };

  const handleEditTab = () => {
    if (editTabId && newTabName) {
      if (editTabId === "total-advantage" || editTabId === "calculator") {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === editTabId ? { ...tab, name: newTabName } : tab
          )
        );
        setIsEditDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
        setEditTabId(null);
        return;
      }
      if (newTabFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const src = reader.result as string;
          const type = newTabFile.type.startsWith("image")
            ? "image"
            : newTabFile.type.startsWith("video")
            ? "video"
            : newTabFile.type === "application/pdf"
            ? "pdf"
            : "other";
          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === editTabId
                ? { ...tab, name: newTabName, file: newTabFile, src, type }
                : tab
            )
          );
          setIsEditDialogOpen(false);
          setNewTabName("");
          setNewTabFile(null);
          setEditTabId(null);
        };
        reader.readAsDataURL(newTabFile);
      } else {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === editTabId ? { ...tab, name: newTabName } : tab
          )
        );
        setIsEditDialogOpen(false);
        setNewTabName("");
        setNewTabFile(null);
        setEditTabId(null);
      }
    }
  };

  const handleDeleteTab = (id: string) => {
    if (id === "total-advantage" || id === "calculator") return;
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  // New handler to toggle tab visibility
  const handleToggleVisibility = (id: string) => {
    if (id === "total-advantage" || id === "calculator") return; // Prevent disabling default tabs
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, isVisible: !tab.isVisible } : tab
      )
    );
  };

  // New handler to move tab up
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // Can't move first tab up
    setTabs((prev) => {
      const newTabs = [...prev];
      [newTabs[index - 1], newTabs[index]] = [
        newTabs[index],
        newTabs[index - 1],
      ];
      return newTabs;
    });
  };

  // New handler to move tab down
  const handleMoveDown = (index: number) => {
    if (index === tabs.length - 1) return; // Can't move last tab down
    setTabs((prev) => {
      const newTabs = [...prev];
      [newTabs[index], newTabs[index + 1]] = [
        newTabs[index + 1],
        newTabs[index],
      ];
      return newTabs;
    });
  };

  return (
    <div className="h-[90vh] grid grid-cols-2 gap-4">
      {/* Left Column - Input Parameters and Collapsible Comparison Table */}
      <div className="flex flex-col gap-4">
        {/* Input Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
        >
          <Card>
            <CardContent className="grid grid-cols-3 gap-2 pt-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 120,
                }}
                className="flex flex-col space-y-2"
              >
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Current Age</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[50px] text-sm border-gray-500 border-2"
                      disabled
                      value={data.currentAge}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Stop Saving Age</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[50px] text-sm border-gray-500 border-2"
                      disabled
                      value={data.stopSavingAge}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Retirement Age</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[50px] text-sm border-gray-500 border-2"
                      disabled
                      value={data.retirementAge}
                    />
                  </motion.p>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 120,
                }}
                className="flex flex-col space-y-2"
              >
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Working Tax Rate</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`${data.workingTaxRate}%`}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Retirement Tax Rate</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`${data.retirementTaxRate}%`}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Inflation Rate</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`${data.inflationRate}%`}
                    />
                  </motion.p>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 120,
                }}
                className="flex flex-col space-y-2"
              >
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Current Plan Fees</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`${data.currentPlanFees}%`}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Current Plan ROR</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`6.3%`}
                    />
                  </motion.p>
                </motion.div>
                <motion.div
                  className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md"
                  whileHover={{ scale: 1.02, backgroundColor: "#e5e7eb" }}
                >
                  <Label>Tax Free Plan ROR</Label>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Input
                      className="w-[60px] text-sm border-gray-500 border-2"
                      disabled
                      value={`6.3%`}
                    />
                  </motion.p>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Collapsible Comparison Table */}
        <AnimatePresence>
          {!isTableCardExpanded ? (
            <Card>
              <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                onClick={() => setIsTableCollapsed(!isTableCollapsed)}
                aria-label="Toggle table visibility"
              >
                <h3 className="text-lg font-semibold">Comparison Table</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTableCardExpanded(true)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="w-full table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead
                        className={`bg-red-200 cursor-pointer ${
                          columnTextWhite.currentPlan
                            ? "text-red-200"
                            : "text-black"
                        } transition-colors duration-300`}
                        onClick={() => handleHeaderClick("currentPlan")}
                        aria-label="Toggle Current Plan column text color"
                      >
                        Current Plan <br /> TSP, 401k, 403b, IRA
                      </TableHead>
                      <TableHead
                        className={`bg-yellow-200 cursor-pointer ${
                          columnTextWhite.taxes
                            ? "text-yellow-200"
                            : "text-black"
                        } transition-colors duration-300`}
                        onClick={() => handleHeaderClick("taxes")}
                        aria-label="Toggle Taxes column text color"
                      >
                        Taxes
                      </TableHead>
                      <TableHead
                        className={`bg-green-200 cursor-pointer ${
                          columnTextWhite.taxFreePlan
                            ? "text-green-200"
                            : "text-black"
                        } transition-colors duration-300`}
                        onClick={() => handleHeaderClick("taxFreePlan")}
                        aria-label="Toggle Tax Free Plan column text color"
                      >
                        IRS (IRC) 7702 <br /> Tax Free Plan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      "Starting Balance",
                      "Annual Contributions",
                      "Annual Employer Match",
                      "Annual Fees",
                      "Gross Retirement Income",
                      "Income Tax",
                      "Net Retirement Income",
                      "Cumulative Taxes Deferred",
                      "Cumulative Taxes Paid",
                      "Cumulative Fees Paid",
                      "Cumulative Net Income",
                      "Cumulative Account Balance",
                      "Taxes Due",
                      "Death Benefits",
                      "Years You Run Out of Money",
                    ].map((label, index) => (
                      <motion.tr
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <TableCell
                          className={`border cursor-pointer whitespace-nowrap ${
                            highlightedRow === index ? "bg-[#ffa1ad]" : ""
                          }`}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {label}
                        </TableCell>
                        <TableCell
                          className={`border cursor-pointer whitespace-nowrap ${
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white"
                          } ${
                            columnTextWhite.currentPlan
                              ? "text-white opacity-0"
                              : "text-black"
                          } transition-colors duration-300`}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {label === "Starting Balance" && "0"}
                          {label === "Annual Contributions" && "$25,641"}
                          {label === "Annual Employer Match" && "$0"}
                          {label === "Annual Fees" && "2%"}
                          {label === "Gross Retirement Income" &&
                            `$${defaultResults.grossRetirementIncome.toLocaleString()}`}
                          {label === "Income Tax" &&
                            `$${defaultResults.incomeTax.toLocaleString()}`}
                          {label === "Net Retirement Income" &&
                            `$${defaultResults.netRetirementIncome.toLocaleString()}`}
                          {label === "Cumulative Taxes Deferred" &&
                            `$${defaultResults.cumulativeTaxesDeferred.toLocaleString()}`}
                          {label === "Cumulative Taxes Paid" &&
                            `$${defaultResults.cumulativeTaxesPaid.toLocaleString()}`}
                          {label === "Cumulative Fees Paid" &&
                            `$${defaultResults.cumulativeFeesPaid.toLocaleString()}`}
                          {label === "Cumulative Net Income" &&
                            `$${defaultResults.cumulativeNetIncome.toLocaleString()}`}
                          {label === "Cumulative Account Balance" &&
                            `$${defaultResults.cumulativeAccountBalance.toLocaleString()}`}
                          {label === "Taxes Due" &&
                            `${defaultResults.taxesDue}%`}
                          {label === "Death Benefits" &&
                            `$${defaultResults.deathBenefits.toLocaleString()}`}
                          {label === "Years You Run Out of Money" &&
                            `${defaultResults.yearsRunOutOfMoney}`}
                        </TableCell>
                        <TableCell
                          className={`border cursor-pointer whitespace-nowrap ${
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white"
                          } ${
                            columnTextWhite.taxes
                              ? "text-white opacity-0"
                              : "text-red-600"
                          } transition-colors duration-300`}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {label === "Starting Balance" && "10%"}
                          {label === "Annual Contributions" && "22%"}
                          {label === "Income Tax" && "28%"}
                          {label === "Net Retirement Income" && "28%"}
                          {label === "Cumulative Taxes Paid" && "10%"}
                          {label === "Taxes Due" && "28%"}
                        </TableCell>
                        <TableCell
                          className={`border cursor-pointer whitespace-nowrap ${
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white"
                          } ${
                            columnTextWhite.taxFreePlan
                              ? "text-white opacity-0"
                              : "text-black"
                          } transition-colors duration-300`}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {label === "Starting Balance" && "0"}
                          {label === "Annual Contributions" && "$20,000"}
                          {label === "Annual Employer Match" && "N/A"}
                          {label === "Annual Fees" && "Included"}
                          {label === "Gross Retirement Income" &&
                            `$${taxFreeResults.grossRetirementIncome.toLocaleString()}`}
                          {label === "Income Tax" &&
                            `$${taxFreeResults.incomeTax.toLocaleString()}`}
                          {label === "Net Retirement Income" &&
                            `$${taxFreeResults.netRetirementIncome.toLocaleString()}`}
                          {label === "Cumulative Taxes Deferred" &&
                            `$${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}`}
                          {label === "Cumulative Taxes Paid" &&
                            `$${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}`}
                          {label === "Cumulative Fees Paid" &&
                            `$${taxFreeResults.cumulativeFeesPaid.toLocaleString()}`}
                          {label === "Cumulative Net Income" &&
                            `$${taxFreeResults.cumulativeNetIncome.toLocaleString()}`}
                          {label === "Cumulative Account Balance" &&
                            `$${taxFreeResults.cumulativeAccountBalance.toLocaleString()}`}
                          {label === "Taxes Due" &&
                            `${taxFreeResults.taxesDue}%`}
                          {label === "Death Benefits" &&
                            `$${taxFreeResults.deathBenefits.toLocaleString()}`}
                          {label === "Years You Run Out of Money" &&
                            `${taxFreeResults.yearsRunOutOfMoney}`}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
            >
              <Card className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">Comparison Table</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTableCardExpanded(false)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="overflow-auto">
                  <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="grow"
                            >
                              Options
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="grow"
                            >
                              Show/Hide
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead
                          className={`bg-red-200 cursor-pointer ${
                            columnTextWhite.currentPlan
                              ? "text-red-200"
                              : "text-black"
                          } transition-colors duration-300`}
                          onClick={() => handleHeaderClick("currentPlan")}
                          aria-label="Toggle Current Plan column text color"
                        >
                          Current Plan <br /> TSP, 401k, 403b, IRA
                        </TableHead>
                        <TableHead
                          className={`bg-yellow-200 cursor-pointer ${
                            columnTextWhite.taxes
                              ? "text-yellow-200"
                              : "text-black"
                          } transition-colors duration-300`}
                          onClick={() => handleHeaderClick("taxes")}
                          aria-label="Toggle Taxes column text color"
                        >
                          Taxes
                        </TableHead>
                        <TableHead
                          className={`bg-green-200 cursor-pointer ${
                            columnTextWhite.taxFreePlan
                              ? "text-green-200"
                              : "text-black"
                          } transition-colors duration-300`}
                          onClick={() => handleHeaderClick("taxFreePlan")}
                          aria-label="Toggle Tax Free Plan column text color"
                        >
                          IRS (IRC) 7702 <br /> Tax Free Plan
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        "Starting Balance",
                        "Annual Contributions",
                        "Annual Employer Match",
                        "Annual Fees",
                        "Gross Retirement Income",
                        "Income Tax",
                        "Net Retirement Income",
                        "Cumulative Taxes Deferred",
                        "Cumulative Taxes Paid",
                        "Cumulative Fees Paid",
                        "Cumulative Net Income",
                        "Cumulative Account Balance",
                        "Taxes Due",
                        "Death Benefits",
                        "Years You Run Out of Money",
                      ].map((label, index) => (
                        <TableRow key={label}>
                          <TableCell
                            className={`border cursor-pointer whitespace-nowrap ${
                              highlightedRow === index ? "bg-[#ffa1ad]" : ""
                            }`}
                            onClick={() => handleCellClick(index)}
                            aria-selected={highlightedRow === index}
                          >
                            {label}
                          </TableCell>
                          <TableCell
                            className={`border cursor-pointer whitespace-nowrap ${
                              highlightedRow === index
                                ? "bg-[#ffa1ad]"
                                : "bg-white"
                            } ${
                              columnTextWhite.currentPlan
                                ? "text-white opacity-0"
                                : "text-black"
                            } transition-colors duration-300`}
                            onClick={() => handleCellClick(index)}
                            aria-selected={highlightedRow === index}
                          >
                            {label === "Starting Balance" && "0"}
                            {label === "Annual Contributions" && "$25,641"}
                            {label === "Annual Employer Match" && "$0"}
                            {label === "Annual Fees" && "2%"}
                            {label === "Gross Retirement Income" &&
                              `$${defaultResults.grossRetirementIncome.toLocaleString()}`}
                            {label === "Income Tax" &&
                              `$${defaultResults.incomeTax.toLocaleString()}`}
                            {label === "Net Retirement Income" &&
                              `$${defaultResults.netRetirementIncome.toLocaleString()}`}
                            {label === "Cumulative Taxes Deferred" &&
                              `$${defaultResults.cumulativeTaxesDeferred.toLocaleString()}`}
                            {label === "Cumulative Taxes Paid" &&
                              `$${defaultResults.cumulativeTaxesPaid.toLocaleString()}`}
                            {label === "Cumulative Fees Paid" &&
                              `$${defaultResults.cumulativeFeesPaid.toLocaleString()}`}
                            {label === "Cumulative Net Income" &&
                              `$${defaultResults.cumulativeNetIncome.toLocaleString()}`}
                            {label === "Cumulative Account Balance" &&
                              `$${defaultResults.cumulativeAccountBalance.toLocaleString()}`}
                            {label === "Taxes Due" &&
                              `${defaultResults.taxesDue}%`}
                            {label === "Death Benefits" &&
                              `$${defaultResults.deathBenefits.toLocaleString()}`}
                            {label === "Years You Run Out of Money" &&
                              `${defaultResults.yearsRunOutOfMoney}`}
                          </TableCell>
                          <TableCell
                            className={`border cursor-pointer whitespace-nowrap ${
                              highlightedRow === index
                                ? "bg-[#ffa1ad]"
                                : "bg-white"
                            } ${
                              columnTextWhite.taxes
                                ? "text-white opacity-0"
                                : "text-red-600"
                            } transition-colors duration-300`}
                            onClick={() => handleCellClick(index)}
                            aria-selected={highlightedRow === index}
                          >
                            {label === "Starting Balance" && "10%"}
                            {label === "Annual Contributions" && "22%"}
                            {label === "Income Tax" && "28%"}
                            {label === "Net Retirement Income" && "28%"}
                            {label === "Cumulative Taxes Paid" && "10%"}
                            {label === "Taxes Due" && "28%"}
                          </TableCell>
                          <TableCell
                            className={`border cursor-pointer whitespace-nowrap ${
                              highlightedRow === index
                                ? "bg-[#ffa1ad]"
                                : "bg-white"
                            } ${
                              columnTextWhite.taxFreePlan
                                ? "text-white opacity-0"
                                : "text-black"
                            } transition-colors duration-300`}
                            onClick={() => handleCellClick(index)}
                            aria-selected={highlightedRow === index}
                          >
                            {label === "Starting Balance" && "0"}
                            {label === "Annual Contributions" && "$20,000"}
                            {label === "Annual Employer Match" && "N/A"}
                            {label === "Annual Fees" && "Included"}
                            {label === "Gross Retirement Income" &&
                              `$${taxFreeResults.grossRetirementIncome.toLocaleString()}`}
                            {label === "Income Tax" &&
                              `$${taxFreeResults.incomeTax.toLocaleString()}`}
                            {label === "Net Retirement Income" &&
                              `$${taxFreeResults.netRetirementIncome.toLocaleString()}`}
                            {label === "Cumulative Taxes Deferred" &&
                              `$${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}`}
                            {label === "Cumulative Taxes Paid" &&
                              `$${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}`}
                            {label === "Cumulative Fees Paid" &&
                              `$${taxFreeResults.cumulativeFeesPaid.toLocaleString()}`}
                            {label === "Cumulative Net Income" &&
                              `$${taxFreeResults.cumulativeNetIncome.toLocaleString()}`}
                            {label === "Cumulative Account Balance" &&
                              `$${taxFreeResults.cumulativeAccountBalance.toLocaleString()}`}
                            {label === "Taxes Due" &&
                              `${taxFreeResults.taxesDue}%`}
                            {label === "Death Benefits" &&
                              `$${taxFreeResults.deathBenefits.toLocaleString()}`}
                            {label === "Years You Run Out of Money" &&
                              `${taxFreeResults.yearsRunOutOfMoney}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column - Company Info, Future Age, and Tabs */}
      <div className="flex flex-col gap-4 relative">
        <div className="flex gap-4">
          {/* Future Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          >
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="">
                  <Label className="text-sm text-center mb-4">Future Age</Label>
                  <div className="flex flex-col gap-2">
                    <motion.div
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 2px #3b82f6",
                      }}
                    >
                      <Input
                        placeholder="Age"
                        type="number"
                        value={futureAge}
                        onChange={handleFutureAgeChange}
                        className="w-20"
                      />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
            className="grow"
          >
            <Card>
              <CardContent className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-2/5"
                >
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="font-bold"
                  >
                    {companyDetails.businessName}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {companyDetails.agentName}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    {companyDetails.phone}
                  </motion.p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={defaultLogo.src}
                    alt="Logo"
                    width={300}
                    height={300}
                    className="object-contain w-full"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Image
                    src={defaultProfile.src}
                    width={200}
                    height={200}
                    alt={defaultProfile.name}
                    className="w-[120px] h-[120px] object-cover rounded-full"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs Card with Full-Screen Toggle */}
        <AnimatePresence>
          {!isTabCardExpanded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className="grow"
            >
              <Card className="h-full">
                <CardContent className="pt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 120,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {tabs
                          .filter((tab) => tab.isVisible) // Only show visible tabs
                          .map((tab) => (
                            <motion.div
                              key={tab.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: tabs.indexOf(tab) * 0.1,
                              }}
                              whileHover={{
                                scale: 1,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  activeTab === tab.id ? "default" : "outline"
                                }
                                onClick={() => setActiveTab(tab.id)}
                                aria-selected={activeTab === tab.id}
                              >
                                {tab.name}
                              </Button>
                            </motion.div>
                          ))}
                      </div>
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTabCardExpanded(true)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <motion.div
                            whileHover={{
                              scale: 1.1,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button variant="outline">Add</Button>
                          </motion.div>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-50 p-6">
                          <DialogHeader>
                            <DialogTitle>Add New Tab</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Tab Name"
                              value={newTabName}
                              onChange={(e) => setNewTabName(e.target.value)}
                              className="rounded-md"
                            />
                            <Button asChild>
                              <label className="flex items-center gap-2 cursor-pointer">
                                Upload File
                                <Upload className="h-4 w-4" />
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,video/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setNewTabFile(file);
                                  }}
                                />
                              </label>
                            </Button>
                            {newTabFile && <p>Selected: {newTabFile.name}</p>}
                            <Button
                              onClick={handleAddTab}
                              disabled={!newTabName || !newTabFile}
                              className="w-full"
                            >
                              Add Tab
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* New Manage Button and Dialog */}
                      <Dialog
                        open={isManageDialogOpen}
                        onOpenChange={setIsManageDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <motion.div
                            whileHover={{
                              scale: 1.1,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button variant="outline">Manage</Button>
                          </motion.div>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-50 p-6">
                          <DialogHeader>
                            <DialogTitle>Manage Tabs</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {tabs.map((tab, index) => (
                                <div
                                  key={tab.id}
                                  className="flex items-center justify-between p-2 border rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={tab.isVisible}
                                      onChange={() =>
                                        handleToggleVisibility(tab.id)
                                      }
                                      disabled={
                                        tab.id === "total-advantage" ||
                                        tab.id === "calculator"
                                      }
                                      className="h-4 w-4"
                                    />
                                    <span>{tab.name}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMoveUp(index)}
                                      disabled={index === 0}
                                      aria-label={`Move ${tab.name} up`}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMoveDown(index)}
                                      disabled={index === tabs.length - 1}
                                      aria-label={`Move ${tab.name} down`}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Button
                              onClick={() => setIsManageDialogOpen(false)}
                              className="w-full"
                            >
                              Save
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <AnimatePresence mode="wait">
                      {activeTab && (
                        <div key={activeTab} className="p-4 min-h-[200px]">
                          {tabs.map(
                            (tab) =>
                              tab.id === activeTab && (
                                <div key={tab.id} className="space-y-4">
                                  {tab.type === "totalAdvantage" && (
                                    <div className="h-[400px] flex items-center justify-center gap-4 text-center">
                                      <div className="mt-[100px] border-2 border-black w-full h-[200px] flex items-center justify-center flex-col">
                                        <h2 className="text-4xl font-bold mb-5">
                                          Total Advantage
                                        </h2>
                                        <h2 className="text-4xl font-bold mb-5">
                                          $
                                          {totalAdvantage.total.toLocaleString()}
                                        </h2>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="lg"
                                            className="cursor-pointer"
                                            onClick={() => {}}
                                          >
                                            Taxes $
                                            {totalAdvantage.taxes.toLocaleString()}
                                          </Button>
                                          <p>|</p>
                                          <Button
                                            variant="ghost"
                                            size="lg"
                                            className="cursor-pointer"
                                            onClick={() => {}}
                                          >
                                            Fees $
                                            {totalAdvantage.fees.toLocaleString()}
                                          </Button>
                                          <p>|</p>
                                          <Button
                                            variant="ghost"
                                            size="lg"
                                            className="cursor-pointer"
                                            onClick={() => {}}
                                          >
                                            Cumulative Income $
                                            {totalAdvantage.cumulativeIncome.toLocaleString()}
                                          </Button>
                                          <p>|</p>
                                          <Button
                                            variant="ghost"
                                            size="lg"
                                            className="cursor-pointer"
                                            onClick={() => {}}
                                          >
                                            Death Benefit $
                                            {totalAdvantage.deathBenefits.toLocaleString()}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {tab.type === "calculator" && (
                                    <div className="h-[400px] flex items-center justify-center gap-4 text-center">
                                      <TabCalculator />
                                    </div>
                                  )}
                                  {tab.type === "image" && tab.src && (
                                    <div>
                                      <Image
                                        src={tab.src}
                                        alt={tab.name}
                                        width={300}
                                        height={200}
                                        className="object-contain w-full h-[400px]"
                                      />
                                    </div>
                                  )}
                                  {tab.type === "video" && tab.src && (
                                    <div>
                                      <video
                                        src={tab.src}
                                        controls
                                        className="w-full h-auto max-h-64"
                                      />
                                    </div>
                                  )}
                                  {tab.type === "pdf" && tab.src && (
                                    <div>
                                      <embed
                                        src={tab.src}
                                        type="application/pdf"
                                        className="w-full h-64"
                                      />
                                    </div>
                                  )}
                                  {tab.type === "other" && tab.src && (
                                    <p>Unsupported file type: {tab.name}</p>
                                  )}
                                  {tab.id !== "total-advantage" &&
                                    tab.id !== "calculator" && (
                                      <div className="flex gap-2">
                                        <Dialog
                                          open={isEditDialogOpen}
                                          onOpenChange={setIsEditDialogOpen}
                                        >
                                          <DialogTrigger asChild>
                                            <motion.div
                                              whileHover={{
                                                scale: 1.1,
                                                boxShadow:
                                                  "0 2px 8px rgba(0,0,0,0.1)",
                                              }}
                                              whileTap={{ scale: 0.95 }}
                                            >
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setEditTabId(tab.id);
                                                  setNewTabName(tab.name);
                                                  setNewTabFile(null);
                                                }}
                                              >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                              </Button>
                                            </motion.div>
                                          </DialogTrigger>
                                          <DialogContent className="bg-gray-50 p-6">
                                            <DialogHeader>
                                              <DialogTitle>
                                                Edit Tab
                                              </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <Input
                                                placeholder="Tab Name"
                                                value={newTabName}
                                                onChange={(e) =>
                                                  setNewTabName(e.target.value)
                                                }
                                                className="rounded-md"
                                              />
                                              <Button asChild>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                  Upload New File (Optional)
                                                  <Upload className="h-4 w-4" />
                                                  <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,video/*,application/pdf"
                                                    onChange={(e) => {
                                                      const file =
                                                        e.target.files?.[0];
                                                      if (file)
                                                        setNewTabFile(file);
                                                    }}
                                                  />
                                                </label>
                                              </Button>
                                              {newTabFile && (
                                                <p>
                                                  Selected: {newTabFile.name}
                                                </p>
                                              )}
                                              <Button
                                                onClick={handleEditTab}
                                                disabled={!newTabName}
                                                className="w-full"
                                              >
                                                Save
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <motion.div
                                          whileHover={{
                                            scale: 1.1,
                                            boxShadow:
                                              "0 2px 8px rgba(0,0,0,0.1)",
                                          }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleDeleteTab(tab.id)
                                            }
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </Button>
                                        </motion.div>
                                      </div>
                                    )}
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {tabs
                      .filter((tab) => tab.isVisible) // Only show visible tabs
                      .map((tab) => (
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: tabs.indexOf(tab) * 0.1,
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={
                              activeTab === tab.id ? "default" : "outline"
                            }
                            onClick={() => setActiveTab(tab.id)}
                            aria-selected={activeTab === tab.id}
                          >
                            {tab.name}
                          </Button>
                        </motion.div>
                      ))}
                  </div>
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTabCardExpanded(false)}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline">Add</Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 p-6">
                      <DialogHeader>
                        <DialogTitle>Add New Tab</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Tab Name"
                          value={newTabName}
                          onChange={(e) => setNewTabName(e.target.value)}
                          className="rounded-md"
                        />
                        <Button asChild>
                          <label className="flex items-center gap-2 cursor-pointer">
                            Upload File
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setNewTabFile(file);
                              }}
                            />
                          </label>
                        </Button>
                        {newTabFile && <p>Selected: {newTabFile.name}</p>}
                        <Button
                          onClick={handleAddTab}
                          disabled={!newTabName || !newTabFile}
                          className="w-full"
                        >
                          Add Tab
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* New Manage Button and Dialog for Full-Screen View */}
                  <Dialog
                    open={isManageDialogOpen}
                    onOpenChange={setIsManageDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline">Manage</Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 p-6">
                      <DialogHeader>
                        <DialogTitle>Manage Tabs</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {tabs.map((tab, index) => (
                            <div
                              key={tab.id}
                              className="flex items-center justify-between p-2 border rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={tab.isVisible}
                                  onChange={() =>
                                    handleToggleVisibility(tab.id)
                                  }
                                  disabled={
                                    tab.id === "total-advantage" ||
                                    tab.id === "calculator"
                                  }
                                  className="h-4 w-4"
                                />
                                <span>{tab.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                  aria-label={`Move ${tab.name} up`}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === tabs.length - 1}
                                  aria-label={`Move ${tab.name} down`}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => setIsManageDialogOpen(false)}
                          className="w-full"
                        >
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <AnimatePresence mode="wait">
                  {activeTab && (
                    <div key={activeTab} className="p-4 flex-1 overflow-y-auto">
                      {tabs.map(
                        (tab) =>
                          tab.id === activeTab && (
                            <div key={tab.id} className="space-y-4">
                              {tab.type === "totalAdvantage" && (
                                <div className="h-full flex items-center justify-center gap-4 text-center">
                                  <div>
                                    <h2 className="text-3xl font-bold">
                                      ${totalAdvantage.total.toLocaleString()}
                                    </h2>
                                    <p>
                                      Taxes $
                                      {totalAdvantage.taxes.toLocaleString()}
                                    </p>
                                    <p>
                                      Fees $
                                      {totalAdvantage.fees.toLocaleString()}
                                    </p>
                                    <p>
                                      Cumulative Income $
                                      {totalAdvantage.cumulativeIncome.toLocaleString()}
                                    </p>
                                    <p>
                                      Death Benefit $
                                      {totalAdvantage.deathBenefits.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {tab.type === "calculator" && (
                                <div className="h-full flex items-center justify-center gap-4 text-center">
                                  <TabCalculator />
                                </div>
                              )}
                              {tab.type === "image" && tab.src && (
                                <div>
                                  <Image
                                    src={tab.src}
                                    alt={tab.name}
                                    width={300}
                                    height={200}
                                    className="object-contain w-full max-h-[80vh] mx-auto"
                                  />
                                </div>
                              )}
                              {tab.type === "video" && tab.src && (
                                <div>
                                  <video
                                    src={tab.src}
                                    controls
                                    className="w-full h-auto max-h-[80vh] mx-auto"
                                  />
                                </div>
                              )}
                              {tab.type === "pdf" && tab.src && (
                                <div>
                                  <embed
                                    src={tab.src}
                                    type="application/pdf"
                                    className="w-full h-[80vh] mx-auto"
                                  />
                                </div>
                              )}
                              {tab.type === "other" && tab.src && (
                                <p>Unsupported file type: {tab.name}</p>
                              )}
                              {tab.id !== "total-advantage" &&
                                tab.id !== "calculator" && (
                                  <div className="flex gap-2 justify-center">
                                    <Dialog
                                      open={isEditDialogOpen}
                                      onOpenChange={setIsEditDialogOpen}
                                    >
                                      <DialogTrigger asChild>
                                        <motion.div
                                          whileHover={{
                                            scale: 1.1,
                                            boxShadow:
                                              "0 2px 8px rgba(0,0,0,0.1)",
                                          }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setEditTabId(tab.id);
                                              setNewTabName(tab.name);
                                              setNewTabFile(null);
                                            }}
                                          >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                          </Button>
                                        </motion.div>
                                      </DialogTrigger>
                                      <DialogContent className="bg-gray-50 p-6">
                                        <DialogHeader>
                                          <DialogTitle>Edit Tab</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <Input
                                            placeholder="Tab Name"
                                            value={newTabName}
                                            onChange={(e) =>
                                              setNewTabName(e.target.value)
                                            }
                                            className="rounded-md"
                                          />
                                          <Button asChild>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                              Upload New File (Optional)
                                              <Upload className="h-4 w-4" />
                                              <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,video/*,application/pdf"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) setNewTabFile(file);
                                                }}
                                              />
                                            </label>
                                          </Button>
                                          {newTabFile && (
                                            <p>Selected: {newTabFile.name}</p>
                                          )}
                                          <Button
                                            onClick={handleEditTab}
                                            disabled={!newTabName}
                                            className="w-full"
                                          >
                                            Save
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <motion.div
                                      whileHover={{
                                        scale: 1.1,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                      }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteTab(tab.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </Button>
                                    </motion.div>
                                  </div>
                                )}
                            </div>
                          )
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
