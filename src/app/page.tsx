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
      {/* Brand Hero Welcome Banner — Neomorphic White/Black/Blue */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-pressed text-[#315EE8] text-xs md:text-sm font-black border border-blue-200/60">
              <div className="p-1 rounded-full bg-white shadow-2xs">
                <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
              </div>
              <span>{isRtl ? 'بي آي للتكنولوجيا · منصة ذكاء الأعمال' : 'BI Technology · Business Intelligence'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight leading-tight">
              {isRtl ? 'اتخاذ القرارات الاستثمارية، بوضوح وموثوقية' : 'Decision-Making, Made Clearer.'}
            </h1>

            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-semibold">
              {isRtl
                ? 'تقييم فرص الإيرادات المتكررة والذكاء الاصطناعي في السوق السعودي بأدلة موثقة، ونمذجة مالية حتمية، وحوكمة صارمة للميزانيات (≤ 25,000 ر.س).'
                : 'Evaluate Saudi recurring-revenue & AI opportunities with verified market evidence, deterministic financial modeling, and strict capital discipline (≤ SAR 25,000 validation budgets).'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/opportunities?new=true"
                className="neu-btn-primary px-6 py-3 rounded-xl text-white text-sm font-black flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('newOpportunity')}</span>
              </Link>
              <Link
                href="/financial-simulator"
                className="neu-btn px-6 py-3 rounded-xl text-slate-800 text-sm font-black flex items-center gap-2 hover:text-[#315EE8]"
              >
                <ChartNoAxesCombined className="w-4 h-4 text-[#315EE8]" />
                <span>{t('financialSandbox')}</span>
              </Link>
            </div>
          </div>

          {/* Friendly Mascot Robot Showcase — Neomorphic Extruded Card */}
          <div className="neu-raised-hover flex items-center gap-4 lg:gap-6 bg-white p-4.5 rounded-3xl border border-white shadow-lg shrink-0">
            <div className="relative">
              <img
                src="/brand/mascot.png"
                alt="BI Technology Mascot"
                className="w-24 md:w-32 h-auto object-contain drop-shadow-[0_10px_20px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-300 animate-pulse" />
            </div>
            <div className="space-y-1.5 text-left">
              <div className="text-xs font-black text-[#315EE8] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#315EE8]" />
                <span>{isRtl ? 'المستشار الذكي نشط' : 'BI Advisor Active'}</span>
              </div>
              <div className="font-black text-base md:text-lg text-black leading-tight">
                {isRtl ? 'فرصتان قيد التجربة المعتمدة' : '2 Active Pilots Underway'}
              </div>
              <div className="text-xs text-slate-700 font-bold space-y-1">
                <div>⚖️ <strong>LawOS 360</strong>: {isRtl ? 'تجارب 10 مكاتب محاماة' : '10 Law Firm Trials'}</div>
                <div>⚡ <strong>BITEX</strong>: {isRtl ? 'نظام ERP الذكي المتوافق مع زاتكا' : 'Autonomous ZATCA ERP'}</div>
              </div>
              <div className="pt-1 text-[11px] text-blue-900 font-black neu-pressed px-2.5 py-1 rounded-md inline-block">
                {isRtl ? 'سقف الميزانية: ≤ 25,000 ر.س' : 'Budget Disciplined: ≤ SAR 25,000'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BI Technology 4-Stage Investment Framework — Neomorphic Obsidian Black */}
      <div className="neu-dark-raised text-white p-7 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm font-black text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('processBannerTitle')}</span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              {t('processBannerDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/opportunities?new=true"
              className="neu-btn-primary px-4 py-2 text-white text-xs md:text-sm font-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newOpportunity')}</span>
            </Link>
          </div>
        </div>

        {/* 4 Steps Horizontal Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="neu-dark-pressed p-4 rounded-2xl flex items-start gap-3.5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-cyan-400 font-black text-sm flex items-center justify-center shrink-0 border border-cyan-500/40">
              1
            </div>
            <div>
              <div className="text-sm font-black text-white">{isRtl ? 'تسجيل الفكرة' : '1. Idea Intake'}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">{isRtl ? 'حصر مشاكل العملاء' : 'Painful KSA problem'}</div>
            </div>
          </div>

          <div className="neu-dark-pressed p-4 rounded-2xl flex items-start gap-3.5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-500/40">
              2
            </div>
            <div>
              <div className="text-sm font-black text-white">{isRtl ? 'التحقق بالأدلة' : '2. 6-Step Validation'}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">{isRtl ? 'سوق، منافسين، مالية' : 'Market, comps, finance'}</div>
            </div>
          </div>

          <div className="neu-dark-pressed p-4 rounded-2xl flex items-start gap-3.5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-500/40">
              3
            </div>
            <div>
              <div className="text-sm font-black text-white">{isRtl ? 'بوابات الحوكمة 9' : '3. 9 Mandatory Gates'}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">{isRtl ? 'توقيع الإدارة المعتمد' : 'Zero bypass rules'}</div>
            </div>
          </div>

          <div className="neu-dark-pressed p-4 rounded-2xl flex items-start gap-3.5 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/30 text-cyan-300 font-black text-sm flex items-center justify-center shrink-0 border border-cyan-500/40">
              4
            </div>
            <div>
              <div className="text-sm font-black text-white">{isRtl ? 'تجربة مقيدة ≤ 25 ألف' : '4. Pilot Launch'}</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">{isRtl ? 'إيرادات متكررة ونقطة التعادل' : 'Break-even & MRR'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Executive Dashboard Metric Clusters — Neomorphic Raised Surfaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cluster 1: Pipeline Status & Velocity */}
        <div className="neu-raised p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{t('dashClusterPipeline')}</span>
            <span className="text-xs font-black px-2.5 py-1 rounded-full neu-pressed text-[#315EE8]">
              {totalCount} {isRtl ? 'فرص مسجلة' : 'Registered'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="neu-pressed p-3 rounded-2xl">
              <div className="text-2xl font-black text-black tabular-nums">{totalCount}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">{t('kpiTotalOpps')}</div>
            </div>
            <div className="neu-pressed p-3 rounded-2xl bg-[#e3eaf3]">
              <div className="text-2xl font-black text-[#315EE8] tabular-nums">{underEvaluationCount}</div>
              <div className="text-xs font-bold text-blue-800 mt-1">{t('kpiUnderEval')}</div>
            </div>
            <div className={`neu-pressed p-3 rounded-2xl ${attentionItems.length > 0 ? 'bg-amber-100/50' : ''}`}>
              <div className={`text-2xl font-black tabular-nums ${attentionItems.length > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                {attentionItems.length}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-1">{t('kpiAttentionNeeded')}</div>
            </div>
          </div>
        </div>

        {/* Cluster 2: Capital Allocation & Exposure */}
        <div className="neu-raised p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{t('dashClusterCapital')}</span>
            <span className="text-xs font-black px-2.5 py-1 rounded-full neu-pressed text-emerald-800">
              ≤ SAR 25k Cap
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="neu-pressed p-3 rounded-2xl">
              <div className="text-xs font-bold text-slate-600">{t('kpiProposedBudget')}</div>
              <div className="text-sm md:text-base font-black text-black mt-1 tabular-nums truncate">{fmtSAR(totalProposedBudget)}</div>
            </div>
            <div className="neu-pressed p-3 rounded-2xl bg-[#e3eaf3]">
              <div className="text-xs font-bold text-blue-800">{t('kpiApprovedBudget')}</div>
              <div className="text-sm md:text-base font-black text-[#315EE8] mt-1 tabular-nums truncate">{fmtSAR(totalApprovedBudget)}</div>
            </div>
            <div className="neu-pressed p-3 rounded-2xl bg-emerald-50">
              <div className="text-xs font-bold text-emerald-800">{t('kpiActualSpend')}</div>
              <div className="text-sm md:text-base font-black text-emerald-900 mt-1 tabular-nums truncate">{fmtSAR(totalActualExpenditure)}</div>
            </div>
          </div>
          {/* Progress against cap */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-bold">
              <span>{t('dashCapLimitNote')}</span>
              <span className="font-black text-black">
                {totalApprovedBudget > 0 ? Math.round((totalActualExpenditure / totalApprovedBudget) * 100) : 0}%
              </span>
            </div>
            <div className="neu-pressed-deep w-full h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#315EE8] to-cyan-500 h-full rounded-full transition-all duration-500 shadow-sm"
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
        <div className="neu-raised p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{t('dashClusterReturns')}</span>
            <span className="text-xs font-black px-2.5 py-1 rounded-full neu-pressed text-blue-900">
              {isRtl ? 'إيرادات متكررة' : 'Recurring Billing'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="neu-pressed p-3 rounded-2xl bg-emerald-50">
              <div className="text-2xl font-black text-[#159769] tabular-nums">
                {activeProductsCount + pilotApprovedCount}
              </div>
              <div className="text-xs font-bold text-emerald-800 mt-1">
                {isRtl ? 'منتجات وتجارب' : 'Products & Pilots'}
              </div>
            </div>
            <div className="neu-pressed p-3 rounded-2xl bg-emerald-50">
              <div className="text-sm md:text-base font-black text-[#159769] mt-1 tabular-nums truncate">{fmtSAR(totalCurrentMRR)}</div>
              <div className="text-xs font-bold text-emerald-800 mt-1">{t('kpiCurrentMRR')}</div>
            </div>
            <div className="neu-pressed p-3 rounded-2xl bg-emerald-50">
              <div className="text-2xl font-black text-[#159769] tabular-nums">{actualGrossMargin}%</div>
              <div className="text-xs font-bold text-emerald-800 mt-1">{t('kpiGrossMargin')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Executive Decision Queue — Neomorphic Card */}
      <div className="neu-raised p-6 rounded-3xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-5 h-5 ${attentionItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
            <h3 className="text-base font-black text-black">{t('executiveDecisionQueue')}</h3>
            {attentionItems.length > 0 ? (
              <span className="neu-pressed px-3 py-0.5 rounded-full text-amber-900 text-xs font-black">
                {attentionItems.length} {isRtl ? 'تتطلب قرار' : 'Pending'}
              </span>
            ) : (
              <span className="neu-pressed px-3 py-0.5 rounded-full text-emerald-900 text-xs font-black">
                {isRtl ? 'مكتمل' : 'All Clear'}
              </span>
            )}
          </div>
          <Link
            href="/opportunities"
            className="text-sm text-[#315EE8] font-black hover:underline"
          >
            {isRtl ? 'عرض سجل الفرص كامل ←' : 'View Full Register →'}
          </Link>
        </div>

        {attentionItems.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {attentionItems.map((opp) => (
              <div key={opp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="neu-pressed text-xs font-black px-2.5 py-1 text-slate-800 uppercase">
                    {opp.id}
                  </span>
                  <div>
                    <div className="text-sm font-black text-black">{opp.name}</div>
                    <div className="text-xs text-amber-900 flex items-center gap-1 mt-0.5 font-bold">
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
                  className="neu-btn px-4 py-2 text-[#315EE8] text-xs md:text-sm font-black inline-flex items-center gap-1.5 self-start sm:self-auto hover:text-blue-800"
                >
                  <span>{t('actionReviewNow')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-slate-600 font-bold">
            {t('queueEmpty')}
          </div>
        )}
      </div>

      {/* Main Charts Grid — Neomorphic Surfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Forecast vs Actual Spend Chart */}
          <div className="neu-raised p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-base text-black">{t('timelineTitle')}</h3>
                <p className="text-xs md:text-sm text-slate-600 font-semibold">{t('timelineSubtitle')}</p>
              </div>
              <span className="neu-pressed text-xs font-black text-emerald-800 px-3 py-1 rounded-full">
                {t('mrrGrowing')}
              </span>
            </div>

            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0B0F17', color: '#fff', borderRadius: '12px', fontSize: '13px', border: '1px solid #334155' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', fontWeight: 700 }} />
                  <Line type="monotone" dataKey="forecastMRR" name={t('forecastMRR')} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualMRR" name={t('actualMRR')} stroke="#159769" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actualSpend" name={t('actualCashSpend')} stroke="#315EE8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Allocation by Opportunity */}
          <div className="neu-raised p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-base text-black">{t('budgetAllocTitle')}</h3>
                <p className="text-xs md:text-sm text-slate-600 font-semibold">{t('budgetAllocSubtitle')}</p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetAllocationData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0B0F17', color: '#fff', borderRadius: '12px', fontSize: '13px', border: '1px solid #334155' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', fontWeight: 700 }} />
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
          <div className="neu-raised p-6 rounded-3xl border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-black text-base mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>{t('attentionPanelTitle')}</span>
            </div>

            <div className="space-y-3">
              {attentionItems.length === 0 ? (
                <div className="text-sm text-slate-600 py-3 text-center font-bold">
                  {t('noBlockers')}
                </div>
              ) : (
                attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="neu-pressed block p-3.5 rounded-2xl hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center justify-between text-sm font-black text-black">
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="text-xs text-amber-950 mt-1 font-bold">
                      {item.status === 'on_hold'
                        ? (language === 'ar' ? 'الحالة: معلق — بانتظار اتفاقية الشريك' : 'Status: On Hold — Partner agreement pending')
                        : item.mandatoryGates.some((g) => g.status === 'fail')
                        ? (language === 'ar' ? 'فشل بوابة إلزامية: فحص الامتثال / اقتصاديات الوحدة' : 'Mandatory Gate Failure: Compliance / Unit economics check failed')
                        : (language === 'ar' ? 'طلب عملاء غير موثق: 0 التزامات تجارب مدفوعة' : 'Unvalidated Customer Demand: 0 paid pilot commitments')}
                    </div>
                    <div className="text-xs text-slate-600 mt-2 flex items-center justify-between font-bold">
                      <span>{item.id}</span>
                      <span className="text-amber-800 font-black">{t('btnReviewRecord')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Stage Distribution */}
          <div className="neu-raised p-6 rounded-3xl">
            <h3 className="font-black text-base text-black mb-1">{t('lifecycleDistTitle')}</h3>
            <p className="text-xs md:text-sm text-slate-600 font-semibold mb-4">{t('lifecycleDistSubtitle')}</p>

            <div className="space-y-3.5">
              {stageData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-black text-slate-800">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="neu-pressed-deep w-24 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(s.count / Math.max(opportunities.length, 1)) * 100}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                    <span className="font-black text-black tabular-nums w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Opportunities Table Section — Neomorphic Card */}
      <div className="neu-raised rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-black">{t('trackedOppsTitle')}</h3>
            <p className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">
              {t('trackedOppsSubtitle')}
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="neu-btn text-xs md:text-sm px-3.5 py-2 font-black text-slate-800 outline-none"
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
              className="neu-btn text-xs md:text-sm px-3.5 py-2 font-black text-slate-800 outline-none"
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
              className="text-xs md:text-sm text-[#315EE8] font-black hover:underline ml-2"
            >
              {t('btnViewFullRegister')}
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#E8EEF6] text-slate-700 uppercase tracking-wider font-black text-xs border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-2xl neu-raised text-[#315EE8] flex items-center justify-center mx-auto">
                        <Layers3 className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-black text-black">{t('emptySearchTitle')}</h4>
                      <p className="text-xs md:text-sm text-slate-600 font-semibold">{t('emptySearchDesc')}</p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Link
                          href="/opportunities?new=true"
                          className="neu-btn-primary px-6 py-2.5 text-white text-xs md:text-sm font-black"
                        >
                          {t('createFirstOpp')}
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/opportunities/${o.id}`} className="font-black text-black group-hover:text-[#315EE8] block text-sm md:text-base">
                        {o.name}
                      </Link>
                      <div className="text-xs text-slate-600 mt-0.5 font-bold">
                        {o.id} · {o.targetCustomerSegment}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="neu-pressed inline-block px-3 py-1 font-black text-slate-800 uppercase text-xs">
                        {o.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="neu-pressed-deep w-20 h-2 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full ${
                              o.weightedScore >= 75 ? 'bg-emerald-600' : o.weightedScore >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${o.weightedScore}%` }}
                          />
                        </div>
                        <span className="font-black text-black tabular-nums text-sm">
                          {o.weightedScore ? `${o.weightedScore}/100` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 tabular-nums font-black text-slate-900 text-sm">
                      {fmtSAR(o.proposedValidationBudgetSAR)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                          o.recommendation === 'EXECUTE'
                            ? 'neu-pressed text-emerald-900 border border-emerald-300'
                            : o.recommendation === 'PILOT'
                            ? 'neu-pressed text-blue-900 border border-blue-300'
                            : o.recommendation === 'HOLD'
                            ? 'neu-pressed text-amber-900 border border-amber-300'
                            : o.recommendation === 'PARTNER'
                            ? 'neu-pressed text-purple-900 border border-purple-300'
                            : 'neu-pressed text-red-900 border border-red-300'
                        }`}
                      >
                        {t(`rec${o.recommendation}`) || o.recommendation}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize text-slate-900 font-extrabold text-xs md:text-sm">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="neu-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[#315EE8] font-black text-xs md:text-sm hover:text-blue-800"
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
