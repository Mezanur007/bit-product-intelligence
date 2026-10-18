/**
 * B-IT Technology — Decision Engine & Mandatory Gates Specification
 * 
 * Generates transparent, explainable recommendations based on weighted category scores,
 * mandatory governance gates, and financial viability constraints.
 * 
 * CORE PRINCIPLE: High score NEVER overrides a mandatory gate failure.
 */

export interface ScoreWeights {
  marketAttractiveness: number; // default: 20
  customerValidation: number; // default: 20
  competitiveDifferentiation: number; // default: 15
  financialViability: number; // default: 20
  technicalFeasibility: number; // default: 10
  strategicFitAndReusability: number; // default: 10
  operationalReadiness: number; // default: 5
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  marketAttractiveness: 20,
  customerValidation: 20,
  competitiveDifferentiation: 15,
  financialViability: 20,
  technicalFeasibility: 10,
  strategicFitAndReusability: 10,
  operationalReadiness: 5,
};

export interface CategoryScores {
  marketAttractiveness: number; // 0-100
  customerValidation: number; // 0-100
  competitiveDifferentiation: number; // 0-100
  financialViability: number; // 0-100
  technicalFeasibility: number; // 0-100
  strategicFitAndReusability: number; // 0-100
  operationalReadiness: number; // 0-100
}

export type GateStatus = 'pass' | 'conditional_pass' | 'fail' | 'not_assessed' | 'not_applicable';

export interface MandatoryGate {
  id: string;
  name: string;
  category: string;
  status: GateStatus;
  evidence: string;
  notes?: string;
  isCritical: boolean; // if true, failure halts execution
}

export type RecommendationType =
  | 'EXECUTE'
  | 'PILOT'
  | 'CONTINUE_RESEARCH'
  | 'HOLD'
  | 'PARTNER'
  | 'DROP';

export interface DecisionEvaluationInput {
  opportunityId: string;
  opportunityName: string;
  weights?: ScoreWeights;
  scores: CategoryScores;
  gates: MandatoryGate[];
  financialMetrics: {
    isContributionPositive: boolean;
    monthlyContributionPerCustomer: number;
    operatingBreakEvenCustomers: number | null;
    investmentPaybackMonth: number | null;
    totalInitialCashRequirement: number;
  };
  validationEvidence: {
    interviewCount: number;
    qualifiedLeadsCount: number;
    loiCount: number;
    paidPilotCommitments: number;
  };
  buildVsBuy: 'build' | 'buy' | 'partner' | 'white_label';
  budgetCapSAR?: number;
}

export interface DecisionEngineResult {
  opportunityId: string;
  evaluatedAt: string;
  engineVersion: string;
  recommendation: RecommendationType;
  overallScore: number; // 0-100
  categoryScores: CategoryScores;
  normalizedWeights: ScoreWeights;
  
  passedGatesCount: number;
  failedGatesCount: number;
  conditionalGatesCount: number;
  unassessedGatesCount: number;
  criticalGateFailures: string[];

  reasonsFor: string[];
  reasonsAgainst: string[];
  conditionsToProceed: string[];
  recommendedNextActions: string[];
  requiresExecutiveApproval: boolean;
}

/**
 * Validates weights sum to 100
 */
export function validateWeights(weights: ScoreWeights): boolean {
  const sum =
    weights.marketAttractiveness +
    weights.customerValidation +
    weights.competitiveDifferentiation +
    weights.financialViability +
    weights.technicalFeasibility +
    weights.strategicFitAndReusability +
    weights.operationalReadiness;
  return Math.abs(sum - 100) < 0.01;
}

/**
 * Compute the weighted overall score (0 to 100)
 */
export function computeWeightedScore(scores: CategoryScores, weights: ScoreWeights = DEFAULT_WEIGHTS): number {
  const raw =
    (scores.marketAttractiveness * weights.marketAttractiveness) +
    (scores.customerValidation * weights.customerValidation) +
    (scores.competitiveDifferentiation * weights.competitiveDifferentiation) +
    (scores.financialViability * weights.financialViability) +
    (scores.technicalFeasibility * weights.technicalFeasibility) +
    (scores.strategicFitAndReusability * weights.strategicFitAndReusability) +
    (scores.operationalReadiness * weights.operationalReadiness);

  const totalWeight =
    weights.marketAttractiveness +
    weights.customerValidation +
    weights.competitiveDifferentiation +
    weights.financialViability +
    weights.technicalFeasibility +
    weights.strategicFitAndReusability +
    weights.operationalReadiness;

  const score = totalWeight > 0 ? raw / totalWeight : 0;
  return Math.round((score + Number.EPSILON) * 10) / 10;
}

/**
 * Evaluates an opportunity against weighted criteria and mandatory gates.
 */
export function evaluateDecision(input: DecisionEvaluationInput): DecisionEngineResult {
  const weights = input.weights || DEFAULT_WEIGHTS;
  const overallScore = computeWeightedScore(input.scores, weights);

  const reasonsFor: string[] = [];
  const reasonsAgainst: string[] = [];
  const conditionsToProceed: string[] = [];
  const nextActions: string[] = [];

  // 1. Audit mandatory gates
  const criticalGateFailures: string[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let conditionalCount = 0;
  let unassessedCount = 0;

  for (const gate of input.gates) {
    if (gate.status === 'pass') {
      passedCount++;
    } else if (gate.status === 'conditional_pass') {
      conditionalCount++;
      conditionsToProceed.push(`Condition for Gate '${gate.name}': ${gate.evidence || 'Must fulfill documented criteria'}`);
    } else if (gate.status === 'fail') {
      failedCount++;
      if (gate.isCritical) {
        criticalGateFailures.push(gate.name);
        reasonsAgainst.push(`Critical gate failed: ${gate.name}`);
      }
    } else if (gate.status === 'not_assessed') {
      unassessedCount++;
    }
  }

  // 2. Financial viability audit
  if (!input.financialMetrics.isContributionPositive) {
    criticalGateFailures.push('Unit Economics Viability');
    reasonsAgainst.push('Unit contribution per customer is negative or zero. Every sale increases cash burn.');
  } else {
    reasonsFor.push(`Positive unit contribution of SAR ${input.financialMetrics.monthlyContributionPerCustomer.toFixed(2)}/mo.`);
  }

  if (input.financialMetrics.investmentPaybackMonth !== null) {
    reasonsFor.push(`Payback forecast achieved within horizon at month ${input.financialMetrics.investmentPaybackMonth}.`);
  } else {
    reasonsAgainst.push('Investment payback is not reached within the modeled projection horizon.');
  }

  // Check budget limits
  if (input.budgetCapSAR && input.financialMetrics.totalInitialCashRequirement > input.budgetCapSAR) {
    criticalGateFailures.push('Budget Cap Authorization');
    reasonsAgainst.push(`Required cash (${input.financialMetrics.totalInitialCashRequirement.toLocaleString()} SAR) exceeds authorized cap of ${input.budgetCapSAR.toLocaleString()} SAR.`);
  }

  // 3. Customer demand validation audit
  const hasValidatedDemand =
    input.validationEvidence.paidPilotCommitments > 0 ||
    input.validationEvidence.loiCount >= 2 ||
    (input.validationEvidence.interviewCount >= 8 && input.scores.customerValidation >= 70);

  if (hasValidatedDemand) {
    reasonsFor.push(`Customer demand validated with ${input.validationEvidence.interviewCount} interviews, ${input.validationEvidence.loiCount} LOIs, and ${input.validationEvidence.paidPilotCommitments} paid pilot commitments.`);
  } else {
    reasonsAgainst.push('Customer demand is unvalidated or insufficient direct buyer commitments recorded.');
  }

  // 4. Build vs buy strategic evaluation
  if (input.buildVsBuy === 'partner' || input.buildVsBuy === 'white_label') {
    reasonsFor.push(`Strategic approach favors ${input.buildVsBuy.toUpperCase()} to minimize capital expenditure and delivery risk.`);
  }

  // 5. Synthesize Recommendation
  let recommendation: RecommendationType = 'CONTINUE_RESEARCH';

  // RULE A: Critical gate failures or negative contribution ALWAYS block execution
  if (criticalGateFailures.length > 0) {
    if (criticalGateFailures.includes('Legal and regulatory readiness') ||
        criticalGateFailures.includes('Data protection and security') ||
        criticalGateFailures.includes('Unit Economics Viability')) {
      // Irreversible or structural blocker
      if (overallScore < 50 || !input.financialMetrics.isContributionPositive) {
        recommendation = 'DROP';
        nextActions.push('Archive opportunity; document negative economics or fatal blocker in audit history.');
      } else {
        recommendation = 'HOLD';
        nextActions.push('Resolve mandatory gate blockers before committing further company resources.');
      }
    } else {
      recommendation = 'HOLD';
      nextActions.push('Conduct executive review on gate failures and determine if mitigations are achievable.');
    }
  }
  // RULE B: High score with Build-vs-Buy preference for partner
  else if (input.buildVsBuy === 'partner' || input.buildVsBuy === 'white_label') {
    recommendation = 'PARTNER';
    nextActions.push('Initiate partnership negotiations and review vendor SLAs.');
  }
  // RULE C: High score + Passed gates + Validated demand => EXECUTE
  else if (overallScore >= 75 && hasValidatedDemand && unassessedCount <= 1) {
    recommendation = 'EXECUTE';
    nextActions.push('Finalize detailed technical sprint plan and allocate initial cash budget.');
    nextActions.push('Establish weekly launch readiness check-ins.');
  }
  // RULE D: Promising score but unvalidated demand => PILOT
  else if (overallScore >= 60) {
    recommendation = 'PILOT';
    nextActions.push('Design bounded 60-day pilot with maximum SAR 15,000 budget.');
    nextActions.push('Secure minimum 2 paying pilot commitments to validate willingness-to-pay.');
    conditionsToProceed.push('Must convert at least 2 paying pilot customers prior to full build.');
  }
  // RULE E: Missing material evidence or low score
  else if (overallScore >= 45 || unassessedCount >= 3) {
    recommendation = 'CONTINUE_RESEARCH';
    nextActions.push('Conduct at least 5 additional qualified customer interviews in Saudi Arabia.');
    nextActions.push('Complete market sizing verification and competitor pricing benchmarks.');
  }
  // RULE F: Poor overall viability
  else {
    recommendation = 'DROP';
    nextActions.push('Document lessons learned and deprioritize in favor of higher potential opportunities.');
  }

  return {
    opportunityId: input.opportunityId,
    evaluatedAt: '2026-10-18T09:00:00.000Z',
    engineVersion: '2.4.0-governance',
    recommendation,
    overallScore,
    categoryScores: input.scores,
    normalizedWeights: weights,
    passedGatesCount: passedCount,
    failedGatesCount: failedCount,
    conditionalGatesCount: conditionalCount,
    unassessedGatesCount: unassessedCount,
    criticalGateFailures,
    reasonsFor,
    reasonsAgainst,
    conditionsToProceed,
    recommendedNextActions: nextActions,
    requiresExecutiveApproval: recommendation === 'EXECUTE' || recommendation === 'PILOT' || recommendation === 'DROP',
  };
}

/**
 * Standard 9 Mandatory Decision Gates
 */
export function createDefaultMandatoryGates(): MandatoryGate[] {
  return [
    {
      id: 'gate-1',
      name: 'Customer Demand Validation',
      category: 'Market',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-2',
      name: 'Financial Viability & Contribution Margin',
      category: 'Finance',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-3',
      name: 'Validation Budget Authorization (SAR < 25k)',
      category: 'Finance',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-4',
      name: 'Technical Feasibility & Architecture Sign-off',
      category: 'Technical',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-5',
      name: 'Saudi Data Protection (PDPL) & Cybersecurity',
      category: 'Compliance',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-6',
      name: 'Legal, ZATCA e-Invoicing & Contract Terms',
      category: 'Legal',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-7',
      name: 'IP & Source Code Ownership',
      category: 'Legal',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
    {
      id: 'gate-8',
      name: 'Operational Support & Team Capacity',
      category: 'Operations',
      status: 'not_assessed',
      evidence: '',
      isCritical: false,
    },
    {
      id: 'gate-9',
      name: 'Designated Approver Sign-off',
      category: 'Governance',
      status: 'not_assessed',
      evidence: '',
      isCritical: true,
    },
  ];
}
