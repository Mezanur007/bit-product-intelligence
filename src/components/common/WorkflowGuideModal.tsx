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
      color: 'text-[#315EE8]',
      badge: isRtl ? 'الفحص الأولي' : 'Intake & Problem',
    },
    {
      num: '2',
      title: t('workflowStage2'),
      desc: t('workflowStage2Desc'),
      icon: Search,
      color: 'text-indigo-600',
      badge: isRtl ? 'الأدلة والحسابات' : '6-Step Evidence',
    },
    {
      num: '3',
      title: t('workflowStage3'),
      desc: t('workflowStage3Desc'),
      icon: ShieldCheck,
      color: 'text-emerald-700',
      badge: isRtl ? 'موافقة إلزامية' : 'Zero Exceptions',
    },
    {
      num: '4',
      title: t('workflowStage4'),
      desc: t('workflowStage4Desc'),
      icon: Rocket,
      color: 'text-[#315EE8]',
      badge: isRtl ? 'ميزانية ≤ 25 ألف' : 'Cap ≤ SAR 25k',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="neu-raised w-full max-w-3xl rounded-3xl border border-white overflow-hidden shadow-2xl flex flex-col max-h-[92vh] bg-[#EDF2F7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header — Obsidian Black */}
        <div className="p-6 bg-[#0B0F17] text-white flex items-center justify-between relative border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative p-1.5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <img
                src="/brand/mascot.png"
                alt="BI Mascot"
                className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-wider mb-1">
                <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
                <span>{isRtl ? 'بي آي للتكنولوجيا · دليل العمليات' : 'BI Technology · Standard Operating Procedure'}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {t('workflowModalTitle')}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
                {t('workflowModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 4 Stages */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#EDF2F7]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="neu-raised p-5 rounded-2xl flex flex-col justify-between border border-white"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl neu-pressed flex items-center justify-center ${st.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="neu-pressed text-xs font-black uppercase px-3 py-1 text-slate-800">
                        {st.badge}
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-black text-black mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                      {st.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-black text-slate-600">
                    <span>{isRtl ? `الخطوة ${st.num}` : `Step ${st.num}`}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Golden Rules Callout */}
          <div className="neu-pressed p-5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs md:text-sm text-amber-950 flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-amber-950 mb-1">
                {isRtl ? 'قاعدة ذهبية لشركة بي آي للتكنولوجيا:' : 'BI Technology Golden Rule:'}
              </span>
              <p className="text-amber-900 leading-relaxed text-xs md:text-sm font-bold">
                {isRtl
                  ? 'لا يتم كتابة سطر كود واحد أو اعتماد أي ميزانية تزيد عن 25,000 ر.س دون إثبات رغبة عميل سعودي حقيقي في الدفع وتوقيعه خطاب نية أو تجربة مدفوعة.'
                  : 'No custom code is commissioned and no budget beyond SAR 25,000 is authorized without verified Saudi customer demand and signed commitments.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-[#EDF2F7] flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <div className="p-1 rounded bg-white shadow-2xs">
              <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
            </div>
            <span>{isRtl ? 'مستند إلى وثيقة حوكمة استثمار المنتجات لشركة بي آي للتكنولوجيا' : 'Based on BI Technology Product Governance Manual'}</span>
          </div>
          <button
            onClick={onClose}
            className="neu-btn-primary px-6 py-2.5 text-white text-xs md:text-sm font-black flex items-center gap-2"
          >
            <span>{t('closeGuide')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
