'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers3,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Opportunity, Competitor, ResearchSource, VerificationStatus } from '@/lib/db/types';

export default function MarketIntelligencePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Aggregate all sources and competitors across opportunities
  const allSources: (ResearchSource & { oppName: string; oppId: string })[] = [];
  const allCompetitors: (Competitor & { oppName: string; oppId: string })[] = [];

  for (const o of opportunities) {
    if (o.sources) {
      for (const s of o.sources) {
        allSources.push({ ...s, oppName: o.name, oppId: o.id });
      }
    }
    if (o.competitors) {
      for (const c of o.competitors) {
        allCompetitors.push({ ...c, oppName: o.name, oppId: o.id });
      }
    }
  }

  const fmtSAR = (n: number) => 'SAR ' + (n || 0).toLocaleString('en-US');

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <Search className="w-3.5 h-3.5" />
            <span>Module Six — Market Research & Source Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            Market & Competitor Intelligence Hub
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            Evidence classification, verified market sources, and competitive benchmarking for Saudi commercial IT products.
          </p>
        </div>

        {/* AI Research Agent Future Integration Callout */}
        <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200/80 max-w-sm text-xs">
          <div className="flex items-center gap-2 text-[#315EE8] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AI Automated Research Agent (Phase 2)</span>
          </div>
          <p className="text-gray-600 text-[11px] mt-0.5 leading-relaxed">
            Autonomous web research, pricing extraction, and source verification with mandatory human approval.
          </p>
        </div>
      </div>

      {/* Cross-Product Competitor Benchmarks */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">Competitive Pricing & Arabic Support Landscape</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              Aggregated competitor benchmarks across all evaluated B-IT product opportunities.
            </p>
          </div>
          <span className="text-xs font-bold text-[#315EE8]">{allCompetitors.length} Benchmarks Logged</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Competitor</th>
                <th className="py-2.5 px-3">Associated Product</th>
                <th className="py-2.5 px-3">Observed Price</th>
                <th className="py-2.5 px-3">Arabic UX</th>
                <th className="py-2.5 px-3">Key Weaknesses</th>
                <th className="py-2.5 px-3">B-IT Differentiation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No competitor benchmarks recorded yet. Add competitors within an opportunity workspace.
                  </td>
                </tr>
              ) : (
                allCompetitors.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.productName} ({c.country})</div>
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/opportunities/${c.oppId}`} className="text-[#315EE8] font-semibold hover:underline">
                        {c.oppName}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900 tabular-nums">
                      {fmtSAR(c.observedPriceSAR)} / {c.pricingInterval}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.hasArabicSupport ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.hasArabicSupport ? 'Arabic' : 'English Only'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs">{c.mainWeaknesses}</td>
                    <td className="py-3 px-3 font-medium text-[#315EE8] max-w-xs">{c.differentiationOpportunity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Market Research Sources */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">Market Research Sources & Evidence Classification</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              Classified records with clear distinction between verified data and management assumptions.
            </p>
          </div>
          <span className="text-xs font-bold text-[#159769]">{allSources.length} Classified Sources</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Publisher & Page Title</th>
                <th className="py-2.5 px-3">Source Type</th>
                <th className="py-2.5 px-3">Extracted Claim / Value</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3">Date Accessed</th>
                <th className="py-2.5 px-3">Researcher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allSources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No external research sources recorded.
                  </td>
                </tr>
              ) : (
                allSources.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{s.publisher}</div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#315EE8] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{s.pageTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold uppercase text-[10px] text-gray-700">
                        {s.sourceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium max-w-sm">
                      {s.relevantClaim}
                      {s.extractedValue && <span className="block font-bold text-emerald-700 mt-0.5">Value: {s.extractedValue}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {s.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 tabular-nums">{s.accessedAt}</td>
                    <td className="py-3 px-3 font-medium text-gray-700">{s.researcherName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
