'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Building,
} from 'lucide-react';
import { useApp } from '../providers/AppProvider';

interface Suggestion {
  id: string;
  icon: any;
  labelEn: string;
  labelAr: string;
  responseEn: string;
  responseAr: string;
}

const PRESET_QUERIES: Suggestion[] = [
  {
    id: 'lawos',
    icon: Scale,
    labelEn: 'Analyze LawOS 360 (10 Pilot Strategy)',
    labelAr: 'تحليل استراتيجية LawOS 360 (تجارب 10 مكاتب)',
    responseEn:
      'LawOS 360 targets 4,200 licensed law firms in Saudi Arabia with an ARR potential of SAR 30.2M. The 1-year 10-firm pilot strategy validates retention, case AI workflows, and builds defensible reference profiles with a controlled budget of SAR 22,000 (well within the SAR 25,000 capital ceiling).',
    responseAr:
      'يستهدف نظام LawOS 360 أكثر من 4,200 مكتب محاماة مرخص في المملكة بإجمالي سوق مستهدف 30.2 مليون ر.س سنوياً. استراتيجية تجربة 10 مكاتب لمدة عام كامل تحقق بناء سجل نجاح قوي وتدريب خوارزميات الذكاء الاصطناعي بميزانية تحقق مضبوطة 22,000 ر.س (أقل من سقف 25,000 ر.س).',
  },
  {
    id: 'bitex',
    icon: Building,
    labelEn: 'Audit BITEX (Autonomous ZATCA ERP)',
    labelAr: 'فحص BITEX (نظام ERP المؤتمت والمتوافق مع هيئة الزكاة)',
    responseEn:
      'BITEX addresses 185,000 Saudi SMEs requiring Phase-2 ZATCA e-invoicing integration. The core differentiator is zero-touch autonomous agents that automatically extract supplier invoices, calculate VAT, and generate Phase-2 XML clearance without human manual entry.',
    responseAr:
      'يستهدف نظام BITEX أكثر من 185,000 منشأة تجارية وصناعية ملزمة بالربط والتكامل مع المرحلة الثانية للفوترة الإلكترونية (زاتكا). الميزة التنافسية الحصرية هي الوكلاء الأذكياء الذين يسجلون القيود والفواتير ذاتياً بدون تدخل بشري.',
  },
  {
    id: 'capital',
    icon: ShieldCheck,
    labelEn: 'Verify Capital Discipline (< SAR 25,000)',
    labelAr: 'فحص انضباط رأس المال (أقل من 25,000 ر.س)',
    responseEn:
      'BI Technology policy strictly mandates: initial validation and pilot budgets must not exceed SAR 25,000 per project. LawOS 360 is budgeted at SAR 22,000 and BITEX at SAR 24,000. Both comply with 100% human governance sign-off.',
    responseAr:
      'تنص سياسة شركة بي آي للتكنولوجيا بصرامة على ألا تتجاوز ميزانية التحقق والتجربة 25,000 ر.س للمشروع الواحد. تبلغ ميزانية LawOS 360 المقترحة 22,000 ر.س وميزانية BITEX تبلغ 24,000 ر.س، وكلاهما مستوفٍ لمتطلبات الموافقة البشرية الإلزامية.',
  },
];

export default function BiAdvisorWidget() {
  const { language, isRtl, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState<Suggestion | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [customReply, setCustomReply] = useState<string | null>(null);

  const handleSelectQuery = (q: Suggestion) => {
    setActiveQuery(q);
    setCustomReply(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const lower = inputVal.toLowerCase();
    if (lower.includes('lawos') || lower.includes('law')) {
      setCustomReply(PRESET_QUERIES[0][language === 'ar' ? 'responseAr' : 'responseEn']);
    } else if (lower.includes('bitex') || lower.includes('erp') || lower.includes('zatca')) {
      setCustomReply(PRESET_QUERIES[1][language === 'ar' ? 'responseAr' : 'responseEn']);
    } else if (lower.includes('budget') || lower.includes('capital') || lower.includes('25')) {
      setCustomReply(PRESET_QUERIES[2][language === 'ar' ? 'responseAr' : 'responseEn']);
    } else {
      setCustomReply(
        language === 'ar'
          ? `بصفتي مستشارك الذكي في بي آي للتكنولوجيا، قمت بتحليل استفسارك بخصوص "${inputVal}". النظام يعتمد على 9 بوابات حوكمة إلزامية، وفترة استرداد مستهدفة أقل من 12 شهراً، مع التركيز على حلول الذكاء الاصطناعي ذات الإيراد المتكرر في السوق السعودي.`
          : `As your BI Technology AI Advisor, I evaluated your query regarding "${inputVal}". The platform prioritizes high capital efficiency, 9 mandatory governance gates, and < 12-month payback horizons for recurring-revenue AI products in Saudi Arabia.`
      );
    }
    setActiveQuery(null);
    setInputVal('');
  };

  return (
    <div
      className={`fixed bottom-6 ${
        isRtl ? 'left-6' : 'right-6'
      } z-50 flex flex-col items-end no-print`}
    >
      {/* Expanded Neomorphic Advisory Drawer */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-3rem)] rounded-3xl neu-raised border border-white overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          {/* Header with Mascot & Brand in Obsidian Black */}
          <div className="bg-[#0B0F17] p-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative p-1 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <img
                  src="/brand/mascot.png"
                  alt="BI Mascot"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F17]" />
              </div>
              <div>
                <div className="font-black text-sm tracking-wide flex items-center gap-1.5">
                  <span>{language === 'ar' ? 'مستشار بي آي الذكي' : 'BI Intelligence Advisor'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xs text-slate-400 font-bold">
                  {language === 'ar' ? 'بي آي للتكنولوجيا · ذكاء الأعمال' : 'BI Technology · Business Intelligence'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4 max-h-[22rem] overflow-y-auto bg-[#F4F7FB]">
            {/* Mascot Greeting */}
            <div className="flex items-start gap-2.5">
              <img
                src="/brand/mascot.png"
                alt="BI Mascot"
                className="w-8 h-8 object-contain mt-0.5 shrink-0"
              />
              <div className="neu-raised-sm bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200/80 text-xs text-slate-900 leading-relaxed font-medium">
                {language === 'ar' ? (
                  <>
                    مرحباً <span className="font-extrabold text-[#315EE8]">{currentUser.name}</span>! أنا المستشار الذكي لمنصة{' '}
                    <span className="font-black">ذكاء الأعمال</span> في <span className="font-black">بي آي للتكنولوجيا</span>. كيف يمكنني مساعدتك في دراسة الفرص والاستثمارات اليوم؟
                  </>
                ) : (
                  <>
                    Hello <span className="font-extrabold text-[#315EE8]">{currentUser.name}</span>! I am your AI Business Intelligence advisor for{' '}
                    <span className="font-black">BI Technology</span>. How can I assist you with product evaluation and market decisions?
                  </>
                )}
              </div>
            </div>

            {/* Quick Query Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                {language === 'ar' ? 'استفسارات سريعة مقترحة:' : 'Recommended quick audits:'}
              </div>
              <div className="space-y-2">
                {PRESET_QUERIES.map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuery(q)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                        activeQuery?.id === q.id
                          ? 'neu-pressed bg-[#e3eaf3] text-[#315EE8] border border-blue-400'
                          : 'neu-btn text-slate-800 hover:text-[#315EE8]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#315EE8] shrink-0" />
                      <span className="truncate">{language === 'ar' ? q.labelAr : q.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Response Display */}
            {(activeQuery || customReply) && (
              <div className="neu-pressed p-4 rounded-2xl bg-[#e6edf6] text-xs text-slate-900 space-y-2 border border-blue-200">
                <div className="flex items-center gap-2 font-black text-blue-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {activeQuery
                      ? language === 'ar'
                        ? activeQuery.labelAr
                        : activeQuery.labelEn
                      : language === 'ar'
                      ? 'تحليل الذكاء الاصطناعي'
                      : 'AI Intelligence Analysis'}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-900 font-semibold">
                  {customReply ||
                    (activeQuery &&
                      (language === 'ar' ? activeQuery.responseAr : activeQuery.responseEn))}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Input Form */}
          <form
            onSubmit={handleCustomSubmit}
            className="p-3 bg-[#EDF2F7] border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اسأل المستشار الذكي عن أي فرصة...'
                  : 'Ask BI Advisor about any opportunity...'
              }
              className="neu-pressed flex-1 px-3.5 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="neu-btn-primary px-4 py-2.5 text-white font-black text-xs shrink-0"
            >
              {language === 'ar' ? 'إرسال' : 'Ask'}
            </button>
          </form>
        </div>
      )}

      {/* Floating Neomorphic Launcher Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="neu-btn group flex items-center gap-3.5 px-4 py-2.5 rounded-full border border-white/90 shadow-[6px_6px_16px_rgba(166,180,200,0.38),-6px_-6px_16px_rgba(255,255,255,1)]"
        title="BI Technology AI Advisor"
      >
        <div className="relative">
          <img
            src="/brand/mascot.png"
            alt="BI Mascot"
            className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform"
          />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="font-black text-sm text-black tracking-tight flex items-center gap-1.5">
            <span>{language === 'ar' ? 'مستشار بي آي' : 'BI Advisor'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#315EE8] text-white">
              AI
            </span>
          </div>
          <div className="text-xs text-slate-600 font-bold">
            {language === 'ar' ? 'متصل وجاهز للاستشارة' : 'Online & Ready'}
          </div>
        </div>
      </button>
    </div>
  );
}
