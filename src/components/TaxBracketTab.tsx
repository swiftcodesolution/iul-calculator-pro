import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils"; // Assuming a utility for className concatenation

export default function TaxBracketTab() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  const handleRowClick = (rowLabel: string) => {
    setSelectedYear(selectedYear === rowLabel ? null : rowLabel);
  };

  const handleColClick = (col: number) => {
    setSelectedColumn(selectedColumn === col ? null : col);
  };

  const tableHeaders = [
    "Tax Bracket / Rate",
    "Single",
    "Married Jointly",
    "Head of Household",
  ];

  const tableData = [
    ["10%", "$0 - $11,925", "$01 $233,950", "-50 $17,000"],
    ["12%", "311,826 49,47%", "22,691 - 95,450", "$17,001 - -68,250"],
    ["22%", "$49,476 - 102,350", "969,911 $200,701", "$64,891 -122,330"],
    ["24%", "$103,991 - 197,300", "206,701 - $354,300", "103,291 - $197,300"],
    ["32%", "$100,591 - 325,538", "501,081 - 751,900", "250,501  -636,390"],
  ];

  return (
    <div className="w-full p-4 sm:p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          2025 Federal Tax Brackets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <div className="max-h-[400px] overflow-y-auto">
            <table
              className="w-full text-sm border-collapse"
              role="grid"
              aria-label="Federal Tax Brackets Table"
            >
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th
                      key={i}
                      onClick={() => handleColClick(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleColClick(i);
                        }
                      }}
                      tabIndex={0}
                      role="columnheader"
                      className={cn(
                        "p-3 text-center font-medium text-gray-700 dark:text-gray-200 cursor-pointer transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        selectedColumn === i
                          ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-b border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => handleRowClick(row[0])}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowClick(row[0]);
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    className={cn(
                      "transition-colors duration-200",
                      selectedYear === row[0]
                        ? "bg-blue-50 dark:bg-blue-900/50"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "p-3 border-t border-gray-100 dark:border-gray-700",
                          selectedColumn === j
                            ? "bg-blue-100/50 dark:bg-blue-800/50"
                            : ""
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
