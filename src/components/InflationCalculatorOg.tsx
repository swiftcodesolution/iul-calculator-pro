import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function InflationCalculatorOg() {
  const [currentExpenses, setCurrentExpenses] = useState("");
  const [futureExpenses, setFutureExpenses] = useState("");

  // Calculate future expenses with 1% inflation rate compounded annually
  const calculateFutureExpenses = (current: number, years: number) => {
    const inflationRate = 0.01; // 1% inflation
    return current * Math.pow(1 + inflationRate, years);
  };

  // Assume current age is 45 and target age is 95 (50 years)
  const currentAge = 45;
  const targetAge = 95;
  const years = targetAge - currentAge;

  // Update future expenses when current expenses change
  const handleCurrentExpensesChange = (value: string) => {
    setCurrentExpenses(value);
    const currentValue = parseFloat(value) || 0;
    const futureValue = calculateFutureExpenses(currentValue, years);
    setFutureExpenses(futureValue.toFixed(2));
  };

  return (
    <div className="w-full mx-auto p-4 space-y-5">
      <h1 className="text-xl font-semibold text-center">
        Inflation Calculator
      </h1>
      <Card className="border p-4">
        <CardContent className="space-y-6 pt-0">
          <div className="flex items-center gap-4">
            <Label className="w-1/2 text-right">
              Current Monthly Expenses $
            </Label>
            <Input
              className="w-1/2"
              type="number"
              value={currentExpenses}
              onChange={(e) => handleCurrentExpensesChange(e.target.value)}
              placeholder="Enter amount"
              min="0"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-1/2 text-right">
              Expenses at Age 95 - Inflation rate 1%
            </Label>
            <Input
              className="w-1/2"
              type="number"
              value={futureExpenses}
              readOnly
              placeholder="Calculated amount"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
