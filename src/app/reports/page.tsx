'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Opportunity } from '@/lib/db/types';
import { useApp } from '@/components/providers/AppProvider';

export default function ReportsPage() {
  const { t, fmtCurrency, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');

  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setOpportunities(data.data);
          setSelectedOppId(data.data[0].id);
        }
      });
  }, []);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);
  const fmtSAR = fmtCurrency;

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Status', 'Score', 'Recommendation', 'Budget_SAR'];
    const rows = opportunities.map((o) => [
      o.id,
      `"${o.name}"`,
      o.category,
      o.status,
      o.weightedScore,
      o.recommendation,
      o.proposedValidationBudgetSAR,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BIT_Intelligence_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#315EE8] uppercase tracking-wider mb-1.5">
            <span className="p-1 rounded-md neu-pressed text-[#315EE8]">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span>{t('moduleEight')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            {t('decisionMemoTitle')}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-semibold mt-1">
            {t('decisionMemoSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="neu-btn px-4 py-2.5 text-xs font-black text-slate-800 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{t('exportCSV')}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="neu-btn-primary px-5 py-2.5 text-white text-xs font-black flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printMemo')}</span>
          </button>
        </div>
      </div>

      {/* Selector — Neomorphic */}
      <div className="neu-raised p-4 md:p-5 rounded-2xl border border-white flex items-center gap-4 no-print flex-wrap">
        <label className="text-xs md:text-sm font-black text-black">{t('selectOppForMemo')}</label>
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="neu-btn text-xs px-4 py-2 font-black text-black outline-none rounded-xl"
        >
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id} — {o.name} ({t(`rec${o.recommendation}`) || o.recommendation})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Executive Decision Memo Document — Neomorphic Container */}
      {selectedOpp && (
        <div className="neu-raised p-8 md:p-12 rounded-3xl border border-white print-page max-w-4xl mx-auto space-y-8 text-xs text-slate-800 leading-relaxed bg-[#EDF2F7]">
          {/* Header Memo Banner */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img src="/brand/logo.webp" alt="BI Technology" className="w-12 h-12 object-contain" />
              <div>
                <div className="font-black text-2xl text-black tracking-wider">
                  {t('brandName')}
                </div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  {language === 'ar' ? 'مذكرة قرار الاستثمار الداخلي المعتمدة' : 'INTERNAL INVESTMENT DECISION MEMORANDUM'}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">
                  {language === 'ar' ? 'مرجع الوثيقة:' : 'Document Ref:'} <strong>MEMO-{selectedOpp.id}</strong> · {language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
                </div>
              </div>
            </div>
            <div className={isRtl ? 'text-left' : 'text-right'}>
              <span
                className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                  selectedOpp.recommendation === 'EXECUTE'
                    ? 'neu-raised-sm text-emerald-800'
                    : selectedOpp.recommendation === 'PILOT'
                    ? 'neu-raised-sm text-[#315EE8]'
                    : 'neu-raised-sm text-amber-800'
                }`}
              >
                {t('thRecommendation')}: {t(`rec${selectedOpp.recommendation}`) || selectedOpp.recommendation}
              </span>
              <div className="text-xs text-slate-400 mt-1.5 font-bold">
                {language === 'ar' ? 'التاريخ:' : 'Date:'} {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Memo Metadata Block */}
          <div className="neu-pressed grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-white/60">
            <div>
              <span className="text-slate-500 text-[10px] block font-black uppercase">{t('thOpportunity')}</span>
              <strong className="text-black block text-sm font-black">{selectedOpp.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-black uppercase">{t('thCategory')}</span>
              <strong className="text-slate-800 block capitalize font-black">{selectedOpp.category.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-black uppercase">{language === 'ar' ? 'مدير المنتج المسؤول' : 'Product Owner'}</span>
              <strong className="text-slate-800 block font-black">{selectedOpp.ownerName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-black uppercase">{t('thWeightedScore')}</span>
              <strong className="text-[#315EE8] block text-base font-black">{selectedOpp.weightedScore}/100</strong>
            </div>
          </div>

          {/* 1. Problem & Solution */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              {language === 'ar' ? '١. الفرصة التجارية والتحقق من طلب العملاء' : '1. Commercial Opportunity & Customer Validation'}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              {selectedOpp.businessProblem || selectedOpp.description}
            </p>
            <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">
                  {language === 'ar' ? 'إجمالي السوق المتاح (TAM)' : 'Total Addressable Market (TAM)'}
                </span>
                <strong className="text-gray-900">{fmtSAR(selectedOpp.marketAssessment?.tamSAR || 0)}</strong>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">
                  {language === 'ar' ? 'الحصة المستهدفة واقعياً (SOM)' : 'Serviceable Obtainable (SOM)'}
                </span>
                <strong className="text-[#315EE8]">{fmtSAR(selectedOpp.marketAssessment?.somSAR || 0)}</strong>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">
                  {language === 'ar' ? 'التزامات التجارب المدفوعة' : 'Paid Pilot Commitments'}
                </span>
                <strong className="text-emerald-700">
                  {selectedOpp.marketAssessment?.paidPilotCommitments || 0} {language === 'ar' ? 'عميل ملتزم' : 'Committed'}
                </strong>
              </div>
            </div>
          </div>

          {/* 2. Financial Viability */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              {language === 'ar' ? '٢. اقتصاديات الوحدة ونقطة التعادل (المحرك الحتمي)' : '2. Unit Economics & Break-Even Analysis (Deterministic Engine)'}
            </h3>
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-3">
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">
                  {language === 'ar' ? 'سعر الاشتراك الشهري' : 'Customer Monthly Price'}
                </span>
                <strong className="text-gray-900">
                  {fmtSAR(selectedOpp.financialAssumptions?.monthlyPricePerCustomer || 0)}/{language === 'ar' ? 'شهر' : 'mo'}
                </strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">{t('unitContribution')}</span>
                <strong className="text-emerald-700">
                  {fmtSAR(selectedOpp.financialOutputs?.breakEven.monthlyContributionPerCustomer || 0)}/{language === 'ar' ? 'شهر' : 'mo'}
                </strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">{t('operatingBreakEven')}</span>
                <strong className="text-gray-900">
                  {selectedOpp.financialOutputs?.breakEven.operatingBreakEvenCustomers || 'N/A'} {language === 'ar' ? 'عميل' : 'Customers'}
                </strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">{t('investmentPayback')}</span>
                <strong className="text-gray-900">
                  {selectedOpp.financialOutputs?.breakEven.investmentPaybackMonth
                    ? `${language === 'ar' ? 'الشهر' : 'Month'} ${selectedOpp.financialOutputs.breakEven.investmentPaybackMonth}`
                    : (language === 'ar' ? '> ٢٤ شهراً' : '> 24 Months')}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Mandatory Governance Gates */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              {language === 'ar' ? '٣. تدقيق بوابات الحوكمة التسع الإلزامية' : '3. Mandatory Governance Gates Audit'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedOpp.mandatoryGates?.map((g) => (
                <div key={g.id} className="p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gray-800">{g.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      g.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.status === 'conditional_pass'
                        ? 'bg-blue-100 text-blue-800'
                        : g.status === 'fail'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {g.status === 'pass' ? t('pass') : g.status === 'conditional_pass' ? t('conditionalPass') : g.status === 'fail' ? t('fail') : t('unassessed')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Recommendation & Approval Sign-off */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-300">
            <h3 className="font-extrabold text-sm text-gray-900 uppercase mb-2">
              {language === 'ar' ? '٤. الاعتماد التنفيذي وتفويض الميزانية' : '4. Executive Sign-Off & Capital Authorization'}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {language === 'ar'
                ? `يوصي مكتب استثمار المنتجات بالمضي قُدماً بقرار (${t(`rec${selectedOpp.recommendation}`) || selectedOpp.recommendation}) تحت سقف ميزانية تحقق معتمد قدره ${fmtSAR(selectedOpp.approvedBudgetSAR || selectedOpp.proposedValidationBudgetSAR)}.`
                : `The Product Investment Office recommends proceeding with ${selectedOpp.recommendation} under an authorized validation cap of ${fmtSAR(selectedOpp.approvedBudgetSAR || selectedOpp.proposedValidationBudgetSAR)}.`}
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300 text-xs">
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-bold mb-8">
                  {language === 'ar' ? 'مقدم الطلب (مسؤول المنتج)' : 'Submitted By (Product Lead)'}
                </div>
                <div className="border-b border-gray-400 pb-1 font-bold text-gray-900">{selectedOpp.ownerName}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'مدير أول المنتجات، بي آي للتكنولوجيا' : 'Lead Product Manager, BI Technology'}
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-xs uppercase font-bold mb-8">
                  {language === 'ar' ? 'المعتمد (الإدارة التنفيذية)' : 'Authorized By (Executive Approver)'}
                </div>
                <div className="border-b border-gray-400 pb-1 font-bold text-gray-900">
                  {selectedOpp.approvals?.[0]?.reviewedBy || (language === 'ar' ? 'فيصل محمد (COO) / مزمل معروف (CTO)' : 'Faisal Mohammed (COO) / Mezanur Maruf (CTO)')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'لجنة اعتماد الاستثمار، بي آي للتكنولوجيا' : 'Management Approver, BI Technology'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
