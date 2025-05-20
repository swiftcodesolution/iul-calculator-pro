import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ClientFile, TableData, Results } from "./types";

// Utility to merge class names for Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to generate a cropped image from a source image and crop area
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
): Promise<string> {
  try {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise<void>((resolve) => (image.onload = () => resolve()));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL("image/jpeg");
  } catch (error) {
    console.error("Error generating cropped image:", error);
    throw error;
  }
}

// Utility to generate a unique ID for client files
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Utility to format file size for display
export function formatFileSize(size: string): string {
  if (size === "N/A") return size;
  const sizeInKB = parseFloat(size);
  if (isNaN(sizeInKB)) return "N/A";
  if (sizeInKB >= 1000) {
    return `${(sizeInKB / 1000).toFixed(1)} MB`;
  }
  return `${sizeInKB} KB`;
}

// Utility to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility to validate phone number format (basic US format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

// Utility to filter client files by category
export function filterClientFilesByCategory(
  files: ClientFile[],
  category: ClientFile["category"]
): ClientFile[] {
  return files.filter((file) => file.category === category);
}

// Utility to debounce a function with cancellation support
export function debounce<T extends (...args: Parameters<T>) => unknown>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {
    leading: false,
    trailing: true,
  }
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (options.trailing) {
        func(...args);
      }
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    if (options.leading && !timeout) {
      func(...args);
    }

    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as ((...args: Parameters<T>) => void) & {
    cancel: () => void;
  };
}

// Utility to throttle a function
export function throttle<T extends (...args: unknown[]) => R, R>(
  func: T,
  limit: number
): (...args: Parameters<T>) => R {
  let inThrottle: boolean = false;
  let lastResult: R;

  return (...args: Parameters<T>): R => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// export function extractTaxFreeResults(
//   tables: TableData[],
//   currentAge: number,
//   yearsRunOutOfMoney: number
// ): Results {
//   // First table for Premium Outlay, Net Outlay, Cash Value, Death Benefit
//   const mainTable = tables[0]?.data || [];
//   // Second table for Charges
//   const chargesTable = tables[1]?.data || [];

//   if (!mainTable.length) {
//     return {
//       startingBalance: 0,
//       annualContributions: 0,
//       annualEmployerMatch: "N/A",
//       annualFees: "Included",
//       grossRetirementIncome: 0,
//       incomeTax: 0,
//       netRetirementIncome: 0,
//       cumulativeTaxesDeferred: 0,
//       cumulativeTaxesPaid: 0,
//       cumulativeFeesPaid: 0,
//       cumulativeNetIncome: 0,
//       cumulativeAccountBalance: 0,
//       taxesDue: 0,
//       deathBenefits: 0,
//       yearsRunOutOfMoney,
//       currentAge,
//     };
//   }

//   // Helper to parse currency strings (e.g., "$6,000.00" -> 6000)
//   const parseCurrency = (value: string | number): number => {
//     if (typeof value === "number") return value;
//     return Number(value.replace(/[^0-9.-]+/g, "")) || 0;
//   };

//   // Annual Contributions: 7th row of "Premium Outlay"
//   const annualContributions = parseCurrency(
//     mainTable[6]?.["Premium Outlay"] || 0
//   );

//   // Find the age at which "Net Outlay" value first changes
//   let xValue = 0;
//   for (let i = 1; i < mainTable.length; i++) {
//     if (mainTable[i]["Net Outlay"] !== mainTable[i - 1]["Net Outlay"]) {
//       xValue = mainTable[i]["Age"]; // store the age when Net Outlay changes
//       break; // stop after finding the first change
//     }
//   }

//   // Initialize output variables
//   let grossRetirementIncome = 0;
//   let netRetirementIncome = 0;
//   let cumulativeNetIncome = 0;

//   // If the person runs out of money before retirement income starts
//   if (yearsRunOutOfMoney < xValue) {
//     // All values remain zero
//     grossRetirementIncome = 0;
//     netRetirementIncome = 0;
//     cumulativeNetIncome = 0;
//   } else {
//     // Otherwise, calculate income-related values

//     // Find the row for the year the person runs out of money (or last available row)
//     const rowIndex = Math.min(yearsRunOutOfMoney - 1, mainTable.length - 1);

//     // Get the "Net Outlay" value at the run-out year, parsed as currency
//     grossRetirementIncome = parseCurrency(
//       mainTable[rowIndex]?.["Net Outlay"] || 0
//     );

//     // Assume net income is equal to gross income
//     netRetirementIncome = grossRetirementIncome;

//     // Sum Net Outlay values from when it starts (xValue age) until the run-out year
//     for (let i = 0; i < mainTable.length; i++) {
//       if (
//         mainTable[i]["Age"] >= xValue &&
//         mainTable[i]["Age"] < yearsRunOutOfMoney
//       ) {
//         cumulativeNetIncome += parseCurrency(mainTable[i]["Net Outlay"] || 0);
//       }
//     }
//   }

//   // Cumulative Fees Paid: Sum of "Charges" up to yearsRunOutOfMoney row
//   let cumulativeFeesPaid = 0;
//   for (let i = 0; i < Math.min(yearsRunOutOfMoney, chargesTable.length); i++) {
//     cumulativeFeesPaid += parseCurrency(chargesTable[i]?.["Charges"] || 0);
//   }

//   // Cumulative Account Balance: "Cash Value" at yearsRunOutOfMoney row
//   const rowIndex = Math.min(yearsRunOutOfMoney - 1, mainTable.length - 1);
//   const cumulativeAccountBalance = parseCurrency(
//     mainTable[rowIndex]?.["Cash Value"] || 0
//   );

//   // Death Benefits: "Death Benefit" at yearsRunOutOfMoney row
//   const deathBenefits = parseCurrency(
//     mainTable[rowIndex]?.["Death Benefit"] || 0
//   );

//   return {
//     xValue,
//     startingBalance: 0,
//     annualContributions,
//     annualEmployerMatch: "N/A",
//     annualFees: "Included",
//     grossRetirementIncome,
//     incomeTax: 0,
//     netRetirementIncome,
//     cumulativeTaxesDeferred: 0,
//     cumulativeTaxesPaid: 0,
//     cumulativeFeesPaid,
//     cumulativeNetIncome,
//     cumulativeAccountBalance,
//     taxesDue: 0,
//     deathBenefits,
//     yearsRunOutOfMoney,
//     currentAge,
//   };
// }

export function extractTaxFreeResults(
  tables: TableData[],
  currentAge: number,
  yearsRunOutOfMoney: number
): Results {
  const mainTable = tables[0]?.data || [];
  const chargesTable = tables[1]?.data || [];

  // Validate mainTable rows have Age as string or number
  if (
    !mainTable.length ||
    !mainTable.every((row) => typeof row.Age !== "undefined")
  ) {
    console.warn("mainTable is empty or missing Age values");
    return {
      xValue: 0,
      startingBalance: 0,
      annualContributions: 0,
      annualEmployerMatch: "N/A",
      annualFees: "Included",
      grossRetirementIncome: 0,
      incomeTax: 0,
      netRetirementIncome: 0,
      cumulativeTaxesDeferred: 0,
      cumulativeTaxesPaid: 0,
      cumulativeFeesPaid: 0,
      cumulativeNetIncome: 0,
      cumulativeAccountBalance: 0,
      taxesDue: 0,
      deathBenefits: 0,
      yearsRunOutOfMoney,
      currentAge,
    };
  }

  const parseCurrency = (value: string | number): number => {
    if (typeof value === "number") return value;
    return Number(value.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Convert Age to number while preserving other properties
  const parsedMainTable: Record<string, string | number>[] = mainTable.map(
    (row) => ({
      ...row,
      Age: Number(row.Age),
    })
  );

  // Get annualContributions from row where Age matches currentAge + 6
  const targetContributionRow = parsedMainTable.find(
    (row) => row.Age === currentAge + 6
  );
  const annualContributions = targetContributionRow
    ? parseCurrency(targetContributionRow["Premium Outlay"] || 0)
    : 0;

  // Find the age when "Net Outlay" first changes
  let xValue = 0;
  for (let i = 0; i < parsedMainTable.length - 1; i++) {
    const row = parsedMainTable[i];
    const nextRow = parsedMainTable[i + 1];
    if (row["Net Outlay"] !== nextRow["Net Outlay"]) {
      xValue = nextRow.Age as number;
      break;
    }
  }

  let grossRetirementIncome = 0;
  let netRetirementIncome = 0;
  let cumulativeNetIncome = 0;

  if (yearsRunOutOfMoney < xValue) {
    grossRetirementIncome = 0;
    netRetirementIncome = 0;
    cumulativeNetIncome = 0;
  } else {
    // Find row where Age matches yearsRunOutOfMoney
    const targetRow =
      parsedMainTable.find((row) => row.Age === yearsRunOutOfMoney) ||
      parsedMainTable[parsedMainTable.length - 1];

    grossRetirementIncome = parseCurrency(targetRow["Net Outlay"] || 0);
    netRetirementIncome = grossRetirementIncome;

    // Sum Net Outlay for rows where Age is between xValue and yearsRunOutOfMoney
    cumulativeNetIncome = parsedMainTable
      .filter(
        (row) =>
          (row.Age as number) >= xValue &&
          (row.Age as number) < yearsRunOutOfMoney
      )
      .reduce((sum, row) => sum + parseCurrency(row["Net Outlay"] || 0), 0);
  }

  // Sum Charges for rows corresponding to years up to yearsRunOutOfMoney - currentAge
  // const yearsToSum = Math.max(0, yearsRunOutOfMoney - currentAge);
  // const cumulativeFeesPaid = chargesTable
  //   .slice(0, yearsToSum)
  //   .reduce((sum, row) => sum + parseCurrency(row.Charges || 0), 0);

  // console.log(chargesTable);

  let cumulativeFeesPaid = 0;

  if (chargesTable.length && mainTable.length) {
    // Map indexes of ages 41 through yearsRunOutOfMoney using mainTable
    const startIndex = mainTable.findIndex((row) => Number(row.Age) === 41);
    const endIndex = mainTable.findIndex(
      (row) => Number(row.Age) === yearsRunOutOfMoney
    );

    // If valid indexes found, sum corresponding Charges from chargesTable
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      cumulativeFeesPaid = chargesTable
        .slice(startIndex, endIndex + 1) // +1 to include end age
        .reduce((sum, row) => sum + parseCurrency(row.Charges || 0), 0);
    }
  }

  // Find row where Age matches yearsRunOutOfMoney
  const targetRow =
    parsedMainTable.find((row) => row.Age === yearsRunOutOfMoney) ||
    parsedMainTable[parsedMainTable.length - 1];

  const cumulativeAccountBalance = parseCurrency(targetRow["Cash Value"] || 0);
  const deathBenefits = parseCurrency(targetRow["Death Benefit"] || 0);

  console.log({
    xValue: {
      value: xValue,
      source: `Age when "Net Outlay" first changes in mainTable, found by comparing consecutive rows`,
    },
    startingBalance: {
      value: 0,
      source: `Hardcoded as 0`,
    },
    annualContributions: {
      value: annualContributions,
      source: `Parsed "Premium Outlay" from mainTable row where Age = currentAge + 6, or 0 if not found`,
    },
    annualEmployerMatch: {
      value: "N/A",
      source: `Hardcoded as "N/A"`,
    },
    annualFees: {
      value: "Included",
      source: `Hardcoded as "Included"`,
    },
    grossRetirementIncome: {
      value: grossRetirementIncome,
      source: `Parsed "Net Outlay" from mainTable row where Age = yearsRunOutOfMoney, or last row if not found`,
    },
    incomeTax: {
      value: 0,
      source: `Hardcoded as 0`,
    },
    netRetirementIncome: {
      value: netRetirementIncome,
      source: `Equal to grossRetirementIncome`,
    },
    cumulativeTaxesDeferred: {
      value: 0,
      source: `Hardcoded as 0`,
    },
    cumulativeTaxesPaid: {
      value: 0,
      source: `Hardcoded as 0`,
    },
    cumulativeFeesPaid: {
      value: cumulativeFeesPaid,
      source: `Sum of parsed "Charges" from chargesTable rows up to (yearsRunOutOfMoney - currentAge) rows`,
    },
    cumulativeNetIncome: {
      value: cumulativeNetIncome,
      source: `Sum of parsed "Net Outlay" from mainTable rows where Age >= xValue and Age < yearsRunOutOfMoney`,
    },
    cumulativeAccountBalance: {
      value: cumulativeAccountBalance,
      source: `Parsed "Cash Value" from mainTable row where Age = yearsRunOutOfMoney, or last row if not found`,
    },
    taxesDue: {
      value: 0,
      source: `Hardcoded as 0`,
    },
    deathBenefits: {
      value: deathBenefits,
      source: `Parsed "Death Benefit" from mainTable row where Age = yearsRunOutOfMoney, or last row if not found`,
    },
    yearsRunOutOfMoney: {
      value: yearsRunOutOfMoney,
      source: `Input parameter`,
    },
    currentAge: {
      value: currentAge,
      source: `Input parameter`,
    },
  });

  return {
    xValue,
    startingBalance: 0,
    annualContributions,
    annualEmployerMatch: "N/A",
    annualFees: "Included",
    grossRetirementIncome,
    incomeTax: 0,
    netRetirementIncome,
    cumulativeTaxesDeferred: 0,
    cumulativeTaxesPaid: 0,
    cumulativeFeesPaid,
    cumulativeNetIncome,
    cumulativeAccountBalance,
    taxesDue: 0,
    deathBenefits,
    yearsRunOutOfMoney,
    currentAge,
  };
}
