"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Fullscreen, Minimize2 } from "lucide-react";

export default function DataPage() {
  const [evenColumnColor, setEvenColumnColor] = useState("#f0f0f0");
  const [oddColumnColor, setOddColumnColor] = useState("#e6f3ff");
  const [zoomIndex, setZoomIndex] = useState(1); // 1 = normal
  const [isFullScreen, setIsFullScreen] = useState(false);

  const zoomSteps = [0.8, 1, 1.2]; // Font scaling steps
  const fontSize = `${zoomSteps[zoomIndex]}rem`;
  const paddingSize = `${0.75 * zoomSteps[zoomIndex]}rem`;

  const handleZoomIn = () =>
    setZoomIndex((prev) => Math.min(prev + 1, zoomSteps.length - 1));
  const handleZoomOut = () => setZoomIndex((prev) => Math.max(prev - 1, 0));
  const handleFullScreenToggle = () => setIsFullScreen((prev) => !prev);

  function getContrastingTextColor(bgColor: string): string {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#FFFFFF"; // Light background = black text, dark background = white text
  }

  type TableRow = Record<string, string | number>;

  const data: TableRow[] = Array.from({ length: 80 }, (_, i) => {
    const year = 2025 + i;
    const age = 40 + i;
    const annual401kValue = Math.round(100000 * Math.pow(1.063, i));
    const annualIULValue = Math.round(annual401kValue * 1.5);
    const annual401kIncome = Math.round(4000 * Math.pow(1.02, i));
    const annualIULIncome = Math.round(annual401kIncome * 1.5);
    const annualContributions = 5000;
    const tfpAnnualContributions = annualContributions * 1.1;
    const grossRetirementIncome = annual401kIncome + annualIULIncome;
    const retirementTaxes = grossRetirementIncome * 0.2;
    const retirementIncome = grossRetirementIncome - retirementTaxes;
    const tfpRetirementIncome = retirementIncome * 1.05;
    const managementFee = annual401kValue * 0.01;
    const tfpFee = annualIULValue * 0.01;
    const interest = annual401kValue * 0.063;
    const endOfYearBalance = annual401kValue + interest;
    const tfpCumulativeBalance = annualIULValue + interest * 1.5;
    const cumulativeIncome = (annual401kIncome + annualIULIncome) * (i + 1);
    const tfpCumulativeIncome = cumulativeIncome * 1.5;
    const cumulativeFee = managementFee * (i + 1);
    const tfpCumulativeFee = tfpFee * (i + 1);
    const cumulativeTaxesDeferred = retirementTaxes * (i + 1);
    const deathBenefit = annualIULValue * 1.2;
    const tfpDeathBenefit = tfpCumulativeBalance * 1.2;

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
  }).slice(0, 79);

  const headers = [
    "Year",
    "Age",
    "Annual Contributions",
    "TFP Annual Contributions",
    "Gross Retirement Income",
    "Retirement Taxes",
    "Retirement Income",
    "TFP Retirement Income",
    "Management Fee",
    "TFP Fee",
    "Interest",
    "End of Year Balance",
    "TFP Cumulative Balance",
    "Cumulative Income",
    "TFP Cumulative Income",
    "Cumulative Fee",
    "TFP Cumulative Fee",
    "Cumulative Taxes Deferred",
    "Death Benefit",
    "TFP Death Benefit",
  ];

  const renderTable = () => (
    <Card className="w-full h-[90vh] flex flex-col">
      <CardHeader>
        <CardTitle>Current Plan vs Tax Free Plan (TFP)</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="w-full h-full overflow-auto">
          <div className="min-w-full">
            <Table className="table-auto w-full">
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead
                      key={header}
                      className="border whitespace-nowrap"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? oddColumnColor : evenColumnColor,
                        color: getContrastingTextColor(
                          index % 2 === 0 ? oddColumnColor : evenColumnColor
                        ),
                        fontSize,
                        padding: paddingSize,
                      }}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <TableCell
                        key={`${rowIndex}-${colIndex}`}
                        className="border whitespace-nowrap"
                        style={{
                          backgroundColor:
                            colIndex % 2 === 0
                              ? oddColumnColor
                              : evenColumnColor,
                          color: getContrastingTextColor(
                            colIndex % 2 === 0
                              ? oddColumnColor
                              : evenColumnColor
                          ),
                          fontSize,
                          padding: paddingSize,
                        }}
                      >
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col p-2">
      {/* Header Controls */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="odd-column-color">Current Plan</Label>
            <input
              id="odd-column-color"
              type="color"
              value={oddColumnColor}
              onChange={(e) => setOddColumnColor(e.target.value)}
              className="w-8 h-8 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="even-column-color">Tax Free Plan</Label>
            <input
              id="even-column-color"
              type="color"
              value={evenColumnColor}
              onChange={(e) => setEvenColumnColor(e.target.value)}
              className="w-8 h-8 border rounded"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleZoomIn}
            disabled={zoomIndex >= zoomSteps.length - 1}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            onClick={handleZoomOut}
            disabled={zoomIndex <= 0}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleFullScreenToggle}>
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Fullscreen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <AnimatePresence>
        {!isFullScreen ? (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderTable()}
          </motion.div>
        ) : (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-white p-6"
          >
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Year-by-Year Calculations</CardTitle>
                <Button variant="outline" onClick={handleFullScreenToggle}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto flex-1">
                {renderTable()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
