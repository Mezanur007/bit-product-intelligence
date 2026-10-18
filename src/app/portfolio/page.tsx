'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers3,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Opportunity } from '@/lib/db/types';

export default function PortfolioPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOpportunities(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pilotOpps = opportunities.filter((o) => o.status === 'pilot_approved' || o.status === 'pilot_in_progress');
  const activeOpps = opportunities.filter((o) => o.status === 'active' || o.status === 'approved_for_launch');

  const fmtSAR = (n: number) => 'SAR ' + (n || 0).toLocaleString('en-US');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
          <Rocket className="w-3.5 h-3.5" />
          <span>Modules Four & Five — Execution & Performance Governance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
          Portfolio, Pilot & Launch Tracking
        </h1>
        <p className="text-sm text-[#778397] mt-1">
          Monitor approved pilots, launch readiness checklists, and post-launch monthly recurring revenue variance.
        </p>
      </div>

      {/* Pilots Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">Approved Pilot Operations</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              Controlled, bounded real-world validation trials with authorized budgets.
            </p>
          </div>
          <span className="text-xs font-bold text-[#315EE8]">{pilotOpps.length} Active Pilots</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {pilotOpps.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-8 text-xs">
              No opportunities currently in pilot stage.
            </div>
          ) : (
            pilotOpps.map((o) => (
              <div key={o.id} className="p-5 rounded-xl border border-gray-200 bg-[#F8FAFC] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{o.name}</span>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="text-[#315EE8] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-gray-600 leading-relaxed">
                  {o.pilotPlan?.objective || 'Pilot to validate initial willingness-to-pay and conversion rate.'}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px] text-gray-700">
                  <div>
                    <span className="text-gray-400 block">Authorized Budget</span>
                    <strong className="text-gray-900">{fmtSAR(o.approvedBudgetSAR)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Target Clients</span>
                    <strong className="text-gray-900">{o.pilotPlan?.targetCustomers || 3} Clients</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Duration</span>
                    <strong className="text-gray-900">{o.pilotPlan?.durationDays || 45} Days</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Commercialized Products & Actuals Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">Active Commercialized Products & Revenue Tracking</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              Comparing actual monthly recurring revenue and operating margins with original approved investment forecasts.
            </p>
          </div>
          <span className="text-xs font-bold text-[#159769]">{activeOpps.length} Live Products</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Latest Recorded MRR</th>
                <th className="py-2.5 px-3">Total Cash Invested</th>
                <th className="py-2.5 px-3">Break-Even Status</th>
                <th className="py-2.5 px-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeOpps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No active commercialized products recorded.
                  </td>
                </tr>
              ) : (
                activeOpps.map((o) => {
                  const latestPerf = o.actualPerformance?.[o.actualPerformance.length - 1];
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{o.name}</div>
                        <div className="text-[10px] text-gray-400">{o.id}</div>
                      </td>
                      <td className="py-3 px-3 capitalize text-gray-600">{o.category.replace('_', ' ')}</td>
                      <td className="py-3 px-3 font-medium text-gray-700">{o.ownerName}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700 tabular-nums">
                        {latestPerf ? fmtSAR(latestPerf.mrrSAR) : 'Pre-Revenue'}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-semibold">{fmtSAR(o.approvedBudgetSAR)}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          On Track to Payback
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/opportunities/${o.id}`}
                          className="text-[#315EE8] font-bold hover:underline"
                        >
                          View Actuals →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
