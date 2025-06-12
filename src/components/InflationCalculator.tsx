import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTableStore } from "@/lib/store";

const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

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

export default function InflationCalculator() {
  const [currentExpenses, setCurrentExpenses] = useState<string | number>("");
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
    const inflation = rate / 100;
    return current * Math.pow(1 + inflation, years);
  };

  const years = targetAge - currentAge;

  const handleCurrentExpensesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInputValue(e.target.value);
    setCurrentExpenses(value);
    const currentValue = typeof value === "number" ? value : 0;
    const futureValue = calculateFutureExpenses(
      currentValue,
      years,
      inflationRate
    );
    setFutureExpenses(formatMoney(futureValue));
  };

  const handleAgeChange = (value: string, setter: (value: number) => void) => {
    const newAge = parseFloat(value) || 0;
    setter(newAge);
    const currentValue = parseFloat(String(currentExpenses)) || 0;
    const futureValue = calculateFutureExpenses(
      currentValue,
      newAge - currentAge,
      inflationRate
    );
    setFutureExpenses(formatMoney(futureValue));
  };

  const handleInflationChange = (value: string) => {
    const newRate = parseFloat(value) || 0;
    setInflationRate(newRate);
    const currentValue = parseFloat(String(currentExpenses)) || 0;
    const futureValue = calculateFutureExpenses(currentValue, years, newRate);
    setFutureExpenses(formatMoney(futureValue));
  };

  return (
    <div className="w-full space-y-5">
      <h1 className="text-xl font-semibold text-center">
        Inflation Calculator
      </h1>
      <Card className="border p-4">
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Label className="w-1/2 text-right">
                Current Monthly Expenses
              </Label>
              <Input
                className="w-1/2"
                type="text"
                value={formatInputValue(currentExpenses)}
                onChange={handleCurrentExpensesChange}
                placeholder="$0.00"
                aria-label="Current Monthly Expenses"
              />
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
                aria-label="Target Age"
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
                aria-label="Inflation Rate"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label className="text-center text-2xl font-bold">
              Expenses at Age {targetAge} - Inflation rate {inflationRate}%
            </Label>
            {!futureExpenses ? (
              <p className="text-center text-2xl font-bold text-gray-400">
                Calculated Amount
              </p>
            ) : (
              <p className="text-center text-4xl font-bold">{futureExpenses}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
