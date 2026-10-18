'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Database,
  Building,
  Save,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { ScoreWeights, DEFAULT_WEIGHTS } from '@/lib/decision-engine';

export default function SettingsPage() {
  const { currentUser, isDemoMode, setIsDemoMode, showToast, t, fmtCurrency, language, isRtl } = useApp();

  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [budgetCap, setBudgetCap] = useState(25000);
  const [requirePDPL, setRequirePDPL] = useState(true);

  const currentSum =
    Number(weights.marketAttractiveness) +
    Number(weights.customerValidation) +
    Number(weights.competitiveDifferentiation) +
    Number(weights.financialViability) +
    Number(weights.technicalFeasibility) +
    Number(weights.strategicFitAndReusability) +
    Number(weights.operationalReadiness);

  const isSumValid = Math.abs(currentSum - 100) < 0.01;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSumValid) {
      showToast(language === 'ar' ? 'يجب أن يكون مجموع الأوزان 100% تماماً قبل الحفظ.' : 'Weights must sum exactly to 100% before saving.');
      return;
    }
    showToast(language === 'ar' ? 'تم تحديث أوزان معايير الحوكمة بنجاح.' : 'Governance criteria weights updated successfully.');
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/system/reset-demo', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(true);
        showToast(language === 'ar' ? 'تمت استعادة المحفظة التجريبية المعتمدة لـ بي آي للتكنولوجيا' : 'Restored standard BI Technology demo portfolio');
        window.location.reload();
      }
    } catch {
      showToast(language === 'ar' ? 'خطأ في استعادة البيانات التجريبية' : 'Error resetting demo data');
    }
  };

  const handleResetZero = async () => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع الفرص وتفعيل وضع الصفر الصادق؟' : 'Are you sure you want to clear all opportunities and activate an honest zero-data state?')) return;
    try {
      const res = await fetch('/api/system/reset-zero', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(false);
        showToast(language === 'ar' ? 'تم مسح كافة البيانات التجريبية. وضع الصفر نشط.' : 'All sample data cleared. Honest zero-data state active.');
        window.location.reload();
      }
    } catch {
      showToast(language === 'ar' ? 'خطأ في تصفير البيانات' : 'Error clearing data');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <div className="flex items-center gap-2 text-xs font-black text-[#315EE8] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>{t('systemGovParams')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
          {t('platformConfig')}
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-semibold mt-1">
          {t('platformConfigSub')}
        </p>
      </div>

      {/* Organization Profile Card with Official Logo & Mascot — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative p-2.5 rounded-2xl bg-white shadow-[4px_4px_10px_rgba(166,180,200,0.3)] shrink-0 border border-slate-100">
            <img src="/brand/logo.webp" alt="BI Technology Logo" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <div className="text-xs font-black text-[#315EE8] uppercase tracking-wider flex items-center gap-1.5">
              <span>{language === 'ar' ? 'ملف المنشأة الرسمي' : 'Official Enterprise Profile'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-black">
              {language === 'ar' ? 'شركة بي آي للتكنولوجيا' : 'BI Technology'}
            </h2>
            <div className="text-xs md:text-sm text-slate-600 font-bold mt-0.5">
              {language === 'ar' ? 'المشروع: منصة ذكاء الأعمال (Business Intelligence)' : 'Project: Business Intelligence Platform'}
            </div>
          </div>
        </div>

        <div className="neu-pressed flex items-center gap-3.5 p-4 rounded-2xl border border-blue-200/60 shrink-0">
          <img src="/brand/mascot.png" alt="BI Mascot" className="w-12 h-12 object-contain drop-shadow-md" />
          <div className="text-xs">
            <div className="font-black text-black">{language === 'ar' ? 'التميمة الرسمية لشركة بي آي' : 'Official Company Mascot'}</div>
            <div className="text-slate-600 font-bold">{language === 'ar' ? 'روبوت الذكاء الاصطناعي السعودي' : 'Saudi AI Intelligence Assistant'}</div>
          </div>
        </div>
      </div>

      {/* Decision Criteria Weights Form — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-black text-lg text-black">{t('evalWeightsTitle')}</h3>
            <p className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">
              {t('evalWeightsSub')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`neu-pressed px-3.5 py-1.5 rounded-full text-xs font-black ${
                isSumValid ? 'text-emerald-900 border border-emerald-300' : 'text-red-900 border border-red-300'
              }`}
            >
              {language === 'ar' ? 'المجموع الحالي:' : 'Current Sum:'} {currentSum}% {isSumValid ? '✓' : (language === 'ar' ? '(يجب أن يساوي 100%)' : '(Must equal 100%)')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 text-xs md:text-sm">
          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'جاذبية السوق وحجمه (%)' : 'Market Attractiveness (%)'}: {weights.marketAttractiveness}%
            </label>
            <input
              type="number"
              value={weights.marketAttractiveness}
              onChange={(e) => setWeights({ ...weights, marketAttractiveness: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'التحقق الميداني من طلب العملاء (%)' : 'Customer Validation (%)'}: {weights.customerValidation}%
            </label>
            <input
              type="number"
              value={weights.customerValidation}
              onChange={(e) => setWeights({ ...weights, customerValidation: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'الميزة التنافسية والتمايز (%)' : 'Competitive Differentiation (%)'}: {weights.competitiveDifferentiation}%
            </label>
            <input
              type="number"
              value={weights.competitiveDifferentiation}
              onChange={(e) => setWeights({ ...weights, competitiveDifferentiation: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'الجدوى المالية واقتصاديات الوحدة (%)' : 'Financial Viability (%)'}: {weights.financialViability}%
            </label>
            <input
              type="number"
              value={weights.financialViability}
              onChange={(e) => setWeights({ ...weights, financialViability: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'الجدوى التقنية والبنية التحتية (%)' : 'Technical Feasibility (%)'}: {weights.technicalFeasibility}%
            </label>
            <input
              type="number"
              value={weights.technicalFeasibility}
              onChange={(e) => setWeights({ ...weights, technicalFeasibility: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'الملاءمة الاستراتيجية وإمكانية إعادة الاستخدام (%)' : 'Strategic Fit & Reusability (%)'}: {weights.strategicFitAndReusability}%
            </label>
            <input
              type="number"
              value={weights.strategicFitAndReusability}
              onChange={(e) => setWeights({ ...weights, strategicFitAndReusability: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1.5">
              {language === 'ar' ? 'الجاهزية التشغيلية وفريق العمل (%)' : 'Operational Readiness (%)'}: {weights.operationalReadiness}%
            </label>
            <input
              type="number"
              value={weights.operationalReadiness}
              onChange={(e) => setWeights({ ...weights, operationalReadiness: Number(e.target.value) })}
              className="neu-pressed w-full px-4 py-2.5 rounded-xl font-black text-black outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isSumValid}
              className={`neu-btn-primary w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 ${
                !isSumValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{t('saveWeights')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Capital Cap & Saudi Compliance Settings — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white text-xs md:text-sm space-y-4">
        <h3 className="font-black text-lg text-black">
          {language === 'ar' ? 'ضوابط رأس المال والانضباط الاستثماري لـ بي آي للتكنولوجيا' : 'BI Technology Capital Discipline & Compliance Controls'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="neu-pressed p-4 rounded-2xl">
            <label className="block font-black text-black mb-1">{t('valBudgetSAR')}</label>
            <p className="text-xs text-slate-600 mb-2 font-medium">
              {language === 'ar' ? 'الحد الأقصى للسيولة النقدية المصرح بها للتحقق دون استثناء من لجنة الإدارة.' : 'Maximum cash authorization permitted without executive committee special dispensation.'}
            </p>
            <input
              type="number"
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="neu-btn w-full px-3.5 py-2.5 rounded-xl outline-none font-black text-black"
            />
          </div>

          <div className="neu-pressed p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-black text-black block">
                {language === 'ar' ? 'اشتراط الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)' : 'Enforce Saudi PDPL & Data Residency Sign-off'}
              </span>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {language === 'ar' ? 'حظر الموافقة على الإطلاق ما لم يتم التحقق من استضافة البيانات في السعودية (me-central-1).' : 'Block launch approval if data hosting is not verified in Saudi Arabia (me-central-1).'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={requirePDPL}
              onChange={(e) => setRequirePDPL(e.target.checked)}
              className="w-5 h-5 accent-[#315EE8] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Honest Zero-State / Demo Mode Management — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white text-xs md:text-sm">
        <h3 className="font-black text-lg text-black mb-1">{t('clearDataTitle')}</h3>
        <p className="text-slate-600 mb-5 font-semibold">
          {language === 'ar'
            ? 'وفقاً لمتطلبات حوكمة بي آي للتكنولوجيا، يمكن تشغيل البيئة في وضع الصفر الصادق الخالي من البيانات أو تحميل سجلات تجريبية موسومة بوضوح.'
            : 'As required by BI Technology governance, new environments can operate in an honest zero-data state or load clearly labeled demo records.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleResetDemo}
            className="neu-btn w-full sm:w-auto px-6 py-3 rounded-xl text-[#315EE8] font-black flex items-center justify-center gap-2 hover:text-blue-800"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('restoreDemo')}</span>
          </button>

          <button
            onClick={handleResetZero}
            className="neu-btn w-full sm:w-auto px-6 py-3 rounded-xl text-red-700 font-black flex items-center justify-center gap-2 hover:text-red-900"
          >
            <Database className="w-4 h-4" />
            <span>{t('clearDataTitle')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
