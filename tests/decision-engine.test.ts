import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateDecision,
  createDefaultMandatoryGates,
  validateWeights,
  computeWeightedScore,
  DEFAULT_WEIGHTS,
  CategoryScores,
} from '../src/lib/decision-engine/index.js';

describe('Decision Engine & Mandatory Gates — B-IT Technology', () => {
  const perfectScores: CategoryScores = {
    marketAttractiveness: 90,
    customerValidation: 85,
    competitiveDifferentiation: 85,
    financialViability: 90,
    technicalFeasibility: 85,
    strategicFitAndReusability: 80,
    operationalReadiness: 80,
  };

  it('validates that default weights sum precisely to 100', () => {
    assert.strictEqual(validateWeights(DEFAULT_WEIGHTS), true);
  });

  it('computes weighted score accurately', () => {
    const score = computeWeightedScore(perfectScores, DEFAULT_WEIGHTS);
    assert.ok(score >= 85 && score <= 90);
  });

  it('recommends EXECUTE when score is high, demand is validated, and mandatory gates pass', () => {
    const gates = createDefaultMandatoryGates().map(g => ({
      ...g,
      status: 'pass' as const,
      evidence: 'Verified audit evidence present',
    }));

    const result = evaluateDecision({
      opportunityId: 'BIT-OP-001',
      opportunityName: 'SME IT Service Desk',
      scores: perfectScores,
      gates,
      financialMetrics: {
        isContributionPositive: true,
        monthlyContributionPerCustomer: 450,
        operatingBreakEvenCustomers: 9,
        investmentPaybackMonth: 14,
        totalInitialCashRequirement: 15000,
      },
      validationEvidence: {
        interviewCount: 12,
        qualifiedLeadsCount: 15,
        loiCount: 3,
        paidPilotCommitments: 1,
      },
      buildVsBuy: 'build',
      budgetCapSAR: 25000,
    });

    assert.strictEqual(result.recommendation, 'EXECUTE');
    assert.strictEqual(result.failedGatesCount, 0);
    assert.strictEqual(result.criticalGateFailures.length, 0);
  });

  it('recommends PILOT (not EXECUTE) when score is high but customer demand is unvalidated', () => {
    const gates = createDefaultMandatoryGates().map(g => ({
      ...g,
      status: 'pass' as const,
      evidence: 'Technical and financial pass',
    }));

    const result = evaluateDecision({
      opportunityId: 'BIT-OP-002',
      opportunityName: 'AI Support Desk',
      scores: perfectScores,
      gates,
      financialMetrics: {
        isContributionPositive: true,
        monthlyContributionPerCustomer: 450,
        operatingBreakEvenCustomers: 9,
        investmentPaybackMonth: 14,
        totalInitialCashRequirement: 18000,
      },
      validationEvidence: {
        interviewCount: 1, // Only 1 interview, 0 LOIs, 0 pilots!
        qualifiedLeadsCount: 0,
        loiCount: 0,
        paidPilotCommitments: 0,
      },
      buildVsBuy: 'build',
      budgetCapSAR: 25000,
    });

    // Mandatory rule: high score without customer proof must route to PILOT, not direct full EXECUTE!
    assert.strictEqual(result.recommendation, 'PILOT');
    assert.ok(result.conditionsToProceed.some(c => c.includes('paying pilot prospects') || c.includes('paying pilot')));
  });

  it('PROVES high score NEVER overrides a critical mandatory gate failure', () => {
    const gates = createDefaultMandatoryGates().map(g => {
      if (g.name.includes('Data Protection (PDPL)')) {
        return {
          ...g,
          status: 'fail' as const,
          evidence: 'Hosting provider cannot meet Saudi data residency requirements',
        };
      }
      return { ...g, status: 'pass' as const, evidence: 'Passed' };
    });

    const result = evaluateDecision({
      opportunityId: 'BIT-OP-003',
      opportunityName: 'Healthcare Cloud Solution',
      scores: perfectScores, // 86+ high score!
      gates,
      financialMetrics: {
        isContributionPositive: true,
        monthlyContributionPerCustomer: 600,
        operatingBreakEvenCustomers: 5,
        investmentPaybackMonth: 8,
        totalInitialCashRequirement: 12000,
      },
      validationEvidence: {
        interviewCount: 15,
        qualifiedLeadsCount: 10,
        loiCount: 4,
        paidPilotCommitments: 2,
      },
      buildVsBuy: 'build',
      budgetCapSAR: 25000,
    });

    // Score is 86+, but critical compliance gate failed => MUST NOT BE EXECUTE!
    assert.notStrictEqual(result.recommendation, 'EXECUTE');
    assert.ok(result.recommendation === 'HOLD' || result.recommendation === 'DROP');
    assert.ok(result.criticalGateFailures.length > 0);
    assert.ok(result.reasonsAgainst.some(r => r.includes('Critical gate failed')));
  });

  it('rejects execution when unit contribution is negative or budget cap exceeded', () => {
    const gates = createDefaultMandatoryGates().map(g => ({
      ...g,
      status: 'pass' as const,
      evidence: 'Passed',
    }));

    const result = evaluateDecision({
      opportunityId: 'BIT-OP-004',
      opportunityName: 'Negative Unit Margin Tool',
      scores: perfectScores,
      gates,
      financialMetrics: {
        isContributionPositive: false, // Negative unit contribution!
        monthlyContributionPerCustomer: -25,
        operatingBreakEvenCustomers: null,
        investmentPaybackMonth: null,
        totalInitialCashRequirement: 35000, // Exceeds 25,000 cap!
      },
      validationEvidence: {
        interviewCount: 10,
        qualifiedLeadsCount: 5,
        loiCount: 1,
        paidPilotCommitments: 0,
      },
      buildVsBuy: 'build',
      budgetCapSAR: 25000,
    });

    assert.strictEqual(result.recommendation, 'DROP');
    assert.ok(result.criticalGateFailures.includes('Unit Economics Viability'));
    assert.ok(result.criticalGateFailures.includes('Budget Cap Authorization'));
  });
});
