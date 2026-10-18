'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building,
  Save,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProvider';
import { ScoreWeights, DEFAULT_WEIGHTS, validateWeights } from '@/lib/decision-engine';

export default function SettingsPage() {
  const { currentUser, isDemoMode, setIsDemoMode, showToast } = useApp();

  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [budgetCap, setBudgetCap] = useState(25000);
  const [requirePDPL, setRequirePDPL] = useState(true);

  const currentSum =
    Number(weights.marketAttractiveness) +
    Number(weights.customerValidation) +
    Number(weights.competitiveDifferentiation) +
    Number(weights.financialViability) +
    Number(weights.technicalFeasibility) +
    Number(weights.strategicFitAndReusability) +
    Number(weights.operationalReadiness);

  const isSumValid = Math.abs(currentSum - 100) < 0.01;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSumValid) {
      showToast('Weights must sum exactly to 100% before saving.');
      return;
    }
    showToast('Governance criteria weights updated successfully.');
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/system/reset-demo', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(true);
        showToast('Restored standard B-IT demo portfolio');
        window.location.reload();
      }
    } catch {
      showToast('Error resetting demo data');
    }
  };

  const handleResetZero = async () => {
    if (!confirm('Are you sure you want to clear all opportunities and activate an honest zero-data state?')) return;
    try {
      const res = await fetch('/api/system/reset-zero', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        setIsDemoMode(false);
        showToast('All sample data cleared. Honest zero-data state active.');
        window.location.reload();
      }
    } catch {
      showToast('Error clearing data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#315EE8] uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System Governance & Parameters</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
          Platform Configuration & Decision Thresholds
        </h1>
        <p className="text-sm text-[#778397] mt-1">
          Configure decision engine criteria weighting, team capital caps, and data residency policies.
        </p>
      </div>

      {/* Decision Criteria Weights Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#172033]">Evaluation Scoring Criteria Weights (Sum: 100%)</h3>
            <p className="text-xs text-[#778397] mt-0.5">
              Administrators can adjust weighting across categories. Must total exactly 100%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSumValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              Current Sum: {currentSum}% {isSumValid ? '✓' : '(Must equal 100%)'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Market Attractiveness (%): {weights.marketAttractiveness}%
            </label>
            <input
              type="number"
              value={weights.marketAttractiveness}
              onChange={(e) => setWeights({ ...weights, marketAttractiveness: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Customer Validation (%): {weights.customerValidation}%
            </label>
            <input
              type="number"
              value={weights.customerValidation}
              onChange={(e) => setWeights({ ...weights, customerValidation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Competitive Differentiation (%): {weights.competitiveDifferentiation}%
            </label>
            <input
              type="number"
              value={weights.competitiveDifferentiation}
              onChange={(e) => setWeights({ ...weights, competitiveDifferentiation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Financial Viability (%): {weights.financialViability}%
            </label>
            <input
              type="number"
              value={weights.financialViability}
              onChange={(e) => setWeights({ ...weights, financialViability: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Technical Feasibility (%): {weights.technicalFeasibility}%
            </label>
            <input
              type="number"
              value={weights.technicalFeasibility}
              onChange={(e) => setWeights({ ...weights, technicalFeasibility: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Strategic Fit & Reusability (%): {weights.strategicFitAndReusability}%
            </label>
            <input
              type="number"
              value={weights.strategicFitAndReusability}
              onChange={(e) => setWeights({ ...weights, strategicFitAndReusability: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Operational Readiness (%): {weights.operationalReadiness}%
            </label>
            <input
              type="number"
              value={weights.operationalReadiness}
              onChange={(e) => setWeights({ ...weights, operationalReadiness: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isSumValid}
              className={`w-full py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isSumValid ? 'bg-[#315EE8] hover:bg-[#274ec4]' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Update Weights</span>
            </button>
          </div>
        </form>
      </div>

      {/* Capital Cap & Saudi Compliance Settings */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs space-y-4">
        <h3 className="font-bold text-base text-[#172033]">B-IT Capital Discipline & Compliance Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block font-bold text-gray-800 mb-1">Validation Budget Cap (SAR)</label>
            <p className="text-[11px] text-gray-500 mb-2">
              Maximum cash authorization permitted without executive committee special dispensation.
            </p>
            <input
              type="number"
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-bold"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block">Enforce Saudi PDPL & Data Residency Sign-off</span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Block launch approval if data hosting is not verified in Saudi Arabia (me-central-1).
              </p>
            </div>
            <input
              type="checkbox"
              checked={requirePDPL}
              onChange={(e) => setRequirePDPL(e.target.checked)}
              className="w-5 h-5 text-[#315EE8] rounded"
            />
          </div>
        </div>
      </div>

      {/* Honest Zero-State / Demo Mode Management */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6EAF1] shadow-xs text-xs">
        <h3 className="font-bold text-base text-[#172033] mb-1">Honest Zero-State & Demo Portfolio Controls</h3>
        <p className="text-gray-500 mb-4">
          As required by B-IT governance, new environments can operate in an honest zero-data state or load clearly labeled demo records.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 text-[#315EE8] font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Load B-IT Demo Portfolio</span>
          </button>

          <button
            onClick={handleResetZero}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Clear to Honest Zero-Data State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
