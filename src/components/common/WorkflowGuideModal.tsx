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
  Layers,
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
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: isRtl ? 'ميزانية ≤ 25 ألف' : 'Cap ≤ SAR 25k',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-br from-gray-900 to-[#111827] text-white flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#6484FF] uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'منهجية العمل القياسية' : 'Standard Operating Procedure'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {t('workflowModalTitle')}
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
              {t('workflowModalSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 4 Stages */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[#E6EAF1] bg-[#F8FAFC] hover:bg-white hover:border-[#315EE8]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${st.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 shadow-2xs">
                        {st.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-gray-500">
                    <span>{isRtl ? `الخطوة ${st.num}` : `Step ${st.num}`}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Golden Rules Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {isRtl ? 'قاعدة ذهبية لشركة بي-آي-تي:' : 'B-IT Golden Rule:'}
              </span>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                {isRtl
                  ? 'لا يتم كتابة سطر كود واحد أو اعتماد أي ميزانية تزيد عن 25,000 ر.س دون إثبات رغبة عميل سعودي حقيقي في الدفع وتوقيعه خطاب نية أو تجربة مدفوعة.'
                  : 'No custom code is commissioned and no budget beyond SAR 25,000 is authorized without verified Saudi customer demand and signed commitments.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#E6EAF1] bg-white flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            {isRtl ? 'مستند إلى وثيقة حوكمة استثمار المنتجات' : 'Based on B-IT Product Governance Manual'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#315EE8] hover:bg-[#274ec4] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
          >
            <span>{t('closeGuide')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
