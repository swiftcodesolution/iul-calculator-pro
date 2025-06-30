import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTableStore } from "@/lib/store";

// Utility functions
const formatInputValue = (value: string | number): string => {
  if (value === "" || value == null) return "";
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "";
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const parseInputValue = (value: string): number | string => {
  if (value === "") return "";
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  return isNaN(num) || num < 0 ? "" : num;
};

export default function AnnualContributionCalculatorForIUL() {
  const {
    annualContributions,
    calculatorAge,
    calculatorTaxRate,
    setAnnualContributions,
    setCalculatorAge,
    setCalculatorTaxRate,
  } = useTableStore();

  const [contribution, setContribution] = useState<string | number>(
    annualContributions
  );
  const [age, setAge] = useState(calculatorAge);
  const [taxRate, setTaxRate] = useState(calculatorTaxRate);

  useEffect(() => {
    if (annualContributions) {
      setContribution(annualContributions);
      setAnnualContributions(annualContributions);
    }
  }, [annualContributions, setAnnualContributions]);

  useEffect(() => {
    setAnnualContributions(contribution);
  }, [contribution, setAnnualContributions]);

  useEffect(() => {
    setCalculatorAge(age);
    setCalculatorTaxRate(taxRate);
  }, [age, taxRate, setCalculatorAge, setCalculatorTaxRate]);

  const handleContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInputValue(e.target.value);
    setContribution(value);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || "";
    setAge(value);
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || "";
    setTaxRate(value);
  };

  const contributionNum = typeof contribution === "number" ? contribution : 0;
  const taxRateNum = typeof taxRate === "number" ? taxRate : 0;
  const taxes = contributionNum * (taxRateNum / 100);
  const netContribution = contributionNum - taxes;

  return (
    <div className="w-full mx-auto p-4 space-y-5">
      <h1 className="text-xl font-semibold text-center">
        IUL Annual Contribution Calculator
      </h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <Label className="grow">Annual Contribution</Label>
            <Input
              className="w-1/2"
              type="text"
              value={formatInputValue(contribution)}
              onChange={handleContributionChange}
              placeholder="$0.00"
              aria-label="Annual Contribution"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="grow">Current Age</Label>
            <Input
              className="w-1/2"
              type="number"
              value={age}
              onChange={handleAgeChange}
              placeholder="Current Age"
              aria-label="Current Age"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="grow">Income Tax Rate (%)</Label>
            <Input
              className="w-1/2"
              type="number"
              value={taxRate}
              onChange={handleTaxRateChange}
              placeholder="Tax Rate"
              aria-label="Income Tax Rate"
            />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-2 border-t pt-4 text-right">
        <div className="flex justify-between">
          <span>Taxes</span>
          <span>${taxes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Net Contribution</span>
          <span>${netContribution.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
