"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataPage() {
  const data = Array.from({ length: 80 }, (_, i) => {
    const year = 2025 + i;
    const age = 40 + i;
    const annual401kValue = Math.round(100000 * Math.pow(1.063, i));
    const annualIULValue = Math.round(100000 * Math.pow(1.063, i) * 1.5);
    const annual401kIncome = Math.round(4000 * Math.pow(1.02, i));
    const annualIULIncome = Math.round(4000 * Math.pow(1.02, i) * 1.5);

    const annualContributions = 5000; // example contribution per year
    const tfpAnnualContributions = annualContributions * 1.1; // TFP contributions slightly higher
    const grossRetirementIncome = annual401kIncome + annualIULIncome;
    const retirementTaxes = grossRetirementIncome * 0.2; // assume 20% tax rate
    const retirementIncome = grossRetirementIncome - retirementTaxes;
    const tfpRetirementIncome = retirementIncome * 1.05; // TFP Retirement Income adjusted by 5%

    const managementFee = annual401kValue * 0.01; // 1% of the 401k value as management fee
    const tfpFee = annualIULValue * 0.01; // 1% of IUL value as TFP Fee
    const interest = annual401kValue * 0.063; // 6.3% interest earned
    const endOfYearBalance = annual401kValue + interest; // End of Year balance based on interest
    const tfpCumulativeBalance = annualIULValue + interest * 1.5; // Cumulative TFP balance
    const cumulativeIncome = (annual401kIncome + annualIULIncome) * (i + 1); // cumulative income
    const tfpCumulativeIncome = cumulativeIncome * 1.5; // TFP Cumulative Income adjusted
    const cumulativeFee = managementFee * (i + 1); // Total management fee accumulated
    const tfpCumulativeFee = tfpFee * (i + 1); // Total TFP Fee accumulated
    const cumulativeTaxesDeferred = retirementTaxes * (i + 1); // Deferred taxes
    const deathBenefit = annualIULValue * 1.2; // IUL death benefit (20% of IUL value)
    const tfpDeathBenefit = tfpCumulativeBalance * 1.2; // TFP Death Benefit (20% of TFP value)

    return {
      year,
      age,
      "Annual Contributions": annualContributions.toLocaleString(),
      "TFP Annual Contributions": tfpAnnualContributions.toLocaleString(),
      "Gross Retirement Income": grossRetirementIncome.toLocaleString(),
      "Retirement Taxes": retirementTaxes.toLocaleString(),
      "Retirement Income": retirementIncome.toLocaleString(),
      "TFP Retirement Income": tfpRetirementIncome.toLocaleString(),
      "Management Fee": managementFee.toLocaleString(),
      "TFP Fee": tfpFee.toLocaleString(),
      Interest: interest.toLocaleString(),
      "End of Year Balance": endOfYearBalance.toLocaleString(),
      "TFP Cumulative Balance": tfpCumulativeBalance.toLocaleString(),
      "Cumulative Income": cumulativeIncome.toLocaleString(),
      "TFP Cumulative Income": tfpCumulativeIncome.toLocaleString(),
      "Cumulative Fee": cumulativeFee.toLocaleString(),
      "TFP Cumulative Fee": tfpCumulativeFee.toLocaleString(),
      "Cumulative Taxes Deferred": cumulativeTaxesDeferred.toLocaleString(),
      "Death Benefit": deathBenefit.toLocaleString(),
      "TFP Death Benefit": tfpDeathBenefit.toLocaleString(),
    };
  }).slice(0, 79); // Up to age 119 (40 + 79 = 119)

  // min-h-[calc(100vh-8rem)]
  return (
    <div className="">
      <Card className="w-full h-[91vh] overflow-y-scroll">
        <CardHeader>
          <CardTitle>Year-by-Year Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full h-full overflow-scroll">
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Annual Contributions</TableHead>
                <TableHead>TFP Annual Contributions</TableHead>
                <TableHead>Gross Retirement Income</TableHead>
                <TableHead>Retirement Taxes</TableHead>
                <TableHead>Retirement Income</TableHead>
                <TableHead>TFP Retirement Income</TableHead>
                <TableHead>Management Fee</TableHead>
                <TableHead>TFP Fee</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>End of Year Balance</TableHead>
                <TableHead>TFP Cumulative Balance</TableHead>
                <TableHead>Cumulative Income</TableHead>
                <TableHead>TFP Cumulative Income</TableHead>
                <TableHead>Cumulative Fee</TableHead>
                <TableHead>TFP Cumulative Fee</TableHead>
                <TableHead>Cumulative Taxes Deferred</TableHead>
                <TableHead>Death Benefit</TableHead>
                <TableHead>TFP Death Benefit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row["Annual Contributions"]}</TableCell>
                  <TableCell>{row["TFP Annual Contributions"]}</TableCell>
                  <TableCell>{row["Gross Retirement Income"]}</TableCell>
                  <TableCell>{row["Retirement Taxes"]}</TableCell>
                  <TableCell>{row["Retirement Income"]}</TableCell>
                  <TableCell>{row["TFP Retirement Income"]}</TableCell>
                  <TableCell>{row["Management Fee"]}</TableCell>
                  <TableCell>{row["TFP Fee"]}</TableCell>
                  <TableCell>{row["Interest"]}</TableCell>
                  <TableCell>{row["End of Year Balance"]}</TableCell>
                  <TableCell>{row["TFP Cumulative Balance"]}</TableCell>
                  <TableCell>{row["Cumulative Income"]}</TableCell>
                  <TableCell>{row["TFP Cumulative Income"]}</TableCell>
                  <TableCell>{row["Cumulative Fee"]}</TableCell>
                  <TableCell>{row["TFP Cumulative Fee"]}</TableCell>
                  <TableCell>{row["Cumulative Taxes Deferred"]}</TableCell>
                  <TableCell>{row["Death Benefit"]}</TableCell>
                  <TableCell>{row["TFP Death Benefit"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
