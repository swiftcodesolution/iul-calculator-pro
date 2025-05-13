import { AnimatePresence, motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { Results } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ComparisonTableProps {
  defaultResults: Results;
  taxFreeResults: Results;
  columnTextWhite: {
    currentPlan: boolean;
    taxes: boolean;
    taxFreePlan: boolean;
  };
  highlightedRow: number | null;
  isTableCollapsed: boolean;
  isTableCardExpanded: boolean;
  setIsTableCollapsed: (value: boolean) => void;
  setIsTableCardExpanded: (value: boolean) => void;
  handleHeaderClick: (column: "currentPlan" | "taxes" | "taxFreePlan") => void;
  handleCellClick: (rowIndex: number) => void;
}

export function ComparisonTable({
  defaultResults,
  taxFreeResults,
  columnTextWhite,
  highlightedRow,
  isTableCollapsed,
  isTableCardExpanded,
  setIsTableCollapsed,
  setIsTableCardExpanded,
  handleHeaderClick,
  handleCellClick,
}: ComparisonTableProps) {
  const tableRows = [
    { label: "Starting Balance", current: "0", taxes: "10%", taxFree: "0" },
    {
      label: "Annual Contributions",
      current: "$25,641",
      taxes: "22%",
      taxFree: "$20,000",
    },
    {
      label: "Annual Employer Match",
      current: "$0",
      taxes: "",
      taxFree: "N/A",
    },
    { label: "Annual Fees", current: "2%", taxes: "", taxFree: "Included" },
    {
      label: "Gross Retirement Income",
      current: `$${defaultResults.grossRetirementIncome.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.grossRetirementIncome.toLocaleString()}`,
    },
    {
      label: "Income Tax",
      current: `$${defaultResults.incomeTax.toLocaleString()}`,
      taxes: "28%",
      taxFree: `$${taxFreeResults.incomeTax.toLocaleString()}`,
    },
    {
      label: "Net Retirement Income",
      current: `$${defaultResults.netRetirementIncome.toLocaleString()}`,
      taxes: "28%",
      taxFree: `$${taxFreeResults.netRetirementIncome.toLocaleString()}`,
    },
    {
      label: "Cumulative Taxes Deferred",
      current: `$${defaultResults.cumulativeTaxesDeferred.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.cumulativeTaxesDeferred.toLocaleString()}`,
    },
    {
      label: "Cumulative Taxes Paid",
      current: `$${defaultResults.cumulativeTaxesPaid.toLocaleString()}`,
      taxes: "10%",
      taxFree: `$${taxFreeResults.cumulativeTaxesPaid.toLocaleString()}`,
    },
    {
      label: "Cumulative Fees Paid",
      current: `$${defaultResults.cumulativeFeesPaid.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.cumulativeFeesPaid.toLocaleString()}`,
    },
    {
      label: "Cumulative Net Income",
      current: `$${defaultResults.cumulativeNetIncome.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.cumulativeNetIncome.toLocaleString()}`,
    },
    {
      label: "Cumulative Account Balance",
      current: `$${defaultResults.cumulativeAccountBalance.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.cumulativeAccountBalance.toLocaleString()}`,
    },
    {
      label: "Taxes Due",
      current: `${defaultResults.taxesDue}%`,
      taxes: "28%",
      taxFree: `${taxFreeResults.taxesDue}%`,
    },
    {
      label: "Death Benefits",
      current: `$${defaultResults.deathBenefits.toLocaleString()}`,
      taxes: "",
      taxFree: `$${taxFreeResults.deathBenefits.toLocaleString()}`,
    },
    {
      label: "Years You Run Out of Money",
      current: `${defaultResults.yearsRunOutOfMoney}`,
      taxes: "",
      taxFree: `${taxFreeResults.yearsRunOutOfMoney}`,
    },
  ];

  return (
    <AnimatePresence>
      {!isTableCardExpanded ? (
        <Card>
          <CardHeader
            className="flex flex-row items-center justify-between cursor-pointer"
            onClick={() => setIsTableCollapsed(!isTableCollapsed)}
            aria-label="Toggle table visibility"
          >
            <h3 className="text-lg font-semibold">Comparison Table</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTableCardExpanded(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead
                    className={cn(
                      "bg-red-200 cursor-pointer",
                      columnTextWhite.currentPlan
                        ? "text-red-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("currentPlan")}
                    aria-label="Toggle Current Plan column text color"
                  >
                    Current Plan <br /> TSP, 401k, 403b, IRA
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-yellow-200 cursor-pointer",
                      columnTextWhite.taxes ? "text-yellow-200" : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("taxes")}
                    aria-label="Toggle Taxes column text color"
                  >
                    Taxes
                  </TableHead>
                  <TableHead
                    className={cn(
                      "bg-green-200 cursor-pointer",
                      columnTextWhite.taxFreePlan
                        ? "text-green-200"
                        : "text-black",
                      "transition-colors duration-300"
                    )}
                    onClick={() => handleHeaderClick("taxFreePlan")}
                    aria-label="Toggle Tax Free Plan column text color"
                  >
                    IRS (IRC) 7702 <br /> Tax Free Plan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map(({ label, current, taxes, taxFree }, index) => (
                  <motion.tr
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : ""
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {label}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.currentPlan
                          ? "text-white opacity-0"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {current}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.taxes
                          ? "text-white opacity-0"
                          : "text-red-600",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {taxes}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "border cursor-pointer whitespace-nowrap",
                        highlightedRow === index ? "bg-[#ffa1ad]" : "bg-white",
                        columnTextWhite.taxFreePlan
                          ? "text-white opacity-0"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleCellClick(index)}
                      aria-selected={highlightedRow === index}
                    >
                      {taxFree}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
        >
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Comparison Table</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTableCardExpanded(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table className="w-full table-auto">
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
                    <TableHead
                      className={cn(
                        "bg-red-200 cursor-pointer",
                        columnTextWhite.currentPlan
                          ? "text-red-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("currentPlan")}
                      aria-label="Toggle Current Plan column text color"
                    >
                      Current Plan <br /> TSP, 401k, 403b, IRA
                    </TableHead>
                    <TableHead
                      className={cn(
                        "bg-yellow-200 cursor-pointer",
                        columnTextWhite.taxes
                          ? "text-yellow-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("taxes")}
                      aria-label="Toggle Taxes column text color"
                    >
                      Taxes
                    </TableHead>
                    <TableHead
                      className={cn(
                        "bg-green-200 cursor-pointer",
                        columnTextWhite.taxFreePlan
                          ? "text-green-200"
                          : "text-black",
                        "transition-colors duration-300"
                      )}
                      onClick={() => handleHeaderClick("taxFreePlan")}
                      aria-label="Toggle Tax Free Plan column text color"
                    >
                      IRS (IRC) 7702 <br /> Tax Free Plan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map(
                    ({ label, current, taxes, taxFree }, index) => (
                      <TableRow key={label}>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index ? "bg-[#ffa1ad]" : ""
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {label}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.currentPlan
                              ? "text-white opacity-0"
                              : "text-black",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {current}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.taxes
                              ? "text-white opacity-0"
                              : "text-red-600",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {taxes}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "border cursor-pointer whitespace-nowrap",
                            highlightedRow === index
                              ? "bg-[#ffa1ad]"
                              : "bg-white",
                            columnTextWhite.taxFreePlan
                              ? "text-white opacity-0"
                              : "text-black",
                            "transition-colors duration-300"
                          )}
                          onClick={() => handleCellClick(index)}
                          aria-selected={highlightedRow === index}
                        >
                          {taxFree}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
