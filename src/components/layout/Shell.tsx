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
    <div className={`min-h-screen flex bg-[#F4F7FB] text-slate-900 ${isRtl ? 'font-arabic' : ''} relative`}>
      {/* Ambient Glassmorphic Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] left-[12%] w-[38rem] h-[38rem] rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute top-[28%] right-[4%] w-[42rem] h-[42rem] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[22%] w-[32rem] h-[32rem] rounded-full bg-indigo-500/8 blur-[120px]" />
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with Glassmorphic Deep Navy Backdrop */}
      <aside
        className={`fixed top-0 bottom-0 z-40 bg-[#111827]/95 backdrop-blur-xl text-white transition-all duration-200 flex flex-col justify-between ${
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
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="relative shrink-0">
                <img
                  src="/brand/logo.webp"
                  alt="BI Technology"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.65)] group-hover:scale-105 transition-transform"
                />
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="font-extrabold text-base tracking-wide text-white flex items-center gap-1">
                    <span>{isRtl ? 'بي آي' : 'BI'}</span>
                    <span className="text-cyan-400 font-black tracking-normal">
                      {isRtl ? 'للتكنولوجيا' : 'TECHNOLOGY'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">
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

          {/* Grouped Navigation Links with Enhanced Font Size & Clarity */}
          <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-17rem)]">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 py-1 text-xs font-extrabold text-slate-400 tracking-wider uppercase">
                    {section.title}
                  </div>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#315EE8] to-blue-600 text-white shadow-lg shadow-blue-600/30'
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
        <div className="p-3.5 border-t border-slate-800/80 space-y-3">
          {!collapsed && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-blue-950/40 border border-cyan-500/25 shadow-lg text-xs relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-1.5">
                <img
                  src="/brand/mascot.png"
                  alt="BI Mascot"
                  className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
                <div>
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                    <span>{isRtl ? 'مساعد بي آي الذكي' : 'BI Copilot'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {isRtl ? 'مستشار دراسة الفرص' : 'Decision Intelligence'}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-2 font-normal">
                {t('aiAgentDesc')}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold tracking-wider">
                {t('phase2Ready')}
              </span>
            </div>
          )}

          {/* User Meta */}
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
              {currentUser.avatarInitials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate capitalize font-medium">{currentUser.role.replace('_', ' ')}</div>
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
        {/* Top Navbar with Glassmorphism Header */}
        <header className="h-18 glass-header px-5 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-500 flex items-center gap-2.5 font-medium">
              <img
                src="/brand/logo.webp"
                alt="BI Technology"
                className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"
              />
              <span className="font-extrabold text-slate-900">
                {isRtl ? 'بي آي للتكنولوجيا · ذكاء الأعمال' : 'BI Technology · Business Intelligence'}
              </span>
              <span>/</span>
              <span className="capitalize font-bold text-[#315EE8]">
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
            {/* Workflow Guide Button */}
            <button
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white/90 text-slate-800 text-xs md:text-sm font-bold hover:bg-white transition-all shadow-xs polymorphic-btn"
              title={t('workflowGuide')}
            >
              <HelpCircle className="w-4 h-4 text-[#315EE8]" />
              <span className="hidden md:inline">{t('workflowGuide')}</span>
            </button>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#315EE8]/40 bg-blue-50/90 text-[#315EE8] text-xs md:text-sm font-bold hover:bg-blue-100 transition-all shadow-xs polymorphic-btn"
              title={isRtl ? 'Switch to English (LTR)' : 'التحويل إلى العربية (RTL)'}
            >
              <Languages className="w-4 h-4" />
              <span>{isRtl ? 'English (LTR)' : 'العربية (RTL)'}</span>
            </button>

            {/* Demo / Zero Data Mode Switcher */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-300/80 bg-amber-50/90 text-amber-900 shadow-2xs">
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

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl relative transition-all polymorphic-btn"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div
                  className={`absolute ${
                    isRtl ? 'left-0' : 'right-0'
                  } mt-2 w-84 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-4 z-50 text-xs`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span className="text-sm">{isRtl ? 'تنبيهات المنصة' : 'Platform Alerts'}</span>
                    <span className="text-xs text-blue-600 font-extrabold">{isRtl ? '٢ جديد' : '2 NEW'}</span>
                  </div>
                  <div className="divide-y divide-slate-100 mt-2 space-y-2">
                    <div className="pt-2">
                      <div className="font-bold text-slate-900 text-xs">
                        {isRtl ? 'بانتظار القرار: اعتماد تجربة LawOS 360' : 'Decision Pending: LawOS 360 Pilot Approval'}
                      </div>
                      <div className="text-slate-600 mt-0.5 text-xs">
                        {isRtl ? 'طلب اعتماد التجربة مقدم من مزمل الرحمن.' : 'Pilot approval requested by Mezanur Maruf (CTO).'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{isRtl ? 'اليوم ٠٨:٣٠ ص' : 'Today 08:30 AM'}</div>
                    </div>
                    <div className="pt-2">
                      <div className="font-bold text-amber-800 text-xs">
                        {isRtl ? 'فحص متطلبات هيئة الزكاة (ZATCA المرحلة 2)' : 'ZATCA Phase 2 E-Invoicing Audit'}
                      </div>
                      <div className="text-slate-600 mt-0.5 text-xs">
                        {isRtl ? 'تأكيد امتثال BITEX للتكامل مع منصة فاتورة.' : 'Confirm BITEX Fatoora compliance architecture.'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{isRtl ? 'أمس' : 'Yesterday'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-white transition-all text-xs shadow-xs polymorphic-btn"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#315EE8] to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-slate-900 text-xs leading-tight">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className={`absolute ${
                    isRtl ? 'left-0' : 'right-0'
                  } mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 text-xs`}
                >
                  <div className="px-3 py-2 border-b border-slate-100 font-extrabold text-slate-500 text-[11px] uppercase tracking-wider">
                    {t('switchRole')}
                  </div>
                  <div className="py-1">
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
                          currentUser.id === u.id ? 'bg-blue-50 text-[#315EE8] font-bold shadow-2xs' : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                          {u.avatarInitials}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate text-xs font-bold">{u.name}</div>
                          <div className="text-[11px] text-slate-500 truncate font-medium">{u.roleTitle}</div>
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
        <footer className="h-16 border-t border-slate-200/80 glass-header px-5 md:px-8 flex items-center justify-between text-xs font-semibold text-slate-500 no-print relative z-10">
          <div className="flex items-center gap-2.5">
            <img src="/brand/logo.webp" alt="BI Technology" className="w-5 h-5 object-contain" />
            <span>
              {isRtl
                ? '© بي آي للتكنولوجيا · منصة ذكاء الأعمال وقرارات الاستثمار'
                : '© BI Technology · Business Intelligence & Investment Decision Platform'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700">{t('currencyLabel')}</span>
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
