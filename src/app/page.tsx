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
  PieChart,
  Pie,
  Cell,
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

  // Forecast vs Actual Comparison (Aggregate for portfolio)
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('executivePortfolio')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            {t('decisionMakingClearer')}
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/financial-simulator"
            className="px-4 py-2.5 rounded-xl border border-[#E6EAF1] bg-white text-xs font-bold text-[#172033] hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-xs"
          >
            <ChartNoAxesCombined className="w-4 h-4 text-[#315EE8]" />
            <span>{t('financialSandbox')}</span>
          </Link>
          <Link
            href="/opportunities?new=true"
            className="px-4 py-2.5 rounded-xl bg-[#315EE8] hover:bg-[#274ec4] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newOpportunity')}</span>
          </Link>
        </div>
      </div>

      {/* 10 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#778397] uppercase">{t('kpiTotalOpps')}</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1 tabular-nums">
            {totalCount.toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('kpiSubAllStages')}</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#6484FF] uppercase">{t('kpiUnderEval')}</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1 tabular-nums">
            {underEvaluationCount.toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('kpiSubActive6Step')}</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#315EE8] uppercase">{t('kpiPilotApproved')}</div>
          <div className="text-2xl font-extrabold text-[#315EE8] mt-1 tabular-nums">
            {pilotApprovedCount.toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('kpiSubBoundedTrials')}</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#159769] uppercase">{t('kpiActiveProducts')}</div>
          <div className="text-2xl font-extrabold text-[#159769] mt-1 tabular-nums">
            {activeProductsCount.toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('kpiSubCommercialized')}</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase">{t('kpiAttentionNeeded')}</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
            {attentionItems.length.toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{t('kpiSubBlockers')}</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#778397] uppercase">{t('kpiProposedBudget')}</div>
          <div className="text-lg font-bold text-[#172033] mt-1 tabular-nums">
            {fmtSAR(totalProposedBudget)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{t('kpiSubRequestedByPOs')}</div>
        </div>

        {/* KPI 7 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#315EE8] uppercase">{t('kpiApprovedBudget')}</div>
          <div className="text-lg font-bold text-[#315EE8] mt-1 tabular-nums">
            {fmtSAR(totalApprovedBudget)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{t('kpiSubAuthorizedByMgmt')}</div>
        </div>

        {/* KPI 8 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#778397] uppercase">{t('kpiActualSpend')}</div>
          <div className="text-lg font-bold text-[#172033] mt-1 tabular-nums">
            {fmtSAR(totalActualExpenditure)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{t('kpiSubRealizedCash')}</div>
        </div>

        {/* KPI 9 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#159769] uppercase">{t('kpiCurrentMRR')}</div>
          <div className="text-lg font-bold text-[#159769] mt-1 tabular-nums">
            {fmtSAR(totalCurrentMRR)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{t('kpiSubActiveBilling')}</div>
        </div>

        {/* KPI 10 */}
        <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs">
          <div className="text-[11px] font-bold text-[#159769] uppercase">{t('kpiGrossMargin')}</div>
          <div className="text-lg font-bold text-[#159769] mt-1 tabular-nums">
            {actualGrossMargin}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{t('kpiSubDirectMargin')}</div>
        </div>
      </div>

      {/* Main Charts & Attention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Forecast vs Actual Spend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#172033]">{t('timelineTitle')}</h3>
                <p className="text-xs text-[#778397]">{t('timelineSubtitle')}</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {t('mrrGrowing')}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="forecastMRR" name={t('forecastMRR')} stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} />
                  <Line type="monotone" dataKey="actualMRR" name={t('actualMRR')} stroke="#159769" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actualSpend" name={t('actualCashSpend')} stroke="#315EE8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Allocation by Opportunity */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#172033]">{t('budgetAllocTitle')}</h3>
                <p className="text-xs text-[#778397]">{t('budgetAllocSubtitle')}</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetAllocationData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="proposed" name={t('proposedValBudget')} fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name={t('approvedBudget')} fill="#315EE8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Attention Panel & Stage Breakdown */}
        <div className="space-y-6">
          {/* Attention Panel */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{t('attentionPanelTitle')}</span>
            </div>

            <div className="space-y-3">
              {attentionItems.length === 0 ? (
                <div className="text-xs text-gray-500 py-3 text-center">
                  {t('noBlockers')}
                </div>
              ) : (
                attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/opportunities/${item.id}`}
                    className="block p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 hover:bg-amber-100/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <div className="text-[11px] text-amber-900 mt-1">
                      {item.status === 'on_hold'
                        ? (language === 'ar' ? 'الحالة: معلق — بانتظار اتفاقية الشريك' : 'Status: On Hold — Partner agreement pending')
                        : item.mandatoryGates.some((g) => g.status === 'fail')
                        ? (language === 'ar' ? 'فشل بوابة إلزامية: فحص الامتثال / اقتصاديات الوحدة' : 'Mandatory Gate Failure: Compliance / Unit economics check failed')
                        : (language === 'ar' ? 'طلب عملاء غير موثق: 0 التزامات تجارب مدفوعة' : 'Unvalidated Customer Demand: 0 paid pilot commitments')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1.5 flex items-center justify-between">
                      <span>{item.id}</span>
                      <span className="font-semibold text-amber-800">{t('btnReviewRecord')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Stage Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6EAF1] shadow-xs">
            <h3 className="font-bold text-sm text-[#172033] mb-1">{t('lifecycleDistTitle')}</h3>
            <p className="text-xs text-[#778397] mb-4">{t('lifecycleDistSubtitle')}</p>

            <div className="space-y-2.5">
              {stageData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-medium text-gray-700">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(s.count / Math.max(opportunities.length, 1)) * 100}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 tabular-nums w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Opportunities Table Section */}
      <div className="bg-white rounded-2xl border border-[#E6EAF1] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6EAF1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#172033]">{t('trackedOppsTitle')}</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {t('trackedOppsSubtitle')}
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-[#F5F7FB] border border-[#E6EAF1] rounded-lg px-3 py-1.5 font-medium text-gray-700 outline-none"
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
              className="text-xs bg-[#F5F7FB] border border-[#E6EAF1] rounded-lg px-3 py-1.5 font-medium text-gray-700 outline-none"
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
              className="text-xs text-[#315EE8] font-bold hover:underline ml-2"
            >
              {t('btnViewFullRegister')}
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#778397] uppercase tracking-wider font-semibold border-b border-[#E6EAF1]">
              <tr>
                <th className="py-3 px-5">{t('thOpportunity')}</th>
                <th className="py-3 px-4">{t('thCategory')}</th>
                <th className="py-3 px-4">{t('thWeightedScore')}</th>
                <th className="py-3 px-4">{t('thValidationBudget')}</th>
                <th className="py-3 px-4">{t('thRecommendation')}</th>
                <th className="py-3 px-4">{t('thStatus')}</th>
                <th className="py-3 px-5 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAF1]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {t('noOpportunitiesFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-3.5 px-5">
                      <Link href={`/opportunities/${o.id}`} className="font-bold text-gray-900 group-hover:text-[#315EE8] block">
                        {o.name}
                      </Link>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {o.id} · {o.targetCustomerSegment}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 font-semibold text-gray-700 uppercase text-[10px]">
                        {o.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              o.weightedScore >= 75 ? 'bg-emerald-600' : o.weightedScore >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${o.weightedScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 tabular-nums">
                          {o.weightedScore ? `${o.weightedScore}/100` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-semibold text-gray-800">
                      {fmtSAR(o.proposedValidationBudgetSAR)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          o.recommendation === 'EXECUTE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.recommendation === 'PILOT'
                            ? 'bg-blue-100 text-blue-800'
                            : o.recommendation === 'HOLD'
                            ? 'bg-amber-100 text-amber-800'
                            : o.recommendation === 'PARTNER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t(`rec${o.recommendation}`) || o.recommendation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-gray-700 font-medium">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="inline-flex items-center gap-1 text-[#315EE8] font-bold hover:underline"
                      >
                        <span>{t('btnWorkspace')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
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
