'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
  Copy,
  Archive,
  ArrowUpRight,
  Filter,
  Building,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Columns3,
  ListFilter,
  ShieldAlert,
} from 'lucide-react';
import { Opportunity, ProductCategory, OpportunityStatus } from '@/lib/db/types';
import { useApp } from '@/components/providers/AppProvider';

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Loading opportunities register...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}

function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, showToast, t, fmtCurrency, language, isRtl } = useApp();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [quickFilter, setQuickFilter] = useState<'all' | 'needs_action' | 'high_priority'>('all');

  // New Opportunity Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'saas' as ProductCategory,
    businessProblem: '',
    proposedSolution: '',
    targetCustomerSegment: '',
    primaryGeography: 'Saudi Arabia',
    proposedValidationBudgetSAR: 15000,
    targetDecisionDate: '',
  });

  // Clone Modal
  const [cloneModalOpp, setCloneModalOpp] = useState<Opportunity | null>(null);
  const [cloneNewTitle, setCloneNewTitle] = useState('');

  const loadData = () => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOpportunities(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Opportunity "${data.data.name}" registered successfully.`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          category: 'saas',
          businessProblem: '',
          proposedSolution: '',
          targetCustomerSegment: '',
          primaryGeography: 'Saudi Arabia',
          proposedValidationBudgetSAR: 15000,
          targetDecisionDate: '',
        });
        loadData();
        router.push(`/opportunities/${data.data.id}`);
      } else {
        showToast(data.error || 'Failed to create opportunity');
      }
    } catch {
      showToast('Network error during opportunity creation');
    }
  };

  const handleClone = async () => {
    if (!cloneModalOpp || !cloneNewTitle.trim()) return;

    try {
      const res = await fetch(`/api/opportunities/${cloneModalOpp.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ newName: cloneNewTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Cloned opportunity created: ${data.data.name}`);
        setCloneModalOpp(null);
        setCloneNewTitle('');
        loadData();
        router.push(`/opportunities/${data.data.id}`);
      }
    } catch {
      showToast('Error cloning opportunity');
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;

    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        showToast(`Archived "${name}"`);
        loadData();
      }
    } catch {
      showToast('Error archiving opportunity');
    }
  };

  const filtered = opportunities.filter((o) => {
    if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (quickFilter === 'needs_action') {
      const hasGateFailures = o.mandatoryGates?.some((g) => g.status === 'fail');
      const hasZeroPilots = o.marketAssessment?.paidPilotCommitments === 0 && o.status === 'evaluation';
      const isHold = o.status === 'on_hold';
      if (!hasGateFailures && !hasZeroPilots && !isHold) return false;
    }
    if (quickFilter === 'high_priority' && (o.weightedScore || 0) < 70) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.targetCustomerSegment.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const kanbanColumns = [
    {
      id: 'idea',
      title: t('colIdea'),
      statusMatch: ['idea', 'discovery'],
      accent: 'border-t-gray-400',
      badgeBg: 'bg-gray-100 text-gray-700',
    },
    {
      id: 'evaluation',
      title: t('colUnderEval'),
      statusMatch: ['evaluation'],
      accent: 'border-t-[#6484FF]',
      badgeBg: 'bg-blue-50 text-[#315EE8]',
    },
    {
      id: 'decision_pending',
      title: t('colDecisionPending'),
      statusMatch: ['decision_pending', 'on_hold'],
      accent: 'border-t-amber-500',
      badgeBg: 'bg-amber-50 text-amber-800',
    },
    {
      id: 'pilot',
      title: t('colPilotApproved'),
      statusMatch: ['pilot_approved', 'pilot_in_progress'],
      accent: 'border-t-[#315EE8]',
      badgeBg: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'active',
      title: t('colActive'),
      statusMatch: ['active', 'approved_for_launch'],
      accent: 'border-t-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-800',
    },
  ];

  const fmtSAR = fmtCurrency;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <Layers3 className="w-3.5 h-3.5" />
            <span>{t('productRegisterPipeline')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            {t('productOppsRegister')}
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            {t('oppsRegisterSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#315EE8] hover:bg-[#274ec4] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newOpportunity')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-gray-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2 bg-[#F5F7FB] border border-[#E6EAF1] rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#315EE8] ${
              isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
            }`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-[#F5F7FB] border border-[#E6EAF1] rounded-lg px-3 py-2 font-medium text-gray-700 outline-none"
          >
            <option value="all">{t('allCategories')}</option>
            <option value="saas">{t('catSaaS')}</option>
            <option value="ai_agent">{t('catAIAgent')}</option>
            <option value="custom_software">{t('catCustomSoftware')}</option>
            <option value="partnership">{t('catPartnership')}</option>
            <option value="subscription_service">{t('catSubscriptionService')}</option>
            <option value="white_label">{t('catWhiteLabel')}</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-[#F5F7FB] border border-[#E6EAF1] rounded-lg px-3 py-2 font-medium text-gray-700 outline-none"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="idea">{t('statusIdea')}</option>
            <option value="discovery">{t('statusDiscovery')}</option>
            <option value="evaluation">{t('statusEvaluation')}</option>
            <option value="decision_pending">{t('statusDecisionPending')}</option>
            <option value="pilot_approved">{t('statusPilotApproved')}</option>
            <option value="approved_for_launch">{t('statusApprovedForLaunch')}</option>
            <option value="on_hold">{t('statusOnHold')}</option>
            <option value="rejected">{t('statusRejected')}</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 font-semibold"
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Subheader Toolbar with Quick Filters & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              quickFilter === 'all'
                ? 'bg-[#172033] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t('filterAll')} ({opportunities.length})
          </button>
          <button
            onClick={() => setQuickFilter('needs_action')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              quickFilter === 'needs_action'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('filterNeedsAction')}</span>
          </button>
          <button
            onClick={() => setQuickFilter('high_priority')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              quickFilter === 'high_priority'
                ? 'bg-[#315EE8] text-white shadow-xs'
                : 'bg-white text-[#315EE8] border border-blue-200 hover:bg-blue-50'
            }`}
          >
            {t('filterHighPriority')}
          </button>
        </div>

        {/* View Switcher: Kanban Board vs Table */}
        <div className="flex items-center bg-gray-200/80 p-1 rounded-xl self-start sm:self-auto border border-gray-300/60">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'board'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>{t('viewBoard')}</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{t('viewTable')}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colOpps = filtered.filter((o) => col.statusMatch.includes(o.status));
            return (
              <div
                key={col.id}
                className={`bg-[#F8FAFC] rounded-2xl border border-gray-200 border-t-4 ${col.accent} p-3.5 space-y-3 min-h-[420px] flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                    <span className="font-bold text-xs text-gray-800">{col.title}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                      {colOpps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    {colOpps.map((opp) => {
                      const gatesPassed = opp.mandatoryGates?.filter((g) => g.status === 'pass').length || 0;
                      return (
                        <div
                          key={opp.id}
                          className="bg-white p-3.5 rounded-xl border border-[#E6EAF1] shadow-2xs hover:shadow-md hover:border-[#315EE8]/40 transition-all duration-200 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                              {opp.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {opp.id}
                            </span>
                          </div>

                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="font-bold text-xs text-gray-900 hover:text-[#315EE8] block leading-snug line-clamp-2"
                          >
                            {opp.name}
                          </Link>

                          <div className="text-[11px] text-gray-500 line-clamp-1">
                            {opp.targetCustomerSegment || (isRtl ? 'منشآت سعودية' : 'Saudi SMEs')}
                          </div>

                          {/* Score & Gates Pill */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 font-bold text-gray-700">
                              <span className="text-[10px] text-gray-400">{t('cardGates')}</span>
                              <span className={gatesPassed === 9 ? 'text-emerald-700' : 'text-amber-700'}>
                                {gatesPassed}/9
                              </span>
                            </div>
                            <div className="font-extrabold tabular-nums px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-800 text-[10px]">
                              {opp.weightedScore ? `${opp.weightedScore}/100` : '—'}
                            </div>
                          </div>

                          {/* Budget & Open Link */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold text-gray-600 tabular-nums">
                              {fmtSAR(opp.proposedValidationBudgetSAR)}
                            </span>
                            <Link
                              href={`/opportunities/${opp.id}`}
                              className="text-[11px] font-bold text-[#315EE8] hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>{t('cardOpenWorkspace')}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {colOpps.length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-[11px] border border-dashed border-gray-200 rounded-xl">
                        {isRtl ? 'لا توجد فرص في هذه المرحلة' : 'No items in this stage'}
                      </div>
                    )}
                  </div>
                </div>

                {col.id === 'idea' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('newOpportunity')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: AUDIT TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E6EAF1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#778397] uppercase tracking-wider font-semibold border-b border-[#E6EAF1]">
                <tr>
                  <th className="py-3 px-5">{t('thOpportunity')}</th>
                  <th className="py-3 px-4">{t('thCategory')}</th>
                  <th className="py-3 px-4">{t('thValidationBudget')}</th>
                  <th className="py-3 px-4">{t('thWeightedScore')}</th>
                  <th className="py-3 px-4">{t('thRecommendation')}</th>
                  <th className="py-3 px-4">{t('thStatus')}</th>
                  <th className="py-3 px-5 text-right">{t('thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF1]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      {language === 'ar' ? 'جاري تحميل الفرص...' : 'Loading opportunities...'}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#315EE8] flex items-center justify-center mx-auto">
                          <Layers3 className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{t('emptySearchTitle')}</h4>
                        <p className="text-xs text-gray-500">{t('emptySearchDesc')}</p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-[#315EE8] text-white rounded-xl text-xs font-bold hover:bg-[#274ec4] transition-colors"
                          >
                            {t('createFirstOpp')}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-4 px-5">
                        <Link href={`/opportunities/${o.id}`} className="font-bold text-gray-900 group-hover:text-[#315EE8] block text-sm">
                          {o.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {o.id} · <span className="text-gray-600">{o.targetCustomerSegment || (language === 'ar' ? 'المنشآت السعودية الصغيرة والمتوسطة' : 'Saudi SMEs')}</span> · {language === 'ar' ? 'المسؤول' : 'Owner'}: {o.ownerName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 font-semibold text-gray-700 uppercase text-[10px]">
                          {o.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 tabular-nums font-semibold text-gray-900">
                        {fmtSAR(o.proposedValidationBudgetSAR)}
                      </td>
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
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
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 capitalize">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              o.status.includes('approved') || o.status === 'active'
                                ? 'bg-emerald-500'
                                : o.status === 'on_hold'
                                ? 'bg-amber-500'
                                : o.status === 'rejected'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setCloneModalOpp(o);
                              setCloneNewTitle(`${o.name} (${language === 'ar' ? 'نسخة بديلة' : 'Alternative Pricing/Market'})`);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title={t('cloneOpp')}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(o.id, o.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('archiveOpp')}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/opportunities/${o.id}`}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#315EE8] font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <span>{t('btnWorkspace')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-[#315EE8] uppercase tracking-wider">
                  {language === 'ar' ? 'سجل جديد' : 'New Record'}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{t('createOppModalTitle')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {t('productName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: منصة دعم تذاكر تقنية عبر الواتساب للمنشآت' : 'e.g. SME WhatsApp IT Ticketing Desk'}
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">{t('thCategory')}</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none bg-white"
                  >
                    <option value="saas">{t('catSaaS')}</option>
                    <option value="ai_agent">{t('catAIAgent')}</option>
                    <option value="custom_software">{t('catCustomSoftware')}</option>
                    <option value="partnership">{t('catPartnership')}</option>
                    <option value="white_label">{t('catWhiteLabel')}</option>
                    <option value="subscription_service">{t('catSubscriptionService')}</option>
                    <option value="other">{t('catOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">{t('valBudgetSAR')}</label>
                  <input
                    type="number"
                    max={25000}
                    value={createForm.proposedValidationBudgetSAR}
                    onChange={(e) => setCreateForm({ ...createForm, proposedValidationBudgetSAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none"
                  />
                  <span className="text-[10px] text-gray-400">
                    {language === 'ar' ? 'سقف ميزانية الفريق: 25,000 ر.س' : 'Team cap: SAR 25,000'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">{t('targetSegment')}</label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: شركات الخدمات اللوجستية والتجارة الإلكترونية المتوسطة بالسعودية' : 'e.g. Mid-sized Saudi logistics & e-commerce companies'}
                  value={createForm.targetCustomerSegment}
                  onChange={(e) => setCreateForm({ ...createForm, targetCustomerSegment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">{t('businessProblem')}</label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'ما هي المشكلة المحددة التي يعاني منها العميل حالياً؟' : 'What specific pain point does the customer experience today?'}
                  value={createForm.businessProblem}
                  onChange={(e) => setCreateForm({ ...createForm, businessProblem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">{t('proposedSolution')}</label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'كيف تعالج بي آي للتكنولوجيا هذه المشكلة بتميّز وميزة تنافسية؟' : 'How does BI Technology address this problem with differentiation?'}
                  value={createForm.proposedSolution}
                  onChange={(e) => setCreateForm({ ...createForm, proposedSolution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#315EE8] hover:bg-[#274ec4] text-white font-bold shadow-md shadow-blue-600/20"
                >
                  {t('registerOpportunity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {cloneModalOpp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">{t('cloneModalTitle')}</h3>
            <p className="text-gray-500 mb-4">
              {language === 'ar'
                ? `استنساخ "${cloneModalOpp.name}" لاختبار شريحة سوقية جديدة، أو فئات تسعير بديلة، أو نموذج شراكة.`
                : `Duplicate "${cloneModalOpp.name}" to test a new market segment, different pricing tiers, or a partnership variant.`}
            </p>

            <label className="block font-bold text-gray-800 mb-1">{t('cloneNewName')}</label>
            <input
              type="text"
              value={cloneNewTitle}
              onChange={(e) => setCloneNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#315EE8] outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCloneModalOpp(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClone}
                className="px-4 py-2 bg-[#315EE8] text-white rounded-lg font-bold hover:bg-[#274ec4]"
              >
                {t('cloneAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
