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
    <div className="space-y-6">
      {/* Title Header with Create User Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>
              {language === 'ar' ? 'الوحدة السابعة — إدارة المستخدمين وصلاحيات الحوكمة' : 'Module Seven — User Management & Governance Authority'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            {language === 'ar' ? 'فريق العمل وصلاحيات الوصول (RBAC)' : 'Team Members & Role-Based Access (RBAC)'}
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            {language === 'ar'
              ? 'إدارة حسابات الفريق وتحديد الأدوار وصلاحيات الاعتماد لمشاريع بي آي للتكنولوجيا.'
              : 'Manage team accounts, assign governance roles, and simulate authorization permissions for BI Technology projects.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#315EE8] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all polymorphic-btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'ar' ? '+ إضافة مستخدم جديد' : '+ Create New User'}</span>
        </button>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'إجمالي أعضاء الفريق' : 'Total Team Members'}
          </span>
          <div className="text-2xl font-extrabold text-[#172033] mt-1 tabular-nums">
            {users.length} {language === 'ar' ? 'مستخدمين' : 'Users'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'المسؤولون التنفيذيون (Super Admin)' : 'Super Admins'}
          </span>
          <div className="text-2xl font-extrabold text-[#315EE8] mt-1 tabular-nums">
            {users.filter((u) => u.role === 'admin').length} {language === 'ar' ? 'مشرفين' : 'Admins'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'الجلسة الحالية' : 'Active Session'}
          </span>
          <div className="text-sm font-extrabold text-emerald-700 mt-1 truncate">
            {currentUser.name}
          </div>
          <div className="text-[11px] text-gray-500 truncate">{currentUser.username || currentUser.email}</div>
        </div>
      </div>

      {/* Active User Switcher / Simulator Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">
              {language === 'ar' ? 'حسابات الفريق ومحاكي التبديل بين الأدوار' : 'Team Accounts & Active Session Switcher'}
            </h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {language === 'ar'
                ? 'انقر على أي مستخدم لاختبار الصلاحيات والتفويضات البرمجية من جانب الخادم فوراً.'
                : 'Click any user to simulate their session and test server-side authorization policies.'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#315EE8] border border-blue-200">
            {language === 'ar' ? 'المستخدم النشط:' : 'Active:'} {currentUser.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#315EE8] bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-[#315EE8] text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {u.avatarInitials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-gray-900 truncate">{u.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{u.username || u.email}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-blue-100 text-[#315EE8]">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {u.role.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-gray-800 font-semibold mt-1">{u.roleTitle}</div>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">{u.department}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Approval Requests */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <h3 className="font-bold text-base text-[#172033] mb-1">
          {language === 'ar' ? 'قائمة انتظار اعتمادات الاستثمار التنفيذية' : 'Executive Investment Approval Queue'}
        </h3>
        <p className="text-xs text-[#778397] mb-4">
          {language === 'ar'
            ? 'قرارات تتطلب تفويضاً رسمياً من الإدارة أو المسؤول التنفيذي.'
            : 'Decisions requiring formal authorization by Management / Admin.'}
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            {language === 'ar' ? 'لا توجد حالات استثمارية بانتظار المراجعة التنفيذية حالياً.' : 'No investment cases currently pending executive review.'}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((pa) => (
              <div
                key={pa.oppId}
                className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{pa.oppName}</span>
                    <span className="px-2 py-0.5 rounded font-extrabold uppercase text-[10px] bg-blue-100 text-blue-800">
                      {t(`rec${pa.recommendation}`) || pa.recommendation}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {language === 'ar' ? 'مقدم من:' : 'Submitted by'} {pa.owner} · {language === 'ar' ? 'الميزانية المطلوبة:' : 'Requested Budget:'} {fmtCurrency(pa.budget)}
                  </div>
                </div>
                <Link
                  href={`/opportunities/${pa.oppId}`}
                  className="px-3 py-1.5 rounded-lg bg-[#315EE8] text-white font-bold text-xs hover:bg-[#274ec4]"
                >
                  {language === 'ar' ? 'المراجعة في مساحة العمل ←' : 'Review in Workspace →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Audit Trail */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-base mb-1">
          <History className="w-4 h-4 text-gray-600" />
          <span>{language === 'ar' ? 'سجل التدقيق غير القابل للتعديل' : 'Immutable Audit Log'}</span>
        </div>
        <p className="text-xs text-[#778397] mb-4">
          {language === 'ar'
            ? 'سجل زمني متسلسل لكافة عمليات إنشاء المستخدمين والفرص والتعديلات والاعتمادات.'
            : 'Chronological record of all user management, opportunity creation, edits, calculations, and approvals.'}
        </p>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              {language === 'ar' ? 'لم يتم تسجيل إجراءات تدقيق بعد.' : 'No audit entries recorded yet.'}
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{log.actorName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600">
                      {log.actorRole}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-[#315EE8]">{log.action}</span>
                  </div>
                  <p className="text-gray-600 text-[11px]">{log.summary}</p>
                </div>
                <div className="text-right text-[10px] text-gray-400 whitespace-nowrap tabular-nums">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#315EE8]" />
                <h3 className="font-bold text-base text-gray-900">
                  {language === 'ar' ? 'إضافة مستخدم جديد للنظام' : 'Create New Team Member'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'اسم المستخدم / البريد الإلكتروني (Username)*' : 'Username / Email*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. analyst@b-it.co"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8] focus:ring-1 focus:ring-[#315EE8]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'الاسم الكامل والمنصب (Full Name)*' : 'Full Name*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Al-Otaibi"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8] focus:ring-1 focus:ring-[#315EE8]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'دور وصلاحية المستخدم (Role)*' : 'User Role*'}
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8] bg-white font-medium"
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
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'المسمى الوظيفي' : 'Role Title'}
                  </label>
                  <input
                    type="text"
                    value={userForm.roleTitle}
                    onChange={(e) => setUserForm({ ...userForm, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {language === 'ar' ? 'القسم / الإدارة' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {language === 'ar' ? 'كلمة المرور (Password)' : 'Password'}
                </label>
                <input
                  type="text"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#315EE8] font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#315EE8] hover:bg-[#274ec4] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
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
