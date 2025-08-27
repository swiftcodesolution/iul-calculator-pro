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
    ["10%", "$0 - $11,925", "$0 - $23,850", "$0 - $17,000"],
    ["12%", "$11,926 - $48,475", "$23,851 - $96,950", "$17,001 - $64,850"],
    ["22%", "$48,476 - $103,350", "$69,951 - $206,700", "$64,851 - $103,350"],
    [
      "24%",
      "$103,351 - $197,300",
      "$206,701 - $394,600",
      "$103,351 - $197,300",
    ],
    [
      "32%",
      "$197,301 - $250,525",
      "$394,601 - $501,050",
      "$197,301 - $250,500",
    ],
    [
      "35%",
      "$250,526 - $626,350",
      "$501,051 - $751,600",
      "$250,501 - $626,350",
    ],
    ["37%", "$626,351+", "$751,601+", "$626,351+"],
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
              className="w-full text-sm border-collapse border border-gray-800 dark:border-gray-700"
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
                        "border border-gray-900 p-3 text-center font-medium text-gray-700 dark:text-gray-200 cursor-pointer transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        selectedColumn === i
                          ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-b border-gray-900 dark:border-gray-700"
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
                      "transition-colors duration-200 border border-b border-gray-700 dark:border-gray-700 cursor-pointer",
                      selectedYear === row[0]
                        ? "bg-blue-50 dark:bg-blue-900/50"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "p-3 border-t border-gray-900 dark:border-gray-700 border",
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
