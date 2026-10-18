'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers3,
  CircleDollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock3,
  SlidersHorizontal,
  Plus,
  ShieldAlert,
  Search,
  Building2,
  Calendar,
  Sparkles,
  ChartNoAxesCombined,
  ShieldCheck,
  Scale,
  Bot,
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
import { useApp } from '@/components/providers/AppProvider';

export default function ExecutiveDashboard() {
  const { isDemoMode, showToast, t, fmtCurrency, direction, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOpportunities(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter((o) => {
    if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  // Calculate the 10 KPIs
  const totalCount = opportunities.length;
  const underEvaluationCount = opportunities.filter((o) => o.status === 'evaluation' || o.status === 'discovery').length;
  const pilotApprovedCount = opportunities.filter((o) => o.status === 'pilot_approved' || o.status === 'pilot_in_progress').length;
  const activeProductsCount = opportunities.filter((o) => o.status === 'active' || o.status === 'approved_for_launch').length;

  const totalProposedBudget = opportunities.reduce((s, o) => s + (o.proposedValidationBudgetSAR || 0), 0);
  const totalApprovedBudget = opportunities.reduce((s, o) => s + (o.approvedBudgetSAR || 0), 0);

  // Actual expenditure and MRR from monthly performance
  let totalActualExpenditure = 0;
  let totalCurrentMRR = 0;
  let totalDirectCosts = 0;
  let totalGrossProfit = 0;
  let totalRevenueActual = 0;

  for (const o of opportunities) {
    if (o.actualPerformance && o.actualPerformance.length > 0) {
      const latest = o.actualPerformance[o.actualPerformance.length - 1];
      totalCurrentMRR += latest.mrrSAR;
      for (const p of o.actualPerformance) {
        totalActualExpenditure += p.operatingCostsSAR + p.directCostsSAR;
        totalDirectCosts += p.directCostsSAR;
        totalGrossProfit += p.grossProfitSAR;
        totalRevenueActual += p.mrrSAR;
      }
    }
  }

  const actualGrossMargin = totalRevenueActual > 0
    ? Math.round((totalGrossProfit / totalRevenueActual) * 100)
    : 0;

  // Attention Items
  const attentionItems = opportunities.filter((o) => {
    const hasGateFailures = o.mandatoryGates?.some((g) => g.status === 'fail');
    const hasUnvalidatedDemand = o.marketAssessment?.paidPilotCommitments === 0 && o.status === 'evaluation';
    const isHold = o.status === 'on_hold';
    return hasGateFailures || hasUnvalidatedDemand || isHold;
  });

  // Stage Distribution Data
  const stageData = [
    { name: t('statusDiscovery'), count: opportunities.filter((o) => o.status === 'discovery' || o.status === 'idea').length, color: '#94A3B8' },
    { name: t('statusEvaluation'), count: opportunities.filter((o) => o.status === 'evaluation').length, color: '#6484FF' },
    { name: t('recPILOT'), count: pilotApprovedCount, color: '#315EE8' },
    { name: t('statusActive'), count: activeProductsCount, color: '#159769' },
    { name: t('statusOnHold'), count: opportunities.filter((o) => o.status === 'on_hold').length, color: '#D99A2B' },
    { name: t('statusRejected'), count: opportunities.filter((o) => o.status === 'rejected' || o.status === 'discontinued').length, color: '#D95360' },
  ].filter((s) => s.count > 0);

  // Budget Allocation Data
  const budgetAllocationData = opportunities.map((o) => ({
    name: o.name.length > 15 ? o.name.slice(0, 15) + '…' : o.name,
    proposed: o.proposedValidationBudgetSAR,
    approved: o.approvedBudgetSAR,
  }));

  // Forecast vs Actual Comparison
  const monthlyTimeline = [
    { month: 'Jul 26', forecastMRR: 0, actualMRR: 0, forecastSpend: 5000, actualSpend: 3200 },
    { month: 'Aug 26', forecastMRR: 0, actualMRR: 0, forecastSpend: 9000, actualSpend: 8400 },
    { month: 'Sep 26', forecastMRR: 1200, actualMRR: 1300, forecastSpend: 12000, actualSpend: 11500 },
    { month: 'Oct 26', forecastMRR: 2800, actualMRR: 3900, forecastSpend: 14000, actualSpend: 13800 },
    { month: 'Nov 26 (F)', forecastMRR: 5200, actualMRR: null, forecastSpend: 16000, actualSpend: null },
    { month: 'Dec 26 (F)', forecastMRR: 8500, actualMRR: null, forecastSpend: 18000, actualSpend: null },
  ];

  const fmtSAR = fmtCurrency;

  return (
    <div className="space-y-8">
      {/* Brand Hero Welcome Banner with Mascot & Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/70 shadow-xl p-6 md:p-8">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-xs md:text-sm font-bold shadow-2xs">
              <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
              <span>{isRtl ? 'بي آي للتكنولوجيا · منصة ذكاء الأعمال' : 'BI Technology · Business Intelligence'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {isRtl ? 'اتخاذ القرارات الاستثمارية، بوضوح وموثوقية' : 'Decision-Making, Made Clearer.'}
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
              {isRtl
                ? 'تقييم فرص الإيرادات المتكررة والذكاء الاصطناعي في السوق السعودي بأدلة موثقة، ونمذجة مالية حتمية، وحوكمة صارمة للميزانيات (≤ 25,000 ر.س).'
                : 'Evaluate Saudi recurring-revenue & AI opportunities with verified market evidence, deterministic financial modeling, and strict capital discipline (≤ SAR 25,000 validation budgets).'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/opportunities?new=true"
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 polymorphic-btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>{t('newOpportunity')}</span>
              </Link>
              <Link
                href="/financial-simulator"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-800 text-sm font-bold hover:bg-white transition-all flex items-center gap-2 shadow-xs polymorphic-btn"
              >
                <ChartNoAxesCombined className="w-4 h-4 text-[#315EE8]" />
                <span>{t('financialSandbox')}</span>
              </Link>
            </div>
          </div>

          {/* Friendly Mascot Robot Showcase Card */}
          <div className="flex items-center gap-4 lg:gap-6 bg-gradient-to-br from-white/95 to-blue-50/80 p-4 rounded-2xl border border-white shadow-lg shrink-0 polymorphic-card">
            <div className="relative">
              <img
                src="/brand/mascot.png"
                alt="BI Technology Mascot"
                className="w-24 md:w-32 h-auto object-contain drop-shadow-[0_10px_20px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-300 animate-pulse" />
            </div>
            <div className="space-y-1.5 text-left">
              <div className="text-xs font-extrabold text-cyan-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isRtl ? 'المستشار الذكي نشط' : 'BI Advisor Active'}</span>
              </div>
              <div className="font-extrabold text-base md:text-lg text-slate-900 leading-tight">
                {isRtl ? 'فرصتان قيد التجربة المعتمدة' : '2 Active Pilots Underway'}
              </div>
              <div className="text-xs text-slate-600 font-medium space-y-0.5">
                <div>⚖️ <strong>LawOS 360</strong>: {isRtl ? 'تجارب 10 مكاتب محاماة' : '10 Law Firm Trials'}</div>
                <div>⚡ <strong>BITEX</strong>: {isRtl ? 'نظام ERP الذكي المتوافق مع زاتكا' : 'Autonomous ZATCA ERP'}</div>
              </div>
              <div className="pt-1 text-[11px] text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded-md inline-block">
                {isRtl ? 'سقف الميزانية: ≤ 25,000 ر.س' : 'Budget Disciplined: ≤ SAR 25,000'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BI Technology 4-Stage Investment Framework Stepper Banner */}
      <div className="glass-panel-dark text-white p-6 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('processBannerTitle')}</span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('processBannerDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/opportunities?new=true"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#315EE8] to-cyan-600 text-white text-xs md:text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newOpportunity')}</span>
            </Link>
          </div>
        </div>

        {/* 4 Steps Horizontal Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-400 font-black text-sm flex items-center justify-center shrink-0 border border-cyan-500/30">
              1
            </div>
            <div>
              <div className="text-sm font-bold text-white">{isRtl ? 'تسجيل الفكرة' : '1. Idea Intake'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{isRtl ? 'حصر مشاكل العملاء' : 'Painful KSA problem'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-500/30">
              2
            </div>
            <div>
              <div className="text-sm font-bold text-white">{isRtl ? 'التحقق بالأدلة' : '2. 6-Step Validation'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{isRtl ? 'سوق، منافسين، مالية' : 'Market, comps, finance'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-500/30">
              3
            </div>
            <div>
              <div className="text-sm font-bold text-white">{isRtl ? 'بوابات الحوكمة 9' : '3. 9 Mandatory Gates'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{isRtl ? 'توقيع الإدارة المعتمد' : 'Zero bypass rules'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-sm flex items-center justify-center shrink-0 border border-cyan-500/30">
              4
            </div>
            <div>
              <div className="text-sm font-bold text-white">{isRtl ? 'تجربة مقيدة ≤ 25 ألف' : '4. Pilot Launch'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{isRtl ? 'إيرادات متكررة ونقطة التعادل' : 'Break-even & MRR'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Executive Dashboard Metric Clusters with Glassmorphism & Polymorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cluster 1: Pipeline Status & Velocity */}
        <div className="glass-panel polymorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">{t('dashClusterPipeline')}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#315EE8] border border-blue-200">
              {totalCount} {isRtl ? 'فرص مسجلة' : 'Registered'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalCount}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">{t('kpiTotalOpps')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <div className="text-2xl font-extrabold text-[#315EE8] tabular-nums">{underEvaluationCount}</div>
              <div className="text-xs font-bold text-blue-700 mt-1">{t('kpiUnderEval')}</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${attentionItems.length > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50/80 border-slate-200/80'}`}>
              <div className={`text-2xl font-extrabold tabular-nums ${attentionItems.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {attentionItems.length}
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1">{t('kpiAttentionNeeded')}</div>
            </div>
          </div>
        </div>

        {/* Cluster 2: Capital Allocation & Exposure */}
        <div className="glass-panel polymorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">{t('dashClusterCapital')}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ≤ SAR 25k Cap
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-500">{t('kpiProposedBudget')}</div>
              <div className="text-sm md:text-base font-extrabold text-slate-900 mt-1.5 tabular-nums truncate">{fmtSAR(totalProposedBudget)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <div className="text-xs font-bold text-blue-700">{t('kpiApprovedBudget')}</div>
              <div className="text-sm md:text-base font-extrabold text-[#315EE8] mt-1.5 tabular-nums truncate">{fmtSAR(totalApprovedBudget)}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="text-xs font-bold text-emerald-700">{t('kpiActualSpend')}</div>
              <div className="text-sm md:text-base font-extrabold text-emerald-800 mt-1.5 tabular-nums truncate">{fmtSAR(totalActualExpenditure)}</div>
            </div>
          </div>
          {/* Progress against cap */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
              <span>{t('dashCapLimitNote')}</span>
              <span className="font-bold text-slate-800">
                {totalApprovedBudget > 0 ? Math.round((totalActualExpenditure / totalApprovedBudget) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div
                className="bg-gradient-to-r from-[#315EE8] to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    totalApprovedBudget > 0 ? Math.round((totalActualExpenditure / totalApprovedBudget) * 100) : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Cluster 3: Commercial Traction & Returns */}
        <div className="glass-panel polymorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">{t('dashClusterReturns')}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              {isRtl ? 'إيرادات متكررة' : 'Recurring Billing'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="text-2xl font-extrabold text-[#159769] tabular-nums">
                {activeProductsCount + pilotApprovedCount}
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-1">
                {isRtl ? 'منتجات وتجارب' : 'Products & Pilots'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="text-sm md:text-base font-extrabold text-[#159769] mt-1.5 tabular-nums truncate">{fmtSAR(totalCurrentMRR)}</div>
              <div className="text-xs font-bold text-emerald-700 mt-1">{t('kpiCurrentMRR')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="text-2xl font-extrabold text-[#159769] tabular-nums">{actualGrossMargin}%</div>
              <div className="text-xs font-bold text-emerald-700 mt-1">{t('kpiGrossMargin')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Executive Decision Queue */}
      <div className="glass-panel polymorphic-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-5 h-5 ${attentionItems.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <h3 className="text-base font-bold text-slate-900">{t('executiveDecisionQueue')}</h3>
            {attentionItems.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {attentionItems.length} {isRtl ? 'تتطلب قرار' : 'Pending'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                {isRtl ? 'مكتمل' : 'All Clear'}
              </span>
            )}
          </div>
          <Link
            href="/opportunities"
            className="text-sm text-[#315EE8] font-bold hover:underline"
          >
            {isRtl ? 'عرض سجل الفرص كامل ←' : 'View Full Register →'}
          </Link>
        </div>

        {attentionItems.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {attentionItems.map((opp) => (
              <div key={opp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 uppercase border border-slate-200">
                    {opp.id}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{opp.name}</div>
                    <div className="text-xs text-amber-800 flex items-center gap-1 mt-0.5 font-medium">
                      <span>•</span>
                      <span>
                        {opp.mandatoryGates?.some((g) => g.status === 'fail')
                          ? (isRtl ? 'يوجد فحص بوابة غير مجتاز' : 'Has unverified mandatory gate')
                          : (isRtl ? 'بانتظار اعتماد التجربة أو معلق' : 'Pending executive pilot approval or on hold')}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-[#315EE8] hover:bg-blue-100 text-xs md:text-sm font-bold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto polymorphic-btn"
                >
                  <span>{t('actionReviewNow')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-slate-500 font-medium">
            {t('queueEmpty')}
          </div>
        )}
      </div>

      {/* Main Charts & Attention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Forecast vs Actual Spend Chart */}
          <div className="glass-panel polymorphic-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('timelineTitle')}</h3>
                <p className="text-xs md:text-sm text-slate-500">{t('timelineSubtitle')}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t('mrrGrowing')}
              </span>
            </div>

            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="forecastMRR" name={t('forecastMRR')} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualMRR" name={t('actualMRR')} stroke="#159769" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actualSpend" name={t('actualCashSpend')} stroke="#315EE8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Allocation by Opportunity */}
          <div className="glass-panel polymorphic-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('budgetAllocTitle')}</h3>
                <p className="text-xs md:text-sm text-slate-500">{t('budgetAllocSubtitle')}</p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetAllocationData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="proposed" name={t('proposedValBudget')} fill="#94A3B8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="approved" name={t('approvedBudget')} fill="#315EE8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Attention Panel & Stage Breakdown */}
        <div className="space-y-6">
          {/* Attention Panel */}
          <div className="glass-panel polymorphic-card p-6 rounded-2xl border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>{t('attentionPanelTitle')}</span>
            </div>

            <div className="space-y-3">
              {attentionItems.length === 0 ? (
                <div className="text-sm text-slate-500 py-3 text-center font-medium">
                  {t('noBlockers')}
                </div>
              ) : (
                attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="block p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition-all"
                  >
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="text-xs text-amber-900 mt-1 font-medium">
                      {item.status === 'on_hold'
                        ? (language === 'ar' ? 'الحالة: معلق — بانتظار اتفاقية الشريك' : 'Status: On Hold — Partner agreement pending')
                        : item.mandatoryGates.some((g) => g.status === 'fail')
                        ? (language === 'ar' ? 'فشل بوابة إلزامية: فحص الامتثال / اقتصاديات الوحدة' : 'Mandatory Gate Failure: Compliance / Unit economics check failed')
                        : (language === 'ar' ? 'طلب عملاء غير موثق: 0 التزامات تجارب مدفوعة' : 'Unvalidated Customer Demand: 0 paid pilot commitments')}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center justify-between font-semibold">
                      <span>{item.id}</span>
                      <span className="text-amber-800 font-bold">{t('btnReviewRecord')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Stage Distribution */}
          <div className="glass-panel polymorphic-card p-6 rounded-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-1">{t('lifecycleDistTitle')}</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-4">{t('lifecycleDistSubtitle')}</p>

            <div className="space-y-3">
              {stageData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-bold text-slate-700">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(s.count / Math.max(opportunities.length, 1)) * 100}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                    <span className="font-extrabold text-slate-900 tabular-nums w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Opportunities Table Section */}
      <div className="glass-panel polymorphic-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{t('trackedOppsTitle')}</h3>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {t('trackedOppsSubtitle')}
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-700 outline-none shadow-2xs"
            >
              <option value="all">{t('allCategories')}</option>
              <option value="saas">{t('catSaaS')}</option>
              <option value="ai_agent">{t('catAIAgent')}</option>
              <option value="custom_software">{t('catCustomSoftware')}</option>
              <option value="partnership">{t('catPartnership')}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs md:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-700 outline-none shadow-2xs"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="discovery">{t('statusDiscovery')}</option>
              <option value="evaluation">{t('statusEvaluation')}</option>
              <option value="pilot_approved">{t('statusPilotApproved')}</option>
              <option value="approved_for_launch">{t('statusApprovedForLaunch')}</option>
              <option value="on_hold">{t('statusOnHold')}</option>
              <option value="rejected">{t('statusRejected')}</option>
            </select>

            <Link
              href="/opportunities"
              className="text-xs md:text-sm text-[#315EE8] font-extrabold hover:underline ml-2"
            >
              {t('btnViewFullRegister')}
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider font-extrabold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">{t('thOpportunity')}</th>
                <th className="py-4 px-4">{t('thCategory')}</th>
                <th className="py-4 px-4">{t('thWeightedScore')}</th>
                <th className="py-4 px-4">{t('thValidationBudget')}</th>
                <th className="py-4 px-4">{t('thRecommendation')}</th>
                <th className="py-4 px-4">{t('thStatus')}</th>
                <th className="py-4 px-6 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#315EE8] flex items-center justify-center mx-auto border border-blue-200">
                        <Layers3 className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{t('emptySearchTitle')}</h4>
                      <p className="text-xs md:text-sm text-slate-500">{t('emptySearchDesc')}</p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Link
                          href="/opportunities?new=true"
                          className="px-5 py-2.5 bg-[#315EE8] text-white rounded-xl text-xs md:text-sm font-bold hover:bg-[#274ec4] transition-all shadow-md polymorphic-btn-primary"
                        >
                          {t('createFirstOpp')}
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/opportunities/${o.id}`} className="font-extrabold text-slate-900 group-hover:text-[#315EE8] block text-sm md:text-base">
                        {o.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">
                        {o.id} · {o.targetCustomerSegment}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 uppercase text-xs border border-slate-200/60">
                        {o.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full rounded-full ${
                              o.weightedScore >= 75 ? 'bg-emerald-600' : o.weightedScore >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${o.weightedScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                          {o.weightedScore ? `${o.weightedScore}/100` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 tabular-nums font-bold text-slate-800 text-sm">
                      {fmtSAR(o.proposedValidationBudgetSAR)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                          o.recommendation === 'EXECUTE'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : o.recommendation === 'PILOT'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : o.recommendation === 'HOLD'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : o.recommendation === 'PARTNER'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        {t(`rec${o.recommendation}`) || o.recommendation}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize text-slate-800 font-bold text-xs md:text-sm">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#315EE8] font-bold text-xs md:text-sm hover:bg-blue-100 transition-all polymorphic-btn"
                      >
                        <span>{t('btnWorkspace')}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
