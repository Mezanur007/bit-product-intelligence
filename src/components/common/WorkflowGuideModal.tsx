'use client';

import React from 'react';
import {
  X,
  Target,
  Search,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../providers/AppProvider';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowGuideModal({ isOpen, onClose }: WorkflowGuideModalProps) {
  const { t, isRtl } = useApp();

  if (!isOpen) return null;

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const stages = [
    {
      num: '1',
      title: t('workflowStage1'),
      desc: t('workflowStage1Desc'),
      icon: Target,
      color: 'bg-blue-50 text-[#315EE8] border-blue-200',
      badge: isRtl ? 'الفحص الأولي' : 'Intake & Problem',
    },
    {
      num: '2',
      title: t('workflowStage2'),
      desc: t('workflowStage2Desc'),
      icon: Search,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: isRtl ? 'الأدلة والحسابات' : '6-Step Evidence',
    },
    {
      num: '3',
      title: t('workflowStage3'),
      desc: t('workflowStage3Desc'),
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: isRtl ? 'موافقة إلزامية' : 'Zero Exceptions',
    },
    {
      num: '4',
      title: t('workflowStage4'),
      desc: t('workflowStage4Desc'),
      icon: Rocket,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      badge: isRtl ? 'ميزانية ≤ 25 ألف' : 'Cap ≤ SAR 25k',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-3xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Logo and Mascot */}
        <div className="p-6 bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] text-white flex items-center justify-between relative border-b border-slate-700/80">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/brand/mascot.png"
                alt="BI Mascot"
                className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
                <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
                <span>{isRtl ? 'بي آي للتكنولوجيا · دليل العمليات' : 'BI Technology · Standard Operating Procedure'}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {t('workflowModalTitle')}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {t('workflowModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 4 Stages */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white/60 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl polymorphic-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${st.color} shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {st.badge}
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                      {st.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{isRtl ? `الخطوة ${st.num}` : `Step ${st.num}`}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Golden Rules Callout */}
          <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs md:text-sm text-amber-950 flex items-start gap-3.5 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-amber-900 mb-1">
                {isRtl ? 'قاعدة ذهبية لشركة بي آي للتكنولوجيا:' : 'BI Technology Golden Rule:'}
              </span>
              <p className="text-amber-800 leading-relaxed text-xs md:text-sm font-medium">
                {isRtl
                  ? 'لا يتم كتابة سطر كود واحد أو اعتماد أي ميزانية تزيد عن 25,000 ر.س دون إثبات رغبة عميل سعودي حقيقي في الدفع وتوقيعه خطاب نية أو تجربة مدفوعة.'
                  : 'No custom code is commissioned and no budget beyond SAR 25,000 is authorized without verified Saudi customer demand and signed commitments.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200/80 bg-white/95 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
            <span>{isRtl ? 'مستند إلى وثيقة حوكمة استثمار المنتجات لشركة بي آي للتكنولوجيا' : 'Based on BI Technology Product Governance Manual'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-white text-xs md:text-sm font-bold flex items-center gap-2 transition-all polymorphic-btn-primary"
          >
            <span>{t('closeGuide')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
