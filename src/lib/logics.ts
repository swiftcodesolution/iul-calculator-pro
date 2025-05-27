import { TableData, Results } from "./types";

// Helper for fallback case
export function getEmptyResults(): Results {
  return {
    xValue: 0,
    startingBalance: 0,
    annualContributions: 0,
    annualEmployerMatch: 0,
    annualFees: "0.00%",
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
    yearsRunOutOfMoney: 0,
    currentAge: 0,
  };
}

// Utility to calculate current plan results (red column)
export function extractCurrentPlanResults(
  currentAge: number,
  yearsRunOutOfMoney: number,
  annualContribution: number,
  returnRate: number, // Expected as percentage (e.g., 6.3 for 6.3%)
  retirementTaxRate: number, // Expected as percentage (e.g., 22 for 22%)
  annualFee: number, // Expected as percentage (e.g., 2 for 2%)
  workingTaxRate: number, // Expected as percentage (e.g., 22 for 22%)
  startingBalance: number,
  annualEmployerMatch: number,
  retirementAge: number,
  stopSavingAge: number = retirementAge
): Results {
  const contributionYears = stopSavingAge - currentAge;
  const retirementYears = yearsRunOutOfMoney - retirementAge + 1;

  if (
    !(
      currentAge <= stopSavingAge &&
      stopSavingAge <= retirementAge &&
      retirementAge < yearsRunOutOfMoney
    )
  ) {
    console.error("Invalid age sequence provided.");
    return getEmptyResults();
  }

  // Convert percentage inputs to decimals
  const netReturnRate = returnRate / 100 - annualFee / 100;
  const decimalRetirementTaxRate = retirementTaxRate / 100;
  const decimalWorkingTaxRate = workingTaxRate / 100;

  const totalContributions = annualContribution + annualEmployerMatch;

  let balanceAtStopSavingAgeNet = 0;
  if (contributionYears > 0) {
    const fvStartingBalanceNet =
      startingBalance * Math.pow(1 + netReturnRate, contributionYears);
    let fvContributionsNet = 0;
    if (netReturnRate === 0) {
      fvContributionsNet = totalContributions * contributionYears;
    } else {
      fvContributionsNet =
        totalContributions *
        ((Math.pow(1 + netReturnRate, contributionYears) - 1) / netReturnRate);
    }
    balanceAtStopSavingAgeNet = fvStartingBalanceNet + fvContributionsNet;
  } else {
    balanceAtStopSavingAgeNet = startingBalance;
  }

  const yearsGrowthOnly = retirementAge - stopSavingAge;
  let cumulativeAccountBalanceAtRetirement = balanceAtStopSavingAgeNet;
  if (yearsGrowthOnly > 0) {
    cumulativeAccountBalanceAtRetirement =
      balanceAtStopSavingAgeNet * Math.pow(1 + netReturnRate, yearsGrowthOnly);
  }

  let grossRetirementIncome = 0;
  if (cumulativeAccountBalanceAtRetirement <= 0 || retirementYears <= 0) {
    return getEmptyResults();
  }
  if (netReturnRate === 0) {
    grossRetirementIncome =
      cumulativeAccountBalanceAtRetirement / retirementYears;
  } else {
    const numerator =
      netReturnRate * Math.pow(1 + netReturnRate, retirementYears);
    const denominator = Math.pow(1 + netReturnRate, retirementYears) - 1;
    if (denominator === 0) {
      return getEmptyResults();
    }
    grossRetirementIncome =
      cumulativeAccountBalanceAtRetirement * (numerator / denominator);
  }

  const annualIncomeTax = grossRetirementIncome * decimalRetirementTaxRate;
  const netRetirementIncome = grossRetirementIncome - annualIncomeTax;

  let hypotheticalGrossAccountBalance =
    startingBalance * Math.pow(1 + returnRate / 100, contributionYears);
  if (returnRate !== 0) {
    hypotheticalGrossAccountBalance +=
      totalContributions *
      ((Math.pow(1 + returnRate / 100, contributionYears) - 1) /
        (returnRate / 100));
  } else {
    hypotheticalGrossAccountBalance += totalContributions * contributionYears;
  }
  const totalContributed = totalContributions * contributionYears;
  const totalGrowth =
    cumulativeAccountBalanceAtRetirement - totalContributed - startingBalance;
  const cumulativeTaxesDeferred =
    (totalContributed + totalGrowth) * decimalWorkingTaxRate;

  const cumulativeTaxesPaid = annualIncomeTax * retirementYears;

  const feesAccumulation =
    hypotheticalGrossAccountBalance - cumulativeAccountBalanceAtRetirement;
  const averageBalanceDuringRetirement =
    cumulativeAccountBalanceAtRetirement / 2;
  const feesRetirementApprox =
    averageBalanceDuringRetirement * (annualFee / 100) * retirementYears;
  const cumulativeFeesPaid = feesAccumulation + feesRetirementApprox;

  const cumulativeNetIncome = netRetirementIncome * retirementYears;
  const cumulativeAccountBalance = cumulativeAccountBalanceAtRetirement;
  const taxesDue =
    grossRetirementIncome > 0
      ? (annualIncomeTax / grossRetirementIncome) * 100
      : 0;

  const deathBenefits = 0;

  const results: Results = {
    xValue: retirementAge,
    startingBalance,
    annualContributions: annualContribution,
    annualEmployerMatch,
    annualFees: `${annualFee.toFixed(2)}%`,
    grossRetirementIncome,
    incomeTax: annualIncomeTax,
    netRetirementIncome,
    cumulativeTaxesDeferred,
    cumulativeTaxesPaid,
    cumulativeFeesPaid,
    cumulativeNetIncome,
    cumulativeAccountBalance,
    taxesDue,
    deathBenefits,
    yearsRunOutOfMoney,
    currentAge,
  };

  // console.log("Retirement Plan Results:");
  // console.log(`Current Age: ${results.currentAge}`);
  // console.log(`Stop Saving Age: ${stopSavingAge}`);
  // console.log(`Retirement Age: ${results.xValue}`);
  // console.log(`Years Money Lasts Until: ${results.yearsRunOutOfMoney}`);
  // console.log(`Starting Balance: $${results.startingBalance.toFixed(2)}`);
  // console.log(
  //   `Annual Contributions: $${results.annualContributions.toFixed(2)}`
  // );
  // console.log(`Annual Employer Match: $${results.annualEmployerMatch}`);
  // console.log(`Annual Fees: ${results.annualFees}`);
  // console.log(
  //   `Gross Annual Retirement Income: $${results.grossRetirementIncome.toFixed(
  //     2
  //   )}`
  // );
  // console.log(`Annual Income Tax: $${results.incomeTax.toFixed(2)}`);
  // console.log(
  //   `Net Annual Retirement Income: $${results.netRetirementIncome.toFixed(2)}`
  // );
  // console.log(
  //   `Cumulative Taxes Deferred: $${results.cumulativeTaxesDeferred.toFixed(2)}`
  // );
  // console.log(
  //   `Cumulative Taxes Paid: $${results.cumulativeTaxesPaid.toFixed(2)}`
  // );
  // console.log(
  //   `Cumulative Fees Paid: $${results.cumulativeFeesPaid.toFixed(2)}`
  // );
  // console.log(
  //   `Cumulative Net Income: $${results.cumulativeNetIncome.toFixed(2)}`
  // );
  // console.log(
  //   `Cumulative Account Balance at Retirement: $${results.cumulativeAccountBalance.toFixed(
  //     2
  //   )}`
  // );
  // console.log(`Taxes Due (%): ${results.taxesDue.toFixed(2)}%`);
  // console.log(`Death Benefits: $${results.deathBenefits.toFixed(2)}`);

  return results;
}

// current plan loop calculations for full table
export function runGrossRetirementIncomeLoop(
  currentAge: number,
  yearsRunOutOfMoney: number,
  annualContribution: number,
  returnRate: number,
  retirementTaxRate: number,
  annualFee: number,
  workingTaxRate: number,
  startingBalance: number,
  annualEmployerMatch: number,
  retirementAge: number,
  stopSavingAge: number = retirementAge
): Array<{
  year: number;
  age: number;
  annualContribution: number;
  grossRetirementIncome: number;
  retirementTaxes: number;
  retirementIncome: number;
  managementFees: number;
  interest: number;
  endOfYearBalance: number;
  cumulativeIncome: number;
  cumulativeFees: number;
  cumulativeTaxesDeferred: number;
  deathBenefit: number;
}> {
  const results: Array<{
    year: number;
    age: number;
    annualContribution: number;
    grossRetirementIncome: number;
    retirementTaxes: number;
    retirementIncome: number;
    managementFees: number;
    interest: number;
    endOfYearBalance: number;
    cumulativeIncome: number;
    cumulativeFees: number;
    cumulativeTaxesDeferred: number;
    deathBenefit: number;
  }> = [];

  const startYear = 1;
  let previousEndOfYearBalance = startingBalance;
  let cumulativeIncome = 0;
  let cumulativeFees = 0;
  let cumulativeTaxesDeferred = 0;

  // Validate inputs
  if (
    currentAge >= yearsRunOutOfMoney ||
    currentAge >= retirementAge ||
    currentAge >= stopSavingAge
  ) {
    return results;
  }

  const contributionYears = stopSavingAge - currentAge;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalContributions =
    (annualContribution + annualEmployerMatch) * contributionYears;
  // const netReturnRate = returnRate / 100 - annualFee / 100;
  const decimalWorkingTaxRate = workingTaxRate / 100;

  // Calculate hypothetical gross balance for taxes deferred
  let hypotheticalGrossBalance =
    startingBalance * Math.pow(1 + returnRate / 100, contributionYears);
  if (returnRate !== 0) {
    hypotheticalGrossBalance +=
      (annualContribution + annualEmployerMatch) *
      ((Math.pow(1 + returnRate / 100, contributionYears) - 1) /
        (returnRate / 100));
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hypotheticalGrossBalance +=
      (annualContribution + annualEmployerMatch) * contributionYears;
  }

  for (let age = currentAge; age <= yearsRunOutOfMoney; age++) {
    const year = startYear + (age - currentAge);
    const annualContrib =
      age <= stopSavingAge ? annualContribution + annualEmployerMatch : 0;

    const retirementResults: Results | 0 =
      age >= retirementAge
        ? extractCurrentPlanResults(
            currentAge,
            yearsRunOutOfMoney,
            annualContribution,
            returnRate,
            retirementTaxRate,
            annualFee,
            workingTaxRate,
            startingBalance,
            annualEmployerMatch,
            retirementAge,
            stopSavingAge
          )
        : 0;

    const grossRetirementIncome =
      retirementResults !== 0 ? retirementResults.grossRetirementIncome : 0;

    const safeGrossRetirementIncome = Number.isFinite(grossRetirementIncome)
      ? grossRetirementIncome
      : 0;
    const retirementTaxes =
      safeGrossRetirementIncome * (retirementTaxRate / 100);
    const retirementIncome = safeGrossRetirementIncome - retirementTaxes;

    const managementFees =
      year === 1
        ? annualContrib * (annualFee / 100)
        : (annualContrib +
            previousEndOfYearBalance -
            safeGrossRetirementIncome) *
          (annualFee / 100);

    const interest =
      year === 1
        ? annualContrib * (returnRate / 100)
        : (annualContrib +
            previousEndOfYearBalance -
            safeGrossRetirementIncome) *
          (returnRate / 100);

    const endOfYearBalance =
      year === 1
        ? annualContrib + interest - safeGrossRetirementIncome - managementFees
        : previousEndOfYearBalance +
          annualContrib +
          interest -
          safeGrossRetirementIncome -
          managementFees;

    // Cumulative calculations
    cumulativeIncome += retirementIncome;
    cumulativeFees += managementFees;

    // Cumulative taxes deferred (based on original logic)
    // if (age === stopSavingAge) {
    //   const totalGrowth =
    //     hypotheticalGrossBalance - totalContributions - startingBalance;
    //   cumulativeTaxesDeferred =
    //     (totalContributions + totalGrowth) * decimalWorkingTaxRate;
    // }
    const previousCumulativeTaxesDeferred =
      results.length > 0
        ? results[results.length - 1].cumulativeTaxesDeferred
        : 0;
    if (year === 1) {
      cumulativeTaxesDeferred = annualContribution * decimalWorkingTaxRate;
    } else if (age < retirementAge) {
      const X = annualContribution * decimalWorkingTaxRate;
      cumulativeTaxesDeferred = previousCumulativeTaxesDeferred + X;
    } else if (age >= retirementAge) {
      cumulativeTaxesDeferred =
        previousCumulativeTaxesDeferred - retirementTaxes;
    }

    console.log(
      `year: ${year} || current age: ${age} || previous cumulative deferred:${previousCumulativeTaxesDeferred}, current cumulative deferred: ${cumulativeTaxesDeferred}`
    );

    // Death benefit (designed as remaining balance, common in retirement plans)
    // const deathBenefit = endOfYearBalance > 0 ? endOfYearBalance : 0;

    let deathBenefit = 0;
    if (age < retirementAge) {
      const X = (endOfYearBalance * workingTaxRate) / 100;
      deathBenefit = endOfYearBalance - X;
      console.log(
        `current age ${age} < retirement age ${retirementAge} death benefit = ${deathBenefit}`
      );
    } else if (age >= retirementAge) {
      const Y = (endOfYearBalance * retirementTaxRate) / 100;
      deathBenefit = endOfYearBalance - Y;
      console.log(
        `current age ${age} >=  retirement age ${retirementAge} death benefit = ${deathBenefit}`
      );
    }

    previousEndOfYearBalance = endOfYearBalance;

    results.push({
      year: Math.floor(year),
      age: Math.floor(age),
      annualContribution: Math.floor(annualContrib),
      grossRetirementIncome: Math.floor(safeGrossRetirementIncome),
      retirementTaxes: Math.floor(retirementTaxes),
      retirementIncome: Math.floor(retirementIncome),
      managementFees: Math.floor(managementFees),
      interest: Math.floor(interest),
      endOfYearBalance: Math.floor(endOfYearBalance),
      cumulativeIncome: Math.floor(cumulativeIncome),
      cumulativeFees: Math.floor(cumulativeFees),
      cumulativeTaxesDeferred: Math.floor(cumulativeTaxesDeferred),
      deathBenefit: Math.floor(deathBenefit),
    });
  }

  return results;
}

// current plan loop function to generate full table
export function runRetirementPlanLoop(
  currentAge: number,
  yearsRunOutOfMoney: number,
  annualContribution: number,
  returnRate: number,
  retirementTaxRate: number,
  annualFee: number,
  workingTaxRate: number,
  startingBalance: number,
  annualEmployerMatch: number,
  retirementAge: number,
  stopSavingAge: number = retirementAge
): Results[] {
  const results: Results[] = [];

  for (let age = currentAge; age <= yearsRunOutOfMoney; age++) {
    const planResults = extractCurrentPlanResults(
      currentAge,
      yearsRunOutOfMoney,
      annualContribution,
      returnRate,
      retirementTaxRate,
      annualFee,
      workingTaxRate,
      startingBalance,
      annualEmployerMatch,
      age,
      Math.min(age, stopSavingAge)
    );
    results.push(planResults);
  }

  return results;
}

// Utility to calculate tax-free plan results (IRS 7702, green column)
export function extractTaxFreeResults(
  tables: TableData[],
  currentAge: number,
  yearsRunOutOfMoney: number
): Results {
  const mainTable = tables[0]?.data || [];
  const chargesTable = tables[1]?.data || [];

  // Validate inputs
  if (
    currentAge < 0 ||
    yearsRunOutOfMoney < currentAge ||
    !mainTable.length ||
    !mainTable.every((row) => typeof row.Age !== "undefined")
  ) {
    console.warn("Invalid inputs or empty mainTable for Tax-Free Plan");
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

  // Parse currency values from strings
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
  let xValue = (parsedMainTable[0]?.Age as number) || 65;
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
    netRetirementIncome = grossRetirementIncome; // Tax-free, so no income tax
    cumulativeNetIncome = parsedMainTable
      .filter(
        (row) =>
          (row.Age as number) >= xValue &&
          (row.Age as number) <= yearsRunOutOfMoney
      )
      .reduce((sum, row) => sum + parseCurrency(row["Net Outlay"] || 0), 0);
  }

  let cumulativeFeesPaid = 0;
  if (chargesTable.length && mainTable.length) {
    const endIndex = parsedMainTable.findIndex(
      (row) => row.Age === yearsRunOutOfMoney
    );
    if (endIndex !== -1 && endIndex < chargesTable.length) {
      cumulativeFeesPaid = chargesTable
        .slice(0, endIndex + 1)
        .reduce((sum, row) => sum + parseCurrency(row.Charges || 0), 0);
    } else {
      console.warn("Charges table index out of bounds or mismatched");
    }
  }

  const targetRow =
    parsedMainTable.find((row) => row.Age === yearsRunOutOfMoney) ||
    parsedMainTable[parsedMainTable.length - 1];

  const cumulativeAccountBalance = parseCurrency(targetRow["Cash Value"] || 0);
  const deathBenefits = parseCurrency(targetRow["Death Benefit"] || 0);

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

// tax free plan loop function to generate full table
export function runTaxFreePlanLoop(
  tables: TableData[],
  currentAge: number,
  yearsRunOutOfMoney: number
): Results[] {
  const results: Results[] = [];

  for (let age = currentAge; age <= yearsRunOutOfMoney; age++) {
    const planResults = extractTaxFreeResults(tables, currentAge, age);
    results.push(planResults);
  }

  return results;
}
