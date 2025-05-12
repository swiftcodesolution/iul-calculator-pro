import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TabCalculator() {
  const [amount, setAmount] = useState(100000);
  const [age, setAge] = useState(45);
  const [taxRate, setTaxRate] = useState(22);

  const penalty = age < 59.5 ? amount * 0.1 : 0;
  const taxes = (amount - penalty) * (taxRate / 100);
  const netWithdrawal = amount - penalty - taxes;

  return (
    <div className="mx-auto p-6 space-y-5">
      <h1 className="text-xl font-semibold text-center">
        Early Withdrawal Tax Calculator
      </h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <Label className="grow">Amount to Withdraw</Label>
            <Input
              className="w-1/2"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
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

      {/* Net Advantage Summary */}
      <h1 className="text-xl font-semibold text-center">Net Advantage</h1>
      <div className="flex justify-center gap-4 mt-8 text-black">
        <div className=" text-center px-4 py-2 rounded w-32">
          <div className="font-bold text-xl">$0</div>
          <div className="text-sm">Total</div>
        </div>
        <div className="text-center px-4 py-2 rounded w-32">
          <div className="font-bold text-xl">$0</div>
          <div className="text-sm">Taxes Paid</div>
        </div>
        <div className="text-center px-4 py-2 rounded w-32">
          <div className="font-bold text-xl">$0</div>
          <div className="text-sm">Fees</div>
        </div>
        <div className="text-center px-4 py-2 rounded w-32">
          <div className="font-bold text-xl">$0</div>
          <div className="text-sm">Income</div>
        </div>
        <div className="text-center px-4 py-2 rounded w-32">
          <div className="font-bold text-xl">$0</div>
          <div className="text-sm">Death Benefit</div>
        </div>
      </div>
    </div>
  );
}
