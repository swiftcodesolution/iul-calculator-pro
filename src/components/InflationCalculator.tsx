import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTableStore } from "@/lib/store";

export default function InflationCalculator() {
  const [currentExpenses, setCurrentExpenses] = useState("");
  const [futureExpenses, setFutureExpenses] = useState("");

  const [targetAge, setTargetAge] = useState(95);
  const [inflationRate, setInflationRate] = useState(1);

  const currentAgeRaw = useTableStore((state) => state.boxesData.currentAge);
  const currentAge = Number(currentAgeRaw);

  const calculateFutureExpenses = (
    current: number,
    years: number,
    rate: number
  ) => {
    const inflation = rate / 100; // Convert percentage to decimal
    return current * Math.pow(1 + inflation, years);
  };

  const years = targetAge - currentAge;

  const handleCurrentExpensesChange = (value: string) => {
    setCurrentExpenses(value);
    const currentValue = parseFloat(value) || 0;
    const futureValue = calculateFutureExpenses(
      currentValue,
      years,
      inflationRate
    );
    setFutureExpenses(futureValue.toFixed(2));
  };

  const handleAgeChange = (value: string, setter: (value: number) => void) => {
    const newAge = parseFloat(value) || 0;
    setter(newAge);
    const currentValue = parseFloat(currentExpenses) || 0;
    const futureValue = calculateFutureExpenses(
      currentValue,
      targetAge - currentAge,
      inflationRate
    );
    setFutureExpenses(futureValue.toFixed(2));
  };

  const handleInflationChange = (value: string) => {
    const newRate = parseFloat(value) || 0;
    setInflationRate(newRate);
    const currentValue = parseFloat(currentExpenses) || 0;
    const futureValue = calculateFutureExpenses(currentValue, years, newRate);
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
            <Label className="w-1/2 text-right">Current Age</Label>
            <Label className="w-1/2">{currentAge}</Label>
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-1/2 text-right">Target Age</Label>
            <Input
              className="w-1/2"
              type="number"
              value={targetAge}
              onChange={(e) => handleAgeChange(e.target.value, setTargetAge)}
              placeholder="Enter age"
              min="0"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-1/2 text-right">Inflation Rate (%)</Label>
            <Input
              className="w-1/2"
              type="number"
              value={inflationRate}
              onChange={(e) => handleInflationChange(e.target.value)}
              placeholder="Enter rate"
              min="0"
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center gap-4">
        <Label className="text-center text-4xl font-bold">
          Expenses at Age {targetAge} - Inflation rate {inflationRate}%
        </Label>
        {!futureExpenses ? (
          <p className="text-center text-4xl font-bold text-gray-400">
            Calculated Amount
          </p>
        ) : (
          <p className="text-center text-4xl font-bold">{futureExpenses}</p>
        )}
        {/* <Input
          className="w-1/2 text-4xl font-bold"
          type="number"
          value={futureExpenses}
          readOnly
          placeholder="Calculated amount"
        /> */}
      </div>
    </div>
  );
}
