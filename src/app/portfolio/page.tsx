'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers3,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Opportunity } from '@/lib/db/types';
import { useApp } from '@/components/providers/AppProvider';

export default function PortfolioPage() {
  const { t, fmtCurrency, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOpportunities(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pilotOpps = opportunities.filter((o) => o.status === 'pilot_approved' || o.status === 'pilot_in_progress');
  const activeOpps = opportunities.filter((o) => o.status === 'active' || o.status === 'approved_for_launch');

  const fmtSAR = fmtCurrency;

  return (
    <div className="space-y-6">
      {/* Title — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <div className="flex items-center gap-2 text-xs font-black text-[#315EE8] uppercase tracking-wider mb-1.5">
          <span className="p-1 rounded-md neu-pressed text-[#315EE8]">
            <Rocket className="w-3.5 h-3.5" />
          </span>
          <span>
            {language === 'ar' ? 'الوحدتان الرابعة والخامسة — حوكمة التنفيذ ومتابعة الأداء' : 'Modules Four & Five — Execution & Performance Governance'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
          {language === 'ar' ? 'متابعة المحفظة، والتجارب، وإطلاق المنتجات' : 'Portfolio, Pilot & Launch Tracking'}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 font-semibold mt-1">
          {language === 'ar'
            ? 'متابعة التجارب المعتمدة، وقوائم جاهزية الإطلاق، ومقارنة الإيرادات الشهرية المتكررة وهوامش الربح.'
            : 'Monitor approved pilots, launch readiness checklists, and post-launch monthly recurring revenue variance.'}
        </p>
      </div>

      {/* Pilots Section — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-black text-lg text-black">
              {language === 'ar' ? 'عمليات التجارب الاستطلاعية المعتمدة' : 'Approved Pilot Operations'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              {language === 'ar' ? 'تجارب واقعية محددة النطاق للتحقق الميداني بميزانيات معتمدة.' : 'Controlled, bounded real-world validation trials with authorized budgets.'}
            </p>
          </div>
          <span className="neu-pressed px-3.5 py-1 rounded-full text-xs font-black text-[#315EE8]">
            {pilotOpps.length} {language === 'ar' ? 'تجارب نشطة' : 'Active Pilots'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {pilotOpps.length === 0 ? (
            <div className="col-span-2 neu-pressed p-10 text-center text-slate-400 font-bold text-xs rounded-2xl">
              {language === 'ar' ? 'لا توجد فرص استثمارية في مرحلة التجربة حالياً.' : 'No opportunities currently in pilot stage.'}
            </div>
          ) : (
            pilotOpps.map((o) => (
              <div key={o.id} className="neu-raised-sm p-6 rounded-2xl border border-white space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-black">{o.name}</span>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="neu-btn px-3 py-1.5 text-xs font-black text-[#315EE8] hover:text-[#274ec4] inline-flex items-center gap-1 rounded-xl"
                  >
                    <span>{t('btnInspect')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-slate-600 font-medium leading-relaxed">
                  {o.pilotPlan?.objective || (language === 'ar' ? 'تجربة للتحقق من استعداد العميل للدفع ونسبة التحويل.' : 'Pilot to validate initial willingness-to-pay and conversion rate.')}
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div className="neu-pressed p-2.5 rounded-xl">
                    <span className="text-slate-500 font-bold text-[10px] block">{t('kpiApprovedBudget')}</span>
                    <strong className="text-black font-black text-xs block mt-0.5">{fmtSAR(o.approvedBudgetSAR)}</strong>
                  </div>
                  <div className="neu-pressed p-2.5 rounded-xl">
                    <span className="text-slate-500 font-bold text-[10px] block">{language === 'ar' ? 'العملاء المستهدفون' : 'Target Clients'}</span>
                    <strong className="text-black font-black text-xs block mt-0.5">{o.pilotPlan?.targetCustomers || 3} {language === 'ar' ? 'عملاء' : 'Clients'}</strong>
                  </div>
                  <div className="neu-pressed p-2.5 rounded-xl">
                    <span className="text-slate-500 font-bold text-[10px] block">{language === 'ar' ? 'المدة' : 'Duration'}</span>
                    <strong className="text-black font-black text-xs block mt-0.5">{o.pilotPlan?.durationDays || 45} {language === 'ar' ? 'يوماً' : 'Days'}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Commercialized Products & Actuals Table — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-black text-lg text-black">
              {language === 'ar' ? 'المنتجات المطروحة تجارياً ومتابعة الإيرادات' : 'Active Commercialized Products & Revenue Tracking'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              {language === 'ar'
                ? 'مقارنة الإيرادات الشهرية المتكررة وهوامش التشغيل الفعلية مع التوقعات الاستثمارية المعتمدة.'
                : 'Comparing actual monthly recurring revenue and operating margins with original approved investment forecasts.'}
            </p>
          </div>
          <span className="neu-pressed px-3.5 py-1 rounded-full text-xs font-black text-emerald-700">
            {activeOpps.length} {language === 'ar' ? 'منتجات في السوق' : 'Live Products'}
          </span>
        </div>

        <div className="neu-pressed p-2 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-600 font-black uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t('productName')}</th>
                <th className="py-3.5 px-4">{t('thCategory')}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'المسؤول' : 'Owner'}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'آخر إيراد شهري مسجل' : 'Latest Recorded MRR'}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'إجمالي السيولة المستثمرة' : 'Total Cash Invested'}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'حالة التعادل' : 'Break-Even Status'}</th>
                <th className="py-3.5 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeOpps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-bold">
                    {language === 'ar' ? 'لا توجد منتجات تجارية نشطة مسجلة حالياً.' : 'No active commercialized products recorded.'}
                  </td>
                </tr>
              ) : (
                activeOpps.map((o) => {
                  const latestPerf = o.actualPerformance?.[o.actualPerformance.length - 1];
                  return (
                    <tr key={o.id} className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-black text-sm">{o.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">{o.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="neu-pressed px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-slate-700">
                          {o.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{o.ownerName}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 tabular-nums">
                        {latestPerf ? fmtSAR(latestPerf.mrrSAR) : (language === 'ar' ? 'مرحلة ما قبل الإيرادات' : 'Pre-Revenue')}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-black text-black">{fmtSAR(o.approvedBudgetSAR)}</td>
                      <td className="py-3.5 px-4">
                        <span className="neu-raised-sm inline-block px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-700">
                          {language === 'ar' ? 'ضمن مسار استرداد الاستثمار' : 'On Track to Payback'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/opportunities/${o.id}`}
                          className="neu-btn px-3 py-1.5 text-xs font-black text-[#315EE8] hover:text-[#274ec4] inline-flex items-center gap-1 rounded-lg"
                        >
                          {language === 'ar' ? 'عرض النتائج الفعلية ←' : 'View Actuals →'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
