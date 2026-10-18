/**
 * B-IT Technology — Storage & Data Repository
 * 
 * Provides robust persistence with JSON file storage (.data/bit_store.json),
 * in-memory fallback for serverless cold-starts, audit logging for all changes,
 * and support for both demo mode and honest zero-data state.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  Opportunity,
  AuditLog,
  SystemSettings,
  User,
  Competitor,
  RiskItem,
  LaunchChecklistItem,
  MonthlyPerformanceRecord,
  ApprovalRecord,
  MarketAssessment,
  TechnicalFeasibility,
} from './types';
import { INITIAL_USERS, INITIAL_SETTINGS, getSampleOpportunities } from './seed';
import { calculateFinancialModel, FinancialAssumptions } from '../financial-engine';
import { createDefaultMandatoryGates, evaluateDecision, MandatoryGate, GateStatus } from '../decision-engine';

interface DatabaseStore {
  version: string;
  opportunities: Opportunity[];
  users: User[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  lastSavedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'bit_store.json');

// Memory cache
let inMemoryStore: DatabaseStore | null = null;

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create local .data directory (likely serverless environment):', err);
  }
}

function loadStore(): DatabaseStore {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  ensureDataDirectory();

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content) as DatabaseStore;
      return inMemoryStore;
    } catch (err) {
      console.error('Failed to read database store file, falling back to seed:', err);
    }
  }

  // Initialize with seed data
  const defaultStore: DatabaseStore = {
    version: '1.0.0',
    opportunities: getSampleOpportunities(),
    users: INITIAL_USERS,
    settings: INITIAL_SETTINGS,
    auditLogs: [
      {
        id: 'audit-init',
        actorId: 'usr-admin',
        actorName: 'System Initializer',
        actorRole: 'admin',
        action: 'INITIALIZE_SYSTEM',
        entityType: 'System',
        entityId: 'BIT-SYS',
        summary: 'Platform initialized with standard B-IT seed records.',
        timestamp: new Date().toISOString(),
      },
    ],
    lastSavedAt: new Date().toISOString(),
  };

  inMemoryStore = defaultStore;
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: DatabaseStore): void {
  inMemoryStore = store;
  store.lastSavedAt = new Date().toISOString();
  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // In serverless read-only contexts, in-memory cache preserves state for current instance
    console.warn('Could not write store to file (serverless mode active):', err);
  }
}

export function logAudit(
  actor: User | { id: string; name: string; role: any },
  action: string,
  entityType: string,
  entityId: string,
  summary: string
): void {
  const store = loadStore();
  const entry: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    summary,
    timestamp: new Date().toISOString(),
  };
  store.auditLogs.unshift(entry);
  // Keep last 500 audit entries
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
}

// -------------------------------------------------------------
// REPOSITORY METHODS
// -------------------------------------------------------------

export function getAllOpportunities(filters?: {
  category?: string;
  status?: string;
  query?: string;
}): Opportunity[] {
  const store = loadStore();
  let list = store.opportunities.filter((o) => !o.isArchived);

  if (filters?.category && filters.category !== 'all') {
    list = list.filter((o) => o.category === filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((o) => o.status === filters.status);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.targetCustomerSegment.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getOpportunityById(id: string): Opportunity | null {
  const store = loadStore();
  return store.opportunities.find((o) => o.id === id || o.code === id) || null;
}

export function createOpportunity(
  input: Partial<Opportunity> & { name: string; category: Opportunity['category'] },
  actor: User
): Opportunity {
  const store = loadStore();
  const count = store.opportunities.length + 1;
  const id = `BIT-OP-${String(count).padStart(3, '0')}`;
  const code = `BIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const defaultAssumptions: FinancialAssumptions = {
    monthlyPricePerCustomer: 500,
    setupFeePerCustomer: 0,
    annualDiscountPercent: 15,
    annualBillingSharePercent: 20,
    variableHostingPerCustomer: 25,
    variableSupportPerCustomer: 20,
    paymentProcessingPercent: 2.5,
    paymentProcessingFixed: 1.0,
    fixedHostingAndTools: 1000,
    fixedMarketingAndSales: 1500,
    fixedMaintenanceAndLabor: 1000,
    fixedGeneralAndAdmin: 500,
    initialResearchAndDesignCash: 2500,
    initialDevelopmentCash: 8000,
    initialMarketingLaunchCash: 3000,
    initialContingencyCash: 1500,
    internalLaborEconomicCost: 10000,
    startingPayingCustomers: 0,
    monthlyNewCustomers: 4,
    monthlyCustomerGrowthRatePercent: 3,
    monthlyChurnPercent: 2.5,
    horizonMonths: 24,
  };

  const newOpp: Opportunity = {
    id,
    code,
    name: input.name,
    description: input.description || '',
    category: input.category,
    businessProblem: input.businessProblem || '',
    proposedSolution: input.proposedSolution || '',
    targetCustomerSegment: input.targetCustomerSegment || 'Saudi SMEs',
    primaryGeography: input.primaryGeography || 'Saudi Arabia',
    industry: input.industry || 'IT & Commercial Services',
    businessModel: input.businessModel || 'Recurring Subscription',
    pricingModel: input.pricingModel || 'Monthly Subscription per Tenant',
    ownerName: actor.name,
    ownerId: actor.id,
    technicalOwnerName: input.technicalOwnerName || 'Fahad Al-Harbi',
    financeReviewerName: input.financeReviewerName || 'Omar Al-Zahrani',
    discoveryDate: new Date().toISOString().slice(0, 10),
    targetDecisionDate: input.targetDecisionDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    proposedValidationBudgetSAR: input.proposedValidationBudgetSAR || 15000,
    approvedBudgetSAR: 0,
    status: 'discovery',
    weightedScore: 0,
    recommendation: 'CONTINUE_RESEARCH',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    marketAssessment: {
      opportunityId: id,
      tamSAR: 50000000,
      samSAR: 10000000,
      somSAR: 1500000,
      sizingMethodology: 'bottom_up',
      targetBusinessCount: 1500,
      reachableSharePercent: 5,
      annualRevenuePerCustomerSAR: 6000,
      customerProblem: input.businessProblem || '',
      targetCustomerProfile: input.targetCustomerSegment || '',
      currentAlternatives: '',
      urgencyLevel: 'moderate',
      salesCycleDays: 30,
      interviewCount: 0,
      qualifiedLeadsCount: 0,
      loiCount: 0,
      paidPilotCommitments: 0,
      adoptionBarriers: '',
      confidenceLevel: 'medium',
    },

    competitors: [],

    technicalFeasibility: {
      opportunityId: id,
      architectureSummary: '',
      proposedTechStack: ['Next.js', 'PostgreSQL', 'Tailwind'],
      buildVsBuy: 'build',
      reusableInternalComponents: 'B-IT Core Auth & UI Library',
      thirdPartyDependencies: '',
      securityRequirements: 'Saudi PDPL compliant',
      saudiHostingCompliant: true,
      effortDiscoveryDays: 5,
      effortDesignDays: 7,
      effortFrontendDays: 12,
      effortBackendDays: 15,
      effortQaDays: 6,
      blendedDailyRateSAR: 600,
      deliveryRiskSummary: '',
      technicalOwnerName: 'Fahad Al-Harbi',
    },

    financialAssumptions: defaultAssumptions,
    financialOutputs: calculateFinancialModel(defaultAssumptions, 'Base Case'),

    risks: [],
    mandatoryGates: createDefaultMandatoryGates(),

    categoryScores: {
      marketAttractiveness: 50,
      customerValidation: 20,
      competitiveDifferentiation: 50,
      financialViability: 60,
      technicalFeasibility: 60,
      strategicFitAndReusability: 60,
      operationalReadiness: 50,
    },

    approvals: [],
    launchChecklist: [
      { id: `chk-${Date.now()}-1`, opportunityId: id, taskName: 'Design system architecture & DB schema', category: 'product', assigneeName: 'Fahad Al-Harbi', isCompleted: false },
      { id: `chk-${Date.now()}-2`, opportunityId: id, taskName: 'Complete Saudi PDPL & CITC compliance check', category: 'security', assigneeName: 'Fahad Al-Harbi', isCompleted: false },
      { id: `chk-${Date.now()}-3`, opportunityId: id, taskName: 'Draft pilot contract with ZATCA invoice support', category: 'legal', assigneeName: 'Omar Al-Zahrani', isCompleted: false },
    ],
    actualPerformance: [],
    sources: [],
  };

  store.opportunities.unshift(newOpp);
  saveStore(store);

  logAudit(actor, 'CREATE_OPPORTUNITY', 'Opportunity', id, `Created new opportunity "${newOpp.name}" in category ${newOpp.category}`);
  return newOpp;
}

export function updateOpportunity(
  id: string,
  updates: Partial<Opportunity>,
  actor: User
): Opportunity {
  const store = loadStore();
  const index = store.opportunities.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new Error(`Opportunity ${id} not found.`);
  }

  const existing = store.opportunities[index];
  const updated: Opportunity = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  store.opportunities[index] = updated;
  saveStore(store);

  logAudit(actor, 'UPDATE_OPPORTUNITY', 'Opportunity', id, `Updated opportunity "${updated.name}"`);
  return updated;
}

export function cloneOpportunity(
  id: string,
  newTitle: string,
  actor: User
): Opportunity {
  const original = getOpportunityById(id);
  if (!original) {
    throw new Error(`Opportunity ${id} not found.`);
  }

  const cloned = createOpportunity(
    {
      ...original,
      name: newTitle,
      description: `Cloned from ${original.id} (${original.name}) to evaluate alternative market or pricing scenario.`,
      status: 'discovery',
    },
    actor
  );

  logAudit(actor, 'CLONE_OPPORTUNITY', 'Opportunity', cloned.id, `Cloned from ${original.id} as "${cloned.name}"`);
  return cloned;
}

export function deleteOpportunity(id: string, actor: User): boolean {
  const store = loadStore();
  const index = store.opportunities.findIndex((o) => o.id === id);
  if (index === -1) return false;

  // Soft delete / archive to maintain audit integrity
  store.opportunities[index].isArchived = true;
  saveStore(store);

  logAudit(actor, 'ARCHIVE_OPPORTUNITY', 'Opportunity', id, `Archived opportunity ${id}`);
  return true;
}

// -------------------------------------------------------------
// STEP WORKFLOW METHODS
// -------------------------------------------------------------

export function updateMarketAssessment(
  id: string,
  assessment: Partial<MarketAssessment>,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  opp.marketAssessment = {
    ...opp.marketAssessment,
    ...assessment,
  };

  return updateOpportunity(id, { marketAssessment: opp.marketAssessment }, actor);
}

export function addCompetitor(
  id: string,
  competitor: Omit<Competitor, 'id' | 'opportunityId'>,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const newComp: Competitor = {
    id: `comp-${Date.now()}`,
    opportunityId: id,
    ...competitor,
  };

  opp.competitors.push(newComp);
  return updateOpportunity(id, { competitors: opp.competitors }, actor);
}

export function removeCompetitor(id: string, compId: string, actor: User): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  opp.competitors = opp.competitors.filter((c) => c.id !== compId);
  return updateOpportunity(id, { competitors: opp.competitors }, actor);
}

export function updateTechnicalFeasibility(
  id: string,
  tech: Partial<TechnicalFeasibility>,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  opp.technicalFeasibility = {
    ...opp.technicalFeasibility,
    ...tech,
  };

  return updateOpportunity(id, { technicalFeasibility: opp.technicalFeasibility }, actor);
}

export function saveFinancialAssumptions(
  id: string,
  assumptions: FinancialAssumptions,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const outputs = calculateFinancialModel(assumptions, 'Base Case');
  opp.financialAssumptions = assumptions;
  opp.financialOutputs = outputs;

  return updateOpportunity(
    id,
    {
      financialAssumptions: assumptions,
      financialOutputs: outputs,
    },
    actor
  );
}

export function updateMandatoryGate(
  id: string,
  gateId: string,
  status: GateStatus,
  evidence: string,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const gateIndex = opp.mandatoryGates.findIndex((g) => g.id === gateId);
  if (gateIndex !== -1) {
    opp.mandatoryGates[gateIndex].status = status;
    opp.mandatoryGates[gateIndex].evidence = evidence;
  }

  return updateOpportunity(id, { mandatoryGates: opp.mandatoryGates }, actor);
}

export function addRisk(
  id: string,
  risk: Omit<RiskItem, 'id' | 'opportunityId' | 'riskCode'>,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const newRisk: RiskItem = {
    id: `rsk-${Date.now()}`,
    opportunityId: id,
    riskCode: `RSK-${String(opp.risks.length + 1).padStart(2, '0')}`,
    ...risk,
  };

  opp.risks.push(newRisk);
  return updateOpportunity(id, { risks: opp.risks }, actor);
}

export function runOpportunityDecisionEngine(id: string, actor: User): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const fin = opp.financialOutputs || calculateFinancialModel(opp.financialAssumptions);

  const result = evaluateDecision({
    opportunityId: opp.id,
    opportunityName: opp.name,
    scores: opp.categoryScores,
    gates: opp.mandatoryGates,
    financialMetrics: {
      isContributionPositive: fin.breakEven.isContributionPositive,
      monthlyContributionPerCustomer: fin.breakEven.monthlyContributionPerCustomer,
      operatingBreakEvenCustomers: fin.breakEven.operatingBreakEvenCustomers,
      investmentPaybackMonth: fin.breakEven.investmentPaybackMonth,
      totalInitialCashRequirement: fin.breakEven.totalInitialCashRequirement,
    },
    validationEvidence: {
      interviewCount: opp.marketAssessment.interviewCount,
      qualifiedLeadsCount: opp.marketAssessment.qualifiedLeadsCount,
      loiCount: opp.marketAssessment.loiCount,
      paidPilotCommitments: opp.marketAssessment.paidPilotCommitments,
    },
    buildVsBuy: opp.technicalFeasibility.buildVsBuy,
    budgetCapSAR: 25000,
  });

  return updateOpportunity(
    id,
    {
      weightedScore: result.overallScore,
      recommendation: result.recommendation,
    },
    actor
  );
}

export function submitDecisionApproval(
  id: string,
  decisionType: Opportunity['recommendation'],
  rationale: string,
  requestedBudgetSAR: number,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const approval: ApprovalRecord = {
    id: `appr-${Date.now()}`,
    opportunityId: id,
    decisionType,
    status: 'pending',
    submittedBy: actor.name,
    submittedAt: new Date().toISOString(),
    approvedBudgetSAR: requestedBudgetSAR,
    rationale,
  };

  opp.approvals.unshift(approval);
  opp.status = 'decision_pending';

  return updateOpportunity(id, { approvals: opp.approvals, status: 'decision_pending' }, actor);
}

export function recordApprovalDecision(
  id: string,
  approvalId: string,
  decision: 'approved' | 'rejected',
  conditions: string,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const appr = opp.approvals.find((a) => a.id === approvalId);
  if (!appr) throw new Error(`Approval ${approvalId} not found.`);

  appr.status = decision;
  appr.reviewedBy = actor.name;
  appr.reviewedAt = new Date().toISOString();
  appr.conditions = conditions;

  if (decision === 'approved') {
    if (appr.decisionType === 'EXECUTE') opp.status = 'approved_for_launch';
    else if (appr.decisionType === 'PILOT') opp.status = 'pilot_approved';
    else if (appr.decisionType === 'HOLD') opp.status = 'on_hold';
    else if (appr.decisionType === 'DROP') opp.status = 'rejected';
    opp.approvedBudgetSAR = appr.approvedBudgetSAR || 0;
  } else {
    opp.status = 'rejected';
  }

  logAudit(actor, 'RECORD_APPROVAL', 'Approval', approvalId, `${decision.toUpperCase()} decision ${appr.decisionType} for opportunity ${opp.name}`);
  return updateOpportunity(id, { approvals: opp.approvals, status: opp.status, approvedBudgetSAR: opp.approvedBudgetSAR }, actor);
}

export function addMonthlyPerformance(
  id: string,
  record: Omit<MonthlyPerformanceRecord, 'id' | 'opportunityId'>,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const newRecord: MonthlyPerformanceRecord = {
    id: `perf-${Date.now()}`,
    opportunityId: id,
    ...record,
  };

  opp.actualPerformance.push(newRecord);
  return updateOpportunity(id, { actualPerformance: opp.actualPerformance }, actor);
}

export function toggleLaunchTask(
  id: string,
  taskId: string,
  isCompleted: boolean,
  actor: User
): Opportunity {
  const opp = getOpportunityById(id);
  if (!opp) throw new Error(`Opportunity ${id} not found.`);

  const task = opp.launchChecklist.find((t) => t.id === taskId);
  if (task) {
    task.isCompleted = isCompleted;
    task.completedAt = isCompleted ? new Date().toISOString() : undefined;
  }

  return updateOpportunity(id, { launchChecklist: opp.launchChecklist }, actor);
}

export function getAuditLogs(): AuditLog[] {
  const store = loadStore();
  return store.auditLogs;
}

export function getSystemSettings(): SystemSettings {
  const store = loadStore();
  return store.settings;
}

export function updateSystemSettings(settings: Partial<SystemSettings>, actor: User): SystemSettings {
  const store = loadStore();
  store.settings = { ...store.settings, ...settings };
  saveStore(store);

  logAudit(actor, 'UPDATE_SETTINGS', 'Settings', 'global', 'Updated system settings');
  return store.settings;
}

export function resetToDemoData(actor: User): void {
  const store = loadStore();
  store.opportunities = getSampleOpportunities();
  store.users = [...INITIAL_USERS];
  store.settings.demoModeActive = true;
  saveStore(store);

  logAudit(actor, 'RESET_DEMO_DATA', 'System', 'all', 'Reset database to standard B-IT demo portfolio');
}

export function resetToZeroData(actor: User): void {
  const store = loadStore();
  store.opportunities = [];
  store.settings.demoModeActive = false;
  saveStore(store);

  logAudit(actor, 'RESET_ZERO_DATA', 'System', 'all', 'Cleared all opportunities to start with an honest zero-data state');
}

// -------------------------------------------------------------
// USER MANAGEMENT METHODS
// -------------------------------------------------------------

export function getAllUsers(): User[] {
  const store = loadStore();
  if (!store.users || store.users.length === 0) {
    store.users = [...INITIAL_USERS];
    saveStore(store);
  }
  return store.users;
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByUsername(username: string): User | null {
  const users = getAllUsers();
  const normalized = username.trim().toLowerCase();
  return (
    users.find(
      (u) =>
        u.username?.toLowerCase() === normalized ||
        u.email.toLowerCase() === normalized
    ) || null
  );
}

export function createUser(
  input: {
    username: string;
    name: string;
    role: User['role'];
    roleTitle?: string;
    department?: string;
    password?: string;
    email?: string;
  },
  actor: User
): User {
  const store = loadStore();
  const normalizedUsername = input.username.trim().toLowerCase();

  // Validate duplicate username
  const existing = store.users.find(
    (u) =>
      u.username?.toLowerCase() === normalizedUsername ||
      u.email.toLowerCase() === normalizedUsername
  );
  if (existing) {
    throw new Error(`User with username/email "${input.username}" already exists.`);
  }

  // Generate initials from name
  const initials =
    input.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'U';

  const defaultRoleTitle: Record<string, string> = {
    admin: 'Super Admin',
    management: 'Management Approver',
    product_owner: 'Lead Product Manager',
    market_analyst: 'Market & Competitive Intelligence Analyst',
    technical_reviewer: 'Solutions Architect & Tech Lead',
    finance_reviewer: 'Senior Financial Analyst',
  };

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: input.name.trim(),
    email: input.email?.trim() || input.username.trim(),
    username: input.username.trim(),
    password: input.password || 'Bit@123456@',
    role: input.role,
    roleTitle: input.roleTitle?.trim() || defaultRoleTitle[input.role] || 'Team Member',
    department: input.department?.trim() || 'Product & Technology',
    avatarInitials: initials,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore(store);

  logAudit(
    actor,
    'CREATE_USER',
    'User',
    newUser.id,
    `Created new user "${newUser.name}" (${newUser.username}) with role [${newUser.role}]`
  );

  return newUser;
}

export function updateUser(
  id: string,
  updates: Partial<User>,
  actor: User
): User {
  const store = loadStore();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`User with ID "${id}" not found.`);
  }

  store.users[index] = {
    ...store.users[index],
    ...updates,
  };
  saveStore(store);

  logAudit(
    actor,
    'UPDATE_USER',
    'User',
    id,
    `Updated user profile for "${store.users[index].name}"`
  );

  return store.users[index];
}

export function deleteUser(id: string, actor: User): boolean {
  const store = loadStore();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  const user = store.users[index];
  if (user.role === 'admin') {
    const adminCount = store.users.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      throw new Error('Cannot delete the last remaining Super Admin.');
    }
  }

  store.users.splice(index, 1);
  saveStore(store);

  logAudit(
    actor,
    'DELETE_USER',
    'User',
    id,
    `Deleted user "${user.name}" (${user.username || user.email})`
  );

  return true;
}
