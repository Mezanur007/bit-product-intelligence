'use client';

import React, { useState } from 'react';
import {
  ChartNoAxesCombined,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  calculateFinancialModel,
  generateThreeScenarios,
  runSensitivityAnalysis,
  FinancialAssumptions,
} from '@/lib/financial-engine';
import { useApp } from '@/components/providers/AppProvider';

export default function FinancialSimulatorPage() {
  const { t, fmtCurrency, language, isRtl } = useApp();
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>({
    monthlyPricePerCustomer: 650,
    setupFeePerCustomer: 500,
    annualDiscountPercent: 15,
    annualBillingSharePercent: 25,
    variableHostingPerCustomer: 30,
    variableSupportPerCustomer: 25,
    paymentProcessingPercent: 2.5,
    paymentProcessingFixed: 1.0,
    fixedHostingAndTools: 1200,
    fixedMarketingAndSales: 2000,
    fixedMaintenanceAndLabor: 1500,
    fixedGeneralAndAdmin: 500,
    initialResearchAndDesignCash: 3000,
    initialDevelopmentCash: 8000,
    initialMarketingLaunchCash: 3500,
    initialContingencyCash: 1500,
    internalLaborEconomicCost: 12000,
    startingPayingCustomers: 0,
    monthlyNewCustomers: 6,
    monthlyCustomerGrowthRatePercent: 4,
    monthlyChurnPercent: 2.5,
    horizonMonths: 24,
  });

  const [activeScenario, setActiveScenario] = useState<'base' | 'downside' | 'upside'>('base');
  const scenarios = generateThreeScenarios(assumptions);
  const currentModel = activeScenario === 'base' ? scenarios.base : activeScenario === 'downside' ? scenarios.downside : scenarios.upside;

  const sensitivityPrice = runSensitivityAnalysis(assumptions, 'price');
  const sensitivityAcq = runSensitivityAnalysis(assumptions, 'acquisitions');

  const fmtSAR = fmtCurrency;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neu-raised p-6 rounded-3xl border border-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <ChartNoAxesCombined className="w-3.5 h-3.5" />
            <span>{t('modelingEngine')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            {t('finSimulatorTitle')}
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            {t('finSimulatorSub')}
          </p>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center gap-2 neu-pressed p-1.5 rounded-2xl text-xs">
          <button
            onClick={() => setActiveScenario('downside')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeScenario === 'downside' ? 'bg-red-500 text-white shadow-sm rounded-xl' : 'text-gray-600'
            }`}
          >
            {t('downsideTab')}
          </button>
          <button
            onClick={() => setActiveScenario('base')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeScenario === 'base' ? 'bg-[#315EE8] text-white shadow-sm rounded-xl' : 'text-gray-600'
            }`}
          >
            {t('baseTab')}
          </button>
          <button
            onClick={() => setActiveScenario('upside')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeScenario === 'upside' ? 'bg-emerald-600 text-white shadow-sm rounded-xl' : 'text-gray-600'
            }`}
          >
            {t('upsideTab')}
          </button>
        </div>
      </div>

      {/* KPI Outputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-raised p-5 rounded-3xl border border-white">
          <div className="text-[11px] font-bold text-gray-500 uppercase">{t('unitContribution')}</div>
          <div className={`text-2xl font-extrabold mt-1 tabular-nums ${currentModel.breakEven.isContributionPositive ? 'text-emerald-700' : 'text-red-600'}`}>
            {fmtSAR(currentModel.breakEven.monthlyContributionPerCustomer)}/{language === 'ar' ? 'شهر' : 'mo'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {t('contributionMargin')}: {currentModel.breakEven.contributionMarginPercent}%
          </div>
        </div>

        <div className="neu-raised p-5 rounded-3xl border border-white">
          <div className="text-[11px] font-bold text-[#315EE8] uppercase">{t('operatingBreakEven')}</div>
          <div className="text-2xl font-extrabold text-[#315EE8] mt-1 tabular-nums">
            {currentModel.breakEven.operatingBreakEvenCustomers !== null
              ? `${currentModel.breakEven.operatingBreakEvenCustomers} ${language === 'ar' ? 'عميل' : 'Customers'}`
              : (language === 'ar' ? 'مساهمة سالبة' : 'Negative Contribution')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'لتغطية مصاريف ثابتة' : 'To cover fixed opex of'} {fmtSAR(currentModel.breakEven.currentMonthlyFixedCosts)}/{language === 'ar' ? 'شهر' : 'mo'}
          </div>
        </div>

        <div className="neu-raised p-5 rounded-3xl border border-white">
          <div className="text-[11px] font-bold text-gray-500 uppercase">{t('investmentPayback')}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1 tabular-nums">
            {currentModel.breakEven.investmentPaybackMonth !== null
              ? `${language === 'ar' ? 'الشهر' : 'Month'} ${currentModel.breakEven.investmentPaybackMonth}`
              : (language === 'ar' ? 'غير مسترد خلال ٢٤ شهراً' : 'Not within 24m')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'الاستثمار النقدي المسبق:' : 'Cash investment:'} {fmtSAR(currentModel.breakEven.totalInitialCashRequirement)}
          </div>
        </div>

        <div className="neu-raised p-5 rounded-3xl border border-white">
          <div className="text-[11px] font-bold text-gray-500 uppercase">{t('year1OperatingProfit')}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1 tabular-nums">
            {fmtSAR(currentModel.summaryYear1.totalOperatingProfit)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'إيراد نهاية السنة الأولى:' : 'End Year 1 MRR:'} {fmtSAR(currentModel.summaryYear1.endMrr)}
          </div>
        </div>
      </div>

      {/* Main Cash Flow Chart */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <h3 className="font-bold text-sm text-[#172033] mb-1">
          {language === 'ar'
            ? `مسار التدفقات النقدية التراكمية والاسترداد لـ 24 شهراً (${activeScenario === 'base' ? 'السيناريو الأساسي' : activeScenario === 'downside' ? 'السيناريو المتشائم' : 'السيناريو المتفائل'})`
            : `24-Month Cumulative Cash Flow & Payback Curve (${activeScenario.toUpperCase()})`}
        </h3>
        <p className="text-xs text-[#778397] mb-4">
          {language === 'ar'
            ? 'يوضح التدفقات النقدية السلبية الأولية للتطوير والتسويق، والتحول إلى استرداد موجب مع نمو قاعدة العملاء.'
            : 'Shows initial negative cash flow from development and marketing, transitioning to positive payback as paying customer base scales.'}
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentModel.monthlyProjections}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [fmtCurrency(Number(val)), '']}
                contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="totalRevenue" name={language === 'ar' ? 'الإيراد الشهري' : 'Monthly Revenue'} stroke="#159769" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="operatingProfit" name={language === 'ar' ? 'الربح التشغيلي الشهري' : 'Monthly Operating Profit'} stroke="#6484FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cumulativeCashFlow" name={language === 'ar' ? 'التدفق النقدي التراكمي' : 'Cumulative Cash Flow'} stroke="#315EE8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Assumption Sliders & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pricing & Acquisition */}
        <div className="neu-raised p-5 rounded-3xl border border-white text-xs space-y-4">
          <span className="font-bold text-[#315EE8] uppercase text-[11px] block">
            {language === 'ar' ? 'التسعير وقاعدة العملاء' : 'Pricing & Customers'}
          </span>
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'سعر الاشتراك الشهري:' : 'Monthly Price:'} {fmtSAR(assumptions.monthlyPricePerCustomer)}
            </label>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={assumptions.monthlyPricePerCustomer}
              onChange={(e) => setAssumptions({ ...assumptions, monthlyPricePerCustomer: Number(e.target.value) })}
              className="w-full accent-[#315EE8]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'إضافات العملاء الجدد شهرياً:' : 'Monthly New Customer Additions:'} {assumptions.monthlyNewCustomers}
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={assumptions.monthlyNewCustomers}
              onChange={(e) => setAssumptions({ ...assumptions, monthlyNewCustomers: Number(e.target.value) })}
              className="w-full accent-[#315EE8]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'معدل التسرب الشهري:' : 'Monthly Churn:'} {assumptions.monthlyChurnPercent}%
            </label>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={assumptions.monthlyChurnPercent}
              onChange={(e) => setAssumptions({ ...assumptions, monthlyChurnPercent: Number(e.target.value) })}
              className="w-full accent-[#315EE8]"
            />
          </div>
        </div>

        {/* Direct Variable Costs */}
        <div className="neu-raised p-5 rounded-3xl border border-white text-xs space-y-4">
          <span className="font-bold text-[#315EE8] uppercase text-[11px] block">
            {language === 'ar' ? 'التكاليف المتغيرة المباشرة' : 'Direct Variable Costs'}
          </span>
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'استضافة سحابية ورموز ذكاء اصطناعي:' : 'Cloud Infra & AI Tokens:'} {fmtSAR(assumptions.variableHostingPerCustomer)}/{language === 'ar' ? 'عميل' : 'cust'}
            </label>
            <input
              type="range"
              min={5}
              max={300}
              step={5}
              value={assumptions.variableHostingPerCustomer}
              onChange={(e) => setAssumptions({ ...assumptions, variableHostingPerCustomer: Number(e.target.value) })}
              className="w-full accent-[#315EE8]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'ساعات دعم العملاء:' : 'Customer Support Hours:'} {fmtSAR(assumptions.variableSupportPerCustomer)}/{language === 'ar' ? 'عميل' : 'cust'}
            </label>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={assumptions.variableSupportPerCustomer}
              onChange={(e) => setAssumptions({ ...assumptions, variableSupportPerCustomer: Number(e.target.value) })}
              className="w-full accent-[#315EE8]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'رسوم بوابة الدفع الإلكتروني:' : 'Payment Gateway Fee:'} {assumptions.paymentProcessingPercent}% + {language === 'ar' ? '1 ر.س' : '1 SAR'}
            </label>
            <div className="text-[11px] text-gray-400">
              {language === 'ar' ? 'معالجة بطاقات مدى / فيزا / ماستركارد المعتمدة في السعودية' : 'Standard Saudi Mada / Visa gateway processing'}
            </div>
          </div>
        </div>

        {/* Fixed Overhead & Capital Requirement */}
        <div className="neu-raised p-5 rounded-3xl border border-white text-xs space-y-4">
          <span className="font-bold text-[#315EE8] uppercase text-[11px] block">
            {language === 'ar' ? 'التكاليف الثابتة ورأس المال الأولي' : 'Fixed Costs & Initial Cash'}
          </span>
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'المصاريف التشغيلية الثابتة:' : 'Monthly Fixed Opex:'} {fmtSAR(assumptions.fixedHostingAndTools + assumptions.fixedMarketingAndSales + assumptions.fixedMaintenanceAndLabor + assumptions.fixedGeneralAndAdmin)}/{language === 'ar' ? 'شهر' : 'mo'}
            </label>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={assumptions.fixedHostingAndTools + assumptions.fixedMarketingAndSales + assumptions.fixedMaintenanceAndLabor + assumptions.fixedGeneralAndAdmin}
              onChange={(e) => {
                const total = Number(e.target.value);
                setAssumptions({
                  ...assumptions,
                  fixedHostingAndTools: Math.round(total * 0.3),
                  fixedMarketingAndSales: Math.round(total * 0.4),
                  fixedMaintenanceAndLabor: Math.round(total * 0.2),
                  fixedGeneralAndAdmin: Math.round(total * 0.1),
                });
              }}
              className="w-full accent-[#315EE8]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'السيولة النقدية الأولية المطلوبة:' : 'Initial Cash Requirement:'} {fmtSAR(assumptions.initialDevelopmentCash + assumptions.initialResearchAndDesignCash + assumptions.initialMarketingLaunchCash + assumptions.initialContingencyCash)}
            </label>
            <input
              type="range"
              min={3000}
              max={30000}
              step={1000}
              value={assumptions.initialDevelopmentCash + assumptions.initialResearchAndDesignCash + assumptions.initialMarketingLaunchCash + assumptions.initialContingencyCash}
              onChange={(e) => {
                const total = Number(e.target.value);
                setAssumptions({
                  ...assumptions,
                  initialDevelopmentCash: total,
                  initialResearchAndDesignCash: 0,
                  initialMarketingLaunchCash: 0,
                  initialContingencyCash: 0,
                });
              }}
              className="w-full accent-[#315EE8]"
            />
            <span className="text-[10px] text-gray-400">
              {language === 'ar' ? 'سقف ميزانية الفريق: 25,000 ر.س' : 'Team budget cap: 25,000 SAR'}
            </span>
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis Table */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white text-xs">
        <h3 className="font-bold text-sm text-[#172033] mb-1">
          {language === 'ar' ? 'تحليل حساسية السعر واختبارات التحمل' : 'Price Sensitivity Analysis'}
        </h3>
        <p className="text-xs text-[#778397] mb-4">
          {language === 'ar'
            ? 'أثر تغير السعر الشهري بنسبة ±10% و ±20% على إيراد نهاية السنة الأولى وأرباحها التشغيلية وعملاء التعادل.'
            : 'Impact of varying monthly customer price by ±10% and ±20% on year 1 MRR and break-even customers.'}
        </p>

        <div className="neu-pressed rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#EDF2F7]/60 text-gray-500 uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">{language === 'ar' ? 'تباين السعر' : 'Price Variance'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'السعر الشهري المحاكى' : 'Simulated Monthly Price'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'إيراد نهاية السنة الأولى' : 'End Year 1 MRR'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'صافي أرباح السنة الأولى' : 'Year 1 Operating Profit'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'عملاء نقطة التعادل' : 'Break-Even Customers'}</th>
                <th className="py-2.5 px-3">{language === 'ar' ? 'أفق استرداد الاستثمار' : 'Payback Horizon'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {sensitivityPrice.map((s, idx) => (
                <tr key={idx} className={`hover:bg-white/30 ${s.deltaPercent === 0 ? 'bg-blue-50/60 font-bold' : ''}`}>
                  <td className="py-2.5 px-3 font-semibold">
                    {s.deltaPercent > 0 ? `+${s.deltaPercent}%` : `${s.deltaPercent}%`}
                    {s.deltaPercent === 0 && ` (${language === 'ar' ? 'الأساسي' : 'Baseline'})`}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    {fmtSAR(Math.round(assumptions.monthlyPricePerCustomer * (1 + s.deltaPercent / 100)))}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-gray-900 tabular-nums">{fmtSAR(s.endMrr)}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700 tabular-nums">{fmtSAR(s.operatingProfitYear1)}</td>
                  <td className="py-2.5 px-3 tabular-nums">{s.breakEvenCustomers} {language === 'ar' ? 'عميل' : 'Customers'}</td>
                  <td className="py-2.5 px-3 tabular-nums">
                    {s.paybackMonth !== null ? `${language === 'ar' ? 'الشهر' : 'Month'} ${s.paybackMonth}` : (language === 'ar' ? 'غير متحقق' : 'Not reached')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
