/**
 * B-IT Technology — Seed Data
 * Real Strategic Product Portfolio for the Saudi Arabian Market:
 * 1. LawOS 360 — LegalTech SaaS & Autonomous Lawyer AI Copilot (10-firm 1-year pilot)
 * 2. BITEX — Autonomous Saudi ERP Suite with ZATCA Phase 2 & Self-Operating Agent
 */

import { Opportunity, User, SystemSettings } from './types';
import { calculateFinancialModel } from '../financial-engine';
import { createDefaultMandatoryGates, DEFAULT_WEIGHTS } from '../decision-engine';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-maruf',
    name: 'Mezanur Maruf (CTO)',
    email: 'maruf@b-it.co',
    username: 'maruf@b-it.co',
    password: 'Bit@123456@',
    role: 'admin',
    roleTitle: 'Super Admin (CTO)',
    department: 'Executive Management & Technology',
    avatarInitials: 'MM',
    createdAt: '2026-10-18T00:00:00Z',
  },
  {
    id: 'usr-coo',
    name: 'Faisal Mohammed (COO)',
    email: 'coo@b--it.co',
    username: 'coo@b--it.co',
    password: 'Bit@123456@',
    role: 'admin',
    roleTitle: 'Super Admin (COO)',
    department: 'Executive Management & Operations',
    avatarInitials: 'FM',
    createdAt: '2026-10-18T00:00:00Z',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  currency: 'SAR',
  defaultWeights: DEFAULT_WEIGHTS,
  maxValidationBudgetWithoutApprovalSAR: 25000,
  requireSaudiPDPLSignOff: true,
  demoModeActive: false,
};

export function getSampleOpportunities(): Opportunity[] {
  // =========================================================================
  // REAL PRODUCT 1: LawOS 360 (LegalTech SaaS + Lawyer AI Copilot)
  // =========================================================================
  const lawosFinAssumptions = {
    monthlyPricePerCustomer: 1490,
    setupFeePerCustomer: 750,
    annualDiscountPercent: 15,
    annualBillingSharePercent: 35,
    variableHostingPerCustomer: 70,
    variableSupportPerCustomer: 40,
    paymentProcessingPercent: 2.2,
    paymentProcessingFixed: 1.0,
    fixedHostingAndTools: 1800,
    fixedMarketingAndSales: 2500,
    fixedMaintenanceAndLabor: 2000,
    fixedGeneralAndAdmin: 500,
    initialResearchAndDesignCash: 4500,
    initialDevelopmentCash: 12000,
    initialMarketingLaunchCash: 3500,
    initialContingencyCash: 2000,
    internalLaborEconomicCost: 18000,
    startingPayingCustomers: 0,
    monthlyNewCustomers: 5,
    monthlyCustomerGrowthRatePercent: 5,
    monthlyChurnPercent: 2.0,
    horizonMonths: 24,
  };
  const lawosFinOutputs = calculateFinancialModel(lawosFinAssumptions, 'Base Case');

  const lawosGates = createDefaultMandatoryGates().map((g) => {
    if (g.id === 'gate-1') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: '10 licensed Saudi law firms signed under 1-year pilot agreements with active case workflow commitments.',
        evaluatedAt: '2026-10-15T10:00:00Z',
        evaluatedBy: 'Sarah Al-Otaibi',
      };
    }
    if (g.id === 'gate-2') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Unit contribution margin is 90.7% (SAR 1,351/mo per firm) against SAR 1,490 subscription price.',
        evaluatedAt: '2026-10-15T11:00:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-3') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Operational break-even achieved at 5 paying law firms; full investment recovered within 10 months.',
        evaluatedAt: '2026-10-15T11:30:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-4') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Full data residency in Riyadh AWS me-central-1 cluster. PDPL attorney-client privilege encryption protocol verified.',
        evaluatedAt: '2026-10-16T09:00:00Z',
        evaluatedBy: 'Fahad Al-Harbi',
      };
    }
    if (g.id === 'gate-5') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Validation pilot budget of SAR 22,000 strictly complies with B-IT threshold (SAR 25,000).',
        evaluatedAt: '2026-10-16T10:00:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-6') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: '45 person-days effort with 40% code reuse from B-IT core auth, multi-tenant DB, and task workflows.',
        evaluatedAt: '2026-10-16T14:00:00Z',
        evaluatedBy: 'Fahad Al-Harbi',
      };
    }
    return {
      ...g,
      status: 'conditional_pass' as const,
      evidence: 'Under continuous governance review during 1-year pilot.',
    };
  });

  const lawos360: Opportunity = {
    id: 'BIT-OP-LAWOS360',
    code: 'BIT-2610-LAWOS360',
    name: 'LawOS 360',
    description: 'Bilingual legal practice management SaaS with an autonomous Saudi Lawyer AI Copilot, assisting law firms with task workflows, Najiz court integrations, and case research.',
    category: 'saas',
    businessProblem: 'Saudi law firms struggle with fragmented case tracking across WhatsApp and paper files, delayed Najiz court hearing tracking, and hours wasted researching thousands of Saudi Royal Decrees and Commercial Court precedents with non-Arabic or foreign tools.',
    proposedSolution: 'Unified cloud practice suite (tasks, CRM, hearings, billable hours) combined with a specialized Saudi Lawyer AI trained on official Saudi laws and precedents. Dual delivery: SaaS for boutique firms + dedicated on-premise installation for tier-1 firms.',
    targetCustomerSegment: 'Saudi law firms (3-25 attorneys) and independent legal practitioners across Riyadh, Jeddah, and Eastern Province',
    primaryGeography: 'Saudi Arabia',
    industry: 'LegalTech & Professional Services',
    businessModel: 'Recurring Subscription + Enterprise Custom Deployment',
    pricingModel: 'SAR 1,490 / month / firm (SaaS) or SAR 45,000 - 90,000 for custom on-premise',
    ownerName: 'Mezanur Maruf (CTO)',
    ownerId: 'usr-maruf',
    technicalOwnerName: 'Mezanur Maruf (CTO)',
    financeReviewerName: 'Faisal Mohammed (COO)',
    discoveryDate: '2026-09-10',
    targetDecisionDate: '2026-11-15',
    proposedValidationBudgetSAR: 22000,
    approvedBudgetSAR: 22000,
    status: 'pilot_approved',
    weightedScore: 88.5,
    recommendation: 'PILOT',
    isArchived: false,
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',

    marketAssessment: {
      opportunityId: 'BIT-OP-LAWOS360',
      tamSAR: 81000000,
      samSAR: 32400000,
      somSAR: 2160000,
      sizingMethodology: 'bottom_up',
      targetBusinessCount: 4500,
      reachableSharePercent: 6.7,
      annualRevenuePerCustomerSAR: 17880,
      customerProblem: 'Attorneys lose 12+ hours weekly manually tracking Najiz hearing calendars, cross-referencing Royal Decrees, and assembling case files with zero centralized client CRM.',
      targetCustomerProfile: 'Managing Partners and Senior Advocates at licensed Saudi law firms with 3 to 25 legal staff',
      currentAlternatives: 'LexisNexis Middle East (research only, no CRM), Jurispect, CaseFox/Clio (US-based, no Arabic NLP), and manual Excel/WhatsApp',
      urgencyLevel: 'high',
      salesCycleDays: 35,
      interviewCount: 16,
      qualifiedLeadsCount: 22,
      loiCount: 10,
      paidPilotCommitments: 0,
      adoptionBarriers: 'Data confidentiality concerns regarding case details and lawyer-client privilege under Saudi PDPL regulations.',
      confidenceLevel: 'high',
    },

    competitors: [
      {
        id: 'comp-law-1',
        opportunityId: 'BIT-OP-LAWOS360',
        name: 'Jurispect MENA',
        website: 'https://jurispect.com',
        productName: 'Jurispect Practice',
        country: 'UAE / Saudi Rep',
        observedPriceSAR: 1800,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Established regional brand, comprehensive billing module',
        mainWeaknesses: 'Generic AI assistant lacking Saudi Commercial Court precedent indexing; high renewal fee',
        differentiationOpportunity: 'Saudi Lawyer AI trained on MOJ/Najiz judicial codes, local Riyadh cloud hosting, and integrated task-to-court timeline',
        confidence: 'verified',
      },
      {
        id: 'comp-law-2',
        opportunityId: 'BIT-OP-LAWOS360',
        name: 'LexisNexis Middle East',
        website: 'https://lexisnexis.com/middle-east',
        productName: 'Lexis Middle East Law',
        country: 'Global / Regional',
        observedPriceSAR: 3200,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Massive legal research archive, statutory translation',
        mainWeaknesses: 'Extremely high subscription cost; zero law firm practice management, task tracking, or client CRM',
        differentiationOpportunity: 'All-in-one suite combining day-to-day law firm operations with intelligent case preparation at less than half the cost',
        confidence: 'verified',
      },
      {
        id: 'comp-law-3',
        opportunityId: 'BIT-OP-LAWOS360',
        name: 'Clio / CaseFox',
        website: 'https://clio.com',
        productName: 'Clio Manage',
        country: 'United States',
        observedPriceSAR: 850,
        pricingInterval: 'monthly',
        hasArabicSupport: false,
        mainStrengths: 'Mature practice management, great billing and calendar UI',
        mainWeaknesses: 'Zero Arabic interface, no RTL, no Saudi court / Najiz integration, non-compliant with Saudi PDPL data residency',
        differentiationOpportunity: 'Native Arabic RTL design, Najiz hearing synchronization, and 100% in-kingdom sovereign data storage',
        confidence: 'verified',
      },
    ],

    technicalFeasibility: {
      opportunityId: 'BIT-OP-LAWOS360',
      architectureSummary: 'Next.js App Router bilingual interface, PostgreSQL with pgvector for legal precedent embeddings, and a Python FastAPI microservice for RAG document retrieval. Deployed on AWS Riyadh (me-central-1) with end-to-end client encryption.',
      proposedTechStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL (pgvector)', 'FastAPI (Python)', 'OpenAI / Claude with Saudi Legal RAG', 'AWS me-central-1'],
      buildVsBuy: 'build',
      reusableInternalComponents: 'B-IT multi-tenant authentication, RBAC authorization, billing portal, and task-workflow engine (approx. 40% component reuse).',
      thirdPartyDependencies: 'Saudi Legal Gazette open portal API, Najiz notification hooks, and SMS/WhatsApp business gateway for client reminders.',
      securityRequirements: 'Strict AES-256 field-level encryption for attorney-client documents; tenant data isolation; zero third-party training on lawyer case data.',
      saudiHostingCompliant: true,
      effortDiscoveryDays: 8,
      effortDesignDays: 7,
      effortFrontendDays: 14,
      effortBackendDays: 12,
      effortQaDays: 4,
      blendedDailyRateSAR: 600,
      deliveryRiskSummary: 'Fine-tuning the Lawyer AI to ensure zero hallucinations when citing Saudi statutory articles and Royal Decrees.',
      technicalOwnerName: 'Fahad Al-Harbi',
    },

    financialAssumptions: lawosFinAssumptions,
    financialOutputs: lawosFinOutputs,

    risks: [
      {
        id: 'rsk-l01',
        opportunityId: 'BIT-OP-LAWOS360',
        riskCode: 'RSK-L01',
        category: 'privacy',
        description: 'Saudi PDPL compliance regarding confidential lawyer-client case details and litigation evidence.',
        likelihood: 'medium',
        impact: 'critical',
        severity: 'high',
        ownerName: 'Fahad Al-Harbi',
        mitigation: 'Implement sovereign Riyadh-based cloud hosting, tenant-isolated vector indexes, and explicit zero-data-retention AI inference contracts.',
        status: 'mitigating',
      },
      {
        id: 'rsk-l02',
        opportunityId: 'BIT-OP-LAWOS360',
        riskCode: 'RSK-L02',
        category: 'technical',
        description: 'AI hallucination risk when suggesting legal defense citations or procedural deadlines.',
        likelihood: 'medium',
        impact: 'high',
        severity: 'high',
        ownerName: 'Mezanur Rahman',
        mitigation: 'Enforce strict RAG grounding where the AI must highlight and quote the exact Saudi statute or court decree with clickable verification links.',
        status: 'mitigating',
      },
      {
        id: 'rsk-l03',
        opportunityId: 'BIT-OP-LAWOS360',
        riskCode: 'RSK-L03',
        category: 'commercial',
        description: 'Reluctance of senior partners to transition from legacy paper or WhatsApp workflows during the 1-year pilot.',
        likelihood: 'medium',
        impact: 'medium',
        severity: 'medium',
        ownerName: 'Sarah Al-Otaibi',
        mitigation: 'Dedicated B-IT customer success specialist conducting bi-weekly hands-on training and monitoring daily active engagement.',
        status: 'open',
      },
    ],

    mandatoryGates: lawosGates,

    categoryScores: {
      marketAttractiveness: 88,
      customerValidation: 85,
      competitiveDifferentiation: 90,
      financialViability: 88,
      technicalFeasibility: 85,
      strategicFitAndReusability: 92,
      operationalReadiness: 82,
    },

    approvals: [
      {
        id: 'appr-l01',
        opportunityId: 'BIT-OP-LAWOS360',
        decisionType: 'PILOT',
        status: 'approved',
        submittedBy: 'Mezanur Maruf (CTO)',
        submittedAt: '2026-10-16T11:00:00Z',
        reviewedBy: 'Faisal Mohammed (COO)',
        reviewedAt: '2026-10-17T09:30:00Z',
        approvedBudgetSAR: 22000,
        conditions: 'Ensure all 10 pilot law firms sign the formal pilot telemetry agreement and verify AWS Riyadh cloud data residency prior to onboarding.',
        rationale: 'Strong legal market demand in KSA; 10 signed pilot firms provide a solid foundation to build market credibility and capture telemetry for the Lawyer AI copilot.',
      },
    ],

    pilotPlan: {
      opportunityId: 'BIT-OP-LAWOS360',
      objective: 'Deploy LawOS 360 across 10 licensed Saudi law firms for 12 months (free access) to validate daily active adoption, capture prompt and case telemetry, test Lawyer AI citation accuracy, and build high-credibility local case studies.',
      targetCustomers: 10,
      durationDays: 365,
      budgetSAR: 22000,
      successCriteria: '≥8 of 10 law firms active weekly after 6 months; ≥40% reduction in initial case research time; ≥6 firms signing binding annual paid subscription commitments at pilot conclusion.',
      failureCriteria: 'Fewer than 4 law firms actively using the platform after 90 days or critical legal citation inaccuracies reported by pilot attorneys.',
      status: 'in_progress',
    },

    launchChecklist: [
      { id: 'chk-l1', opportunityId: 'BIT-OP-LAWOS360', taskName: 'Deploy AWS Riyadh me-central-1 isolated database cluster', category: 'security', assigneeName: 'Fahad Al-Harbi', isCompleted: true, completedAt: '2026-10-14' },
      { id: 'chk-l2', opportunityId: 'BIT-OP-LAWOS360', taskName: 'Ingest and index 12,000+ official Saudi Royal Decrees & Commercial Court precedents', category: 'product', assigneeName: 'Mezanur Rahman', isCompleted: true, completedAt: '2026-10-16' },
      { id: 'chk-l3', opportunityId: 'BIT-OP-LAWOS360', taskName: 'Draft and execute 10 Law Firm 1-Year Pilot Participation Agreements', category: 'legal', assigneeName: 'Sarah Al-Otaibi', isCompleted: true, completedAt: '2026-10-17' },
      { id: 'chk-l4', opportunityId: 'BIT-OP-LAWOS360', taskName: 'Complete bilingual Lawyer AI prompt evaluation and ground truth citation testing', category: 'qa', assigneeName: 'Fahad Al-Harbi', isCompleted: false },
      { id: 'chk-l5', opportunityId: 'BIT-OP-LAWOS360', taskName: 'Setup telemetry dashboard to monitor daily active attorney sessions and query satisfaction', category: 'product', assigneeName: 'Mezanur Rahman', isCompleted: false },
    ],

    actualPerformance: [],

    sources: [
      {
        id: 'src-l01',
        opportunityId: 'BIT-OP-LAWOS360',
        url: 'https://sba.gov.sa/statistics',
        publisher: 'Saudi Bar Association (SBA)',
        pageTitle: 'Licensed Legal Practitioners & Law Firms Census 2025',
        sourceType: 'government_data',
        relevantClaim: 'Over 4,500 licensed law practices operating across the Kingdom, with Riyadh accounting for 48% of total legal billings.',
        extractedValue: '4,500 licensed law practices',
        verificationStatus: 'verified',
        accessedAt: '2026-10-10',
        researcherName: 'Sarah Al-Otaibi',
      },
      {
        id: 'src-l02',
        opportunityId: 'BIT-OP-LAWOS360',
        url: 'https://laws.boe.gov.sa',
        publisher: 'Bureau of Experts at the Council of Ministers',
        pageTitle: 'Saudi Personal Data Protection Law (PDPL) Regulations',
        sourceType: 'government_data',
        relevantClaim: 'Legal data involving Saudi judicial entities and attorney communications must reside inside the Kingdom.',
        verificationStatus: 'verified',
        accessedAt: '2026-10-12',
        researcherName: 'Sarah Al-Otaibi',
      },
    ],
  };

  // =========================================================================
  // REAL PRODUCT 2: BITEX (Autonomous Saudi ERP Suite with ZATCA Phase 2)
  // =========================================================================
  const bitexFinAssumptions = {
    monthlyPricePerCustomer: 1950,
    setupFeePerCustomer: 1200,
    annualDiscountPercent: 20,
    annualBillingSharePercent: 40,
    variableHostingPerCustomer: 90,
    variableSupportPerCustomer: 50,
    paymentProcessingPercent: 2.0,
    paymentProcessingFixed: 1.0,
    fixedHostingAndTools: 2200,
    fixedMarketingAndSales: 3500,
    fixedMaintenanceAndLabor: 2500,
    fixedGeneralAndAdmin: 800,
    initialResearchAndDesignCash: 5000,
    initialDevelopmentCash: 14000,
    initialMarketingLaunchCash: 3500,
    initialContingencyCash: 2000,
    internalLaborEconomicCost: 22000,
    startingPayingCustomers: 0,
    monthlyNewCustomers: 4,
    monthlyCustomerGrowthRatePercent: 4,
    monthlyChurnPercent: 1.5,
    horizonMonths: 24,
  };
  const bitexFinOutputs = calculateFinancialModel(bitexFinAssumptions, 'Base Case');

  const bitexGates = createDefaultMandatoryGates().map((g) => {
    if (g.id === 'gate-1') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: '5 pilot enterprises (2 factories, 2 retail chains, 1 wholesale distributor) committed for validation testing.',
        evaluatedAt: '2026-10-16T15:00:00Z',
        evaluatedBy: 'Sarah Al-Otaibi',
      };
    }
    if (g.id === 'gate-2') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Unit contribution margin is 91.8% (SAR 1,791/mo per business) on a SAR 1,950 base subscription.',
        evaluatedAt: '2026-10-16T16:00:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-3') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Operational break-even achieved at 5 paying companies; full cash investment recovered within 11 months.',
        evaluatedAt: '2026-10-16T16:30:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-4') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Native ZATCA Phase 2 FATOORA XML UBL 2.1 generator and ECDSA secp256k1 cryptographic signing engine architected; cloud hosting in Riyadh.',
        evaluatedAt: '2026-10-17T11:00:00Z',
        evaluatedBy: 'Fahad Al-Harbi',
      };
    }
    if (g.id === 'gate-5') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: 'Validation budget of SAR 24,500 is within the SAR 25,000 internal executive threshold.',
        evaluatedAt: '2026-10-17T12:00:00Z',
        evaluatedBy: 'Omar Al-Zahrani',
      };
    }
    if (g.id === 'gate-6') {
      return {
        ...g,
        status: 'pass' as const,
        evidence: '65 person-days effort with 50% reuse from B-IT core accounting ledger, multi-currency ledger, and invoice queues.',
        evaluatedAt: '2026-10-17T14:00:00Z',
        evaluatedBy: 'Fahad Al-Harbi',
      };
    }
    return {
      ...g,
      status: 'conditional_pass' as const,
      evidence: 'Awaiting field clearance telemetry from the 5 pilot enterprises.',
    };
  });

  const bitex: Opportunity = {
    id: 'BIT-OP-BITEX',
    code: 'BIT-2610-BITEX',
    name: 'BITEX',
    description: 'Autonomous Saudi Enterprise ERP Suite with native ZATCA Phase 2 FATOORA compliance, HR module (GOSI, Qiwa, WPS), and a self-operating AI Agent that extracts invoices and books accounting entries with minimal human touch.',
    category: 'saas',
    businessProblem: 'Saudi mid-sized businesses (factories, retailers, wholesale) struggle with mandatory ZATCA Phase 2 e-invoicing compliance, complex labor laws (Qiwa, GOSI, WPS), and high labor costs spent on manual invoice data entry into disconnected ERPs.',
    proposedSolution: 'All-in-one Saudi ERP (Accounting, Invoicing, Inventory, Supply Chain, POS, HR) featuring direct ZATCA Phase 2 clearance and an Autonomous AI Agent Operator that scans supplier bills, matches purchase orders, and inputs balanced entries automatically. Available as SaaS and custom enterprise on-premise.',
    targetCustomerSegment: 'Saudi mid-sized commercial enterprises (Retail chains, Factories, Wholesale, Contracting) subject to ZATCA Phase 2 integration waves',
    primaryGeography: 'Saudi Arabia',
    industry: 'Enterprise Software & Industrial ERP',
    businessModel: 'Recurring Subscription + Custom Enterprise Deployment',
    pricingModel: 'SAR 1,950 / month / company (SaaS) or SAR 85,000 - 160,000 for factory custom setups',
    ownerName: 'Mezanur Maruf (CTO)',
    ownerId: 'usr-maruf',
    technicalOwnerName: 'Mezanur Maruf (CTO)',
    financeReviewerName: 'Faisal Mohammed (COO)',
    discoveryDate: '2026-09-18',
    targetDecisionDate: '2026-11-20',
    proposedValidationBudgetSAR: 24500,
    approvedBudgetSAR: 24500,
    status: 'pilot_approved',
    weightedScore: 91.0,
    recommendation: 'PILOT',
    isArchived: false,
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-10-18T10:30:00Z',

    marketAssessment: {
      opportunityId: 'BIT-OP-BITEX',
      tamSAR: 4320000000,
      samSAR: 840000000,
      somSAR: 6000000,
      sizingMethodology: 'hybrid',
      targetBusinessCount: 180000,
      reachableSharePercent: 0.71,
      annualRevenuePerCustomerSAR: 23400,
      customerProblem: 'Companies face severe ZATCA fines for non-compliant e-invoicing and waste 3-5 hours daily manually typing supplier invoices, receipts, and WPS payroll files.',
      targetCustomerProfile: 'Chief Financial Officers, General Managers, and Head Accountants at Saudi factories, retail networks, and commercial traders',
      currentAlternatives: 'Daftra, Wafeq, local Odoo implementation partners, and expensive legacy systems (SAP Business One, MS Dynamics)',
      urgencyLevel: 'critical',
      salesCycleDays: 45,
      interviewCount: 18,
      qualifiedLeadsCount: 26,
      loiCount: 5,
      paidPilotCommitments: 2,
      adoptionBarriers: 'Transition friction from existing accounting software and complexity of physical warehouse barcode hardware integration.',
      confidenceLevel: 'high',
    },

    competitors: [
      {
        id: 'comp-erp-1',
        opportunityId: 'BIT-OP-BITEX',
        name: 'Daftra',
        website: 'https://daftra.com',
        productName: 'Daftra Cloud ERP',
        country: 'Saudi Arabia / Regional',
        observedPriceSAR: 1200,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Widespread brand recognition, simple interface for micro-businesses',
        mainWeaknesses: 'Basic ZATCA handling; no autonomous data entry agent; weak manufacturing bill of materials (BOM)',
        differentiationOpportunity: 'Autonomous AI agent that automates document data entry; native factory manufacturing and supply chain modules',
        confidence: 'verified',
      },
      {
        id: 'comp-erp-2',
        opportunityId: 'BIT-OP-BITEX',
        name: 'Wafeq',
        website: 'https://wafeq.com',
        productName: 'Wafeq Accounting',
        country: 'UAE / Saudi Arabia',
        observedPriceSAR: 950,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Fast onboarding, clean e-invoicing UI',
        mainWeaknesses: 'Limited to basic bookkeeping; lacks HR module (Qiwa/GOSI/WPS) and industrial manufacturing ERP workflows',
        differentiationOpportunity: 'Complete unified suite with full Saudi HR automation and self-operating document processing agent',
        confidence: 'verified',
      },
      {
        id: 'comp-erp-3',
        opportunityId: 'BIT-OP-BITEX',
        name: 'Odoo Saudi Partners',
        website: 'https://odoo.com',
        productName: 'Odoo Enterprise Custom',
        country: 'Global / Local Resellers',
        observedPriceSAR: 2800,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Extensive modular ecosystem and global marketplace',
        mainWeaknesses: 'Very expensive custom implementation (SAR 40k-100k+); fragile custom ZATCA scripts prone to breaking on version updates',
        differentiationOpportunity: 'Out-of-the-box pre-certified ZATCA Phase 2 compliance with zero custom coding needed and autonomous data-entry agent included',
        confidence: 'verified',
      },
      {
        id: 'comp-erp-4',
        opportunityId: 'BIT-OP-BITEX',
        name: 'SAP Business One Saudi',
        website: 'https://sap.com',
        productName: 'SAP Business One',
        country: 'Germany / Saudi Partners',
        observedPriceSAR: 6500,
        pricingInterval: 'monthly',
        hasArabicSupport: true,
        mainStrengths: 'Enterprise prestige, deep audit trail, complex manufacturing control',
        mainWeaknesses: 'Prohibitive total cost of ownership; 6-12 month rollout; heavy manual operator overhead',
        differentiationOpportunity: '10x faster deployment, modern web interface, and autonomous AI data entry at a fraction of the cost',
        confidence: 'verified',
      },
    ],

    technicalFeasibility: {
      opportunityId: 'BIT-OP-BITEX',
      architectureSummary: 'High-throughput microservices architecture with a dedicated cryptographic signing daemon for ZATCA Phase 2 (ECDSA secp256k1 & XML UBL 2.1), multi-tenant PostgreSQL database, and an autonomous AI worker pipeline using document OCR & LLM reasoning to auto-book transactions.',
      proposedTechStack: ['Next.js 15', 'TypeScript', 'Node.js Cryptography Engine', 'PostgreSQL', 'Redis Queue', 'DocTR OCR & LLM Extraction', 'ZATCA FATOORA API', 'AWS Riyadh me-central-1'],
      buildVsBuy: 'build',
      reusableInternalComponents: 'B-IT double-entry general ledger, payment gateway, multi-tenant billing, and Arabic reporting engine (approx. 50% reuse).',
      thirdPartyDependencies: 'ZATCA FATOORA API endpoints, GOSI API, Qiwa labor portal integration, and Saudi bank SIF payroll format generators.',
      securityRequirements: 'Hardware security module (HSM) or encrypted keystore for ZATCA cryptographic private keys; strict multi-tenant separation; full financial audit log.',
      saudiHostingCompliant: true,
      effortDiscoveryDays: 10,
      effortDesignDays: 10,
      effortFrontendDays: 20,
      effortBackendDays: 18,
      effortQaDays: 7,
      blendedDailyRateSAR: 600,
      deliveryRiskSummary: 'Ensuring 100% real-time ZATCA Phase 2 clearance uptime and high OCR recognition rates for faint supplier receipts.',
      technicalOwnerName: 'Fahad Al-Harbi',
    },

    financialAssumptions: bitexFinAssumptions,
    financialOutputs: bitexFinOutputs,

    risks: [
      {
        id: 'rsk-b01',
        opportunityId: 'BIT-OP-BITEX',
        riskCode: 'RSK-B01',
        category: 'regulatory',
        description: 'ZATCA Phase 2 clearance latency or intermittent API downtime affecting client sales counter operations.',
        likelihood: 'medium',
        impact: 'critical',
        severity: 'high',
        ownerName: 'Fahad Al-Harbi',
        mitigation: 'Implement resilient offline queuing with automatic signed clearance synchronization within ZATCA 24-hour grace window.',
        status: 'mitigating',
      },
      {
        id: 'rsk-b02',
        opportunityId: 'BIT-OP-BITEX',
        riskCode: 'RSK-B02',
        category: 'technical',
        description: 'Autonomous AI agent making erroneous double-entry journal postings on unstandardized supplier invoices.',
        likelihood: 'medium',
        impact: 'high',
        severity: 'high',
        ownerName: 'Mezanur Rahman',
        mitigation: 'Set an automatic confidence threshold (95%): transactions above 95% confidence book automatically; lower confidence items go to an exception approval tray.',
        status: 'mitigating',
      },
      {
        id: 'rsk-b03',
        opportunityId: 'BIT-OP-BITEX',
        riskCode: 'RSK-B03',
        category: 'operational',
        description: 'Resistance from existing bookkeeping staff fearing AI automation during factory pilot.',
        likelihood: 'medium',
        impact: 'medium',
        severity: 'medium',
        ownerName: 'Sarah Al-Otaibi',
        mitigation: 'Position the AI agent as a digital assistant that eliminates data-entry drudgery so accountants focus on financial analysis.',
        status: 'open',
      },
    ],

    mandatoryGates: bitexGates,

    categoryScores: {
      marketAttractiveness: 92,
      customerValidation: 90,
      competitiveDifferentiation: 93,
      financialViability: 91,
      technicalFeasibility: 84,
      strategicFitAndReusability: 95,
      operationalReadiness: 80,
    },

    approvals: [
      {
        id: 'appr-b01',
        opportunityId: 'BIT-OP-BITEX',
        decisionType: 'PILOT',
        status: 'approved',
        submittedBy: 'Mezanur Maruf (CTO)',
        submittedAt: '2026-10-17T10:00:00Z',
        reviewedBy: 'Faisal Mohammed (COO)',
        reviewedAt: '2026-10-17T16:00:00Z',
        approvedBudgetSAR: 24500,
        conditions: 'Validate ZATCA Phase 2 FATOORA cryptographic sandbox compliance with zero rejection errors before retail go-live.',
        rationale: 'Huge market demand across Saudi commercial enterprises facing mandatory ZATCA Phase 2 integration waves; self-operating AI agent is a decisive differentiator.',
      },
    ],

    pilotPlan: {
      opportunityId: 'BIT-OP-BITEX',
      objective: 'Deploy BITEX to 5 mid-sized Saudi commercial establishments (2 manufacturing factories, 2 retail chains, 1 wholesale distributor) to validate automated ZATCA Phase 2 clearance, verify autonomous AI invoice ingestion accuracy, and prove WPS wage payroll reconciliation.',
      targetCustomers: 5,
      durationDays: 180,
      budgetSAR: 24500,
      successCriteria: '100% ZATCA FATOORA clearance without rejections; ≥85% autonomous data entry accuracy without human intervention; 5 out of 5 converting to commercial contracts.',
      failureCriteria: 'ZATCA compliance rejection rate exceeding 1% or persistent failures in factory supply chain inventory tracking.',
      status: 'in_progress',
    },

    launchChecklist: [
      { id: 'chk-b1', opportunityId: 'BIT-OP-BITEX', taskName: 'ZATCA Phase 2 cryptographic signing SDK & sandbox certification', category: 'security', assigneeName: 'Fahad Al-Harbi', isCompleted: true, completedAt: '2026-10-15' },
      { id: 'chk-b2', opportunityId: 'BIT-OP-BITEX', taskName: 'Setup Autonomous AI Agent document ingestion OCR pipeline', category: 'product', assigneeName: 'Mezanur Rahman', isCompleted: true, completedAt: '2026-10-16' },
      { id: 'chk-b3', opportunityId: 'BIT-OP-BITEX', taskName: 'Saudi HR Module integration (Qiwa, GOSI, WPS SIF payroll file format)', category: 'product', assigneeName: 'Mezanur Rahman', isCompleted: true, completedAt: '2026-10-17' },
      { id: 'chk-b4', opportunityId: 'BIT-OP-BITEX', taskName: 'Hardware barcode and receipt printer field testing with 2 pilot factories', category: 'qa', assigneeName: 'Fahad Al-Harbi', isCompleted: false },
      { id: 'chk-b5', opportunityId: 'BIT-OP-BITEX', taskName: 'Establish 24/7 priority emergency support desk for ZATCA clearance alerts', category: 'billing', assigneeName: 'Sarah Al-Otaibi', isCompleted: false },
    ],

    actualPerformance: [],

    sources: [
      {
        id: 'src-b01',
        opportunityId: 'BIT-OP-BITEX',
        url: 'https://zatca.gov.sa/fatoora',
        publisher: 'Zakat, Tax and Customs Authority (ZATCA)',
        pageTitle: 'E-Invoicing Phase 2 (Integration Phase) Waves and Technical Specifications',
        sourceType: 'government_data',
        relevantClaim: 'All taxable commercial establishments with revenues over SAR 10M must integrate with FATOORA portal.',
        extractedValue: 'ZATCA Phase 2 Mandate',
        verificationStatus: 'verified',
        accessedAt: '2026-10-12',
        researcherName: 'Sarah Al-Otaibi',
      },
      {
        id: 'src-b02',
        opportunityId: 'BIT-OP-BITEX',
        url: 'https://monshaat.gov.sa',
        publisher: 'Monshaat (Small & Medium Enterprises General Authority)',
        pageTitle: 'Quarterly SME Report — Wholesale, Retail & Light Industry',
        sourceType: 'government_data',
        relevantClaim: 'Over 180,000 mid-sized establishments operate in Saudi Arabia, actively seeking automated accounting solutions.',
        extractedValue: '180,000 mid-sized enterprises',
        verificationStatus: 'verified',
        accessedAt: '2026-10-14',
        researcherName: 'Sarah Al-Otaibi',
      },
    ],
  };

  return [lawos360, bitex];
}
