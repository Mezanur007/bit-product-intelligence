/**
 * B-IT Technology — Financial Calculation Engine
 * 
 * Pure, deterministic, transparent financial calculations for SaaS and product investments.
 * Uses exact arithmetic without hidden optimism multipliers.
 * All currency values are in SAR (Saudi Riyals).
 */

export interface FinancialAssumptions {
  // Pricing & Revenue
  monthlyPricePerCustomer: number; // SAR / month
  setupFeePerCustomer: number; // One-time SAR
  annualDiscountPercent: number; // e.g. 15 for 15% discount
  annualBillingSharePercent: number; // e.g. 30 for 30% of customers paying annually

  // Direct Variable Costs per Customer
  variableHostingPerCustomer: number; // SAR / month (cloud infra, AI API tokens, storage)
  variableSupportPerCustomer: number; // SAR / month (customer success, support hours)
  paymentProcessingPercent: number; // e.g. 2.5% + fixed fee
  paymentProcessingFixed: number; // SAR per transaction, e.g. 1.0

  // Fixed Monthly Operating Expenses
  fixedHostingAndTools: number; // SAR / month (base servers, SaaS tools)
  fixedMarketingAndSales: number; // SAR / month (ads, content, sales ops)
  fixedMaintenanceAndLabor: number; // SAR / month (allocated ongoing engineering/support)
  fixedGeneralAndAdmin: number; // SAR / month (licenses, legal, admin)

  // Initial Investment
  initialResearchAndDesignCash: number; // SAR cash
  initialDevelopmentCash: number; // SAR cash (third-party devs, licenses)
  initialMarketingLaunchCash: number; // SAR cash
  initialContingencyCash: number; // SAR cash
  internalLaborEconomicCost: number; // SAR (economic valuation of internal team hours)

  // Customer Acquisition & Retention
  startingPayingCustomers: number;
  monthlyNewCustomers: number; // Expected new customers per month (or ramp)
  monthlyCustomerGrowthRatePercent: number; // e.g. 5% month-over-month growth of new customer additions
  monthlyChurnPercent: number; // e.g. 3% monthly churn

  // Planning horizon
  horizonMonths: number; // typically 12, 24, or 36 months
}

export interface MonthlyFinancialResult {
  month: number;
  activeCustomersStart: number;
  newCustomers: number;
  churnedCustomers: number;
  activeCustomersEnd: number;

  recurringRevenue: number; // SAR
  setupRevenue: number; // SAR
  totalRevenue: number; // SAR
  mrr: number; // Monthly Recurring Revenue at month end
  arrRunRate: number; // MRR * 12

  variableCosts: number; // SAR (hosting, support, payment gateway)
  grossProfit: number; // Total Revenue - Variable Costs
  grossMarginPercent: number; // (Gross Profit / Total Revenue) * 100

  fixedOperatingCosts: number; // SAR (fixed hosting, marketing, maintenance, G&A)
  operatingProfit: number; // Gross Profit - Fixed Costs (EBITDA equivalent)

  netCashFlow: number; // Net cash generated or consumed in this month
  cumulativeCashFlow: number; // Cumulative cash from Month 0 through current month
}

export interface BreakEvenAnalysis {
  monthlyContributionPerCustomer: number; // SAR / month
  contributionMarginPercent: number;
  isContributionPositive: boolean;
  operatingBreakEvenCustomers: number | null; // Customer count needed to cover monthly fixed costs
  currentMonthlyFixedCosts: number;
  breakEvenCommentary: string;

  investmentPaybackMonth: number | null; // Month where cumulative cash flow >= 0
  paybackReachedInHorizon: boolean;
  totalInitialCashRequirement: number;
  totalInternalEconomicCost: number;
  totalInitialInvestmentCombined: number;
}

export interface FinancialModelOutputs {
  scenarioName: string;
  calculatedAt: string;
  engineVersion: string;
  assumptions: FinancialAssumptions;
  breakEven: BreakEvenAnalysis;
  monthlyProjections: MonthlyFinancialResult[];

  summaryYear1: {
    totalRevenue: number;
    totalGrossProfit: number;
    averageGrossMarginPercent: number;
    totalOperatingProfit: number;
    endMrr: number;
    endCustomers: number;
    netCashFlowYear1: number;
    cumulativeCashFlowEndYear1: number;
  };

  validationWarnings: string[];
  confidenceScore: number; // 0 to 100 based on completeness and reasonableness
}

/**
 * Standard rounding to 2 decimal places for financial reporting
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates deterministic financial model results from assumptions.
 */
export function calculateFinancialModel(
  assumptions: FinancialAssumptions,
  scenarioName: string = 'Base Case',
  calculatedAtTimestamp?: string
): FinancialModelOutputs {
  const warnings: string[] = [];

  // Validate critical constraints
  if (assumptions.monthlyPricePerCustomer <= 0) {
    warnings.push('Monthly price per customer is zero or negative.');
  }

  // 1. Calculate Unit Economics
  const gatewayFee = round2(
    (assumptions.monthlyPricePerCustomer * (assumptions.paymentProcessingPercent / 100)) +
    assumptions.paymentProcessingFixed
  );

  const totalVariableCostPerCustomer = round2(
    assumptions.variableHostingPerCustomer +
    assumptions.variableSupportPerCustomer +
    gatewayFee
  );

  const monthlyContributionPerCustomer = round2(
    assumptions.monthlyPricePerCustomer - totalVariableCostPerCustomer
  );

  const contributionMarginPercent = assumptions.monthlyPricePerCustomer > 0
    ? round2((monthlyContributionPerCustomer / assumptions.monthlyPricePerCustomer) * 100)
    : 0;

  const isContributionPositive = monthlyContributionPerCustomer > 0;

  // Monthly fixed operating costs
  const monthlyFixedCosts = round2(
    assumptions.fixedHostingAndTools +
    assumptions.fixedMarketingAndSales +
    assumptions.fixedMaintenanceAndLabor +
    assumptions.fixedGeneralAndAdmin
  );

  // Total Initial Cash Investment
  const totalInitialCashRequirement = round2(
    assumptions.initialResearchAndDesignCash +
    assumptions.initialDevelopmentCash +
    assumptions.initialMarketingLaunchCash +
    assumptions.initialContingencyCash
  );

  const totalInternalEconomicCost = round2(assumptions.internalLaborEconomicCost);
  const totalInitialInvestmentCombined = round2(
    totalInitialCashRequirement + totalInternalEconomicCost
  );

  // 2. Operating Break-Even Customer Count
  let operatingBreakEvenCustomers: number | null = null;
  let breakEvenCommentary = '';

  if (!isContributionPositive) {
    operatingBreakEvenCustomers = null;
    breakEvenCommentary = 'Negative or zero unit contribution: Every new customer increases monthly loss. Operating break-even cannot be reached with current pricing and variable cost structure.';
    warnings.push('Unit contribution is negative or zero. Pricing must exceed direct delivery costs.');
  } else if (monthlyFixedCosts === 0) {
    operatingBreakEvenCustomers = 0;
    breakEvenCommentary = 'No fixed operating costs modeled. Breakeven is immediate with 1 customer.';
  } else {
    operatingBreakEvenCustomers = Math.ceil(monthlyFixedCosts / monthlyContributionPerCustomer);
    breakEvenCommentary = `${operatingBreakEvenCustomers} active paying customers are required to cover monthly fixed operating costs (${monthlyFixedCosts.toLocaleString('en-US')} SAR/mo).`;
  }

  // 3. Month-by-month projection
  const horizon = Math.max(12, Math.min(60, assumptions.horizonMonths || 24));
  const projections: MonthlyFinancialResult[] = [];

  let currentCustomers = Math.max(0, assumptions.startingPayingCustomers || 0);
  let cumulativeCash = -totalInitialCashRequirement; // Cash investment spent at Month 0
  let investmentPaybackMonth: number | null = null;

  let currentMonthlyNewAcquisitions = Math.max(0, assumptions.monthlyNewCustomers || 0);

  for (let m = 1; m <= horizon; m++) {
    const startCustomers = currentCustomers;

    // Apply month-over-month growth to new customer additions if configured
    if (m > 1 && assumptions.monthlyCustomerGrowthRatePercent > 0) {
      currentMonthlyNewAcquisitions = round2(
        currentMonthlyNewAcquisitions * (1 + (assumptions.monthlyCustomerGrowthRatePercent / 100))
      );
    }

    const newCust = currentMonthlyNewAcquisitions;
    const churnRate = Math.min(100, Math.max(0, assumptions.monthlyChurnPercent)) / 100;
    const churnedCust = Math.round(startCustomers * churnRate);
    const endCustomers = Math.max(0, startCustomers + newCust - churnedCust);

    // Revenue calculations
    // Blended monthly price factoring in annual discount
    const annualShare = Math.min(100, Math.max(0, assumptions.annualBillingSharePercent)) / 100;
    const discountFactor = 1 - ((assumptions.annualDiscountPercent || 0) / 100);
    const blendedMonthlyPrice = round2(
      (assumptions.monthlyPricePerCustomer * (1 - annualShare)) +
      (assumptions.monthlyPricePerCustomer * annualShare * discountFactor)
    );

    const recurringRev = round2(endCustomers * blendedMonthlyPrice);
    const setupRev = round2(newCust * assumptions.setupFeePerCustomer);
    const totalRev = round2(recurringRev + setupRev);
    const mrr = round2(endCustomers * assumptions.monthlyPricePerCustomer);
    const arrRunRate = round2(mrr * 12);

    // Variable costs for active customer base
    const totalVarCosts = round2(endCustomers * totalVariableCostPerCustomer);
    const grossProfit = round2(totalRev - totalVarCosts);
    const grossMarginPercent = totalRev > 0 ? round2((grossProfit / totalRev) * 100) : 0;

    // Operating profit
    const opProfit = round2(grossProfit - monthlyFixedCosts);
    const netCashFlow = opProfit; // Under cash-basis baseline (excluding receivables lag for conservative core)
    cumulativeCash = round2(cumulativeCash + netCashFlow);

    // Check investment payback
    if (investmentPaybackMonth === null && cumulativeCash >= 0) {
      investmentPaybackMonth = m;
    }

    projections.push({
      month: m,
      activeCustomersStart: startCustomers,
      newCustomers: newCust,
      churnedCustomers: churnedCust,
      activeCustomersEnd: endCustomers,
      recurringRevenue: recurringRev,
      setupRevenue: setupRev,
      totalRevenue: totalRev,
      mrr,
      arrRunRate,
      variableCosts: totalVarCosts,
      grossProfit,
      grossMarginPercent,
      fixedOperatingCosts: monthlyFixedCosts,
      operatingProfit: opProfit,
      netCashFlow,
      cumulativeCashFlow: cumulativeCash,
    });

    currentCustomers = endCustomers;
  }

  // 4. Summarize Year 1
  const year1Projections = projections.slice(0, 12);
  const totalRevY1 = round2(year1Projections.reduce((sum, p) => sum + p.totalRevenue, 0));
  const totalGrossProfitY1 = round2(year1Projections.reduce((sum, p) => sum + p.grossProfit, 0));
  const avgGrossMarginY1 = totalRevY1 > 0 ? round2((totalGrossProfitY1 / totalRevY1) * 100) : 0;
  const totalOpProfitY1 = round2(year1Projections.reduce((sum, p) => sum + p.operatingProfit, 0));
  const netCashFlowY1 = round2(year1Projections.reduce((sum, p) => sum + p.netCashFlow, 0));
  const endMrrY1 = year1Projections[year1Projections.length - 1]?.mrr || 0;
  const endCustY1 = year1Projections[year1Projections.length - 1]?.activeCustomersEnd || 0;
  const cumCashEndYear1 = year1Projections[year1Projections.length - 1]?.cumulativeCashFlow || 0;

  // Confidence heuristic
  let confidence = 85;
  if (assumptions.monthlyChurnPercent > 10) {
    warnings.push('Monthly churn above 10% indicates high volatility.');
    confidence -= 10;
  }
  if (assumptions.monthlyNewCustomers > 50 && assumptions.startingPayingCustomers === 0) {
    warnings.push('Aggressive early customer acquisition assumed without existing customer base.');
    confidence -= 10;
  }
  if (!isContributionPositive) {
    confidence -= 30;
  }

  return {
    scenarioName,
    calculatedAt: calculatedAtTimestamp || '2026-10-18T09:00:00.000Z',
    engineVersion: '2.4.0-deterministic',
    assumptions,
    breakEven: {
      monthlyContributionPerCustomer,
      contributionMarginPercent,
      isContributionPositive,
      operatingBreakEvenCustomers,
      currentMonthlyFixedCosts: monthlyFixedCosts,
      breakEvenCommentary,
      investmentPaybackMonth,
      paybackReachedInHorizon: investmentPaybackMonth !== null,
      totalInitialCashRequirement,
      totalInternalEconomicCost,
      totalInitialInvestmentCombined,
    },
    monthlyProjections: projections,
    summaryYear1: {
      totalRevenue: totalRevY1,
      totalGrossProfit: totalGrossProfitY1,
      averageGrossMarginPercent: avgGrossMarginY1,
      totalOperatingProfit: totalOpProfitY1,
      endMrr: endMrrY1,
      endCustomers: endCustY1,
      netCashFlowYear1: netCashFlowY1,
      cumulativeCashFlowEndYear1: cumCashEndYear1,
    },
    validationWarnings: warnings,
    confidenceScore: Math.max(10, Math.min(100, confidence)),
  };
}

/**
 * Generate 3 standardized scenarios (Downside, Base Case, Upside)
 * with independent, transparent assumption adjustments.
 */
export function generateThreeScenarios(base: FinancialAssumptions) {
  // Downside: 20% lower price, 35% lower acquisition, 30% higher churn, 15% higher variable cost
  const downside: FinancialAssumptions = {
    ...base,
    monthlyPricePerCustomer: round2(base.monthlyPricePerCustomer * 0.8),
    monthlyNewCustomers: Math.max(1, Math.floor(base.monthlyNewCustomers * 0.65)),
    monthlyChurnPercent: round2(base.monthlyChurnPercent * 1.3),
    variableHostingPerCustomer: round2(base.variableHostingPerCustomer * 1.15),
    fixedMarketingAndSales: round2(base.fixedMarketingAndSales * 1.1),
    initialDevelopmentCash: round2(base.initialDevelopmentCash * 1.2), // cost overrun
  };

  // Upside: 15% higher price, 30% higher acquisition, 20% lower churn, 10% lower variable cost
  const upside: FinancialAssumptions = {
    ...base,
    monthlyPricePerCustomer: round2(base.monthlyPricePerCustomer * 1.15),
    monthlyNewCustomers: Math.ceil(base.monthlyNewCustomers * 1.3),
    monthlyChurnPercent: round2(Math.max(1, base.monthlyChurnPercent * 0.8)),
    variableHostingPerCustomer: round2(base.variableHostingPerCustomer * 0.9),
    initialMarketingLaunchCash: round2(base.initialMarketingLaunchCash * 1.1),
  };

  return {
    downside: calculateFinancialModel(downside, 'Downside'),
    base: calculateFinancialModel(base, 'Base Case'),
    upside: calculateFinancialModel(upside, 'Upside'),
  };
}

/**
 * Perform sensitivity analysis by varying a key driver by +/- 10% and +/- 20%
 */
export function runSensitivityAnalysis(base: FinancialAssumptions, driver: 'price' | 'acquisitions' | 'churn' | 'costs') {
  const steps = [-0.2, -0.1, 0, 0.1, 0.2];

  return steps.map((pct) => {
    const modified: FinancialAssumptions = { ...base };
    if (driver === 'price') {
      modified.monthlyPricePerCustomer = round2(base.monthlyPricePerCustomer * (1 + pct));
    } else if (driver === 'acquisitions') {
      modified.monthlyNewCustomers = Math.max(1, Math.round(base.monthlyNewCustomers * (1 + pct)));
    } else if (driver === 'churn') {
      modified.monthlyChurnPercent = Math.max(0.5, round2(base.monthlyChurnPercent * (1 + pct)));
    } else if (driver === 'costs') {
      modified.fixedHostingAndTools = round2(base.fixedHostingAndTools * (1 + pct));
      modified.fixedMarketingAndSales = round2(base.fixedMarketingAndSales * (1 + pct));
    }

    const res = calculateFinancialModel(modified, `${driver} ${(pct * 100).toFixed(0)}%`);
    return {
      deltaPercent: pct * 100,
      endMrr: res.summaryYear1.endMrr,
      operatingProfitYear1: res.summaryYear1.totalOperatingProfit,
      breakEvenCustomers: res.breakEven.operatingBreakEvenCustomers,
      paybackMonth: res.breakEven.investmentPaybackMonth,
    };
  });
}
