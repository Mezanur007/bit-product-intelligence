'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers3,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Cpu,
  TrendingUp,
  FileCheck,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Opportunity, Competitor, ResearchSource } from '@/lib/db/types';
import { useApp } from '@/components/providers/AppProvider';
import { AICompetitorItem, AIMarketEstimateResult, AIRiskItem } from '@/lib/ai/types';

export default function MarketIntelligencePage() {
  const { currentUser, showToast, t, fmtCurrency, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppId, setSelectedOppId] = useState<string>('');

  // AI Research State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [stagedCompetitors, setStagedCompetitors] = useState<AICompetitorItem[]>([]);
  const [stagedMarketEstimate, setStagedMarketEstimate] = useState<AIMarketEstimateResult | null>(null);
  const [stagedRisks, setStagedRisks] = useState<AIRiskItem[]>([]);

  const loadData = () => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setOpportunities(data.data);
          if (!selectedOppId) {
            setSelectedOppId(data.data[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

  // --------------------------------------------------------------------------
  // AI ACTION HANDLERS
  // --------------------------------------------------------------------------
  const runCompetitorScan = async () => {
    if (!selectedOpp) return;
    setAiLoading(true);
    setAiAction('competitor');
    try {
      const res = await fetch('/api/ai/competitor-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOpp.id,
          productName: selectedOpp.name,
          category: selectedOpp.category,
          description: selectedOpp.description,
          industry: selectedOpp.industry,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStagedCompetitors(json.data);
        showToast(
          language === 'ar'
            ? `اكتشف الذكاء الاصطناعي ${json.data.length} منافسين في السوق السعودي!`
            : `AI discovered ${json.data.length} Saudi market competitors!`
        );
      } else {
        showToast(json.error || 'Failed to scan competitors', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const runMarketEstimate = async () => {
    if (!selectedOpp) return;
    setAiLoading(true);
    setAiAction('market');
    try {
      const res = await fetch('/api/ai/market-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOpp.id,
          productName: selectedOpp.name,
          category: selectedOpp.category,
          targetAudience: selectedOpp.targetCustomerSegment,
          pricingSAR: selectedOpp.financialAssumptions?.monthlyPricePerCustomer,
          industry: selectedOpp.industry,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStagedMarketEstimate(json.data);
        showToast(
          language === 'ar'
            ? 'تم استخراج تقديرات حجم السوق السعودي وفق بيانات منشآت!'
            : 'Extracted Saudi market size estimates using Monshaat census data!'
        );
      } else {
        showToast(json.error || 'Failed to estimate market size', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const runRiskScan = async () => {
    if (!selectedOpp) return;
    setAiLoading(true);
    setAiAction('risk');
    try {
      const res = await fetch('/api/ai/risk-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: selectedOpp.id,
          productName: selectedOpp.name,
          category: selectedOpp.category,
          targetAudience: selectedOpp.targetCustomerSegment,
          technicalStack: selectedOpp.technicalFeasibility?.proposedTechStack,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStagedRisks(json.data);
        showToast(
          language === 'ar'
            ? `تم رصد ${json.data.length} مخاطر تنظيمية وتقنية للسوق السعودي!`
            : `Detected ${json.data.length} Saudi regulatory and technical risks!`
        );
      } else {
        showToast(json.error || 'Failed to scan risks', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // HUMAN-IN-THE-LOOP VERIFICATION HANDLERS
  // --------------------------------------------------------------------------
  const acceptCompetitor = async (comp: AICompetitorItem) => {
    if (!selectedOpp) return;
    try {
      const res = await fetch(`/api/opportunities/${selectedOpp.id}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-analyst',
        },
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
        setStagedCompetitors((prev) => prev.filter((c) => c.id !== comp.id));
        showToast(
          language === 'ar'
            ? `تم توثيق وإضافة المنافس "${comp.name}" رسمياً للمنتج!`
            : `Verified & added competitor "${comp.name}" to evaluation!`
        );
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const acceptMarketEstimate = async () => {
    if (!selectedOpp || !stagedMarketEstimate) return;
    try {
      const res = await fetch(`/api/opportunities/${selectedOpp.id}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-analyst',
        },
        body: JSON.stringify({
          step: 'market',
          payload: {
            tamSAR: stagedMarketEstimate.tamSAR,
            samSAR: stagedMarketEstimate.samSAR,
            somSAR: stagedMarketEstimate.somSAR,
            targetBusinessCount: stagedMarketEstimate.targetEstablishmentsCount,
            sizingMethodology: stagedMarketEstimate.sizingMethodology,
            confidenceLevel: stagedMarketEstimate.confidenceLevel,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStagedMarketEstimate(null);
        showToast(
          language === 'ar'
            ? 'تم اعتماد تقديرات حجم السوق وتحديث الخطوة الأولى للمنتج!'
            : 'Market sizing verified and applied to Step 1 evaluation!'
        );
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const acceptRisk = async (rsk: AIRiskItem) => {
    if (!selectedOpp) return;
    try {
      const res = await fetch(`/api/opportunities/${selectedOpp.id}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'usr-analyst',
        },
        body: JSON.stringify({
          step: 'risk',
          payload: {
            category: rsk.category,
            description: rsk.description,
            likelihood: rsk.likelihood,
            impact: rsk.impact,
            severity: rsk.severity,
            mitigation: rsk.mitigation,
            ownerName: currentUser?.name || 'Sarah Al-Otaibi',
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStagedRisks((prev) => prev.filter((r) => r.riskCode !== rsk.riskCode));
        showToast(
          language === 'ar'
            ? `تم اعتماد الخطر التنظيمي "${rsk.riskCode}" وإضافته للمصفوفة!`
            : `Risk "${rsk.riskCode}" approved and added to risk register!`
        );
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Aggregate all sources and competitors across opportunities
  const allSources: (ResearchSource & { oppName: string; oppId: string })[] = [];
  const allCompetitors: (Competitor & { oppName: string; oppId: string })[] = [];

  for (const o of opportunities) {
    if (o.sources) {
      for (const s of o.sources) {
        allSources.push({ ...s, oppName: o.name, oppId: o.id });
      }
    }
    if (o.competitors) {
      for (const c of o.competitors) {
        allCompetitors.push({ ...c, oppName: o.name, oppId: o.id });
      }
    }
  }

  const fmtSAR = fmtCurrency;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <Search className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? 'المرحلة الثانية — وكيل أبحاث الذكاء الاصطناعي واستخبارات السوق السعودي'
                : 'Phase 2 — AI Research Agent & Saudi Market Intelligence'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            {language === 'ar' ? 'مركز استخبارات السوق والمنافسين' : 'Market & Competitor Intelligence Hub'}
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            {language === 'ar'
              ? 'أبحاث مؤتمتة، واستكشاف المنافسين في السوق السعودي، وحجم السوق المعتمد على بيانات منشآت مع حوكمة الموافقة البشرية.'
              : 'Automated AI research, Saudi competitor discovery, and Monshaat market sizing with human-in-the-loop governance.'}
          </p>
        </div>

        {/* Status Badge with Mascot */}
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2.5 shadow-xs">
          <img src="/brand/mascot.png" alt="BI Mascot" className="w-8 h-8 object-contain" />
          <div>
            <div className="flex items-center gap-1.5">
              <span>{language === 'ar' ? 'محرك الذكاء الاصطناعي نشط' : 'AI Intelligence Engine Active'}</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'بي آي للتكنولوجيا' : 'BI Technology'}
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6EAF1] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {language === 'ar' ? 'المنتج قيد التحليل:' : 'Active Target Product:'}
          </span>
          <div className="flex gap-2">
            {opportunities.map((opp) => (
              <button
                key={opp.id}
                onClick={() => {
                  setSelectedOppId(opp.id);
                  setStagedCompetitors([]);
                  setStagedMarketEstimate(null);
                  setStagedRisks([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOpp?.id === opp.id
                    ? 'bg-[#315EE8] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opp.name}
              </button>
            ))}
          </div>
        </div>

        {/* AI Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runCompetitorScan}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'فحص المنافسين بالذكاء الاصطناعي' : 'Run AI Competitor Scan'}</span>
          </button>

          <button
            onClick={runMarketEstimate}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تقدير حجم السوق (منشآت)' : 'Monshaat Market Sizing'}</span>
          </button>

          <button
            onClick={runRiskScan}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'فحص المخاطر والامتثال' : 'Scan Regulatory Risks'}</span>
          </button>
        </div>
      </div>

      {/* AI Loading Banner */}
      {aiLoading && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-indigo-800 text-xs font-semibold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>
            {language === 'ar'
              ? `يقوم وكيل الذكاء الاصطناعي الآن بمسح قواعد بيانات السوق السعودي لـ "${selectedOpp?.name}"...`
              : `AI Research Agent is actively querying Saudi market databases for "${selectedOpp?.name}"...`}
          </span>
        </div>
      )}

      {/* STAGING QUEUE: AI-Generated Competitor Discoveries */}
      {stagedCompetitors.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white p-6 rounded-2xl border-2 border-indigo-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {language === 'ar' ? 'فرضيات الذكاء الاصطناعي قيد المراجعة' : 'AI-Generated Hypotheses in Staging'}
              </span>
              <span className="text-xs font-bold text-gray-700">
                ({stagedCompetitors.length} {language === 'ar' ? 'منافسين جدد مرصودين' : 'new competitors staged'})
              </span>
            </div>
            <button
              onClick={() => setStagedCompetitors([])}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              {language === 'ar' ? 'إلغاء المعاينة' : 'Dismiss All'}
            </button>
          </div>

          <p className="text-xs text-gray-600">
            {language === 'ar'
              ? 'وفقاً لقواعد بي-آي-تي الصارمة: نتائج الذكاء الاصطناعي لا تُعتمد رسمياً في مذكرة الاستثمار إلا بعد موافقة وتوثيق المحلل البشري.'
              : 'Governance Rule: AI findings are never auto-merged into investment memos without explicit human analyst verification.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stagedCompetitors.map((comp) => (
              <div key={comp.id} className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{comp.name}</h4>
                    <p className="text-[11px] text-gray-500">{comp.productName} • {comp.country}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-gray-900">{fmtSAR(comp.observedPriceSAR)}</span>
                    <span className="text-[10px] text-gray-500 block">/ {comp.pricingInterval}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      comp.hasArabicSupport ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {comp.hasArabicSupport ? 'Arabic Supported' : 'English Only'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    AI Hypothesis
                  </span>
                </div>

                <p className="text-xs text-gray-600">
                  <strong className="text-gray-700">{language === 'ar' ? 'نقاط الضعف:' : 'Weakness:'}</strong>{' '}
                  {comp.mainWeaknesses}
                </p>
                <p className="text-xs text-blue-700">
                  <strong className="text-blue-900">{language === 'ar' ? 'فرصة التمايز:' : 'Differentiation:'}</strong>{' '}
                  {comp.differentiationOpportunity}
                </p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>{language === 'ar' ? 'الموقع الرسمي' : 'Website'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStagedCompetitors((prev) => prev.filter((c) => c.id !== comp.id))}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 font-semibold"
                    >
                      {language === 'ar' ? 'تجاهل' : 'Discard'}
                    </button>
                    <button
                      onClick={() => acceptCompetitor(comp)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>{language === 'ar' ? 'اعتماد وإضافة للمنتج' : 'Verify & Accept'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGING QUEUE: AI Market Estimate Results */}
      {stagedMarketEstimate && (
        <div className="bg-gradient-to-r from-blue-50/80 to-white p-6 rounded-2xl border-2 border-blue-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-600 text-white flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {language === 'ar' ? 'تقديرات حجم السوق من الذكاء الاصطناعي' : 'AI Market Sizing Model'}
              </span>
              <span className="text-xs font-bold text-gray-700">
                {selectedOpp?.name}
              </span>
            </div>
            <button
              onClick={() => setStagedMarketEstimate(null)}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              {language === 'ar' ? 'إلغاء' : 'Dismiss'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase">TAM (إجمالي السوق المتاح)</span>
              <p className="text-lg font-extrabold text-[#172033] mt-1 tabular-nums">{fmtSAR(stagedMarketEstimate.tamSAR)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase">SAM (السوق المخدوم)</span>
              <p className="text-lg font-extrabold text-[#315EE8] mt-1 tabular-nums">{fmtSAR(stagedMarketEstimate.samSAR)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase">SOM (السوق المستهدف بالسنة 2)</span>
              <p className="text-lg font-extrabold text-emerald-600 mt-1 tabular-nums">{fmtSAR(stagedMarketEstimate.somSAR)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase">عدد المنشآت المستهدفة</span>
              <p className="text-lg font-extrabold text-gray-900 mt-1 tabular-nums">
                {stagedMarketEstimate.targetEstablishmentsCount.toLocaleString()} {language === 'ar' ? 'منشأة' : 'entities'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-700 bg-white/70 p-3 rounded-xl border border-blue-100">
            <strong>{language === 'ar' ? 'المنهجية والمصادر:' : 'Methodology & Sources:'}</strong>{' '}
            {stagedMarketEstimate.methodologyNotes}
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setStagedMarketEstimate(null)}
              className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
            >
              {language === 'ar' ? 'تجاهل' : 'Discard'}
            </button>
            <button
              onClick={acceptMarketEstimate}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'اعتماد التقدير وتحديث الخطوة الأولى' : 'Apply to Step 1 Market Evaluation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGING QUEUE: AI Risk Scan Results */}
      {stagedRisks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50/80 to-white p-6 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-600 text-white flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {language === 'ar' ? 'مخاطر تنظيمية وتقنية مكتشفة' : 'AI-Detected Regulatory & Tech Risks'}
              </span>
              <span className="text-xs font-bold text-gray-700">
                ({stagedRisks.length} {language === 'ar' ? 'مخاطر قيد التحقق' : 'risks staged'})
              </span>
            </div>
            <button
              onClick={() => setStagedRisks([])}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              {language === 'ar' ? 'إلغاء' : 'Dismiss All'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stagedRisks.map((rsk) => (
              <div key={rsk.riskCode} className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-900">{rsk.riskCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                    {rsk.regulatoryBody || rsk.category}
                  </span>
                </div>
                <p className="text-xs text-gray-800 font-medium">{rsk.description}</p>
                <p className="text-[11px] text-gray-600">
                  <strong className="text-gray-700">{language === 'ar' ? 'المعالجة:' : 'Mitigation:'}</strong>{' '}
                  {rsk.mitigation}
                </p>
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => acceptRisk(rsk)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{language === 'ar' ? 'إضافة لسجل المخاطر' : 'Add to Risk Register'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Product Competitor Benchmarks */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">
              {language === 'ar' ? 'مشهد تسعير المنافسين ودعم اللغة العربية' : 'Competitive Pricing & Arabic Support Landscape'}
            </h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {language === 'ar'
                ? 'مقارنات معيارية موثقة للمنافسين لمنتجي LawOS 360 و BITEX في السوق السعودي.'
                : 'Verified competitor benchmarks for LawOS 360 and BITEX in the Saudi Arabian market.'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#315EE8]">
            {allCompetitors.length} {language === 'ar' ? 'مقارنات موثقة' : 'Verified Benchmarks'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">{language === 'ar' ? 'المنافس' : 'Competitor'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'المنتج المرتبط' : 'Associated Product'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'السعر المرصود' : 'Observed Price'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'دعم العربية' : 'Arabic UX'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'نقاط الضعف الجوهرية' : 'Key Weaknesses'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'فرصة التمايز لـ بي آي للتكنولوجيا' : 'BI Technology Differentiation'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {language === 'ar' ? 'لم يتم تسجيل مقارنات منافسين بعد.' : 'No competitor benchmarks recorded yet.'}
                  </td>
                </tr>
              ) : (
                allCompetitors.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.productName} ({c.country})</div>
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/opportunities/${c.oppId}`} className="text-[#315EE8] font-semibold hover:underline">
                        {c.oppName}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 tabular-nums">
                      {fmtSAR(c.observedPriceSAR)} / {c.pricingInterval}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.hasArabicSupport ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.hasArabicSupport ? (language === 'ar' ? 'يدعم العربية' : 'Arabic') : (language === 'ar' ? 'إنجليزية فقط' : 'English Only')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs">{c.mainWeaknesses}</td>
                    <td className="py-3 px-3 font-medium text-[#315EE8] max-w-xs">{c.differentiationOpportunity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Market Research Sources */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">
              {language === 'ar' ? 'مصادر أبحاث السوق وتصنيف الأدلة' : 'Market Research Sources & Evidence Classification'}
            </h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {language === 'ar'
                ? 'سجلات مصنفة مع تمييز صريح بين البيانات الموثقة وافتراضات الإدارة.'
                : 'Classified records with clear distinction between verified data and management assumptions.'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#159769]">
            {allSources.length} {language === 'ar' ? 'مصادر مصنفة' : 'Classified Sources'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">{language === 'ar' ? 'الناشر وعنوان الصفحة' : 'Publisher & Page Title'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'نوع المصدر' : 'Source Type'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'البيان المستخرج / القيمة' : 'Extracted Claim / Value'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'حالة التوثيق' : 'Verification Status'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'تاريخ الوصول' : 'Date Accessed'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'الباحث' : 'Researcher'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allSources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {language === 'ar' ? 'لم يتم تسجيل مصادر أبحاث خارجية بعد.' : 'No external research sources recorded.'}
                  </td>
                </tr>
              ) : (
                allSources.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{s.publisher}</div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#315EE8] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{s.pageTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold uppercase text-[10px] text-gray-700">
                        {s.sourceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium max-w-sm">
                      {s.relevantClaim}
                      {s.extractedValue && <span className="block font-bold text-emerald-700 mt-0.5">{language === 'ar' ? 'القيمة:' : 'Value:'} {s.extractedValue}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {s.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 tabular-nums">{s.accessedAt}</td>
                    <td className="py-3 px-3 font-medium text-gray-700">{s.researcherName}</td>
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
