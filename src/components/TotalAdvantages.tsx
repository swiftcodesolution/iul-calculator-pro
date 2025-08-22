// src/components/TotalAdvantageTab.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { TotalAdvantage } from "@/lib/types";
import { useTableStore } from "@/lib/store";

interface TotalAdvantageTabProps {
  totalAdvantage: TotalAdvantage;
  handleCellClick?: (rowIndex: number) => void;
}

const TotalAdvantageTab = ({
  totalAdvantage,
  handleCellClick,
}: TotalAdvantageTabProps) => {
  const { activeButtons, setActiveButtons } = useTableStore();

  const toggleButton = (id: number) => {
    setActiveButtons({
      ...activeButtons,
      [id]: !activeButtons[id],
    });
    handleCellClick?.(id);
  };

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Your Estimated - Total Advantage
        </h2>
        <h2 className="text-3xl font-bold mb-6">
          ${totalAdvantage.total.toLocaleString()} + Living Benefits
        </h2>
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className={`cursor-pointer p-6 w-full sm:w-1/3 ${
              activeButtons[9]
                ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                : ""
            } ${
              totalAdvantage.fees < 0
                ? "border-red-500 text-red-500 font-bold"
                : ""
            }`}
            onClick={() => toggleButton?.(9)}
          >
            Fees Saved: <br /> ${totalAdvantage.fees.toLocaleString()}
          </Button>
          <Button
            variant="outline"
            className={`cursor-pointer p-6 w-full sm:w-1/3 ${
              activeButtons[10]
                ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                : ""
            } ${
              totalAdvantage.cumulativeIncome < 0
                ? "border-red-500 text-red-500 font-bold"
                : ""
            }`}
            onClick={() => toggleButton?.(10)}
          >
            Extra Income: <br /> $
            {totalAdvantage.cumulativeIncome.toLocaleString()}
          </Button>
          <Button
            variant="outline"
            className={`cursor-pointer p-6 w-full sm:w-1/3 ${
              activeButtons[13]
                ? "bg-red-300 hover:bg-red-300 dark:bg-red-300 dark:hover:bg-red-300 text-black dark:text-black"
                : ""
            } ${
              totalAdvantage.deathBenefits < 0
                ? "border-red-500 text-red-500 font-bold"
                : ""
            }`}
            onClick={() => toggleButton?.(13)}
          >
            Death Benefit: <br /> $
            {totalAdvantage.deathBenefits.toLocaleString()}
          </Button>
        </div>
      </div>
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Plus, A Guarantee Of</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">Zero Taxes on Income</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Structured withdrawals and policy loans are designed to be
                tax-free under current IRS guidelines.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">
                Zero Loss When Markets Crash
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Thanks to built-in floor protection, clients never lose
                principal due to market downturns.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Living Benefits Available Through Most Major IUL Providers
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Ask your agent for details
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Lifetime Income | Critical Illness | Chronic Illness | Terminal
            Illness
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalAdvantageTab;
