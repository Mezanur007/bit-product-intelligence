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
      {/* Top Header — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#315EE8] uppercase tracking-wider mb-1.5">
            <span className="p-1 rounded-md neu-pressed text-[#315EE8]">
              <Layers3 className="w-3.5 h-3.5" />
            </span>
            <span>{t('productRegisterPipeline')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            {t('productOppsRegister')}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-semibold mt-1">
            {t('oppsRegisterSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="neu-btn-primary px-5 py-3 text-white text-xs md:text-sm font-black flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newOpportunity')}</span>
        </button>
      </div>

      {/* Filter and Search Bar — Neomorphic */}
      <div className="neu-raised p-4 md:p-5 rounded-2xl border border-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`neu-pressed w-full py-2.5 rounded-xl text-xs font-bold text-black outline-none ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="neu-btn text-xs px-3.5 py-2.5 font-bold text-slate-800 outline-none rounded-xl"
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
            className="neu-btn text-xs px-3.5 py-2.5 font-bold text-slate-800 outline-none rounded-xl"
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
              className="neu-btn text-xs text-slate-600 hover:text-black px-3 py-2 font-bold rounded-xl"
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Subheader Toolbar with Quick Filters & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              quickFilter === 'all'
                ? 'neu-btn-black text-white'
                : 'neu-btn text-slate-700'
            }`}
          >
            {t('filterAll')} ({opportunities.length})
          </button>
          <button
            onClick={() => setQuickFilter('needs_action')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              quickFilter === 'needs_action'
                ? 'neu-raised-sm bg-amber-600 text-white shadow-sm'
                : 'neu-btn text-amber-700 hover:text-amber-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('filterNeedsAction')}</span>
          </button>
          <button
            onClick={() => setQuickFilter('high_priority')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              quickFilter === 'high_priority'
                ? 'neu-btn-primary text-white'
                : 'neu-btn text-[#315EE8]'
            }`}
          >
            {t('filterHighPriority')}
          </button>
        </div>

        {/* View Switcher: Kanban Board vs Table */}
        <div className="neu-pressed p-1 rounded-xl flex items-center self-start sm:self-auto">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              viewMode === 'board'
                ? 'neu-raised-sm bg-[#EDF2F7] text-black shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>{t('viewBoard')}</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              viewMode === 'table'
                ? 'neu-raised-sm bg-[#EDF2F7] text-black shadow-xs'
                : 'text-slate-600 hover:text-black'
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
                className={`neu-raised p-4 rounded-3xl border border-white space-y-3.5 min-h-[460px] flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                    <span className="font-black text-xs text-slate-800 uppercase tracking-wider">{col.title}</span>
                    <span className="neu-pressed text-[11px] font-black px-2.5 py-0.5 rounded-full text-slate-700">
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
                          className="neu-raised-sm p-4 rounded-2xl border border-white hover:translate-y-[-2px] transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="neu-pressed text-[10px] font-black px-2.5 py-0.5 rounded uppercase text-slate-700">
                              {opp.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {opp.id}
                            </span>
                          </div>

                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="font-black text-sm text-black hover:text-[#315EE8] block leading-snug line-clamp-2"
                          >
                            {opp.name}
                          </Link>

                          <div className="text-xs text-slate-600 font-medium line-clamp-1">
                            {opp.targetCustomerSegment || (isRtl ? 'منشآت سعودية' : 'Saudi SMEs')}
                          </div>

                          {/* Score & Gates Pill */}
                          <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span className="text-[10px] text-slate-500 font-bold">{t('cardGates')}</span>
                              <span className={gatesPassed === 9 ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
                                {gatesPassed}/9
                              </span>
                            </div>
                            <div className="neu-pressed font-black tabular-nums px-2.5 py-0.5 rounded-md text-black text-xs">
                              {opp.weightedScore ? `${opp.weightedScore}/100` : '—'}
                            </div>
                          </div>

                          {/* Budget & Open Link */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black text-slate-800 tabular-nums">
                              {fmtSAR(opp.proposedValidationBudgetSAR)}
                            </span>
                            <Link
                              href={`/opportunities/${opp.id}`}
                              className="neu-btn px-2.5 py-1 text-xs font-black text-[#315EE8] hover:text-[#274ec4] inline-flex items-center gap-1"
                            >
                              <span>{t('cardOpenWorkspace')}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {colOpps.length === 0 && (
                      <div className="neu-pressed py-10 text-center text-slate-400 font-bold text-xs rounded-2xl">
                        {isRtl ? 'لا توجد فرص في هذه المرحلة' : 'No items in this stage'}
                      </div>
                    )}
                  </div>
                </div>

                {col.id === 'idea' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="neu-btn w-full py-2.5 text-slate-700 hover:text-black text-xs font-black flex items-center justify-center gap-1.5 rounded-xl transition-all"
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
        <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white space-y-4">
          <div className="neu-pressed p-2 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 uppercase tracking-wider font-black border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">{t('thOpportunity')}</th>
                  <th className="py-3.5 px-4">{t('thCategory')}</th>
                  <th className="py-3.5 px-4">{t('thValidationBudget')}</th>
                  <th className="py-3.5 px-4">{t('thWeightedScore')}</th>
                  <th className="py-3.5 px-4">{t('thRecommendation')}</th>
                  <th className="py-3.5 px-4">{t('thStatus')}</th>
                  <th className="py-3.5 px-5 text-right">{t('thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      {language === 'ar' ? 'جاري تحميل الفرص...' : 'Loading opportunities...'}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl neu-raised text-[#315EE8] flex items-center justify-center mx-auto">
                          <Layers3 className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-black">{t('emptySearchTitle')}</h4>
                        <p className="text-xs text-slate-600 font-semibold">{t('emptySearchDesc')}</p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="neu-btn-primary px-5 py-2.5 text-white rounded-xl text-xs font-black"
                          >
                            {t('createFirstOpp')}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-white/40 transition-colors group">
                      <td className="py-4 px-5">
                        <Link href={`/opportunities/${o.id}`} className="font-black text-black group-hover:text-[#315EE8] block text-sm">
                          {o.name}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {o.id} · <span className="text-slate-700">{o.targetCustomerSegment || (language === 'ar' ? 'المنشآت السعودية الصغيرة والمتوسطة' : 'Saudi SMEs')}</span> · {language === 'ar' ? 'المسؤول' : 'Owner'}: {o.ownerName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="neu-pressed inline-block px-2.5 py-1 rounded-md font-black text-slate-700 uppercase text-[10px]">
                          {o.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 tabular-nums font-black text-black">
                        {fmtSAR(o.proposedValidationBudgetSAR)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 neu-pressed h-2 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full ${
                                o.weightedScore >= 75 ? 'bg-emerald-600' : o.weightedScore >= 60 ? 'bg-[#315EE8]' : 'bg-amber-500'
                              }`}
                              style={{ width: `${o.weightedScore}%` }}
                            />
                          </div>
                          <span className="font-black text-black tabular-nums">
                            {o.weightedScore ? `${o.weightedScore}/100` : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`neu-raised-sm inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            o.recommendation === 'EXECUTE'
                              ? 'text-emerald-700'
                              : o.recommendation === 'PILOT'
                              ? 'text-[#315EE8]'
                              : o.recommendation === 'HOLD'
                              ? 'text-amber-700'
                              : o.recommendation === 'PARTNER'
                              ? 'text-purple-700'
                              : 'text-red-700'
                          }`}
                        >
                          {t(`rec${o.recommendation}`) || o.recommendation}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="neu-pressed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black text-slate-800 capitalize">
                          <span
                            className={`w-2 h-2 rounded-full ${
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
                            className="neu-btn p-2 text-slate-600 hover:text-black rounded-lg"
                            title={t('cloneOpp')}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(o.id, o.name)}
                            className="neu-btn p-2 text-slate-600 hover:text-red-600 rounded-lg"
                            title={t('archiveOpp')}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/opportunities/${o.id}`}
                            className="neu-btn-primary px-3 py-1.5 text-white font-black text-xs inline-flex items-center gap-1"
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

      {/* Create Opportunity Modal — Neomorphic */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="neu-raised bg-[#EDF2F7] rounded-3xl border border-white max-w-xl w-full p-7 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-black text-[#315EE8] uppercase tracking-wider">
                  {language === 'ar' ? 'سجل جديد' : 'New Record'}
                </span>
                <h3 className="text-lg font-black text-black">{t('createOppModalTitle')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="neu-btn p-2 text-slate-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-black text-slate-800 mb-1">
                  {t('productName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: منصة دعم تذاكر تقنية عبر الواتساب للمنشآت' : 'e.g. SME WhatsApp IT Ticketing Desk'}
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">{t('thCategory')}</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as any })}
                    className="neu-btn w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
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
                  <label className="block font-black text-slate-800 mb-1">{t('valBudgetSAR')}</label>
                  <input
                    type="number"
                    max={25000}
                    value={createForm.proposedValidationBudgetSAR}
                    onChange={(e) => setCreateForm({ ...createForm, proposedValidationBudgetSAR: Number(e.target.value) })}
                    className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                  />
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">
                    {language === 'ar' ? 'سقف ميزانية الفريق: 25,000 ر.س' : 'Team cap: SAR 25,000'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">{t('targetSegment')}</label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: شركات الخدمات اللوجستية والتجارة الإلكترونية المتوسطة بالسعودية' : 'e.g. Mid-sized Saudi logistics & e-commerce companies'}
                  value={createForm.targetCustomerSegment}
                  onChange={(e) => setCreateForm({ ...createForm, targetCustomerSegment: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">{t('businessProblem')}</label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'ما هي المشكلة المحددة التي يعاني منها العميل حالياً؟' : 'What specific pain point does the customer experience today?'}
                  value={createForm.businessProblem}
                  onChange={(e) => setCreateForm({ ...createForm, businessProblem: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-medium text-black"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">{t('proposedSolution')}</label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'كيف تعالج بي آي للتكنولوجيا هذه المشكلة بتميّز وميزة تنافسية؟' : 'How does BI Technology address this problem with differentiation?'}
                  value={createForm.proposedSolution}
                  onChange={(e) => setCreateForm({ ...createForm, proposedSolution: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-medium text-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="neu-btn px-5 py-2.5 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="neu-btn-primary px-6 py-2.5 text-white font-black"
                >
                  {t('registerOpportunity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Modal — Neomorphic */}
      {cloneModalOpp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="neu-raised bg-[#EDF2F7] rounded-3xl border border-white max-w-md w-full p-7 space-y-4 shadow-2xl animate-fade-in text-xs md:text-sm">
            <h3 className="text-base font-black text-black mb-1">{t('cloneModalTitle')}</h3>
            <p className="text-slate-600 font-semibold mb-3">
              {language === 'ar'
                ? `استنساخ "${cloneModalOpp.name}" لاختبار شريحة سوقية جديدة، أو فئات تسعير بديلة، أو نموذج شراكة.`
                : `Duplicate "${cloneModalOpp.name}" to test a new market segment, different pricing tiers, or a partnership variant.`}
            </p>

            <label className="block font-black text-slate-800 mb-1">{t('cloneNewName')}</label>
            <input
              type="text"
              value={cloneNewTitle}
              onChange={(e) => setCloneNewTitle(e.target.value)}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black mb-4"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCloneModalOpp(null)}
                className="neu-btn px-5 py-2.5 text-slate-700 font-bold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClone}
                className="neu-btn-primary px-6 py-2.5 text-white font-black"
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
