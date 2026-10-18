'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers3,
  Search,
  ChartNoAxesCombined,
  ShieldCheck,
  Rocket,
  FileText,
  Users,
  Settings,
  Bell,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Languages,
  HelpCircle,
} from 'lucide-react';
import { useApp, ALL_USERS } from '../providers/AppProvider';
import WorkflowGuideModal from '../common/WorkflowGuideModal';
import BiAdvisorWidget from '../common/BiAdvisorWidget';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentUser,
    setCurrentUser,
    users,
    isDemoMode,
    setIsDemoMode,
    showToast,
    direction,
    toggleLanguage,
    t,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const isRtl = direction === 'rtl';

  const navSections = [
    {
      title: t('navSecHub'),
      items: [
        { name: t('navOverview'), href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: t('navSecPipeline'),
      items: [
        { name: t('navOpportunities'), href: '/opportunities', icon: Layers3 },
        { name: t('navFinancialSimulator'), href: '/financial-simulator', icon: ChartNoAxesCombined },
        { name: t('navMarketIntelligence'), href: '/market-intelligence', icon: Search },
      ],
    },
    {
      title: t('navSecGovernance'),
      items: [
        { name: t('navReports'), href: '/reports', icon: FileText },
        { name: t('navTeam'), href: '/team', icon: Users },
      ],
    },
    {
      title: t('navSecOperations'),
      items: [
        { name: t('navPortfolio'), href: '/portfolio', icon: Rocket },
        { name: t('navSettings'), href: '/settings', icon: Settings },
      ],
    },
  ];

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/system/reset-demo', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(true);
        showToast(isRtl ? 'تمت استعادة محفظة النماذج التجريبية لشركة بي آي' : 'Reset to standard BI Technology demo portfolio');
        window.location.reload();
      }
    } catch {
      showToast(isRtl ? 'خطأ في استعادة النماذج' : 'Failed to reset demo data');
    }
  };

  const handleResetZero = async () => {
    try {
      const res = await fetch('/api/system/reset-zero', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(false);
        showToast(isRtl ? 'تم مسح البيانات. وضع الصفر الفعلي نشط.' : 'All sample data cleared. Honest zero-data active.');
        window.location.reload();
      }
    } catch {
      showToast(isRtl ? 'خطأ في مسح البيانات' : 'Failed to clear data');
    }
  };

  return (
    <div className={`min-h-screen flex bg-[#EDF2F7] text-[#0B0F17] ${isRtl ? 'font-arabic' : ''} relative`}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Neomorphic Obsidian Black Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-40 bg-[#0B0F17] text-white transition-all duration-200 flex flex-col justify-between border-r border-slate-800/80 shadow-2xl ${
          isRtl
            ? `right-0 border-l border-slate-800/80 ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`
            : `left-0 border-r border-slate-800/80 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`
        } ${collapsed ? 'w-20' : 'w-72'}`}
      >
        <div>
          {/* Brand Header with Real Company Logo */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/60">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="relative shrink-0 p-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <img
                  src="/brand/logo.webp"
                  alt="BI Technology"
                  className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.7)] group-hover:scale-105 transition-transform"
                />
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="font-black text-base tracking-wide text-white flex items-center gap-1.5">
                    <span>{isRtl ? 'بي آي' : 'BI'}</span>
                    <span className="text-cyan-400 font-black">
                      {isRtl ? 'للتكنولوجيا' : 'TECHNOLOGY'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-extrabold tracking-wider uppercase mt-0.5">
                    {isRtl ? 'ذكاء الأعمال' : 'Business Intelligence'}
                  </div>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Toggle sidebar"
            >
              <div className="w-1.5 h-4 bg-slate-600 rounded-full" />
            </button>
          </div>

          {/* Grouped Navigation Links with Tactile Neomorphic Styling */}
          <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-17rem)]">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 py-1 text-[11px] font-black text-slate-400 tracking-wider uppercase">
                    {section.title}
                  </div>
                )}
                <nav className="space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-[#315EE8] text-white shadow-[4px_4px_12px_rgba(49,94,232,0.45),-2px_-2px_8px_rgba(255,255,255,0.15)] border border-blue-400/40'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer with Mascot Card & User Meta */}
        <div className="p-3.5 border-t border-slate-800/60 space-y-3">
          {!collapsed && (
            <div className="neu-dark-raised p-3.5 rounded-2xl border border-cyan-500/25 shadow-lg text-xs relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-1.5">
                <img
                  src="/brand/mascot.png"
                  alt="BI Mascot"
                  className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
                <div>
                  <div className="text-cyan-400 font-extrabold text-xs flex items-center gap-1">
                    <span>{isRtl ? 'مساعد بي آي الذكي' : 'BI Copilot'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {isRtl ? 'مستشار دراسة الفرص' : 'Decision Intelligence'}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-2 font-normal">
                {t('aiAgentDesc')}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-black tracking-wider shadow-inner">
                {t('phase2Ready')}
              </span>
            </div>
          )}

          {/* User Meta Debossed Well */}
          <div className="neu-dark-pressed flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-[#315EE8] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_6px_rgba(0,0,0,0.5)]">
              {currentUser.avatarInitials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <div className="font-extrabold text-sm text-white truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate capitalize font-semibold">{currentUser.role.replace('_', ' ')}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 relative z-10 ${
          isRtl
            ? collapsed
              ? 'lg:pr-20'
              : 'lg:pr-72'
            : collapsed
            ? 'lg:pl-20'
            : 'lg:pl-72'
        }`}
      >
        {/* Top Navbar with Neomorphic Canvas Styling */}
        <header className="h-20 bg-[#EDF2F7] border-b border-[#D8E1EC] px-5 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_14px_rgba(166,180,200,0.25)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:text-black rounded-xl neu-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-600 flex items-center gap-2.5 font-bold">
              <div className="p-1 rounded-lg bg-white shadow-[2px_2px_5px_rgba(166,180,200,0.3)]">
                <img
                  src="/brand/logo.webp"
                  alt="BI Technology"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-black text-black">
                {isRtl ? 'بي آي للتكنولوجيا · ذكاء الأعمال' : 'BI Technology · Business Intelligence'}
              </span>
              <span>/</span>
              <span className="capitalize font-extrabold text-[#315EE8]">
                {pathname === '/'
                  ? t('navOverview')
                  : pathname === '/opportunities'
                  ? t('navOpportunities')
                  : pathname === '/financial-simulator'
                  ? t('navFinancialSimulator')
                  : pathname === '/market-intelligence'
                  ? t('navMarketIntelligence')
                  : pathname === '/portfolio'
                  ? t('navPortfolio')
                  : pathname === '/reports'
                  ? t('navReports')
                  : pathname === '/team'
                  ? t('navTeam')
                  : pathname === '/settings'
                  ? t('navSettings')
                  : pathname.replace('/', '')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Workflow Guide Button (Neomorphic) */}
            <button
              onClick={() => setGuideOpen(true)}
              className="neu-btn flex items-center gap-2 px-4 py-2 text-slate-800 text-xs md:text-sm font-extrabold hover:text-[#315EE8]"
              title={t('workflowGuide')}
            >
              <HelpCircle className="w-4 h-4 text-[#315EE8]" />
              <span className="hidden md:inline">{t('workflowGuide')}</span>
            </button>

            {/* Language Switcher Pill (Neomorphic) */}
            <button
              onClick={toggleLanguage}
              className="neu-btn flex items-center gap-2 px-4 py-2 text-[#315EE8] text-xs md:text-sm font-extrabold border border-[#315EE8]/25"
              title={isRtl ? 'Switch to English (LTR)' : 'التحويل إلى العربية (RTL)'}
            >
              <Languages className="w-4 h-4" />
              <span>{isRtl ? 'English (LTR)' : 'العربية (RTL)'}</span>
            </button>

            {/* Demo / Zero Data Mode Switcher (Neomorphic Inset Well) */}
            <div className="neu-pressed hidden sm:flex items-center gap-2 px-4 py-1.5 text-xs font-black text-amber-900 border border-amber-300/40">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{isDemoMode ? t('sampleDataActive') : t('zeroDataMode')}</span>
              <button
                onClick={isDemoMode ? handleResetZero : handleResetDemo}
                className="mx-1 underline text-xs hover:text-amber-950 font-black"
                title={isDemoMode ? 'Clear all demo records' : 'Load sample demo opportunities'}
              >
                {isDemoMode ? t('clearToZero') : t('loadDemo')}
              </button>
            </div>

            {/* Notification Bell (Neomorphic) */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="neu-btn p-2.5 text-slate-700 relative hover:text-black"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div
                  className={`absolute ${
                    isRtl ? 'left-0' : 'right-0'
                  } mt-3 w-84 neu-raised p-4 z-50 text-xs border border-white`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-black text-slate-900">
                    <span className="text-sm">{isRtl ? 'تنبيهات المنصة' : 'Platform Alerts'}</span>
                    <span className="text-xs text-blue-600 font-black">{isRtl ? '٢ جديد' : '2 NEW'}</span>
                  </div>
                  <div className="divide-y divide-slate-200 mt-2 space-y-2">
                    <div className="pt-2">
                      <div className="font-extrabold text-slate-900 text-xs">
                        {isRtl ? 'بانتظار القرار: اعتماد تجربة LawOS 360' : 'Decision Pending: LawOS 360 Pilot Approval'}
                      </div>
                      <div className="text-slate-600 mt-0.5 text-xs font-medium">
                        {isRtl ? 'طلب اعتماد التجربة مقدم من مزمل الرحمن.' : 'Pilot approval requested by Mezanur Maruf (CTO).'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-semibold">{isRtl ? 'اليوم ٠٨:٣٠ ص' : 'Today 08:30 AM'}</div>
                    </div>
                    <div className="pt-2">
                      <div className="font-extrabold text-amber-800 text-xs">
                        {isRtl ? 'فحص متطلبات هيئة الزكاة (ZATCA المرحلة 2)' : 'ZATCA Phase 2 E-Invoicing Audit'}
                      </div>
                      <div className="text-slate-600 mt-0.5 text-xs font-medium">
                        {isRtl ? 'تأكيد امتثال BITEX للتكامل مع منصة فاتورة.' : 'Confirm BITEX Fatoora compliance architecture.'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-semibold">{isRtl ? 'أمس' : 'Yesterday'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu (Neomorphic) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="neu-btn flex items-center gap-2.5 px-3.5 py-2 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#315EE8] text-white flex items-center justify-center font-black text-xs shadow-[2px_2px_5px_rgba(49,94,232,0.4)]">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-black text-slate-900 text-xs leading-tight">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-bold leading-tight capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div
                  className={`absolute ${
                    isRtl ? 'left-0' : 'right-0'
                  } mt-3 w-72 neu-raised p-2.5 z-50 text-xs border border-white`}
                >
                  <div className="px-3 py-2 border-b border-slate-200 font-black text-slate-500 text-[11px] uppercase tracking-wider">
                    {t('switchRole')}
                  </div>
                  <div className="py-1 space-y-1">
                    {(users && users.length > 0 ? users : ALL_USERS).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setUserDropdownOpen(false);
                          showToast(
                            isRtl
                              ? `تم التبديل إلى: ${u.name} (${u.roleTitle})`
                              : `Switched to ${u.name} (${u.roleTitle})`
                          );
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                          currentUser.id === u.id ? 'neu-pressed bg-[#e3eaf3] text-[#315EE8] font-black' : 'hover:bg-slate-100 text-slate-800 font-bold'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-xs font-black text-slate-800 shrink-0">
                          {u.avatarInitials}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate text-xs font-black">{u.name}</div>
                          <div className="text-[11px] text-slate-500 truncate font-semibold">{u.roleTitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto relative z-10">{children}</main>

        {/* Footer */}
        <footer className="h-16 bg-[#EDF2F7] border-t border-[#D8E1EC] px-5 md:px-8 flex items-center justify-between text-xs font-bold text-slate-600 no-print relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-white shadow-xs">
              <img src="/brand/logo.webp" alt="BI Technology" className="w-4 h-4 object-contain" />
            </div>
            <span>
              {isRtl
                ? '© بي آي للتكنولوجيا · منصة ذكاء الأعمال وقرارات الاستثمار'
                : '© BI Technology · Business Intelligence & Investment Decision Platform'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-black text-slate-900">{t('currencyLabel')}</span>
            <span>{t('governanceLabel')}</span>
          </div>
        </footer>
      </div>

      {/* Workflow Guide Modal */}
      <WorkflowGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Interactive Mascot AI Intelligence Advisor Widget */}
      <BiAdvisorWidget />
    </div>
  );
}
