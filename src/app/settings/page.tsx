'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building,
  Save,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { ScoreWeights, DEFAULT_WEIGHTS, validateWeights } from '@/lib/decision-engine';

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
        showToast(language === 'ar' ? 'تمت استعادة المحفظة التجريبية المعتمدة لـ بي-آي-تي' : 'Restored standard B-IT demo portfolio');
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
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>{t('systemGovParams')}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
          {t('platformConfig')}
        </h1>
        <p className="text-sm text-[#778397] mt-1">
          {t('platformConfigSub')}
        </p>
      </div>

      {/* Decision Criteria Weights Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">{t('evalWeightsTitle')}</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {t('evalWeightsSub')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSumValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {language === 'ar' ? 'المجموع الحالي:' : 'Current Sum:'} {currentSum}% {isSumValid ? '✓' : (language === 'ar' ? '(يجب أن يساوي 100%)' : '(Must equal 100%)')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'جاذبية السوق وحجمه (%)' : 'Market Attractiveness (%)'}: {weights.marketAttractiveness}%
            </label>
            <input
              type="number"
              value={weights.marketAttractiveness}
              onChange={(e) => setWeights({ ...weights, marketAttractiveness: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'التحقق الميداني من طلب العملاء (%)' : 'Customer Validation (%)'}: {weights.customerValidation}%
            </label>
            <input
              type="number"
              value={weights.customerValidation}
              onChange={(e) => setWeights({ ...weights, customerValidation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'التمايز التنافسي والقيمة المضافة (%)' : 'Competitive Differentiation (%)'}: {weights.competitiveDifferentiation}%
            </label>
            <input
              type="number"
              value={weights.competitiveDifferentiation}
              onChange={(e) => setWeights({ ...weights, competitiveDifferentiation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'الجدوى المالية وهوامش الربح (%)' : 'Financial Viability (%)'}: {weights.financialViability}%
            </label>
            <input
              type="number"
              value={weights.financialViability}
              onChange={(e) => setWeights({ ...weights, financialViability: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'الجدوى التقنية وسرعة الإطلاق (%)' : 'Technical Feasibility (%)'}: {weights.technicalFeasibility}%
            </label>
            <input
              type="number"
              value={weights.technicalFeasibility}
              onChange={(e) => setWeights({ ...weights, technicalFeasibility: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'الملاءمة الاستراتيجية وإمكانية إعادة الاستخدام (%)' : 'Strategic Fit & Reusability (%)'}: {weights.strategicFitAndReusability}%
            </label>
            <input
              type="number"
              value={weights.strategicFitAndReusability}
              onChange={(e) => setWeights({ ...weights, strategicFitAndReusability: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {language === 'ar' ? 'الجاهزية التشغيلية وفريق العمل (%)' : 'Operational Readiness (%)'}: {weights.operationalReadiness}%
            </label>
            <input
              type="number"
              value={weights.operationalReadiness}
              onChange={(e) => setWeights({ ...weights, operationalReadiness: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isSumValid}
              className={`w-full py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSumValid ? 'bg-[#315EE8] hover:bg-[#274ec4]' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{t('saveWeights')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Capital Cap & Saudi Compliance Settings */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs space-y-4">
        <h3 className="font-bold text-base text-[#172033]">
          {language === 'ar' ? 'ضوابط رأس المال والانضباط الاستثماري لـ بي-آي-تي' : 'B-IT Capital Discipline & Compliance Controls'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block font-bold text-gray-800 mb-1">{t('valBudgetSAR')}</label>
            <p className="text-[11px] text-gray-500 mb-2">
              {language === 'ar' ? 'الحد الأقصى للسيولة النقدية المصرح بها للتحقق دون استثناء من لجنة الإدارة.' : 'Maximum cash authorization permitted without executive committee special dispensation.'}
            </p>
            <input
              type="number"
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-bold"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block">
                {language === 'ar' ? 'اشتراط الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)' : 'Enforce Saudi PDPL & Data Residency Sign-off'}
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {language === 'ar' ? 'حظر الموافقة على الإطلاق ما لم يتم التحقق من استضافة البيانات في السعودية (me-central-1).' : 'Block launch approval if data hosting is not verified in Saudi Arabia (me-central-1).'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={requirePDPL}
              onChange={(e) => setRequirePDPL(e.target.checked)}
              className="w-5 h-5 text-[#315EE8] rounded"
            />
          </div>
        </div>
      </div>

      {/* Honest Zero-State / Demo Mode Management */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs">
        <h3 className="font-bold text-base text-[#172033] mb-1">{t('clearDataTitle')}</h3>
        <p className="text-gray-500 mb-4">
          {language === 'ar'
            ? 'وفقاً لمتطلبات حوكمة بي-آي-تي، يمكن تشغيل البيئة في وضع الصفر الصادق الخالي من البيانات أو تحميل سجلات تجريبية موسومة بوضوح.'
            : 'As required by B-IT governance, new environments can operate in an honest zero-data state or load clearly labeled demo records.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 text-[#315EE8] font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('restoreDemo')}</span>
          </button>

          <button
            onClick={handleResetZero}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>{t('clearDataTitle')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
