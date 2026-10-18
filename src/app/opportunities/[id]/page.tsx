'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers3,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  ShieldAlert,
  Building2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Save,
  Check,
  X,
  FileText,
  DollarSign,
  Cpu,
  ShieldCheck,
  Target,
  Rocket,
  Activity,
  History,
  AlertOctagon,
  Copy,
  Printer,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Opportunity } from '@/lib/db/types';
import { GateStatus } from '@/lib/decision-engine';
import { useApp } from '@/components/providers/AppProvider';
import {
  calculateFinancialModel,
  generateThreeScenarios,
  runSensitivityAnalysis,
} from '@/lib/financial-engine';

export default function OpportunityWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, showToast, t, fmtCurrency, language, isRtl } = useApp();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('step1');

  // Step 1: Market State
  const [marketForm, setMarketForm] = useState<any>({});

  // Step 2: Competitor Form Modal
  const [showAddComp, setShowAddComp] = useState(false);
  const [compForm, setCompForm] = useState({
    name: '',
    website: '',
    productName: '',
    country: 'Saudi Arabia',
    observedPriceSAR: 500,
    pricingInterval: 'monthly' as const,
    hasArabicSupport: true,
    mainStrengths: '',
    mainWeaknesses: '',
    differentiationOpportunity: '',
    confidence: 'verified' as const,
  });

  // Phase 2 AI Assistant States
  const [aiLoadingAction, setAiLoadingAction] = useState<string | null>(null);
  const [step2AiCompetitors, setStep2AiCompetitors] = useState<any[]>([]);
  const [step5AiRisks, setStep5AiRisks] = useState<any[]>([]);

  // Step 3: Technical Form
  const [techForm, setTechForm] = useState<any>({});

  // Step 4: Financial Simulator State
  const [finForm, setFinForm] = useState<any>({});
  const [activeScenario, setActiveScenario] = useState<'base' | 'downside' | 'upside'>('base');

  // Step 5: Risk Modal & Gate Edit
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [riskForm, setRiskForm] = useState({
    category: 'commercial' as const,
    description: '',
    likelihood: 'medium' as const,
    impact: 'high' as const,
    severity: 'high' as const,
    ownerName: '',
    mitigation: '',
    status: 'open' as const,
  });

  // Step 6: Approval Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitRationale, setSubmitRationale] = useState('');
  const [submitRequestedBudget, setSubmitRequestedBudget] = useState(15000);

  // Management Decision Modal
  const [showDecideModal, setShowDecideModal] = useState<string | null>(null);
  const [decideChoice, setDecideChoice] = useState<'approved' | 'rejected'>('approved');
  const [decideConditions, setDecideConditions] = useState('');

  // Performance Modal
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [perfForm, setPerfForm] = useState({
    reportingMonth: '2026-11',
    payingCustomers: 5,
    newCustomers: 2,
    churnedCustomers: 0,
    mrrSAR: 3250,
    cashCollectedSAR: 4250,
    directCostsSAR: 280,
    operatingCostsSAR: 4200,
    grossProfitSAR: 3970,
    netOperatingResultSAR: -230,
    forecastVarianceNotes: 'Ahead of break-even target.',
  });

  const loadData = () => {
    fetch(`/api/opportunities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const o: Opportunity = data.data;
          setOpp(o);
          setMarketForm(o.marketAssessment || {});
          setTechForm(o.technicalFeasibility || {});
          setFinForm(o.financialAssumptions || {});
        } else {
          showToast('Opportunity not found');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 text-sm">
        Loading evaluation workspace...
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-lg font-bold text-gray-900">Opportunity Not Found</h2>
        <Link href="/opportunities" className="text-sm text-[#315EE8] font-bold mt-2 inline-block">
          ← Return to Opportunities
        </Link>
      </div>
    );
  }

  // Live financial model calculations
  const liveFinancialOutputs = calculateFinancialModel(finForm, 'Active Simulation');
  const liveScenarios = generateThreeScenarios(finForm);
  const currentScenarioOutputs = activeScenario === 'base' ? liveScenarios.base : activeScenario === 'downside' ? liveScenarios.downside : liveScenarios.upside;

  // Step 1 Save
  const handleSaveMarket = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'market', payload: marketForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Step 1: Market Assessment Saved');
        loadData();
      }
    } catch {
      showToast('Error saving market assessment');
    }
  };

  // AI Step 1: Auto Sizing with Monsha'at
  const handleAiMarketEstimate = async () => {
    if (!opp) return;
    setAiLoadingAction('market');
    try {
      const res = await fetch('/api/ai/market-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          productName: opp.name,
          category: opp.category,
          targetAudience: opp.targetCustomerSegment,
          pricingSAR: opp.financialAssumptions?.monthlyPricePerCustomer,
          industry: opp.industry,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMarketForm((prev: any) => ({
          ...prev,
          tamSAR: json.data.tamSAR,
          samSAR: json.data.samSAR,
          somSAR: json.data.somSAR,
          targetBusinessCount: json.data.targetEstablishmentsCount,
          sizingMethodology: json.data.sizingMethodology,
          confidenceLevel: json.data.confidenceLevel,
        }));
        showToast(
          language === 'ar'
            ? 'تم استيراد تقديرات حجم السوق من منشآت بنجاح!'
            : 'Imported Monshaat market sizing benchmarks!'
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoadingAction(null);
    }
  };

  // AI Step 2: Discover Saudi Competitors
  const handleAiCompetitorDiscovery = async () => {
    if (!opp) return;
    setAiLoadingAction('competitor');
    try {
      const res = await fetch('/api/ai/competitor-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          productName: opp.name,
          category: opp.category,
          description: opp.description,
          industry: opp.industry,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStep2AiCompetitors(json.data);
        showToast(
          language === 'ar'
            ? `تم رصد ${json.data.length} منافسين في السوق السعودي!`
            : `AI found ${json.data.length} Saudi competitors!`
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoadingAction(null);
    }
  };

  const handleAddAiCompetitorToOpp = async (comp: any) => {
    if (!opp) return;
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({
          step: 'competitor',
          action: 'add',
          payload: {
            name: comp.name,
            website: comp.website,
            productName: comp.productName,
            country: comp.country,
            observedPriceSAR: comp.observedPriceSAR,
            pricingInterval: comp.pricingInterval,
            hasArabicSupport: comp.hasArabicSupport,
            mainStrengths: comp.mainStrengths,
            mainWeaknesses: comp.mainWeaknesses,
            differentiationOpportunity: comp.differentiationOpportunity,
            confidence: 'verified',
            sourceUrl: comp.sourceUrl,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStep2AiCompetitors((prev) => prev.filter((c) => c.id !== comp.id));
        showToast(`Added ${comp.name} to competitor landscape`);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // AI Step 5: Scan Regulatory & Tech Risks
  const handleAiRiskScan = async () => {
    if (!opp) return;
    setAiLoadingAction('risk');
    try {
      const res = await fetch('/api/ai/risk-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          productName: opp.name,
          category: opp.category,
          targetAudience: opp.targetCustomerSegment,
          technicalStack: opp.technicalFeasibility?.proposedTechStack,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStep5AiRisks(json.data);
        showToast(
          language === 'ar'
            ? `تم رصد ${json.data.length} مخاطر تنظيمية وتقنية!`
            : `Detected ${json.data.length} regulatory & tech risks!`
        );
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoadingAction(null);
    }
  };

  const handleAddAiRiskToOpp = async (rsk: any) => {
    if (!opp) return;
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({
          step: 'risk',
          payload: {
            category: rsk.category,
            description: rsk.description,
            likelihood: rsk.likelihood,
            impact: rsk.impact,
            severity: rsk.severity,
            mitigation: rsk.mitigation,
            ownerName: currentUser.name,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStep5AiRisks((prev) => prev.filter((r) => r.riskCode !== rsk.riskCode));
        showToast(`Added ${rsk.riskCode} to risk register`);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Step 2 Add Competitor
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'competitor', action: 'add', payload: compForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Step 2: Competitor benchmark recorded');
        setShowAddComp(false);
        loadData();
      }
    } catch {
      showToast('Error adding competitor');
    }
  };

  const handleDeleteCompetitor = async (compId: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'competitor', action: 'delete', payload: { competitorId: compId } }),
      });
      if (res.ok) {
        showToast('Competitor removed');
        loadData();
      }
    } catch {
      showToast('Error removing competitor');
    }
  };

  // Step 3 Save Technical
  const handleSaveTech = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'technical', payload: techForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Step 3: Technical Feasibility Saved');
        loadData();
      }
    } catch {
      showToast('Error saving technical feasibility');
    }
  };

  // Step 4 Save Financial
  const handleSaveFinancial = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'financial', payload: finForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Step 4: Financial Assumptions Saved & Model Recalculated');
        loadData();
      }
    } catch {
      showToast('Error saving financial model');
    }
  };

  // Step 5 Update Gate
  const handleUpdateGate = async (gateId: string, status: GateStatus, evidence: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'gate', payload: { gateId, status, evidence } }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Gate updated: ${status.toUpperCase()}`);
        loadData();
      }
    } catch {
      showToast('Error updating gate');
    }
  };

  // Step 5 Add Risk
  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'risk', payload: riskForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Risk item logged in register');
        setShowAddRisk(false);
        loadData();
      }
    } catch {
      showToast('Error adding risk');
    }
  };

  // Step 6 Run Decision Engine
  const handleRunDecisionEngine = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ step: 'run-engine' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Decision Engine Evaluated: ${data.data.recommendation} (Score: ${data.data.weightedScore}/100)`);
        loadData();
      }
    } catch {
      showToast('Error running decision engine');
    }
  };

  // Step 6 Submit Approval
  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/opportunities/${id}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({
          action: 'submit',
          decisionType: opp.recommendation,
          rationale: submitRationale,
          requestedBudgetSAR: submitRequestedBudget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Decision submitted for management review');
        setShowSubmitModal(false);
        loadData();
      }
    } catch {
      showToast('Error submitting decision');
    }
  };

  // Step 6 Record Approval / Rejection
  const handleDecideApproval = async (approvalId: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({
          action: 'decide',
          approvalId,
          decision: decideChoice,
          conditions: decideConditions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Decision ${decideChoice.toUpperCase()} recorded.`);
        setShowDecideModal(null);
        loadData();
      } else {
        showToast(data.error || 'Authorization error');
      }
    } catch {
      showToast('Error recording decision');
    }
  };

  // Module 4: Toggle Checklist Task
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    const checklist = opp.launchChecklist.map((t) => (t.id === taskId ? { ...t, isCompleted } : t));
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ launchChecklist: checklist }),
      });
      if (res.ok) {
        showToast(`Checklist task updated`);
        loadData();
      }
    } catch {
      showToast('Error updating task');
    }
  };

  // Module 5: Add Performance Record
  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    const actuals = [...(opp.actualPerformance || []), { id: `perf-${Date.now()}`, ...perfForm }];
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ actualPerformance: actuals }),
      });
      if (res.ok) {
        showToast(`Performance record added for ${perfForm.reportingMonth}`);
        setShowPerfModal(false);
        loadData();
      }
    } catch {
      showToast('Error saving performance');
    }
  };

  const fmtSAR = fmtCurrency;

  const steps = [
    { id: 'step1', title: t('step1Tab'), icon: Target },
    { id: 'step2', title: t('step2Tab'), icon: Search },
    { id: 'step3', title: t('step3Tab'), icon: Cpu },
    { id: 'step4', title: t('step4Tab'), icon: DollarSign },
    { id: 'step5', title: t('step5Tab'), icon: ShieldCheck },
    { id: 'step6', title: t('step6Tab'), icon: FileText },
    { id: 'pilot', title: t('pilotTab'), icon: Rocket },
    { id: 'performance', title: t('performanceTab'), icon: Activity },
  ];

  const isStep1Done = Boolean(opp.marketAssessment && opp.marketAssessment.tamSAR > 0);
  const isStep2Done = Boolean(opp.competitors && opp.competitors.length > 0);
  const isStep3Done = Boolean(techForm.architectureSummary || (opp.technicalFeasibility && opp.technicalFeasibility.architectureSummary));
  const isStep4Done = Boolean(opp.financialAssumptions && opp.financialAssumptions.monthlyPricePerCustomer > 0);
  const isStep5Done = Boolean(opp.mandatoryGates && opp.mandatoryGates.filter((g) => g.status === 'pass').length >= 7);
  const isStep6Done = Boolean(opp.recommendation && opp.weightedScore > 0);

  const completedCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done, isStep6Done].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header — Neomorphic */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/opportunities"
          className="neu-btn inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-800 hover:text-black transition-all"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('backToOpps')}</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="neu-btn inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-800 hover:text-black transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>{t('printPDF')}</span>
        </button>
      </div>

      {/* Opportunity Title & Governance Ribbon — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
              <span className="neu-pressed px-2.5 py-0.5 rounded text-[10px] text-slate-700">{opp.id}</span>
              <span>·</span>
              <span className="text-[#315EE8] font-black">{opp.category.replace('_', ' ')}</span>
              <span>·</span>
              <span className="font-bold">{opp.primaryGeography}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mt-1.5">
              {opp.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-semibold mt-1 max-w-3xl leading-relaxed">
              {opp.description || opp.businessProblem}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Recommendation Tag */}
            <div className={isRtl ? 'text-left' : 'text-right'}>
              <div className="text-[10px] font-black text-slate-500 uppercase">
                {language === 'ar' ? 'توصية محرك القرار' : 'Engine Recommendation'}
              </div>
              <span
                className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase mt-1 ${
                  opp.recommendation === 'EXECUTE'
                    ? 'neu-raised-sm text-emerald-800 border border-emerald-300'
                    : opp.recommendation === 'PILOT'
                    ? 'neu-raised-sm text-[#315EE8] border border-blue-300'
                    : opp.recommendation === 'HOLD'
                    ? 'neu-raised-sm text-amber-800 border border-amber-300'
                    : opp.recommendation === 'PARTNER'
                    ? 'neu-raised-sm text-purple-800 border border-purple-300'
                    : 'neu-raised-sm text-red-800 border border-red-300'
                }`}
              >
                {t(`rec${opp.recommendation}`) || opp.recommendation}
              </span>
            </div>

            {/* Score Pill */}
            <div className="neu-pressed px-5 py-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase">{t('thWeightedScore')}</div>
              <div className="text-xl font-black text-black tabular-nums mt-0.5">
                {opp.weightedScore ? `${opp.weightedScore}/100` : '—'}
              </div>
            </div>

            {/* Status Pill */}
            <div className="neu-pressed px-5 py-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase">{t('thStatus')}</div>
              <div className="text-xs font-black text-slate-800 capitalize mt-1">
                {opp.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Visual Stepper */}
        <div className="pt-5 border-t border-slate-200 space-y-3.5 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800">{t('stepProgressLabel')}:</span>
              <span className="font-black text-[#315EE8]">{progressPercent}%</span>
              <span className="text-slate-500 font-semibold">({completedCount}/6 {isRtl ? 'خطوات مكتملة' : 'completed'})</span>
            </div>

            {/* Quick 9-Gate status pill */}
            <div className="flex items-center gap-2.5">
              <span className="text-slate-600 font-bold">{t('gatesSummaryTitle')}</span>
              <span className="neu-pressed font-black text-emerald-800 px-3 py-1 rounded-full text-xs">
                {opp.mandatoryGates?.filter((g) => g.status === 'pass').length || 0}/9 {t('gatesPassedCount')}
              </span>
              {(opp.mandatoryGates?.filter((g) => g.status === 'fail').length || 0) > 0 && (
                <span className="neu-pressed font-black text-red-700 px-3 py-1 rounded-full text-xs">
                  {opp.mandatoryGates?.filter((g) => g.status === 'fail').length} {t('gatesFailedCount')}
                </span>
              )}
              <button
                onClick={() => setActiveTab('step5')}
                className="text-xs text-[#315EE8] font-black hover:underline"
              >
                {isRtl ? 'فحص البوابات ←' : 'Verify Gates →'}
              </button>
            </div>
          </div>

          <div className="neu-pressed w-full h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-[#315EE8] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Tabs Navigation — Neomorphic */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isActive = activeTab === st.id;
              const isEvaluationStep = idx < 6;
              const stepDone =
                idx === 0
                  ? isStep1Done
                  : idx === 1
                  ? isStep2Done
                  : idx === 2
                  ? isStep3Done
                  : idx === 3
                  ? isStep4Done
                  : idx === 4
                  ? isStep5Done
                  : idx === 5
                  ? isStep6Done
                  : false;

              return (
                <button
                  key={st.id}
                  onClick={() => setActiveTab(st.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    isActive
                      ? 'neu-btn-primary text-white shadow-sm'
                      : stepDone
                      ? 'neu-raised-sm text-emerald-800 border border-emerald-300'
                      : 'neu-btn text-slate-700'
                  }`}
                >
                  {isEvaluationStep && (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white text-[#315EE8]'
                          : stepDone
                          ? 'bg-emerald-600 text-white'
                          : 'neu-pressed text-slate-800'
                      }`}
                    >
                      {stepDone && !isActive ? '✓' : idx + 1}
                    </span>
                  )}
                  {!isEvaluationStep && <Icon className="w-3.5 h-3.5" />}
                  <span>{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: MARKET OPPORTUNITY & CUSTOMER VALIDATION */}
      {/* ========================================================================= */}
      {activeTab === 'step1' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 1 — Market Opportunity & Customer Validation</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Determine whether a sufficiently attractive customer problem exists in Saudi Arabia, distinguishing market size from validated demand.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiMarketEstimate}
                  disabled={aiLoadingAction === 'market'}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {aiLoadingAction === 'market'
                      ? (language === 'ar' ? 'جارِ استيراد التقدير...' : 'Estimating...')
                      : (language === 'ar' ? 'تقدير الحجم من منشآت (AI)' : 'Auto-Size with Monshaat (AI)')}
                  </span>
                </button>
                <button
                  onClick={handleSaveMarket}
                  className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Step 1</span>
                </button>
              </div>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-[#315EE8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  {isRtl
                    ? 'احرص على التمييز بين الحجم الكلي للسوق في السعودية (TAM) وبين الطلب المؤكد. لن يتم قبول أي مشروع دون وجود خطاب نية أو التزام تجربة مدفوعة من عميل سعودي حقيقي.'
                    : 'Distinguish between broad macro TAM and validated demand in Saudi Arabia. At least 1 letter of intent or paid pilot commitment is required to satisfy governance gate #1.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Sizing Calculations Card */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <span className="text-[10px] font-bold text-[#315EE8] uppercase tracking-wider">Bottom-Up Market Sizing</span>
                <div>
                  <div className="text-xs text-gray-500">TAM (Total Addressable)</div>
                  <div className="text-lg font-extrabold text-gray-900 tabular-nums">{fmtSAR(marketForm.tamSAR)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">SAM (Serviceable Available)</div>
                  <div className="text-lg font-extrabold text-gray-900 tabular-nums">{fmtSAR(marketForm.samSAR)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">SOM (Obtainable Share)</div>
                  <div className="text-lg font-extrabold text-[#315EE8] tabular-nums">{fmtSAR(marketForm.somSAR)}</div>
                </div>
              </div>

              {/* Bottom Up Inputs */}
              <div className="md:col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Businesses (Count)</label>
                    <input
                      type="number"
                      value={marketForm.targetBusinessCount || 0}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        const share = marketForm.reachableSharePercent || 5;
                        const arpu = marketForm.annualRevenuePerCustomerSAR || 6000;
                        setMarketForm({
                          ...marketForm,
                          targetBusinessCount: count,
                          somSAR: Math.round(count * (share / 100) * arpu),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reachable Share (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={marketForm.reachableSharePercent || 0}
                      onChange={(e) => {
                        const share = Number(e.target.value);
                        const count = marketForm.targetBusinessCount || 1000;
                        const arpu = marketForm.annualRevenuePerCustomerSAR || 6000;
                        setMarketForm({
                          ...marketForm,
                          reachableSharePercent: share,
                          somSAR: Math.round(count * (share / 100) * arpu),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Annual ARPU (SAR)</label>
                    <input
                      type="number"
                      value={marketForm.annualRevenuePerCustomerSAR || 0}
                      onChange={(e) => {
                        const arpu = Number(e.target.value);
                        const count = marketForm.targetBusinessCount || 1000;
                        const share = marketForm.reachableSharePercent || 5;
                        setMarketForm({
                          ...marketForm,
                          annualRevenuePerCustomerSAR: arpu,
                          somSAR: Math.round(count * (share / 100) * arpu),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Validation Evidence Counters */}
                <div className="pt-2">
                  <span className="block font-bold text-gray-800 mb-2">Verified Customer Validation Evidence</span>
                  <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-[11px] text-gray-500 block">Customer Interviews</span>
                      <input
                        type="number"
                        value={marketForm.interviewCount || 0}
                        onChange={(e) => setMarketForm({ ...marketForm, interviewCount: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-bold text-gray-900 mt-1"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 block">Qualified Leads</span>
                      <input
                        type="number"
                        value={marketForm.qualifiedLeadsCount || 0}
                        onChange={(e) => setMarketForm({ ...marketForm, qualifiedLeadsCount: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-bold text-gray-900 mt-1"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 block">Letters of Intent (LOIs)</span>
                      <input
                        type="number"
                        value={marketForm.loiCount || 0}
                        onChange={(e) => setMarketForm({ ...marketForm, loiCount: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-bold text-gray-900 mt-1"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 block">Paid Pilot Commitments</span>
                      <input
                        type="number"
                        value={marketForm.paidPilotCommitments || 0}
                        onChange={(e) => setMarketForm({ ...marketForm, paidPilotCommitments: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-blue-400 bg-blue-50 text-[#315EE8] rounded font-extrabold mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Customer Profile</label>
                  <input
                    type="text"
                    value={marketForm.targetCustomerProfile || ''}
                    onChange={(e) => setMarketForm({ ...marketForm, targetCustomerProfile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Alternatives / Existing Workarounds</label>
                  <textarea
                    rows={2}
                    value={marketForm.currentAlternatives || ''}
                    onChange={(e) => setMarketForm({ ...marketForm, currentAlternatives: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {t('stepOf').replace('{current}', '1')}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveMarket}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('saveDraftBtn')}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveMarket();
                    setActiveTab('step2');
                  }}
                  className="px-5 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>{t('nextStepBtn')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COMPETITORS & DIFFERENTIATION */}
      {/* ========================================================================= */}
      {activeTab === 'step2' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 2 — Competitor & Differentiation Intelligence</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Understand existing alternatives and identify defensible reasons for Saudi businesses to purchase from BI Technology.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiCompetitorDiscovery}
                  disabled={aiLoadingAction === 'competitor'}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {aiLoadingAction === 'competitor'
                      ? (language === 'ar' ? 'جارِ فحص المنافسين...' : 'Scanning...')
                      : (language === 'ar' ? 'اكتشاف منافسي السعودية (AI)' : 'AI Saudi Competitors')}
                  </span>
                </button>
                <button
                  onClick={() => setShowAddComp(true)}
                  className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Competitor Benchmark</span>
                </button>
              </div>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-indigo-50/70 border border-indigo-200/60 flex items-start gap-2.5 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  {isRtl
                    ? 'حدد على الأقل منافسين اثنين ينشطان في السوق السعودي، وتحقق من تسعيرهما الشهري، وما إذا كانا يوفران واجهة عربية ودعماً محلياً متوافقاً مع الفوترة الإلكترونية.'
                    : 'Document at least two active competitors in the Saudi market. Verify their actual monthly pricing in SAR and whether they support Arabic UX and local regulations.'}
                </p>
              </div>
            </div>

            {/* AI Staged Competitors */}
            {step2AiCompetitors.length > 0 && (
              <div className="p-4 mt-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase">
                      AI Hypothesis
                    </span>
                    <span className="text-xs font-bold text-indigo-900">
                      {step2AiCompetitors.length} {language === 'ar' ? 'منافسين سعوديين مقترحين' : 'Saudi Competitors Discovered'}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep2AiCompetitors([])}
                    className="text-[11px] text-gray-500 hover:text-gray-800"
                  >
                    {language === 'ar' ? 'إخفاء' : 'Dismiss'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step2AiCompetitors.map((comp) => (
                    <div key={comp.id} className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-2xs space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{comp.name}</div>
                          <div className="text-[10px] text-gray-400">{comp.productName} ({comp.country})</div>
                        </div>
                        <div className="font-bold text-[#315EE8]">{fmtSAR(comp.observedPriceSAR)} / {comp.pricingInterval}</div>
                      </div>
                      <div className="text-[11px] text-gray-600">{comp.mainWeaknesses}</div>
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddAiCompetitorToOpp(comp)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{language === 'ar' ? 'اعتماد وإضافة' : 'Verify & Add'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitor Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Competitor & Product</th>
                    <th className="py-3 px-4">Observed Price</th>
                    <th className="py-3 px-4">Arabic UX</th>
                    <th className="py-3 px-4">Strengths</th>
                    <th className="py-3 px-4">Weaknesses</th>
                    <th className="py-3 px-4">BI Technology Differentiation</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {opp.competitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No competitors logged yet. Click &quot;Add Competitor Benchmark&quot; to build the intelligence landscape.
                      </td>
                    </tr>
                  ) : (
                    opp.competitors.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          <div>{c.name}</div>
                          <div className="text-[10px] text-gray-400">{c.productName} ({c.country})</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800 tabular-nums">
                          {fmtSAR(c.observedPriceSAR)} / {c.pricingInterval}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.hasArabicSupport ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {c.hasArabicSupport ? 'Arabic Supported' : 'English Only'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs">{c.mainStrengths}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs">{c.mainWeaknesses}</td>
                        <td className="py-3 px-4 font-medium text-[#315EE8] max-w-xs">{c.differentiationOpportunity}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCompetitor(c.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('step1')}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('prevStepBtn')}</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
                  {t('stepOf').replace('{current}', '2')}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('step3')}
                  className="px-5 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>{t('nextStepBtn')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TECHNICAL FEASIBILITY & DELIVERY */}
      {/* ========================================================================= */}
      {activeTab === 'step3' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 3 — Technical Feasibility & Delivery Plan</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm delivery effort, build vs buy strategy, reusable components, and Saudi hosting mandates.
                </p>
              </div>
              <button
                onClick={handleSaveTech}
                className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Step 3</span>
              </button>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-purple-50/70 border border-purple-200/60 flex items-start gap-2.5 text-xs text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {isRtl
                    ? 'التحقق من إمكانية استغلال المكونات البرمجية الجاهزة لدى بي-آي-تي لاختصار مدة التطوير إلى أقل من 45 يوماً عمل، مع الالتزام التام بنظام حماية البيانات الشخصية السعودي (PDPL) والاستضافة السحابية داخل المملكة.'
                    : 'Verify internal reusable components to keep MVP development under 45 engineering days. Strict compliance with Saudi PDPL data residency and Riyadh cloud hosting is mandatory.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Architecture Summary</label>
                <textarea
                  rows={3}
                  value={techForm.architectureSummary || ''}
                  onChange={(e) => setTechForm({ ...techForm, architectureSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. Next.js App Router with Postgres and Redis on AWS Riyadh"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Build vs. Buy Decision</label>
                <select
                  value={techForm.buildVsBuy || 'build'}
                  onChange={(e) => setTechForm({ ...techForm, buildVsBuy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white font-medium"
                >
                  <option value="build">Build Custom In-House</option>
                  <option value="buy">Buy Off-the-Shelf Commercial License</option>
                  <option value="partner">Technology Partnership & Co-Delivery</option>
                  <option value="white_label">White Label Existing Product</option>
                </select>
              </div>

              {/* Delivery Effort Estimates in Days */}
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-800 block mb-2">Delivery Effort Breakdown (Work Days)</span>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500">Discovery & UX</label>
                    <input
                      type="number"
                      value={techForm.effortDiscoveryDays || 0}
                      onChange={(e) => setTechForm({ ...techForm, effortDiscoveryDays: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded mt-1 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Design & Prototyping</label>
                    <input
                      type="number"
                      value={techForm.effortDesignDays || 0}
                      onChange={(e) => setTechForm({ ...techForm, effortDesignDays: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded mt-1 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Frontend</label>
                    <input
                      type="number"
                      value={techForm.effortFrontendDays || 0}
                      onChange={(e) => setTechForm({ ...techForm, effortFrontendDays: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded mt-1 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Backend & APIs</label>
                    <input
                      type="number"
                      value={techForm.effortBackendDays || 0}
                      onChange={(e) => setTechForm({ ...techForm, effortBackendDays: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded mt-1 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">QA & Testing</label>
                    <input
                      type="number"
                      value={techForm.effortQaDays || 0}
                      onChange={(e) => setTechForm({ ...techForm, effortQaDays: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded mt-1 font-bold"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-700 pt-2 border-t border-gray-200">
                  <span>
                    Total Team Days:{' '}
                    {(techForm.effortDiscoveryDays || 0) +
                      (techForm.effortDesignDays || 0) +
                      (techForm.effortFrontendDays || 0) +
                      (techForm.effortBackendDays || 0) +
                      (techForm.effortQaDays || 0)}{' '}
                    days
                  </span>
                  <span>
                    Internal Economic Labor Value:{' '}
                    {fmtSAR(
                      ((techForm.effortDiscoveryDays || 0) +
                        (techForm.effortDesignDays || 0) +
                        (techForm.effortFrontendDays || 0) +
                        (techForm.effortBackendDays || 0) +
                        (techForm.effortQaDays || 0)) *
                        (techForm.blendedDailyRateSAR || 600)
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reusable Internal BI Technology Components</label>
                <input
                  type="text"
                  value={techForm.reusableInternalComponents || ''}
                  onChange={(e) => setTechForm({ ...techForm, reusableInternalComponents: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. BI Technology Auth Service, UI Component Library"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Saudi Hosting Mandate Compliance</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="saudiHost"
                    checked={techForm.saudiHostingCompliant}
                    onChange={(e) => setTechForm({ ...techForm, saudiHostingCompliant: e.target.checked })}
                    className="w-4 h-4 text-[#315EE8]"
                  />
                  <label htmlFor="saudiHost" className="font-semibold text-gray-800">
                    Compliant with Saudi PDPL and CITC Data Residency (Riyadh Cloud Region)
                  </label>
                </div>
              </div>
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('step2')}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('prevStepBtn')}</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveTech}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('saveDraftBtn')}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveTech();
                    setActiveTab('step4');
                  }}
                  className="px-5 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>{t('nextStepBtn')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: FINANCIAL SIMULATOR & INVESTMENT ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === 'step4' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 4 — Deterministic Financial Modeling Engine</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculate unit economics, operating break-even customer count, investment payback horizon, and 3 scenarios.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Scenario Toggle */}
                <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs">
                  <button
                    onClick={() => setActiveScenario('downside')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeScenario === 'downside' ? 'bg-red-500 text-white shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Downside
                  </button>
                  <button
                    onClick={() => setActiveScenario('base')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeScenario === 'base' ? 'bg-[#315EE8] text-white shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Base Case
                  </button>
                  <button
                    onClick={() => setActiveScenario('upside')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeScenario === 'upside' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Upside
                  </button>
                </div>

                <button
                  onClick={handleSaveFinancial}
                  className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Financial Model</span>
                </button>
              </div>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {isRtl
                    ? 'يجب أن تثبت الحسابات تحقيق نقطة التعادل التشغيلي بأقل من 20 عميلاً نشطاً، مع استرداد ميزانية التحقق (≤ 25,000 ر.س) خلال أقل من 12 شهراً في السيناريو الأساسي.'
                    : 'The model must demonstrate break-even with under 20 paying customers and full payback of initial validation funds (≤ SAR 25,000) within 12 months under base case assumptions.'}
                </p>
              </div>
            </div>

            {/* Top 4 Financial Diagnostic Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Unit Contribution / Customer</span>
                <div className={`text-xl font-extrabold mt-1 tabular-nums ${currentScenarioOutputs.breakEven.isContributionPositive ? 'text-emerald-700' : 'text-red-600'}`}>
                  {fmtSAR(currentScenarioOutputs.breakEven.monthlyContributionPerCustomer)}/mo
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Margin: {currentScenarioOutputs.breakEven.contributionMarginPercent}%
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-[#315EE8] uppercase">Operating Break-Even</span>
                <div className="text-xl font-extrabold text-[#315EE8] mt-1 tabular-nums">
                  {currentScenarioOutputs.breakEven.operatingBreakEvenCustomers !== null
                    ? `${currentScenarioOutputs.breakEven.operatingBreakEvenCustomers} Customers`
                    : 'Unreachable'}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">To cover fixed costs</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Investment Payback</span>
                <div className="text-xl font-extrabold text-gray-900 mt-1 tabular-nums">
                  {currentScenarioOutputs.breakEven.investmentPaybackMonth !== null
                    ? `Month ${currentScenarioOutputs.breakEven.investmentPaybackMonth}`
                    : '> 24 Months'}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Cumulative cash recovery</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Year 1 Operating Profit</span>
                <div className="text-xl font-extrabold text-gray-900 mt-1 tabular-nums">
                  {fmtSAR(currentScenarioOutputs.summaryYear1.totalOperatingProfit)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Year 1 End MRR: {fmtSAR(currentScenarioOutputs.summaryYear1.endMrr)}
                </div>
              </div>
            </div>

            {/* Validation Warning Notice if Negative Contribution */}
            {!currentScenarioOutputs.breakEven.isContributionPositive && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs">
                <AlertOctagon className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <strong>Negative Unit Contribution Warning:</strong> Variable hosting and support costs exceed customer price. Every sale burns capital. The decision engine will block execution until unit economics are resolved.
                </div>
              </div>
            )}

            {/* Cash Flow Timeline Chart */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-xs text-gray-700 mb-2">24-Month Cumulative Cash Flow Curve ({activeScenario.toUpperCase()} SCENARIO)</h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentScenarioOutputs.monthlyProjections}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`SAR ${Number(val).toLocaleString()}`, 'Cumulative Cash Flow']}
                      contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="cumulativeCashFlow" stroke="#315EE8" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interactive Inputs Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Monthly Customer Price (SAR)</label>
                <input
                  type="number"
                  value={finForm.monthlyPricePerCustomer || 0}
                  onChange={(e) => setFinForm({ ...finForm, monthlyPricePerCustomer: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Monthly New Customer Ramp</label>
                <input
                  type="number"
                  value={finForm.monthlyNewCustomers || 0}
                  onChange={(e) => setFinForm({ ...finForm, monthlyNewCustomers: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Monthly Churn (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={finForm.monthlyChurnPercent || 0}
                  onChange={(e) => setFinForm({ ...finForm, monthlyChurnPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Variable Cloud / AI Cost (SAR/cust/mo)</label>
                <input
                  type="number"
                  value={finForm.variableHostingPerCustomer || 0}
                  onChange={(e) => setFinForm({ ...finForm, variableHostingPerCustomer: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Fixed Monthly Operating Costs (SAR/mo)</label>
                <input
                  type="number"
                  value={(finForm.fixedHostingAndTools || 0) + (finForm.fixedMarketingAndSales || 0) + (finForm.fixedMaintenanceAndLabor || 0) + (finForm.fixedGeneralAndAdmin || 0)}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setFinForm({
                      ...finForm,
                      fixedHostingAndTools: Math.round(total * 0.3),
                      fixedMarketingAndSales: Math.round(total * 0.4),
                      fixedMaintenanceAndLabor: Math.round(total * 0.2),
                      fixedGeneralAndAdmin: Math.round(total * 0.1),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Initial Cash Requirement (SAR)</label>
                <input
                  type="number"
                  value={(finForm.initialResearchAndDesignCash || 0) + (finForm.initialDevelopmentCash || 0) + (finForm.initialMarketingLaunchCash || 0) + (finForm.initialContingencyCash || 0)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFinForm({
                      ...finForm,
                      initialDevelopmentCash: val,
                      initialResearchAndDesignCash: 0,
                      initialMarketingLaunchCash: 0,
                      initialContingencyCash: 0,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('step3')}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('prevStepBtn')}</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveFinancial}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('saveDraftBtn')}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveFinancial();
                    setActiveTab('step5');
                  }}
                  className="px-5 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>{t('nextStepBtn')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: RISKS & 9 MANDATORY GATES */}
      {/* ========================================================================= */}
      {activeTab === 'step5' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 5 — 9 Mandatory Decision Gates</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Governance rule: High weighted score NEVER overrides a mandatory gate failure.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiRiskScan}
                  disabled={aiLoadingAction === 'risk'}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {aiLoadingAction === 'risk'
                      ? (language === 'ar' ? 'جارِ فحص المخاطر...' : 'Scanning...')
                      : (language === 'ar' ? 'فحص المخاطر التنظيمية (AI)' : 'Scan Regulatory Risks (AI)')}
                  </span>
                </button>
                <button
                  onClick={() => setShowAddRisk(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Risk</span>
                </button>
              </div>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {isRtl
                    ? 'قاعدة الحوكمة الصارمة: الدرجة الموزونة العالية لا تلغي إطلاقاً رسوب أي بوابة إلزامية. يجب التحقق من كافة البوابات التسع وتقديم الأدلة الميدانية قبل رفع التوصية للإدارة.'
                    : 'Strict Governance Rule: High weighted score NEVER overrides a mandatory gate failure. All 9 gates must be verified with audit evidence before management review.'}
                </p>
              </div>
            </div>

            {/* AI Staged Risks */}
            {step5AiRisks.length > 0 && (
              <div className="p-4 mt-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white uppercase">
                      AI Hypothesis
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {step5AiRisks.length} {language === 'ar' ? 'مخاطر تنظيمية وتقنية مرصودة' : 'Regulatory & Tech Risks Detected'}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep5AiRisks([])}
                    className="text-[11px] text-gray-500 hover:text-gray-800"
                  >
                    {language === 'ar' ? 'إخفاء' : 'Dismiss'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {step5AiRisks.map((rsk) => (
                    <div key={rsk.riskCode} className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{rsk.riskCode}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          {rsk.regulatoryBody || rsk.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700">{rsk.description}</p>
                      <p className="text-[10px] text-gray-500">
                        <strong className="text-gray-700">{language === 'ar' ? 'المعالجة:' : 'Mitigation:'}</strong>{' '}
                        {rsk.mitigation}
                      </p>
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddAiRiskToOpp(rsk)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{language === 'ar' ? 'إضافة للسجل' : 'Add to Register'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9 Gates List */}
            <div className="divide-y divide-gray-100 mt-4">
              {opp.mandatoryGates.map((gate) => (
                <div key={gate.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{gate.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {gate.category}
                      </span>
                      {gate.isCritical && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          CRITICAL GATE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Evidence: {gate.evidence || 'No audit evidence attached yet.'}
                    </div>
                  </div>

                  {/* Gate Status Toggle Selector */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateGate(gate.id, 'pass', gate.evidence || 'Verified compliant')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                        gate.status === 'pass'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => handleUpdateGate(gate.id, 'conditional_pass', gate.evidence || 'Conditional requirements')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                        gate.status === 'conditional_pass'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Conditional
                    </button>
                    <button
                      onClick={() => handleUpdateGate(gate.id, 'fail', gate.evidence || 'Failed criteria')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                        gate.status === 'fail'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Fail
                    </button>
                    <button
                      onClick={() => handleUpdateGate(gate.id, 'not_assessed', '')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                        gate.status === 'not_assessed'
                          ? 'bg-gray-300 text-gray-800'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Unassessed
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Register Table */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-xs text-gray-900 mb-3">Opportunity Risk Register</h4>
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Risk Description</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Mitigation Strategy</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {opp.risks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">
                        No specific risks logged.
                      </td>
                    </tr>
                  ) : (
                    opp.risks.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{r.riskCode}</td>
                        <td className="py-2.5 px-3 capitalize text-gray-600">{r.category}</td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium">{r.description}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{r.mitigation}</td>
                        <td className="py-2.5 px-3 capitalize font-semibold">{r.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('step4')}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('prevStepBtn')}</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
                  {t('stepOf').replace('{current}', '5')}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('step6')}
                  className="px-5 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <span>{t('nextStepBtn')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: BUSINESS DECISION & APPROVALS */}
      {/* ========================================================================= */}
      {activeTab === 'step6' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Step 6 — Business Decision & Management Approvals</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Synthesize weighted evaluation scores, mandatory gate status, and financial viability into an actionable decision.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunDecisionEngine}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#6484FF]" />
                  <span>Run Decision Engine</span>
                </button>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 mt-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-[#315EE8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{t('guidanceTitle')}</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  {isRtl
                    ? 'محرك القرار يجمع التقييم الموزون، ونتائج البوابات التسع، ونموذج التعادل المالي. بعد الحصول على التوصية، يقوم مدير المنتج برفع طلب الاعتماد للإدارة التنفيذية.'
                    : 'The decision engine synthesizes weighted criteria, 9 mandatory gate results, and break-even metrics. Once recommendations are generated, POs submit for formal executive sign-off.'}
                </p>
              </div>
            </div>

            {/* Recommendation Decision Memo Box */}
            <div className="mt-6 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E6EAF1]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-xl text-sm font-extrabold uppercase tracking-wide ${
                      opp.recommendation === 'EXECUTE'
                        ? 'bg-emerald-600 text-white'
                        : opp.recommendation === 'PILOT'
                        ? 'bg-[#315EE8] text-white'
                        : opp.recommendation === 'HOLD'
                        ? 'bg-amber-500 text-white'
                        : opp.recommendation === 'PARTNER'
                        ? 'bg-purple-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    RECOMMENDATION: {opp.recommendation}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    Overall Weighted Score: <strong>{opp.weightedScore}/100</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-700 leading-relaxed">
                <strong>Governance Evaluation Rationale:</strong>{' '}
                {opp.recommendation === 'EXECUTE'
                  ? 'All 9 mandatory gates passed, customer willingness-to-pay demonstrated with paid commitments, and positive unit economics confirmed.'
                  : opp.recommendation === 'PILOT'
                  ? 'Promising financial model and market attractiveness, but customer demand is unvalidated. Bounded pilot required to test willingness-to-pay before committing full capital.'
                  : opp.recommendation === 'HOLD'
                  ? 'Mandatory gate blocker flagged or partner agreement pending. Do not commit further funds until resolved.'
                  : 'Fails financial viability or structural compliance gates.'}
              </div>
            </div>

            {/* Approvals History & Management Action Area */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-xs text-gray-900 mb-3">Management Approval Records & Decisions</h4>

              {opp.approvals.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">
                  No approval requests submitted yet. Click &quot;Submit for Review&quot; above.
                </div>
              ) : (
                <div className="space-y-3">
                  {opp.approvals.map((appr) => (
                    <div
                      key={appr.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{appr.decisionType} Approval Request</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              appr.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appr.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {appr.status}
                          </span>
                        </div>
                        <div className="text-gray-600 mt-1">{appr.rationale}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Submitted by {appr.submittedBy} on {new Date(appr.submittedAt).toLocaleDateString()}
                          {appr.reviewedBy && ` · Decided by ${appr.reviewedBy} (${appr.conditions})`}
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      {appr.status === 'pending' && (currentUser.role === 'admin' || currentUser.role === 'management') && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowDecideModal(appr.id);
                              setDecideChoice('approved');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setShowDecideModal(appr.id);
                              setDecideChoice('rejected');
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sequential Step Footer */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('step5')}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('prevStepBtn')}</span>
              </button>
              <div className="flex items-center gap-3">
                <Link
                  href={`/reports?oppId=${opp.id}`}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6484FF]" />
                  <span>{isRtl ? 'عرض المذكرة الاستثمارية الرسمية ←' : 'View Decision Memorandum →'}</span>
                </Link>
                {opp.status.includes('pilot') && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('pilot')}
                    className="px-4 py-2.5 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <span>{t('pilotTab')}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILOT & LAUNCH CHECKLIST */}
      {/* ========================================================================= */}
      {activeTab === 'pilot' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Module 4 — Pilot Plan & Launch Readiness Checklist</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track pilot milestones, measurable KPIs, and pre-launch security & legal sign-offs.
                </p>
              </div>
            </div>

            {opp.pilotPlan && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                <span className="font-bold text-[#315EE8] uppercase text-[10px]">Active Pilot Configuration</span>
                <div className="font-semibold text-gray-900">{opp.pilotPlan.objective}</div>
                <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] text-gray-600">
                  <div>Target Customers: <strong>{opp.pilotPlan.targetCustomers}</strong></div>
                  <div>Duration: <strong>{opp.pilotPlan.durationDays} Days</strong></div>
                  <div>Budget: <strong>{fmtSAR(opp.pilotPlan.budgetSAR)}</strong></div>
                </div>
                <div className="text-[11px] text-gray-600 pt-1">
                  <strong>Success Criteria:</strong> {opp.pilotPlan.successCriteria}
                </div>
              </div>
            )}

            {/* Launch Checklist */}
            <div className="mt-6">
              <h4 className="font-bold text-xs text-gray-900 mb-3">Pre-Launch Verification Tasks</h4>
              <div className="space-y-2">
                {opp.launchChecklist.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="w-4 h-4 text-[#315EE8] rounded"
                      />
                      <span className={`font-semibold ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.taskName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                      <span>Assignee: {task.assigneeName}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-bold uppercase text-[9px]">
                        {task.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST-LAUNCH ACTUAL PERFORMANCE */}
      {/* ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Module 5 — Post-Launch Performance Actuals</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track actual monthly paying customers, MRR, cash collected, and direct costs vs approved forecast.
                </p>
              </div>
              <button
                onClick={() => setShowPerfModal(true)}
                className="px-4 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Monthly Actuals</span>
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Paying Customers</th>
                    <th className="py-2.5 px-3">Realized MRR</th>
                    <th className="py-2.5 px-3">Cash Collected</th>
                    <th className="py-2.5 px-3">Direct Costs</th>
                    <th className="py-2.5 px-3">Gross Margin</th>
                    <th className="py-2.5 px-3">Operating Result</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!opp.actualPerformance || opp.actualPerformance.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No monthly actuals recorded yet.
                      </td>
                    </tr>
                  ) : (
                    opp.actualPerformance.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{p.reportingMonth}</td>
                        <td className="py-2.5 px-3 font-semibold tabular-nums">{p.payingCustomers}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700 tabular-nums">{fmtSAR(p.mrrSAR)}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">{fmtSAR(p.cashCollectedSAR)}</td>
                        <td className="py-2.5 px-3 tabular-nums text-gray-600">{fmtSAR(p.directCostsSAR)}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-800">
                          {p.mrrSAR > 0 ? Math.round((p.grossProfitSAR / p.mrrSAR) * 100) : 0}%
                        </td>
                        <td className={`py-2.5 px-3 font-bold tabular-nums ${p.netOperatingResultSAR >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {fmtSAR(p.netOperatingResultSAR)}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{p.forecastVarianceNotes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddComp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-3">Add Competitor Benchmark</h3>
            <form onSubmit={handleAddCompetitor} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Competitor Name</label>
                <input
                  type="text"
                  required
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Observed Price (SAR)</label>
                  <input
                    type="number"
                    value={compForm.observedPriceSAR}
                    onChange={(e) => setCompForm({ ...compForm, observedPriceSAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Arabic Support</label>
                  <select
                    value={compForm.hasArabicSupport ? 'yes' : 'no'}
                    onChange={(e) => setCompForm({ ...compForm, hasArabicSupport: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="yes">Yes (Arabic Supported)</option>
                    <option value="no">No (English Only)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Main Weaknesses</label>
                <input
                  type="text"
                  value={compForm.mainWeaknesses}
                  onChange={(e) => setCompForm({ ...compForm, mainWeaknesses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. No WhatsApp integration, USD billing"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">BI Technology Differentiation Opportunity</label>
                <input
                  type="text"
                  value={compForm.differentiationOpportunity}
                  onChange={(e) => setCompForm({ ...compForm, differentiationOpportunity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. Local Saudi hosting + ZATCA e-invoice out of box"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddComp(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#315EE8] text-white rounded-lg font-bold"
                >
                  Save Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Approval Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">Submit Decision for Review</h3>
            <p className="text-gray-500 mb-4">
              Submit recommendation ({opp.recommendation}) to executive management for approval.
            </p>
            <form onSubmit={handleSubmitApproval} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Requested Budget (SAR)</label>
                <input
                  type="number"
                  value={submitRequestedBudget}
                  onChange={(e) => setSubmitRequestedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Decision Rationale</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize evidence and justification for management..."
                  value={submitRationale}
                  onChange={(e) => setSubmitRationale(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#315EE8] text-white rounded-lg font-bold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decide Modal */}
      {showDecideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Management Decision: {decideChoice.toUpperCase()}
            </h3>
            <p className="text-gray-500 mb-3">
              Sign off on investment case as {currentUser.name} ({currentUser.roleTitle}).
            </p>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Approval Conditions / Remarks</label>
              <textarea
                rows={3}
                placeholder="e.g. Approved subject to 2 signed pilot client agreements"
                value={decideConditions}
                onChange={(e) => setDecideConditions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none mb-3"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDecideModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecideApproval(showDecideModal)}
                className={`px-4 py-2 text-white rounded-lg font-bold ${
                  decideChoice === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {decideChoice === 'approved' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Performance Modal */}
      {showPerfModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-3">Log Post-Launch Monthly Actuals</h3>
            <form onSubmit={handleAddPerformance} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Month (YYYY-MM)</label>
                  <input
                    type="text"
                    required
                    value={perfForm.reportingMonth}
                    onChange={(e) => setPerfForm({ ...perfForm, reportingMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Paying Customers</label>
                  <input
                    type="number"
                    value={perfForm.payingCustomers}
                    onChange={(e) => setPerfForm({ ...perfForm, payingCustomers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Realized MRR (SAR)</label>
                  <input
                    type="number"
                    value={perfForm.mrrSAR}
                    onChange={(e) => setPerfForm({ ...perfForm, mrrSAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cash Collected (SAR)</label>
                  <input
                    type="number"
                    value={perfForm.cashCollectedSAR}
                    onChange={(e) => setPerfForm({ ...perfForm, cashCollectedSAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Variance Notes</label>
                <input
                  type="text"
                  value={perfForm.forecastVarianceNotes}
                  onChange={(e) => setPerfForm({ ...perfForm, forecastVarianceNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. 10% ahead of forecast"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPerfModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#315EE8] text-white rounded-lg font-bold"
                >
                  Save Monthly Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
