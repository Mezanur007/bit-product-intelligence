/**
 * B-IT Technology — Database Entity Types
 */

import { FinancialAssumptions, FinancialModelOutputs } from '../financial-engine';
import { CategoryScores, GateStatus, MandatoryGate, RecommendationType, ScoreWeights } from '../decision-engine';

export type UserRole =
  | 'admin'
  | 'management'
  | 'product_owner'
  | 'market_analyst'
  | 'technical_reviewer'
  | 'finance_reviewer';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarInitials: string;
  createdAt?: string;
}

export type OpportunityStatus =
  | 'idea'
  | 'discovery'
  | 'evaluation'
  | 'decision_pending'
  | 'pilot_approved'
  | 'pilot_in_progress'
  | 'approved_for_launch'
  | 'active'
  | 'on_hold'
  | 'rejected'
  | 'discontinued';

export type ProductCategory =
  | 'saas'
  | 'ai_agent'
  | 'custom_software'
  | 'white_label'
  | 'partnership'
  | 'subscription_service'
  | 'other';

export interface Competitor {
  id: string;
  opportunityId: string;
  name: string;
  website: string;
  productName: string;
  country: string;
  observedPriceSAR: number;
  pricingInterval: 'monthly' | 'annual' | 'one_time' | 'usage';
  hasArabicSupport: boolean;
  mainStrengths: string;
  mainWeaknesses: string;
  differentiationOpportunity: string;
  sourceUrl?: string;
  confidence: 'verified' | 'unverified' | 'estimate';
}

export type VerificationStatus =
  | 'verified'
  | 'corroborated'
  | 'unverified'
  | 'management_assumption'
  | 'ai_hypothesis'
  | 'outdated'
  | 'disputed';

export interface ResearchSource {
  id: string;
  opportunityId?: string;
  competitorId?: string;
  url: string;
  publisher: string;
  pageTitle: string;
  sourceType: 'official_pricing' | 'industry_report' | 'customer_interview' | 'government_data' | 'news' | 'internal';
  relevantClaim: string;
  extractedValue?: string;
  verificationStatus: VerificationStatus;
  accessedAt: string;
  researcherName: string;
}

export interface RiskItem {
  id: string;
  opportunityId: string;
  riskCode: string; // RSK-01
  category: 'commercial' | 'financial' | 'technical' | 'cybersecurity' | 'privacy' | 'legal' | 'regulatory' | 'operational';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ownerName: string;
  mitigation: string;
  status: 'open' | 'mitigating' | 'resolved' | 'accepted';
}

export interface MarketAssessment {
  opportunityId: string;
  tamSAR: number;
  samSAR: number;
  somSAR: number;
  sizingMethodology: 'top_down' | 'bottom_up' | 'hybrid';
  targetBusinessCount: number;
  reachableSharePercent: number;
  annualRevenuePerCustomerSAR: number;
  customerProblem: string;
  targetCustomerProfile: string;
  currentAlternatives: string;
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';
  salesCycleDays: number;
  interviewCount: number;
  qualifiedLeadsCount: number;
  loiCount: number;
  paidPilotCommitments: number;
  adoptionBarriers: string;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface TechnicalFeasibility {
  opportunityId: string;
  architectureSummary: string;
  proposedTechStack: string[];
  buildVsBuy: 'build' | 'buy' | 'partner' | 'white_label';
  reusableInternalComponents: string;
  thirdPartyDependencies: string;
  securityRequirements: string;
  saudiHostingCompliant: boolean; // PDPL / CITC compliance
  effortDiscoveryDays: number;
  effortDesignDays: number;
  effortFrontendDays: number;
  effortBackendDays: number;
  effortQaDays: number;
  blendedDailyRateSAR: number;
  deliveryRiskSummary: string;
  technicalOwnerName: string;
}

export interface PilotPlan {
  opportunityId: string;
  objective: string;
  targetCustomers: number;
  durationDays: number;
  budgetSAR: number;
  successCriteria: string;
  failureCriteria: string;
  status: 'draft' | 'in_progress' | 'completed' | 'abandoned';
}

export interface LaunchChecklistItem {
  id: string;
  opportunityId: string;
  taskName: string;
  category: 'product' | 'qa' | 'security' | 'legal' | 'sales' | 'billing';
  assigneeName: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface MonthlyPerformanceRecord {
  id: string;
  opportunityId: string;
  reportingMonth: string; // YYYY-MM
  payingCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  mrrSAR: number;
  cashCollectedSAR: number;
  directCostsSAR: number;
  operatingCostsSAR: number;
  grossProfitSAR: number;
  netOperatingResultSAR: number;
  forecastVarianceNotes?: string;
}

export interface ApprovalRecord {
  id: string;
  opportunityId: string;
  decisionType: RecommendationType;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBudgetSAR?: number;
  conditions?: string;
  rationale: string;
}

export interface Opportunity {
  id: string; // BIT-OP-001
  code: string;
  name: string;
  description: string;
  category: ProductCategory;
  businessProblem: string;
  proposedSolution: string;
  targetCustomerSegment: string;
  primaryGeography: string; // Saudi Arabia
  industry: string;
  businessModel: string;
  pricingModel: string;

  ownerName: string;
  ownerId: string;
  technicalOwnerName: string;
  financeReviewerName: string;

  discoveryDate: string;
  targetDecisionDate: string;
  proposedValidationBudgetSAR: number;
  approvedBudgetSAR: number;
  status: OpportunityStatus;

  weightedScore: number;
  recommendation: RecommendationType;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;

  // Step 1: Market
  marketAssessment: MarketAssessment;

  // Step 2: Competitors
  competitors: Competitor[];

  // Step 3: Technical
  technicalFeasibility: TechnicalFeasibility;

  // Step 4: Financial Model Assumptions & Cached Outputs
  financialAssumptions: FinancialAssumptions;
  financialOutputs?: FinancialModelOutputs;

  // Step 5: Risks & Mandatory Gates
  risks: RiskItem[];
  mandatoryGates: MandatoryGate[];

  // Step 6: Category Scores, Decision & Approvals
  categoryScores: CategoryScores;
  approvals: ApprovalRecord[];

  // Module 4: Pilot & Launch
  pilotPlan?: PilotPlan;
  launchChecklist: LaunchChecklistItem[];

  // Module 5: Post-Launch Actual Performance
  actualPerformance: MonthlyPerformanceRecord[];

  // Module 6: Research Sources
  sources: ResearchSource[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  timestamp: string;
}

export interface SystemSettings {
  currency: string;
  defaultWeights: ScoreWeights;
  maxValidationBudgetWithoutApprovalSAR: number;
  requireSaudiPDPLSignOff: boolean;
  demoModeActive: boolean;
}
