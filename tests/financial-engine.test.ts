import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateFinancialModel,
  generateThreeScenarios,
  runSensitivityAnalysis,
  FinancialAssumptions,
} from '../src/lib/financial-engine/index.js';

describe('Financial Calculation Engine — B-IT Technology', () => {
  const baseAssumptions: FinancialAssumptions = {
    monthlyPricePerCustomer: 500, // SAR
    setupFeePerCustomer: 200,
    annualDiscountPercent: 15,
    annualBillingSharePercent: 20, // 20% annual billing

    variableHostingPerCustomer: 20,
    variableSupportPerCustomer: 15,
    paymentProcessingPercent: 2.5,
    paymentProcessingFixed: 1.0,

    fixedHostingAndTools: 1000,
    fixedMarketingAndSales: 1500,
    fixedMaintenanceAndLabor: 1000,
    fixedGeneralAndAdmin: 500, // Total monthly fixed = 4,000 SAR

    initialResearchAndDesignCash: 2500,
    initialDevelopmentCash: 8000,
    initialMarketingLaunchCash: 3000,
    initialContingencyCash: 1500, // Total cash = 15,000 SAR
    internalLaborEconomicCost: 12000,

    startingPayingCustomers: 0,
    monthlyNewCustomers: 5,
    monthlyCustomerGrowthRatePercent: 0,
    monthlyChurnPercent: 2,
    horizonMonths: 24,
  };

  it('calculates unit economics and contribution correctly', () => {
    const res = calculateFinancialModel(baseAssumptions);

    // Gateway fee: 500 * 2.5% + 1.0 = 12.5 + 1.0 = 13.5 SAR
    // Variable cost: 20 + 15 + 13.5 = 48.5 SAR
    // Contribution: 500 - 48.5 = 451.5 SAR
    assert.strictEqual(res.breakEven.monthlyContributionPerCustomer, 451.5);
    assert.strictEqual(res.breakEven.isContributionPositive, true);
    assert.strictEqual(res.breakEven.currentMonthlyFixedCosts, 4000);

    // Break-even customer count: Math.ceil(4000 / 451.5) = Math.ceil(8.8593) = 9 customers
    assert.strictEqual(res.breakEven.operatingBreakEvenCustomers, 9);
    assert.strictEqual(res.breakEven.totalInitialCashRequirement, 15000);
    assert.strictEqual(res.breakEven.totalInternalEconomicCost, 12000);
    assert.strictEqual(res.breakEven.totalInitialInvestmentCombined, 27000);
  });

  it('handles negative or zero contribution margin safely without crashing', () => {
    const lossMaking: FinancialAssumptions = {
      ...baseAssumptions,
      monthlyPricePerCustomer: 30, // SAR price
      variableHostingPerCustomer: 35, // variable cost alone exceeds price!
    };

    const res = calculateFinancialModel(lossMaking);
    assert.strictEqual(res.breakEven.isContributionPositive, false);
    assert.strictEqual(res.breakEven.operatingBreakEvenCustomers, null);
    assert.ok(res.validationWarnings.length > 0);
    assert.ok(res.breakEven.breakEvenCommentary.includes('Negative or zero unit contribution'));
  });

  it('handles zero fixed costs gracefully', () => {
    const zeroFixed: FinancialAssumptions = {
      ...baseAssumptions,
      fixedHostingAndTools: 0,
      fixedMarketingAndSales: 0,
      fixedMaintenanceAndLabor: 0,
      fixedGeneralAndAdmin: 0,
    };

    const res = calculateFinancialModel(zeroFixed);
    assert.strictEqual(res.breakEven.operatingBreakEvenCustomers, 0);
  });

  it('correctly models 24-month cash flow and investment payback', () => {
    const res = calculateFinancialModel(baseAssumptions);
    assert.strictEqual(res.monthlyProjections.length, 24);

    // Month 1 checks:
    const m1 = res.monthlyProjections[0];
    assert.strictEqual(m1.month, 1);
    assert.strictEqual(m1.activeCustomersStart, 0);
    assert.strictEqual(m1.newCustomers, 5);
    // Churn on 0 start is 0
    assert.strictEqual(m1.activeCustomersEnd, 5);

    // Revenue in month 1:
    // Blended price: 500 * 0.8 + 500 * 0.2 * 0.85 = 400 + 85 = 485 SAR
    // 5 * 485 = 2425 SAR recurring + 5 * 200 setup = 1000 => Total = 3425 SAR
    assert.strictEqual(m1.recurringRevenue, 2425);
    assert.strictEqual(m1.setupRevenue, 1000);
    assert.strictEqual(m1.totalRevenue, 3425);

    // Variable costs: 5 * 48.5 = 242.5 SAR
    assert.strictEqual(m1.variableCosts, 242.5);
    // Gross profit: 3425 - 242.5 = 3182.5 SAR
    assert.strictEqual(m1.grossProfit, 3182.5);

    // Operating profit: 3182.5 - 4000 = -817.5 SAR
    assert.strictEqual(m1.operatingProfit, -817.5);

    // Cumulative cash starts at -15000 + (-817.5) = -15817.5 SAR
    assert.strictEqual(m1.cumulativeCashFlow, -15817.5);

    // Check if payback is tracked
    assert.ok(res.breakEven.investmentPaybackMonth !== null);
    assert.ok(res.breakEven.investmentPaybackMonth > 1);
  });

  it('generates three distinct scenarios (Downside, Base, Upside)', () => {
    const scenarios = generateThreeScenarios(baseAssumptions);
    assert.ok(scenarios.downside.summaryYear1.totalRevenue < scenarios.base.summaryYear1.totalRevenue);
    assert.ok(scenarios.base.summaryYear1.totalRevenue < scenarios.upside.summaryYear1.totalRevenue);
    assert.strictEqual(scenarios.downside.scenarioName, 'Downside');
    assert.strictEqual(scenarios.base.scenarioName, 'Base Case');
    assert.strictEqual(scenarios.upside.scenarioName, 'Upside');
  });

  it('executes sensitivity analysis for price and acquisition drivers', () => {
    const priceSensitivity = runSensitivityAnalysis(baseAssumptions, 'price');
    assert.strictEqual(priceSensitivity.length, 5); // -20%, -10%, 0%, +10%, +20%
    assert.ok(priceSensitivity[0].endMrr < priceSensitivity[4].endMrr);
  });
});
