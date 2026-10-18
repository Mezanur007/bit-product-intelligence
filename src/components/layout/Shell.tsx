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
  Database,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useApp, ALL_USERS } from '../providers/AppProvider';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, isDemoMode, setIsDemoMode, showToast } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Opportunities', href: '/opportunities', icon: Layers3 },
    { name: 'Financial Simulator', href: '/financial-simulator', icon: ChartNoAxesCombined },
    { name: 'Market Intelligence', href: '/market-intelligence', icon: Search },
    { name: 'Portfolio & Launches', href: '/portfolio', icon: Rocket },
    { name: 'Executive Reports', href: '/reports', icon: FileText },
    { name: 'Team & Approvals', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/system/reset-demo', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(true);
        showToast('Reset to standard B-IT demo portfolio');
        window.location.reload();
      }
    } catch {
      showToast('Failed to reset demo data');
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
        showToast('All sample data cleared. Honest zero-data active.');
        window.location.reload();
      }
    } catch {
      showToast('Failed to clear data');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] text-[#172033]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#111827] text-white transition-all duration-200 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#315EE8] to-[#6484FF] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/20 shrink-0">
                B
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="font-bold text-sm tracking-wide text-white">
                    B-IT <span className="text-[#6484FF]">TECHNOLOGY</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                    Product Intelligence
                  </div>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              title="Toggle sidebar"
            >
              <div className="w-1.5 h-4 bg-gray-600 rounded-full" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3">
            <div className="px-3 py-2 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              {!collapsed && 'Workspace'}
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#315EE8] text-white shadow-md shadow-blue-600/30'
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 space-y-3">
          {!collapsed && (
            <div className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs">
              <div className="flex items-center gap-2 text-[#6484FF] font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Research Agent</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed mb-2">
                Evidence-first market research with mandatory human approval.
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-900/60 text-[#6484FF] text-[10px] font-bold">
                PHASE 2 READY
              </span>
            </div>
          )}

          {/* User Meta */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-gray-900/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {currentUser.avatarInitials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight flex-1">
                <div className="font-semibold text-xs text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-gray-400 truncate capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E6EAF1] px-5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-[#778397] flex items-center gap-2">
              <span className="font-semibold text-[#172033]">B-IT Intelligence</span>
              <span>/</span>
              <span className="capitalize">{pathname === '/' ? 'Executive Dashboard' : pathname.replace('/', '').replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo / Zero Data Mode Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{isDemoMode ? 'Sample Data Active' : 'Zero Data Mode'}</span>
              <button
                onClick={isDemoMode ? handleResetZero : handleResetDemo}
                className="ml-2 underline text-[11px] hover:text-amber-900"
                title={isDemoMode ? 'Clear all demo records to start with empty honest state' : 'Load sample demo opportunities'}
              >
                {isDemoMode ? 'Clear to Zero' : 'Load Demo'}
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 font-semibold text-gray-800">
                    <span>Platform Alerts</span>
                    <span className="text-[10px] text-blue-600 font-bold">2 NEW</span>
                  </div>
                  <div className="divide-y divide-gray-100 mt-2 space-y-2">
                    <div className="pt-2">
                      <div className="font-semibold text-gray-900">Decision Pending: SME IT Helpdesk</div>
                      <div className="text-gray-500 mt-0.5">Pilot approval requested by Mezanur Rahman.</div>
                      <div className="text-[10px] text-gray-400 mt-1">Today 08:30 AM</div>
                    </div>
                    <div className="pt-2">
                      <div className="font-semibold text-amber-800">Saudi PDPL Review Required</div>
                      <div className="text-gray-500 mt-0.5">Confirm AWS Riyadh residency compliance.</div>
                      <div className="text-[10px] text-gray-400 mt-1">Yesterday</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#E6EAF1] hover:bg-gray-50 transition-colors text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#315EE8] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-gray-900 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-gray-500 leading-tight capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-gray-100 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">
                    Switch Active User Role (RBAC)
                  </div>
                  <div className="py-1">
                    {ALL_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setUserDropdownOpen(false);
                          showToast(`Switched to ${u.name} (${u.roleTitle})`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                          currentUser.id === u.id ? 'bg-blue-50 text-[#315EE8] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                          {u.avatarInitials}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate font-medium">{u.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{u.roleTitle}</div>
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
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">{children}</main>

        {/* Footer */}
        <footer className="h-14 border-t border-[#E6EAF1] bg-white px-5 md:px-8 flex items-center justify-between text-xs text-[#778397] no-print">
          <div>© B-IT Technology · Product Intelligence & Investment Decision Platform</div>
          <div className="flex items-center gap-4">
            <span>Currency: <strong>SAR</strong></span>
            <span>Governance: <strong>Mandatory Human Gate Approval</strong></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
