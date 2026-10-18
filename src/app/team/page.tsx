'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  History,
  Building,
  UserCheck,
  UserPlus,
  Lock,
  Mail,
  Briefcase,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { AuditLog, Opportunity, User, UserRole } from '@/lib/db/types';

export default function TeamPage() {
  const { currentUser, setCurrentUser, users, refreshUsers, addUser, showToast, t, fmtCurrency, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    role: 'product_owner' as UserRole,
    roleTitle: 'Product Manager',
    department: 'Product Delivery',
    password: 'Bit@123456@',
  });

  const loadData = () => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOpportunities(data.data);
      });

    fetch('/api/audit')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAuditLogs(data.data);
      });
  };

  useEffect(() => {
    loadData();
    refreshUsers();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const defaultTitles: Record<UserRole, { title: string; dept: string }> = {
      admin: { title: 'Super Admin', dept: 'Executive Management & Technology' },
      management: { title: 'Management Approver', dept: 'Executive Management' },
      product_owner: { title: 'Lead Product Manager', dept: 'Product Delivery' },
      market_analyst: { title: 'Market & Competitive Intelligence Analyst', dept: 'Strategy & Research' },
      technical_reviewer: { title: 'Solutions Architect & Tech Lead', dept: 'Engineering' },
      finance_reviewer: { title: 'Senior Financial Analyst', dept: 'Finance & Controlling' },
    };

    const def = defaultTitles[role] || { title: 'Team Member', dept: 'Product Delivery' };
    setUserForm((prev) => ({
      ...prev,
      role,
      roleTitle: def.title,
      department: def.dept,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim() || !userForm.name.trim()) {
      showToast(language === 'ar' ? 'يرجى إدخال اسم المستخدم والاسم الكامل' : 'Please provide username and full name', 'error');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(userForm),
      });

      const json = await res.json();
      if (json.success && json.data) {
        addUser(json.data);
        showToast(
          language === 'ar'
            ? `تم إنشاء المستخدم "${json.data.name}" بنجاح!`
            : `User "${json.data.name}" created successfully!`
        );
        setShowCreateModal(false);
        setUserForm({
          username: '',
          name: '',
          role: 'product_owner',
          roleTitle: 'Product Manager',
          department: 'Product Delivery',
          password: 'Bit@123456@',
        });
        loadData();
      } else {
        showToast(json.error || 'Failed to create user', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const pendingApprovals = opportunities
    .filter((o) => o.status === 'decision_pending' || o.approvals?.some((a) => a.status === 'pending'))
    .map((o) => ({
      oppId: o.id,
      oppName: o.name,
      recommendation: o.recommendation,
      budget: o.proposedValidationBudgetSAR,
      owner: o.ownerName,
      approval: o.approvals?.find((a) => a.status === 'pending'),
    }));

  return (
    <div className="space-y-8">
      {/* Title Header with Create User Button — Neomorphic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#315EE8] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>
              {language === 'ar' ? 'الوحدة السابعة — إدارة المستخدمين وصلاحيات الحوكمة' : 'Module Seven — User Management & Governance Authority'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            {language === 'ar' ? 'فريق العمل وصلاحيات الوصول (RBAC)' : 'Team Members & Role-Based Access (RBAC)'}
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-semibold mt-1">
            {language === 'ar'
              ? 'إدارة حسابات الفريق وتحديد الأدوار وصلاحيات الاعتماد لمشاريع بي آي للتكنولوجيا.'
              : 'Manage team accounts, assign governance roles, and simulate authorization permissions for BI Technology projects.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="neu-btn-primary px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ إضافة مستخدم جديد' : '+ Create New User'}</span>
        </button>
      </div>

      {/* Team Summary Cards — Neomorphic Raised */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-raised p-5 rounded-3xl border border-white">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
            {language === 'ar' ? 'إجمالي أعضاء الفريق' : 'Total Team Members'}
          </span>
          <div className="text-3xl font-black text-black mt-1.5 tabular-nums">
            {users.length} <span className="text-sm font-bold text-slate-500">{language === 'ar' ? 'مستخدمين' : 'Users'}</span>
          </div>
        </div>

        <div className="neu-raised p-5 rounded-3xl border border-white">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
            {language === 'ar' ? 'المسؤولون التنفيذيون (Super Admin)' : 'Super Admins'}
          </span>
          <div className="text-3xl font-black text-[#315EE8] mt-1.5 tabular-nums">
            {users.filter((u) => u.role === 'admin').length} <span className="text-sm font-bold text-slate-500">{language === 'ar' ? 'مشرفين' : 'Admins'}</span>
          </div>
        </div>

        <div className="neu-raised p-5 rounded-3xl border border-white">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
            {language === 'ar' ? 'الجلسة الحالية' : 'Active Session'}
          </span>
          <div className="text-base font-black text-emerald-800 mt-1.5 truncate">
            {currentUser.name}
          </div>
          <div className="text-xs text-slate-600 truncate font-bold">{currentUser.username || currentUser.email}</div>
        </div>
      </div>

      {/* Active User Switcher / Simulator Card — Neomorphic */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-black text-lg text-black">
              {language === 'ar' ? 'حسابات الفريق ومحاكي التبديل بين الأدوار' : 'Team Accounts & Active Session Switcher'}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">
              {language === 'ar'
                ? 'انقر على أي مستخدم لاختبار الصلاحيات والتفويضات البرمجية من جانب الخادم فوراً.'
                : 'Click any user to simulate their session and test server-side authorization policies.'}
            </p>
          </div>
          <span className="neu-pressed text-xs font-black px-3.5 py-1.5 rounded-full text-[#315EE8]">
            {language === 'ar' ? 'المستخدم النشط:' : 'Active:'} {currentUser.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {users.map((u) => {
            const isSelected = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  showToast(
                    language === 'ar'
                      ? `تم التبديل إلى: ${u.name} (${u.roleTitle})`
                      : `Switched session to ${u.name} (${u.roleTitle})`
                  );
                }}
                className={`p-4.5 rounded-2xl text-left transition-all ${
                  isSelected
                    ? 'neu-pressed bg-[#e3eaf3] border border-blue-400 text-[#315EE8]'
                    : 'neu-btn text-slate-900 hover:text-[#315EE8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                        isSelected ? 'bg-[#315EE8] text-white shadow-sm' : 'bg-slate-300 text-slate-900'
                      }`}
                    >
                      {u.avatarInitials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-black text-sm text-black truncate">{u.name}</div>
                      <div className="text-xs text-slate-600 truncate font-semibold">{u.username || u.email}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="p-1 rounded-full neu-pressed text-[#315EE8]">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 capitalize">{u.roleTitle}</span>
                  <span className="font-black text-[#315EE8] uppercase">{u.role}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Approval Requests */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <h3 className="font-black text-lg text-black mb-1">
          {language === 'ar' ? 'قائمة انتظار اعتمادات الاستثمار التنفيذية' : 'Executive Investment Approval Queue'}
        </h3>
        <p className="text-xs font-bold text-slate-600 mb-5">
          {language === 'ar'
            ? 'قرارات تتطلب تفويضاً رسمياً من الإدارة أو المسؤول التنفيذي.'
            : 'Decisions requiring formal authorization by Management / Admin.'}
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="neu-pressed p-8 rounded-2xl text-center text-slate-500 font-bold text-xs">
            {language === 'ar' ? 'لا توجد حالات استثمارية بانتظار المراجعة التنفيذية حالياً.' : 'No investment cases currently pending executive review.'}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((pa) => (
              <div
                key={pa.oppId}
                className="neu-pressed p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-black text-sm">{pa.oppName}</span>
                    <span className="neu-raised-sm px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] text-[#315EE8]">
                      {t(`rec${pa.recommendation}`) || pa.recommendation}
                    </span>
                  </div>
                  <div className="text-slate-600 font-bold mt-1">
                    {language === 'ar' ? 'مقدم من:' : 'Submitted by'} {pa.owner} · {language === 'ar' ? 'الميزانية المطلوبة:' : 'Requested Budget:'} {fmtCurrency(pa.budget)}
                  </div>
                </div>
                <Link
                  href={`/opportunities/${pa.oppId}`}
                  className="neu-btn-primary px-4 py-2 text-white font-black text-xs inline-flex items-center gap-1.5 self-start md:self-auto"
                >
                  {language === 'ar' ? 'المراجعة في مساحة العمل ←' : 'Review in Workspace →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Audit Trail */}
      <div className="neu-raised p-6 md:p-8 rounded-3xl border border-white">
        <div className="flex items-center gap-2 text-black font-black text-lg mb-1">
          <History className="w-5 h-5 text-[#315EE8]" />
          <span>{language === 'ar' ? 'سجل التدقيق غير القابل للتعديل' : 'Immutable Audit Log'}</span>
        </div>
        <p className="text-xs font-bold text-slate-600 mb-5">
          {language === 'ar'
            ? 'سجل زمني متسلسل لكافة عمليات إنشاء المستخدمين والفرص والتعديلات والاعتمادات.'
            : 'Chronological record of all user management, opportunity creation, edits, calculations, and approvals.'}
        </p>

        <div className="neu-pressed p-4 rounded-2xl max-h-80 overflow-y-auto divide-y divide-slate-200 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-bold">
              {language === 'ar' ? 'لم يتم تسجيل إجراءات تدقيق بعد.' : 'No audit entries recorded yet.'}
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-black">{log.actorName}</span>
                    <span className="neu-raised-sm px-2 py-0.5 rounded-full text-[10px] uppercase font-black text-slate-700">
                      {log.actorRole}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-extrabold text-[#315EE8]">{log.action}</span>
                  </div>
                  <p className="text-slate-600 font-medium text-[11px]">{log.summary}</p>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-500 whitespace-nowrap tabular-nums">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE USER MODAL — Neomorphic */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="neu-raised bg-[#EDF2F7] rounded-3xl border border-white max-w-lg w-full p-7 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white shadow-xs">
                  <UserPlus className="w-5 h-5 text-[#315EE8]" />
                </div>
                <h3 className="font-black text-lg text-black">
                  {language === 'ar' ? 'إضافة مستخدم جديد للنظام' : 'Create New Team Member'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="neu-btn p-2 text-slate-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="font-black text-slate-800 block mb-1">
                  {language === 'ar' ? 'اسم المستخدم / البريد الإلكتروني (Username)*' : 'Username / Email*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. analyst@bi.co"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 block mb-1">
                  {language === 'ar' ? 'الاسم الكامل والمنصب (Full Name)*' : 'Full Name*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Al-Otaibi"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                />
              </div>

              <div>
                <label className="font-black text-slate-800 block mb-1">
                  {language === 'ar' ? 'دور وصلاحية المستخدم (Role)*' : 'User Role*'}
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="neu-btn w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                >
                  <option value="admin">Super Admin (Full Governance & Approvals)</option>
                  <option value="management">Management Approver (Investment Sign-off)</option>
                  <option value="product_owner">Product Lead / Owner (Evaluations)</option>
                  <option value="market_analyst">Market & Competitor Intelligence Analyst</option>
                  <option value="technical_reviewer">Solutions Architect & Tech Lead</option>
                  <option value="finance_reviewer">Senior Financial Analyst</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-800 block mb-1">
                    {language === 'ar' ? 'المسمى الوظيفي' : 'Role Title'}
                  </label>
                  <input
                    type="text"
                    value={userForm.roleTitle}
                    onChange={(e) => setUserForm({ ...userForm, roleTitle: e.target.value })}
                    className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-800 block mb-1">
                    {language === 'ar' ? 'القسم / الإدارة' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-bold text-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-800 block mb-1">
                  {language === 'ar' ? 'كلمة المرور (Password)' : 'Password'}
                </label>
                <input
                  type="text"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="neu-pressed w-full px-4 py-2.5 rounded-xl outline-none font-mono text-xs font-bold text-black"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="neu-btn px-5 py-2.5 text-slate-700 font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="neu-btn-primary px-6 py-2.5 text-white font-black flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{formLoading ? (language === 'ar' ? 'جارِ الحفظ...' : 'Creating...') : (language === 'ar' ? 'حفظ المستخدم' : 'Create User')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
