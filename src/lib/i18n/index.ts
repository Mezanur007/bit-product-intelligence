/**
 * B-IT Technology — Internationalization (i18n) & Arabic RTL Engine
 * Bilingual English / Arabic with complete terminology translations.
 */

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const DICTIONARY: TranslationDictionary = {
  // Brand
  brandName: { en: 'BI TECHNOLOGY', ar: 'بي آي للتكنولوجيا' },
  productIntelligence: { en: 'Business Intelligence', ar: 'ذكاء الأعمال' },
  executivePortfolio: { en: 'Executive Business Intelligence & Investment Governance', ar: 'منصة ذكاء الأعمال وحوكمة الاستثمار' },
  decisionMakingClearer: { en: 'Decision-making, made clearer.', ar: 'اتخاذ القرارات الاستثمارية، بوضوح وموثوقية.' },
  subtitle: {
    en: 'Evaluate Saudi recurring-revenue opportunities with verified evidence, deterministic financial modeling, and strict mandatory gates.',
    ar: 'تقييم فرص الإيرادات المتكررة في السوق السعودي بأدلة موثقة، ونمذجة مالية حتمية، وبوابات حوكمة إلزامية صارمة.',
  },

  // Navigation
  workspace: { en: 'WORKSPACE', ar: 'مساحة العمل' },
  navOverview: { en: 'Overview', ar: 'نظرة عامة' },
  navOpportunities: { en: 'Opportunities', ar: 'سجل الفرص' },
  navFinancialSimulator: { en: 'Financial Simulator', ar: 'المحاكي المالي' },
  navMarketIntelligence: { en: 'Market Intelligence', ar: 'استخبارات السوق' },
  navPortfolio: { en: 'Portfolio & Launches', ar: 'المحفظة والإطلاق' },
  navReports: { en: 'Executive Reports', ar: 'التقارير التنفيذية' },
  navTeam: { en: 'Team & Approvals', ar: 'الفريق والموافقات' },
  navSettings: { en: 'Settings', ar: 'الإعدادات' },

  // AI Card
  aiAgentTitle: { en: 'AI Research Agent', ar: 'وكيل أبحاث الذكاء الاصطناعي' },
  aiAgentDesc: {
    en: 'Evidence-first market research with mandatory human approval.',
    ar: 'أبحاث سوقية قائمة على الأدلة مع اشتراط الموافقة البشرية الإلزامية.',
  },
  phase2Ready: { en: 'PHASE 2 READY', ar: 'جاهز للمرحلة الثانية' },

  // Top Bar & Controls
  sampleDataActive: { en: 'Sample Data Active', ar: 'بيانات تجريبية نشطة' },
  zeroDataMode: { en: 'Zero Data Mode', ar: 'وضع البيانات الفارغة' },
  clearToZero: { en: 'Clear to Zero', ar: 'تصفير البيانات' },
  loadDemo: { en: 'Load Demo', ar: 'تحميل النماذج' },
  switchRole: { en: 'Switch Active User Role (RBAC)', ar: 'تبديل دور المستخدم النشط (صلاحيات RBAC)' },
  currencyLabel: { en: 'Currency: SAR', ar: 'العملة: ر.س (ريال سعودي)' },
  governanceLabel: { en: 'Governance: Mandatory Human Gate Approval', ar: 'الحوكمة: اشتراط موافقة بشرية إلزامية' },
  newOpportunity: { en: 'New Opportunity', ar: 'فرصة جديدة' },
  financialSandbox: { en: 'Financial Sandbox', ar: 'المختبر المالي' },

  // 10 Dashboard KPIs
  kpiTotalOpps: { en: 'Total Opportunities', ar: 'إجمالي الفرص' },
  kpiUnderEval: { en: 'Under Evaluation', ar: 'قيد التقييم' },
  kpiPilotApproved: { en: 'Pilot Approved', ar: 'تجارب معتمدة' },
  kpiActiveProducts: { en: 'Active Products', ar: 'منتجات نشطة تجارياً' },
  kpiAttentionNeeded: { en: 'Attention Needed', ar: 'تتطلب انتباه الإدارة' },
  kpiProposedBudget: { en: 'Proposed Budget', ar: 'الميزانية المقترحة' },
  kpiApprovedBudget: { en: 'Approved Budget', ar: 'الميزانية المعتمدة' },
  kpiActualSpend: { en: 'Actual Expenditure', ar: 'الإنفاق الفعلي' },
  kpiCurrentMRR: { en: 'Current Total MRR', ar: 'الإيراد الشهري المتكرر' },
  kpiGrossMargin: { en: 'Actual Gross Margin', ar: 'هامش الربح الإجمالي' },

  // Subtitles for KPIs
  kpiSubAllStages: { en: 'All pipeline stages', ar: 'كافة مراحل مسار العمل' },
  kpiSubActive6Step: { en: 'Active 6-step review', ar: 'قيد المراجعة بالخطوات الست' },
  kpiSubBoundedTrials: { en: 'Bounded client trials', ar: 'تجارب محدودة مع عملاء' },
  kpiSubCommercialized: { en: 'Commercialized in market', ar: 'مطروحة تجارياً في السوق' },
  kpiSubBlockers: { en: 'Blockers / Gate checks', ar: 'معوقات / فحوصات البوابات' },
  kpiSubRequestedByPOs: { en: 'Requested by POs', ar: 'مطلوبة من مديري المنتجات' },
  kpiSubAuthorizedByMgmt: { en: 'Authorized by Mgmt', ar: 'معتمدة رسمياً من الإدارة' },
  kpiSubRealizedCash: { en: 'Realized project cash', ar: 'سيولة نقدية مصروفة فعلياً' },
  kpiSubActiveBilling: { en: 'Active customer billing', ar: 'فواتير عملاء نشطة' },
  kpiSubDirectMargin: { en: 'Direct delivery margin', ar: 'هامش تسليم الخدمة المباشر' },

  // Dashboard Panels
  attentionPanelTitle: { en: 'Management Attention Panel', ar: 'لوحة تنبيهات الإدارة والمخاطر' },
  noBlockers: { en: 'No critical risks or blockers currently flagged.', ar: 'لا توجد مخاطر حرجة أو معوقات مرفوعة حالياً.' },
  timelineTitle: { en: 'Portfolio MRR & Expenditure Timeline', ar: 'مسار الإيرادات الشهرية المتكررة والإنفاق' },
  timelineSubtitle: { en: 'Actual performance vs approved forecasts (SAR)', ar: 'الأداء الفعلي مقارنة بالتوقعات المعتمدة (ر.س)' },
  budgetAllocTitle: { en: 'Proposed vs. Approved Budget Allocation', ar: 'توزيع الميزانيات المقترحة مقابل المعتمدة' },
  budgetAllocSubtitle: { en: 'Validation budget per opportunity (SAR)', ar: 'ميزانية التحقق لكل فرصة منتج (ر.س)' },
  lifecycleDistTitle: { en: 'Portfolio Lifecycle Distribution', ar: 'توزيع مراحل دورة حياة المحفظة' },
  lifecycleDistSubtitle: { en: 'Opportunities across governance gates', ar: 'الفرص عبر بوابات الحوكمة' },
  trackedOppsTitle: { en: 'Tracked Product Opportunities', ar: 'فرص المنتجات المسجلة والمتابعة' },
  trackedOppsSubtitle: {
    en: 'Explore evaluation readiness, unit economics, weighted score, and governance decisions.',
    ar: 'استكشف جاهزية التقييم، واقتصاديات الوحدة، والدرجة الموزونة، وقرارات الحوكمة.',
  },

  // Table Headers
  thOpportunity: { en: 'Opportunity', ar: 'الفرصة والرمز' },
  thCategory: { en: 'Category', ar: 'الفئة' },
  thWeightedScore: { en: 'Weighted Score', ar: 'الدرجة الموزونة' },
  thValidationBudget: { en: 'Validation Budget', ar: 'ميزانية التحقق' },
  thRecommendation: { en: 'Recommendation', ar: 'التوصية' },
  thStatus: { en: 'Lifecycle Status', ar: 'الحالة الإجرائية' },
  thActions: { en: 'Actions', ar: 'الإجراءات' },
  btnWorkspace: { en: 'Workspace', ar: 'مساحة العمل' },
  btnInspect: { en: 'Inspect', ar: 'فحص' },
  btnReviewRecord: { en: 'Review Record →', ar: 'مراجعة السجل ←' },
  btnViewFullRegister: { en: 'View Full Register →', ar: 'عرض السجل الكامل ←' },

  // Recommendation Badges
  recEXECUTE: { en: 'EXECUTE', ar: 'تنفيذ كامل' },
  recPILOT: { en: 'PILOT', ar: 'تجربة استطلاعية' },
  recCONTINUE_RESEARCH: { en: 'CONTINUE RESEARCH', ar: 'متابعة البحث' },
  recHOLD: { en: 'HOLD', ar: 'تعليق' },
  recPARTNER: { en: 'PARTNER', ar: 'شراكة تقنية' },
  recDROP: { en: 'DROP', ar: 'استبعاد' },

  // Lifecycle Statuses
  statusIdea: { en: 'Idea', ar: 'فكرة' },
  statusDiscovery: { en: 'Discovery', ar: 'استكشاف' },
  statusEvaluation: { en: 'Evaluation', ar: 'قيد التقييم' },
  statusDecisionPending: { en: 'Decision Pending', ar: 'بانتظار القرار' },
  statusPilotApproved: { en: 'Pilot Approved', ar: 'معتمد للتجربة' },
  statusPilotInProgress: { en: 'Pilot In Progress', ar: 'تجربة جارية' },
  statusApprovedForLaunch: { en: 'Approved for Launch', ar: 'معتمد للإطلاق' },
  statusActive: { en: 'Active', ar: 'نشط تجارياً' },
  statusOnHold: { en: 'On Hold', ar: 'معلق' },
  statusRejected: { en: 'Rejected / Dropped', ar: 'مستبعد' },
  statusDiscontinued: { en: 'Discontinued', ar: 'متوقف' },

  // Categories
  catSaaS: { en: 'SaaS', ar: 'برمجيات كخدمة (SaaS)' },
  catAIAgent: { en: 'AI Application / Agent', ar: 'تطبيق / وكيل ذكاء اصطناعي' },
  catCustomSoftware: { en: 'Custom Software', ar: 'برمجيات مخصصة' },
  catPartnership: { en: 'Partnership', ar: 'شراكة تقنية' },
  catWhiteLabel: { en: 'White Label', ar: 'منتج علامة بيضاء' },
  catSubscriptionService: { en: 'Subscription Service', ar: 'خدمة باشتراك' },
  catOther: { en: 'Other', ar: 'أخرى' },

  // 6 Steps Navigation in Workspace
  step1Tab: { en: '1. Market & Demand', ar: '١. السوق والطلب' },
  step2Tab: { en: '2. Competitors & UX', ar: '٢. المنافسون وتجربة العميل' },
  step3Tab: { en: '3. Tech & Delivery', ar: '٣. الجدوى التقنية والتنفيذ' },
  step4Tab: { en: '4. Financial Engine', ar: '٤. المحرك المالي' },
  step5Tab: { en: '5. Risks & 9 Gates', ar: '٥. المخاطر والبوابات التسع' },
  step6Tab: { en: '6. Decision & Approvals', ar: '٦. القرار والموافقات' },
  pilotTab: { en: 'Pilot & Launch Plan', ar: 'خطة التجربة والإطلاق' },
  performanceTab: { en: 'Post-Launch Actuals', ar: 'النتائج الفعلية بعد الإطلاق' },

  // Financial Engine Terms
  unitContribution: { en: 'Monthly Contribution / Customer', ar: 'مساهمة العميل الشهرية' },
  contributionMargin: { en: 'Contribution Margin', ar: 'هامش المساهمة' },
  operatingBreakEven: { en: 'Operating Break-Even', ar: 'نقطة التعادل التشغيلي' },
  investmentPayback: { en: 'Investment Payback Horizon', ar: 'فترة استرداد الاستثمار' },
  year1OperatingProfit: { en: 'Year 1 Net Operating Profit', ar: 'صافي الربح التشغيلي للسنة الأولى' },
  downsideScenario: { en: 'Downside Scenario', ar: 'السيناريو المتشائم' },
  baseScenario: { en: 'Base Case', ar: 'السيناريو الأساسي' },
  upsideScenario: { en: 'Upside Scenario', ar: 'السيناريو المتفائل' },

  // Buttons & Common Actions
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  back: { en: 'Back', ar: 'رجوع' },
  printMemo: { en: 'Print Decision Memo', ar: 'طباعة مذكرة القرار' },
  printPDF: { en: 'Print / Export PDF', ar: 'طباعة / تصدير PDF' },
  exportCSV: { en: 'Export CSV', ar: 'تصدير CSV' },
  runDecisionEngine: { en: 'Run Decision Engine', ar: 'تشغيل محرك القرار' },
  submitForReview: { en: 'Submit for Review', ar: 'إرسال للاعتماد' },
  approve: { en: 'Approve', ar: 'اعتماد' },
  reject: { en: 'Reject', ar: 'رفض' },
  pass: { en: 'Pass', ar: 'اجتياز' },
  conditionalPass: { en: 'Conditional', ar: 'مشروط' },
  fail: { en: 'Fail', ar: 'عدم اجتياز' },
  unassessed: { en: 'Unassessed', ar: 'غير مقيم' },
  criticalGate: { en: 'CRITICAL GATE', ar: 'بوابة حاسمة' },
  searchPlaceholder: { en: 'Search by name, ID, or customer...', ar: 'البحث بالاسم أو الرمز أو شريحة العملاء...' },
  allCategories: { en: 'All Categories', ar: 'كافة الفئات' },
  allStatuses: { en: 'All Statuses', ar: 'كافة الحالات' },
  noOpportunitiesFound: { en: 'No matching opportunities found.', ar: 'لم يتم العثور على فرص مطابقة.' },
  backToOpps: { en: 'Back to Opportunities Register', ar: 'الرجوع إلى سجل الفرص' },
  mrrGrowing: { en: 'MRR Growing +198% QoQ', ar: 'نمو متسارع للإيراد الشهري +198%' },
  forecastMRR: { en: 'Forecast MRR', ar: 'الإيراد المتوقع' },
  actualMRR: { en: 'Actual MRR', ar: 'الإيراد الفعلي' },
  actualCashSpend: { en: 'Actual Cash Spend', ar: 'الإنفاق النقدي الفعلي' },
  proposedValBudget: { en: 'Proposed Validation Budget', ar: 'ميزانية التحقق المقترحة' },

  // Opportunities Module
  productRegisterPipeline: { en: 'Product Register & Pipeline', ar: 'سجل المنتجات ومسار التطوير' },
  productOppsRegister: { en: 'Product Opportunities Register', ar: 'سجل فرص المنتجات الاستثمارية' },
  oppsRegisterSubtitle: {
    en: 'Central repository of recurring-revenue product concepts, evaluated through our 6-step framework.',
    ar: 'المستودع المركزي لفرص المنتجات ذات الإيرادات المتكررة، والمقيمة عبر إطار الخطوات الست.',
  },
  createOppModalTitle: { en: 'Create New Opportunity', ar: 'تسجيل فرصة استثمارية جديدة' },
  createOppModalSub: {
    en: 'Enter the core premise and initial validation parameters for this opportunity.',
    ar: 'أدخل الفكرة الأساسية ومعايير التحقق الأولية لهذه الفرصة.',
  },
  productName: { en: 'Product Name', ar: 'اسم المنتج' },
  businessProblem: { en: 'Business Problem Solved', ar: 'المشكلة التجارية المستهدفة' },
  proposedSolution: { en: 'Proposed Solution', ar: 'الحل المقترح' },
  targetSegment: { en: 'Target Customer Segment', ar: 'شريحة العملاء المستهدفة' },
  geography: { en: 'Primary Geography', ar: 'النطاق الجغرافي' },
  valBudgetSAR: { en: 'Validation Budget (SAR)', ar: 'ميزانية التحقق (ر.س)' },
  targetDecisionDate: { en: 'Target Decision Date', ar: 'تاريخ القرار المستهدف' },
  registerOpportunity: { en: 'Register Opportunity', ar: 'تسجيل الفرصة' },
  cloneOpp: { en: 'Clone for What-If Scenario', ar: 'استنساخ لسيناريو تجريبي' },
  archiveOpp: { en: 'Archive Opportunity', ar: 'أرشفة الفرصة' },
  cloneModalTitle: { en: 'Clone Opportunity for What-If Scenario', ar: 'استنساخ الفرصة لاختبار سيناريوهات بديلة' },
  cloneNewName: { en: 'New Cloned Opportunity Name', ar: 'اسم النسخة التجريبية الجديدة' },
  cloneAction: { en: 'Clone Opportunity', ar: 'إنشاء نسخة' },

  // Financial Simulator Module
  modelingEngine: { en: 'Interactive Modeling Engine', ar: 'محرك النمذجة المالية التفاعلي' },
  finSimulatorTitle: { en: 'Financial Simulator & Break-Even Sandbox', ar: 'المحاكي المالي ومختبر نقطة التعادل' },
  finSimulatorSub: {
    en: 'Pure deterministic SaaS unit economics, break-even customer threshold, payback horizon, and sensitivity analysis.',
    ar: 'اقتصاديات الوحدة الحتمية لبرمجيات SaaS، ونقطة تعادل عدد العملاء، وأفق الاسترداد، وتحليل الحساسية.',
  },
  downsideTab: { en: 'Downside (-20% Price, Higher Churn)', ar: 'السيناريو المتشائم (-20% السعر، تسرب أعلى)' },
  baseTab: { en: 'Base Case', ar: 'السيناريو الأساسي' },
  upsideTab: { en: 'Upside (+20% Price, Faster Growth)', ar: 'السيناريو المتفائل (+20% السعر، نمو أسرع)' },
  unitEconomicsHeader: { en: 'Unit Economics (Per Paying Customer)', ar: 'اقتصاديات الوحدة (لكل عميل يدفع)' },
  breakEvenPayback: { en: 'Break-Even & Investment Payback', ar: 'نقطة التعادل وأفق استرداد الاستثمار' },
  year1Metrics: { en: 'Year 1 & Horizon Projections', ar: 'توقعات السنة الأولى وأفق المحاكاة' },
  assumptionsPanel: { en: 'Interactive Assumptions & Drivers', ar: 'الافتراضات والمتغيرات المالية التفاعلية' },
  pricePerCustomer: { en: 'Monthly Price / Customer (SAR)', ar: 'سعر الاشتراك الشهري / عميل (ر.س)' },
  setupFee: { en: 'Initial Setup Fee (SAR)', ar: 'رسوم الإعداد الأولية (ر.س)' },
  fixedMonthlyCosts: { en: 'Fixed Monthly Operating Costs (SAR)', ar: 'التكاليف التشغيلية الشهرية الثابتة (ر.س)' },
  initialCapital: { en: 'Initial Upfront Investment (SAR)', ar: 'الاستثمار الأولي المسبق (ر.س)' },
  monthlyNewCust: { en: 'Monthly New Customer Additions', ar: 'العملاء الجدد المضافون شهرياً' },
  churnRate: { en: 'Monthly Customer Churn Rate (%)', ar: 'معدل تسرب العملاء الشهري (%)' },
  sensitivityAnalysis: { en: 'Sensitivity & Stress Testing', ar: 'تحليل الحساسية واختبارات التحمل' },

  // Reports Module
  moduleEight: { en: 'Executive Reporting & Memos', ar: 'التقارير التنفيذية والمذكرات' },
  decisionMemoTitle: { en: 'Executive Decision Memo & Portfolio Export', ar: 'مذكرة القرار التنفيذي وتصدير المحفظة' },
  decisionMemoSubtitle: {
    en: 'Generate formal executive investment decision briefs formatted for management and print/PDF export.',
    ar: 'إعداد مذكرات القرارات الاستثمارية الرسمية المعتمدة للإدارة وجاهزة للطباعة والتصدير كـ PDF.',
  },
  selectOppForMemo: { en: 'Select Opportunity for Memo:', ar: 'اختر الفرصة لإصدار المذكرة:' },

  // Settings Module
  systemGovParams: { en: 'System Governance & Parameters', ar: 'حوكمة النظام والمعايير التشغيلية' },
  platformConfig: { en: 'Platform Configuration & Decision Thresholds', ar: 'إعدادات المنصة وعتبات القرارات' },
  platformConfigSub: {
    en: 'Configure decision engine criteria weighting, team capital caps, and data residency policies.',
    ar: 'ضبط أوزان معايير محرك القرار، والحدود القصوى للميزانيات، وسياسات حماية البيانات.',
  },
  evalWeightsTitle: { en: 'Evaluation Scoring Criteria Weights (Sum: 100%)', ar: 'أوزان معايير تقييم الفرص (المجموع: 100%)' },
  evalWeightsSub: {
    en: 'Administrators can adjust weighting across categories. Must total exactly 100%.',
    ar: 'يمكن للمسؤولين تعديل أوزان الفئات. يجب أن يكون الإجمالي 100% بدقة.',
  },
  saveWeights: { en: 'Save Criteria Weights', ar: 'حفظ أوزان المعايير' },
  restoreDemo: { en: 'Restore Demo Portfolio', ar: 'استعادة المحفظة التجريبية' },
  clearDataTitle: { en: 'Reset to Honest Zero-Data Mode', ar: 'تصفير البيانات إلى وضع الصفر الصادق' },
  clearDataSub: {
    en: 'Wipes all sample records to simulate day-1 clean production.',
    ar: 'مسح كافة السجلات التجريبية لمحاكاة أول يوم تشغيل فعلي نظيف.',
  },

  // Language Switcher
  switchToArabic: { en: 'العربية', ar: 'English' },
  languageName: { en: 'English', ar: 'العربية' },

  // Grouped Navigation Sections
  navSecHub: { en: 'PORTFOLIO HUB', ar: 'المركز التنفيذي' },
  navSecPipeline: { en: 'EVALUATION & RESEARCH', ar: 'مسار التقييم والأبحاث' },
  navSecGovernance: { en: 'DECISIONS & GOVERNANCE', ar: 'اتخاذ القرارات والحوكمة' },
  navSecOperations: { en: 'OPERATIONS & SETTINGS', ar: 'العمليات والإعدادات' },

  // Workflow Guide Modal
  workflowGuide: { en: 'Workflow Guide', ar: 'دليل العمليات' },
  workflowModalTitle: { en: 'How BI Technology Business Intelligence Works', ar: 'كيف تعمل منصة ذكاء الأعمال في بي آي للتكنولوجيا' },
  workflowModalSubtitle: {
    en: 'A disciplined 4-stage governance journey from Saudi market hypothesis to recurring revenue.',
    ar: 'رحلة حوكمة منضبطة من 4 مراحل لتحويل الفرضيات إلى إيرادات متكررة مستدامة.',
  },
  workflowStage1: { en: 'Stage 1: Intake & Problem Definition', ar: 'المرحلة 1: تسجيل الفكرة وتحديد المشكلة' },
  workflowStage1Desc: {
    en: 'Register customer segments, painful problems in KSA, and proposed validation budget (capped at SAR 25,000).',
    ar: 'تسجيل شريحة العملاء المستهدفة، والمشكلة الفعلية في السعودية، والميزانية المقترحة (بحد أقصى 25,000 ر.س).',
  },
  workflowStage2: { en: 'Stage 2: 6-Step Evidence Validation', ar: 'المرحلة 2: التحقق بالخطوات الست القائم على الأدلة' },
  workflowStage2Desc: {
    en: 'Validate market size, benchmark competitors, evaluate technical build vs buy, model 24-month finances, and log operational risks.',
    ar: 'التحقق من حجم السوق، ومقارنة المنافسين، والجدوى التقنية، ونمذجة 24 شهراً مالياً، وسجل المخاطر.',
  },
  workflowStage3: { en: 'Stage 3: 9 Mandatory Governance Gates', ar: 'المرحلة 3: بوابات الحوكمة التسع الإلزامية' },
  workflowStage3Desc: {
    en: 'Before any capital is authorized, all 9 strict gates must be reviewed and signed off by authorized executives.',
    ar: 'قبل اعتماد أي سيولة، يجب فحص واجتياز بوابات الحوكمة التسع الصارمة وتوقيع أصحاب الصلاحية.',
  },
  workflowStage4: { en: 'Stage 4: Controlled Pilot & Scale', ar: 'المرحلة 4: التجربة الميدانية المقيدة والتوسع' },
  workflowStage4Desc: {
    en: 'Execute a bounded paid pilot with real Saudi clients to reach commercial break-even and sustainable MRR.',
    ar: 'تنفيذ تجربة مدفوعة محدودة مع عملاء سعوديين حقيقيين لتحقيق نقطة التعادل وإيرادات متكررة.',
  },
  closeGuide: { en: 'Got it, Let\'s Begin', ar: 'فهمت، لنبدأ الآن' },

  // Grouped Dashboard Clusters
  dashClusterPipeline: { en: 'Pipeline Status & Velocity', ar: 'حالة مسار الفرص والسرعة' },
  dashClusterCapital: { en: 'Capital Allocation & Exposure', ar: 'تخصيص السيولة ومستوى المخاطر' },
  dashClusterReturns: { en: 'Commercial Traction & Returns', ar: 'النتائج التجارية والعوائد الفعلية' },
  dashCapLimitNote: { en: 'Validation capital cap: ≤ SAR 25,000 per project', ar: 'الحد الأقصى لميزانية التحقق: ≤ 25,000 ر.س لكل مشروع' },
  executiveDecisionQueue: { en: 'Executive Decision Queue', ar: 'قائمة القرارات المعلقة للإدارة' },
  executiveQueueSubtitle: {
    en: 'Opportunities currently requiring management gate clearance or investment decisions',
    ar: 'الفرص التي تتطلب حالياً اعتماد البوابات أو قرارات استثمارية من الإدارة',
  },
  queueEmpty: { en: 'All opportunities are clear. No pending management blockers.', ar: 'جميع الفرص تسير بانتظام. لا توجد معوقات معلقة للإدارة حالياً.' },
  actionReviewNow: { en: 'Review & Sign-off', ar: 'مراجعة واعتماد' },
  processBannerTitle: { en: 'BI Technology Investment & Evaluation Framework', ar: 'منهجية بي آي للتكنولوجيا في الاستثمار وتطوير المنتجات' },
  processBannerDesc: {
    en: 'Four structured steps to eliminate guesswork and protect company capital before code is written.',
    ar: 'أربع خطوات منهجية لإلغاء التخمين وحماية رأس مال الشركة قبل كتابة أي كود برمجي.',
  },

  // Opportunities Kanban & Filters
  viewBoard: { en: 'Pipeline Board', ar: 'لوحة المسار (كانبان)' },
  viewTable: { en: 'Audit Table', ar: 'جدول التفاصيل' },
  colIdea: { en: 'Discovery & Ideas', ar: 'الاستكشاف والأفكار' },
  colUnderEval: { en: 'Under 6-Step Review', ar: 'قيد التقييم المنهجي' },
  colDecisionPending: { en: 'Decision Pending', ar: 'بانتظار قرار الإدارة' },
  colPilotApproved: { en: 'Pilot Approved (≤25k)', ar: 'تجارب معتمدة (≤25 ألف)' },
  colActive: { en: 'Commercialized / Scale', ar: 'مطروحة تجارياً / نمو' },
  cardBudget: { en: 'Budget:', ar: 'الميزانية:' },
  cardGates: { en: 'Gates:', ar: 'البوابات:' },
  cardOpenWorkspace: { en: 'Open Workspace', ar: 'فتح مساحة التقييم' },
  filterAll: { en: 'All Items', ar: 'كافة العناصر' },
  filterNeedsAction: { en: 'Needs Action', ar: 'تتطلب إجراء' },
  filterHighPriority: { en: 'Score > 70', ar: 'درجة عالية > 70' },

  // Guided Stepper & Guidance
  stepProgressLabel: { en: 'Evaluation Progress', ar: 'نسبة اكتمال التقييم' },
  stepOf: { en: 'Step {current} of 6', ar: 'الخطوة {current} من 6' },
  nextStepBtn: { en: 'Save & Continue to Next Step →', ar: 'حفظ ومتابعة إلى الخطوة التالية ←' },
  prevStepBtn: { en: '← Back to Previous Step', ar: '← العودة إلى الخطوة السابقة' },
  saveDraftBtn: { en: 'Save Draft', ar: 'حفظ كمسودة' },
  gatesSummaryTitle: { en: '9 Mandatory Governance Gates:', ar: 'بوابات الحوكمة الإلزامية التسع:' },
  gatesPassedCount: { en: 'Passed', ar: 'مكتملة' },
  gatesPendingCount: { en: 'Pending', ar: 'قيد الانتظار' },
  gatesFailedCount: { en: 'Action Needed', ar: 'معوقات' },
  guidanceTitle: { en: 'Saudi Market Guidance & BI Technology Criteria', ar: 'إرشادات السوق السعودي ومعايير بي آي للتكنولوجيا' },
  emptySearchTitle: { en: 'No matching opportunities found', ar: 'لم يتم العثور على فرص مطابقة' },
  emptySearchDesc: {
    en: 'Try adjusting your search filters or start by creating a new opportunity.',
    ar: 'جرب تغيير كلمات البحث أو المرشحات، أو ابدأ بتسجيل فرصة جديدة.',
  },
  createFirstOpp: { en: 'Create First Opportunity', ar: 'تسجيل أول فرصة منتج' },
  loadDemoOpps: { en: 'Load Sample Saudi Portfolio', ar: 'تحميل محفظة نماذج سعودية' },
};

/**
 * Helper to get translated string with fallback
 */
export function getTranslation(key: string, lang: Language): string {
  const item = DICTIONARY[key];
  if (!item) return key;
  return item[lang] || item.en || key;
}

/**
 * Format currency in English (SAR 12,000) or Arabic (12,000 ر.س)
 */
export function formatCurrency(amount: number, lang: Language): string {
  const formatted = (amount || 0).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');
  if (lang === 'ar') {
    return `${formatted} ر.س`;
  }
  return `SAR ${formatted}`;
}
