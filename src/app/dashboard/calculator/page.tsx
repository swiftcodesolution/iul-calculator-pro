"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Upload, Trash2, Pencil } from "lucide-react";

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

// Define type for tab content
type TabContent = {
  id: string;
  name: string;
  file?: File;
  src?: string; // Data URL for preview
  type: "image" | "video" | "pdf" | "other" | "totalAdvantage";
};

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

// Hardcoded company/agent details (same as Home Page)
const companyDetails = {
  businessName: "Acme Insurance",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "760-517-8105",
};
const defaultLogo = { src: "/logo.png", name: "Company Logo" };
const defaultProfile = { src: "/profile.jpg", name: "Agent Profile" };

export default function CalculatorPage() {
  const [data, setData] = useState<CalculatorData>(defaultData);
  const [futureAge, setFutureAge] = useState(data.futureAgeYears);
  const [tabs, setTabs] = useState<TabContent[]>([
    {
      id: "total-advantage",
      name: "Total Advantage",
      type: "totalAdvantage",
    },
  ]);
  const [activeTab, setActiveTab] = useState<string | null>("total-advantage");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);

  // Update future age and recalculate (simplified for now)
  const handleFutureAgeChange = (value: string) => {
    const newAge = parseInt(value);
    setFutureAge(newAge);
    setData((prev) => ({ ...prev, futureAgeYears: newAge }));
  };

  const handleAddYear = () => {
    const newAge = Math.min(futureAge + 1, 14);
    setFutureAge(newAge);
    setData((prev) => ({ ...prev, futureAgeYears: newAge }));
  };

  // Tab Management
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
      if (editTabId === "total-advantage") {
        // Only update name for Total Advantage tab
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
    if (id === "total-advantage") return; // Prevent deletion of Total Advantage tab
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Input Section (Left) */}
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {/* Age and Rates */}
              <div className="bg-gray-200 p-2">
                <Label>Current Age</Label>
                <Input type="number" value={data.currentAge} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Working Tax Rate</Label>
                <Input type="number" value={data.workingTaxRate} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Stop Saving Age</Label>
                <Input type="number" value={data.stopSavingAge} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Retirement Tax Rate</Label>
                <Input type="number" value={data.retirementTaxRate} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Retirement Age</Label>
                <Input type="number" value={data.retirementAge} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Inflation Rate</Label>
                <Input type="number" value={data.inflationRate} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Current Plan Fees</Label>
                <Input type="number" value={data.currentPlanFees} readOnly />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Current Plan ROR</Label>
                <Input
                  type="number"
                  value={data.currentPlan.rateOfReturn}
                  readOnly
                />
              </div>
              <div className="bg-gray-200 p-2">
                <Label>Tax Free Plan ROR</Label>
                <Input
                  type="number"
                  value={data.taxFreePlan.rateOfReturn}
                  readOnly
                />
              </div>

              {/* Plan Details */}
              <div className="col-span-2 bg-red-200 p-2">
                <Label>Current Plan</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Starting Balance</Label>
                    <Input
                      type="number"
                      value={data.currentPlan.startingBalance}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Contributions</Label>
                    <Input
                      type="number"
                      value={data.currentPlan.annualContribution}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Employer Match</Label>
                    <Input
                      type="number"
                      value={data.currentPlan.annualEmployerMatch}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Fees</Label>
                    <Input
                      type="number"
                      value={data.currentPlan.annualFees}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-2 bg-green-200 p-2">
                <Label>Tax Free Plan</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Starting Balance</Label>
                    <Input
                      type="number"
                      value={data.taxFreePlan.startingBalance}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Contributions</Label>
                    <Input
                      type="number"
                      value={data.taxFreePlan.annualContribution}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Employer Match</Label>
                    <Input
                      type="number"
                      value={data.taxFreePlan.annualEmployerMatch}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Annual Fees</Label>
                    <Input
                      type="text"
                      value={data.taxFreePlan.annualFees}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Future Age Selector */}
              <div className="col-span-2 bg-gray-200 p-2 flex items-center justify-between">
                <Label>Future Age</Label>
                <div className="flex gap-2">
                  <Select
                    value={futureAge.toString()}
                    onValueChange={handleFutureAgeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 14 }, (_, i) => i + 1).map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleAddYear}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <Button variant="secondary" className="w-full">
                  Options Show / Hide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table (Center) */}
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2"></th>
                  <th className="border p-2 bg-red-200">Current Plan</th>
                  <th className="border p-2 bg-green-200">Tax Free Plan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Gross Retirement Income</td>
                  <td className="border p-2">
                    ${defaultResults.grossRetirementIncome.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.grossRetirementIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Income Tax</td>
                  <td className="border p-2 text-red-600">
                    ${defaultResults.incomeTax.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.incomeTax.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Net Retirement Income</td>
                  <td className="border p-2">
                    ${defaultResults.netRetirementIncome.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.netRetirementIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Cumulative Taxes Deferred</td>
                  <td className="border p-2">
                    ${defaultResults.cumulativeTaxesDeferred.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Cumulative Taxes Paid</td>
                  <td className="border p-2 text-red-600">
                    ${defaultResults.cumulativeTaxesPaid.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Cumulative Fees Paid</td>
                  <td className="border p-2">
                    ${defaultResults.cumulativeFeesPaid.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.cumulativeFeesPaid.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Cumulative Net Income</td>
                  <td className="border p-2">
                    ${defaultResults.cumulativeNetIncome.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.cumulativeNetIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Cumulative Account Balance</td>
                  <td className="border p-2">
                    ${defaultResults.cumulativeAccountBalance.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.cumulativeAccountBalance.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Taxes Due</td>
                  <td className="border p-2 text-red-600">
                    {defaultResults.taxesDue}%
                  </td>
                  <td className="border p-2">{taxFreeResults.taxesDue}%</td>
                </tr>
                <tr>
                  <td className="border p-2">Death Benefits</td>
                  <td className="border p-2">
                    ${defaultResults.deathBenefits.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${taxFreeResults.deathBenefits.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Years You Run Out of Money</td>
                  <td className="border p-2">
                    {defaultResults.yearsRunOutOfMoney}
                  </td>
                  <td className="border p-2 text-green-600">
                    {taxFreeResults.yearsRunOutOfMoney}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right Column: Two Cards */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Top Card: Company/Agent Details */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="grow">
                  <p className="text-gray-500">{companyDetails.businessName}</p>
                  <p className="text-gray-500">{companyDetails.agentName}</p>
                  <p className="text-gray-500">{companyDetails.email}</p>
                  <p className="text-gray-500">{companyDetails.phone}</p>
                </div>
                <Image
                  src={defaultLogo.src}
                  alt="Company Logo"
                  width={300}
                  height={100}
                  className="object-contain w-1/3 h-32"
                />
                <Image
                  src={defaultProfile.src}
                  alt="Agent Profile"
                  width={128}
                  height={128}
                  className="object-cover w-32 h-32 rounded-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Card: Tabbed Interface */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </Button>
                ))}
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">Add</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Tab</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Tab Name"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
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
                      >
                        Add Tab
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tab Content */}
              {activeTab && (
                <div className="flex-1 border p-4 rounded">
                  {tabs.map(
                    (tab) =>
                      tab.id === activeTab && (
                        <div key={tab.id} className="space-y-4">
                          {tab.type === "totalAdvantage" && (
                            <div className="text-center">
                              <h2 className="text-2xl font-bold">
                                ${totalAdvantage.total.toLocaleString()}
                              </h2>
                              <p>
                                Taxes ${totalAdvantage.taxes.toLocaleString()}
                              </p>
                              <p>
                                Fees ${totalAdvantage.fees.toLocaleString()}
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
                          )}
                          {tab.type === "image" && tab.src && (
                            <Image
                              src={tab.src}
                              alt={tab.name}
                              width={300}
                              height={200}
                              className="object-contain w-full h-auto"
                            />
                          )}
                          {tab.type === "video" && tab.src && (
                            <video
                              src={tab.src}
                              controls
                              className="w-full h-auto max-h-64"
                            />
                          )}
                          {tab.type === "pdf" && tab.src && (
                            <embed
                              src={tab.src}
                              type="application/pdf"
                              className="w-full h-64"
                            />
                          )}
                          {tab.type === "other" && tab.src && (
                            <p>Unsupported file type: {tab.name}</p>
                          )}
                          {tab.id !== "total-advantage" && (
                            <div className="flex gap-2">
                              <Dialog
                                open={isEditDialogOpen}
                                onOpenChange={setIsEditDialogOpen}
                              >
                                <DialogTrigger asChild>
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
                                </DialogTrigger>
                                <DialogContent>
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
                                            const file = e.target.files?.[0];
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
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTab(tab.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
