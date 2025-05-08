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
import { Card, CardContent } from "@/components/ui/card";
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

type TabContent = {
  id: string;
  name: string;
  file?: File;
  src?: string;
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

const companyDetails = {
  businessName: "IUL Calculator PRO",
  agentName: "Steven Johnson",
  email: "steve@iulcalculatorpro.com",
  phone: "(760) 517-8105",
};
const defaultLogo = { src: "/logo.png", name: "Company Logo" };
const defaultProfile = { src: "/profile.jpg", name: "Agent Profile" };

export default function CalculatorPage() {
  const [data, setData] = useState<CalculatorData>(defaultData);
  const [futureAge, setFutureAge] = useState(data.futureAgeYears);
  const [tabs, setTabs] = useState<TabContent[]>([
    { id: "total-advantage", name: "Total Advantage", type: "totalAdvantage" },
  ]);
  const [activeTab, setActiveTab] = useState<string | null>("total-advantage");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTabId, setEditTabId] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [newTabFile, setNewTabFile] = useState<File | null>(null);

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
    if (id === "total-advantage") return;
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-2 gap-4">
      {/* Left Column - Input Parameters */}
      <div className="flex flex-col gap-4">
        <Card>
          {/* top numbers start */}
          <CardContent className="grid grid-cols-3 gap-2">
            <div className="flex flex-col space-y-2">
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Current Age</Label>
                <p>{data.currentAge}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Stop Saving Age</Label>
                <p>{data.stopSavingAge}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Retirement Age</Label>
                <p>{data.retirementAge}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Working Tax Rate</Label>
                <p>{data.workingTaxRate}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Retirement Tax Rate</Label>
                <p>{data.retirementTaxRate}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Inflation Rate</Label>
                <p>{data.inflationRate}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Current Plan Fees</Label>
                <p>{data.currentPlanFees}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Current Plan ROR</Label>
                <p>{"6.3%"}</p>
              </div>
              <div className="bg-gray-200 py-2 px-4 text-end flex items-center justify-between rounded-md">
                <Label>Tax Free Plan ROR</Label>
                <p>{"6.3%"}</p>
              </div>
            </div>
          </CardContent>
          {/* top numbers end */}
        </Card>
        <Card>
          {/* comparision table start */}
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" className="grow">
                        Options
                      </Button>
                      <Button variant="default" size="sm" className="grow">
                        Show/Hide
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="bg-red-200">
                    Current Plan <br></br> TSP, 401k, 403b, IRA
                  </TableHead>
                  <TableHead className="bg-yellow-200">Taxes</TableHead>
                  <TableHead className="bg-green-200">
                    IRS (IRC) 7702 <br></br> Tax Free Plan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border">Starting Balance</TableCell>
                  <TableCell className="border">0</TableCell>
                  <TableCell className="border text-red-600">10%</TableCell>
                  <TableCell className="border">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Annual Contributions</TableCell>
                  <TableCell className="border">$25,641</TableCell>
                  <TableCell className="border text-red-600">22%</TableCell>
                  <TableCell className="border">$20,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Annual Employer Match
                  </TableCell>
                  <TableCell className="border">$0</TableCell>
                  <TableCell className="border text-red-600"></TableCell>
                  <TableCell className="border">N/A</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Annual Fees</TableCell>
                  <TableCell className="border">2%</TableCell>
                  <TableCell className="border text-red-600"></TableCell>
                  <TableCell className="border">Included</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Gross Retirement Income
                  </TableCell>
                  <TableCell className="border">
                    ${defaultResults.grossRetirementIncome.toLocaleString()}
                  </TableCell>
                  <TableCell className="border text-red-600">28%</TableCell>
                  <TableCell className="border">
                    ${taxFreeResults.grossRetirementIncome.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Income Tax</TableCell>
                  <TableCell className="border text-red-600">
                    ${defaultResults.incomeTax.toLocaleString()}
                  </TableCell>
                  <TableCell className="border text-red-600">28%</TableCell>
                  <TableCell className="border">
                    ${taxFreeResults.incomeTax.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Net Retirement Income
                  </TableCell>
                  <TableCell className="border">
                    ${defaultResults.netRetirementIncome.toLocaleString()}
                  </TableCell>
                  <TableCell className="border text-red-600">28%</TableCell>
                  <TableCell className="border text-green-600">
                    ${taxFreeResults.netRetirementIncome.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Cumulative Taxes Deferred
                  </TableCell>
                  <TableCell className="border">
                    ${defaultResults.cumulativeTaxesDeferred.toLocaleString()}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border">
                    ${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Cumulative Taxes Paid
                  </TableCell>
                  <TableCell className="border text-red-600">
                    ${defaultResults.cumulativeTaxesPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="border text-red-600">10%</TableCell>
                  <TableCell className="border">
                    ${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Cumulative Fees Paid</TableCell>
                  <TableCell className="border">
                    ${defaultResults.cumulativeFeesPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border">
                    ${taxFreeResults.cumulativeFeesPaid.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Cumulative Net Income
                  </TableCell>
                  <TableCell className="border">
                    ${defaultResults.cumulativeNetIncome.toLocaleString()}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border">
                    ${taxFreeResults.cumulativeNetIncome.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Cumulative Account Balance
                  </TableCell>
                  <TableCell className="border">
                    ${defaultResults.cumulativeAccountBalance.toLocaleString()}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border">
                    ${taxFreeResults.cumulativeAccountBalance.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Taxes Due</TableCell>
                  <TableCell className="border text-red-600">
                    {defaultResults.taxesDue}%
                  </TableCell>
                  <TableCell className="border text-red-600">28%</TableCell>
                  <TableCell className="border">
                    {taxFreeResults.taxesDue}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">Death Benefits</TableCell>
                  <TableCell className="border">
                    ${defaultResults.deathBenefits.toLocaleString()}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border">
                    ${taxFreeResults.deathBenefits.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border">
                    Years You Run Out of Money
                  </TableCell>
                  <TableCell className="border">
                    {defaultResults.yearsRunOutOfMoney}
                  </TableCell>
                  <TableCell className="border" />
                  <TableCell className="border text-green-600">
                    {taxFreeResults.yearsRunOutOfMoney}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          {/* comparision table end */}
        </Card>
      </div>

      {/* Right Column - Company Info and Tabs */}
      <div className="flex flex-col gap-4">
        {/* company details start */}
        <Card>
          <CardContent className="flex items-center space-x-4">
            <div className="w-2/5">
              <h3 className="font-bold">{companyDetails.businessName}</h3>
              <p>{companyDetails.agentName}</p>
              <p>{companyDetails.phone}</p>
            </div>
            <Image
              src={defaultLogo.src}
              alt="Logo"
              width={300}
              height={300}
              className="object-contain w-1/3"
            />
            <Image
              src={defaultProfile.src}
              width={200}
              height={200}
              alt={defaultProfile.name}
              className="w-[120px] h-[120px] object-cover rounded-full"
            />
          </CardContent>
        </Card>
        {/* company details end */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 bg-gray-200 p-2 flex items-center justify-between rounded-md">
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
                      {Array.from({ length: 40 }, (_, i) => i + 80).map(
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
            </div>
          </CardContent>
        </Card>
        <Card className="grow">
          <CardContent>
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
              {/* {[...Array(14).keys()].slice(1, 14).map((i) => (
                <Button key={`tab-${i + 1}`} variant="outline" disabled>
                  {i + 1}
                </Button>
              ))} */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Add</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Tab</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 space-x-2">
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
            {activeTab && (
              <div className="p-4 min-h-[200px]">
                {tabs.map(
                  (tab) =>
                    tab.id === activeTab && (
                      <div key={tab.id} className="space-y-4">
                        {tab.type === "totalAdvantage" && (
                          <div className="h-[400px] flex items-center justify-center gap-4 text-center">
                            <div>
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
                          </div>
                        )}
                        {tab.type === "image" && tab.src && (
                          <Image
                            src={tab.src}
                            alt={tab.name}
                            width={300}
                            height={200}
                            className="object-contain w-full h-[400px]"
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
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Tab</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 space-x-2">
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
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
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
  );
}
