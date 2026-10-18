'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Opportunity } from '@/lib/db/types';

export default function ReportsPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');

  useEffect(() => {
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setOpportunities(data.data);
          setSelectedOppId(data.data[0].id);
        }
      });
  }, []);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);
  const fmtSAR = (n: number) => 'SAR ' + (n || 0).toLocaleString('en-US');

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Status', 'Score', 'Recommendation', 'Budget_SAR'];
    const rows = opportunities.map((o) => [
      o.id,
      `"${o.name}"`,
      o.category,
      o.status,
      o.weightedScore,
      o.recommendation,
      o.proposedValidationBudgetSAR,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BIT_Intelligence_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Module Eight — Executive Reporting & Memos</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            Executive Decision Memo & Portfolio Export
          </h1>
          <p className="text-sm text-[#778397] mt-1">
            Generate formal executive investment decision briefs formatted for management and print/PDF export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#315EE8] hover:bg-[#274ec4] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Decision Memo</span>
          </button>
        </div>
      </div>

      {/* Selector */}
      <div className="bg-white p-4 rounded-xl border border-[#E6EAF1] shadow-xs flex items-center gap-4 no-print">
        <label className="text-xs font-bold text-gray-700">Select Opportunity for Memo:</label>
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 font-bold text-gray-900 outline-none"
        >
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id} — {o.name} ({o.recommendation})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Executive Decision Memo Document */}
      {selectedOpp && (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-md print-page max-w-4xl mx-auto space-y-8 text-xs text-gray-800 leading-relaxed">
          {/* Header Memo Banner */}
          <div className="border-b-2 border-gray-900 pb-6 flex items-start justify-between">
            <div>
              <div className="font-extrabold text-lg text-gray-900 tracking-wider">
                B-IT <span className="text-[#315EE8]">TECHNOLOGY</span>
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                INTERNAL INVESTMENT DECISION MEMORANDUM
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Document Ref: <strong>MEMO-{selectedOpp.id}</strong> · Riyadh, Saudi Arabia
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-extrabold uppercase ${
                  selectedOpp.recommendation === 'EXECUTE'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : selectedOpp.recommendation === 'PILOT'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                RECOMMENDATION: {selectedOpp.recommendation}
              </span>
              <div className="text-[10px] text-gray-400 mt-1">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Memo Metadata Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-400 text-[10px] block font-bold uppercase">Opportunity</span>
              <strong className="text-gray-900 block text-sm">{selectedOpp.name}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block font-bold uppercase">Category</span>
              <strong className="text-gray-900 block capitalize">{selectedOpp.category.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block font-bold uppercase">Product Owner</span>
              <strong className="text-gray-900 block">{selectedOpp.ownerName}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block font-bold uppercase">Weighted Score</span>
              <strong className="text-[#315EE8] block text-sm font-extrabold">{selectedOpp.weightedScore}/100</strong>
            </div>
          </div>

          {/* 1. Problem & Solution */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              1. Commercial Opportunity & Customer Validation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              {selectedOpp.businessProblem || selectedOpp.description}
            </p>
            <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">Total Addressable Market (TAM)</span>
                <strong className="text-gray-900">{fmtSAR(selectedOpp.marketAssessment?.tamSAR || 0)}</strong>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">Serviceable Obtainable (SOM)</span>
                <strong className="text-[#315EE8]">{fmtSAR(selectedOpp.marketAssessment?.somSAR || 0)}</strong>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block font-bold">Paid Pilot Commitments</span>
                <strong className="text-emerald-700">{selectedOpp.marketAssessment?.paidPilotCommitments || 0} Committed</strong>
              </div>
            </div>
          </div>

          {/* 2. Financial Viability */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              2. Unit Economics & Break-Even Analysis (Deterministic Engine)
            </h3>
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-3">
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">Customer Monthly Price</span>
                <strong className="text-gray-900">{fmtSAR(selectedOpp.financialAssumptions?.monthlyPricePerCustomer || 0)}/mo</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">Unit Contribution</span>
                <strong className="text-emerald-700">
                  {fmtSAR(selectedOpp.financialOutputs?.breakEven.monthlyContributionPerCustomer || 0)}/mo
                </strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">Break-Even Customers</span>
                <strong className="text-gray-900">
                  {selectedOpp.financialOutputs?.breakEven.operatingBreakEvenCustomers || 'N/A'} Customers
                </strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block font-bold">Investment Payback</span>
                <strong className="text-gray-900">
                  {selectedOpp.financialOutputs?.breakEven.investmentPaybackMonth
                    ? `Month ${selectedOpp.financialOutputs.breakEven.investmentPaybackMonth}`
                    : '> 24 Months'}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Mandatory Governance Gates */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">
              3. Mandatory Governance Gates Audit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedOpp.mandatoryGates?.map((g) => (
                <div key={g.id} className="p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gray-800">{g.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      g.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.status === 'conditional_pass'
                        ? 'bg-blue-100 text-blue-800'
                        : g.status === 'fail'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {g.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Recommendation & Approval Sign-off */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-300">
            <h3 className="font-extrabold text-sm text-gray-900 uppercase mb-2">
              4. Executive Sign-Off & Capital Authorization
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              The Product Investment Office recommends proceeding with <strong>{selectedOpp.recommendation}</strong> under an authorized validation cap of{' '}
              <strong>{fmtSAR(selectedOpp.approvedBudgetSAR || selectedOpp.proposedValidationBudgetSAR)}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300 text-xs">
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-bold mb-8">Submitted By (Product Lead)</div>
                <div className="border-b border-gray-400 pb-1 font-bold text-gray-900">{selectedOpp.ownerName}</div>
                <div className="text-[10px] text-gray-500 mt-1">Lead Product Manager, B-IT Technology</div>
              </div>

              <div>
                <div className="text-gray-400 text-[10px] uppercase font-bold mb-8">Authorized By (Executive Approver)</div>
                <div className="border-b border-gray-400 pb-1 font-bold text-gray-900">
                  {selectedOpp.approvals?.[0]?.reviewedBy || 'Tariq Al-Ghamdi / Khalid Al-Mansoor'}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Management Approver, B-IT Technology</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
