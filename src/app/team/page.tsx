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
} from 'lucide-react';
import { useApp, ALL_USERS } from '@/components/providers/AppProvider';
import { AuditLog, Opportunity } from '@/lib/db/types';

export default function TeamPage() {
  const { currentUser, setCurrentUser, showToast, t, fmtCurrency, language, isRtl } = useApp();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
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
  }, []);

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
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" />
          <span>
            {language === 'ar' ? 'الوحدة السابعة — الفريق والمهام وصلاحيات الاعتماد' : 'Module Seven — Team, Tasks & Approval Authority'}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
          {language === 'ar' ? 'صلاحيات الوصول حسب الأدوار (RBAC) ومصفوفة الحوكمة' : 'Role-Based Access & Governance Matrix'}
        </h1>
        <p className="text-sm text-[#778397] mt-1">
          {language === 'ar'
            ? 'سياسات تفويض الصلاحيات الأقل لفريق العمل الداخلي والمعتمدين لشركة تقنية بي-آي-تي.'
            : 'Least-privilege authorization policies for B-IT Technology internal team and designated approvers.'}
        </p>
      </div>

      {/* Active User Switcher / Simulator Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">
              {language === 'ar' ? 'جلسة المستخدم النشط ومحاكي الأدوار المتعددة' : 'Active User Session & Multi-Role Simulator'}
            </h3>
            <p className="text-xs text-[#778397] mt-0.5">
              {language === 'ar'
                ? 'محاكاة إجراءات أعضاء الفريق لاختبار الصلاحيات والتفويضات البرمجية من جانب الخادم.'
                : 'Simulate actions as different team members to test server-side authorization and approval permissions.'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#315EE8] border border-blue-200">
            {language === 'ar' ? 'المستخدم النشط:' : 'Active:'} {currentUser.name} ({currentUser.roleTitle})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {ALL_USERS.map((u) => {
            const isSelected = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  showToast(language === 'ar' ? `تم التبديل إلى: ${u.name} (${u.roleTitle})` : `Role switched to ${u.name} (${u.roleTitle})`);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#315EE8] bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-[#315EE8] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {u.avatarInitials}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm text-gray-900 truncate">{u.name}</div>
                    <div className="text-[11px] text-gray-500 capitalize">{u.role.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">{u.roleTitle}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{u.department}</div>
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
            ? 'سجل زمني متسلسل لكافة عمليات إنشاء الفرص، والتعديلات، وحسابات النمذجة، والاعتمادات.'
            : 'Chronological record of all opportunity creation, edits, calculations, and approvals.'}
        </p>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              {language === 'ar' ? 'لا توجد أحداث تدقيق مسجلة بعد.' : 'No audit events recorded yet.'}
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-gray-900">{log.action}</span>
                  <span className="text-gray-500 text-[11px] ml-2">{log.summary}</span>
                </div>
                <div className="text-[11px] text-gray-400 whitespace-nowrap">
                  {log.actorName} · {new Date(log.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
