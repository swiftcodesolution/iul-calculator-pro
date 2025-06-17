import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Utility functions from InflationCalculator
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

export default function TabCalculator() {
  // Changed to string | number to match InflationCalculator
  const [amount, setAmount] = useState<string | number>(100000);
  const [age, setAge] = useState(45);
  const [taxRate, setTaxRate] = useState(22);

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInputValue(e.target.value);
    setAmount(value);
  };

  // Convert amount to number for calculations, default to 0 if empty
  const amountNum = typeof amount === "number" ? amount : 0;
  const penalty = age < 59.5 ? amountNum * 0.1 : 0;
  const taxes = (amountNum - penalty) * (taxRate / 100);
  const netWithdrawal = amountNum - penalty - taxes;

  return (
    <div className="w-full mx-auto p-4 space-y-5">
      <h1 className="text-xl font-semibold text-center">
        Early Withdrawal Tax Calculator
      </h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <Label className="grow">Amount to Withdraw</Label>
            <Input
              className="w-1/2"
              type="text" // Changed to text for $ formatting
              value={formatInputValue(amount)}
              onChange={handleAmountChange}
              placeholder="$0.00"
              aria-label="Amount to Withdraw"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="grow">Current Age</Label>
            <Input
              className="w-1/2"
              type="number"
              value={age}
              onChange={(e) => setAge(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="grow">Income Tax Rate (%)</Label>
            <Input
              className="w-1/2"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-2 border-t pt-4 text-right">
        <div className="flex justify-between">
          <span>Penalties</span>
          <span>${penalty.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes</span>
          <span>${taxes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Net Withdrawal</span>
          <span>${netWithdrawal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
