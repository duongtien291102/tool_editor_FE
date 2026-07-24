import React from 'react';
import { PlanPolicy, PlanTier } from '../types';

interface PricingTabProps {
  policies: PlanPolicy[];
  currentTier: PlanTier;
  onSelectPlan: (tier: PlanTier) => void;
}

export const PricingTab: React.FC<PricingTabProps> = ({
  policies,
  currentTier,
  onSelectPlan
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-white">Choose Your SaaS Plan</h2>
        <p className="text-slate-400 text-sm">
          Policy-enforced subscription tiers tailored for creators, studios, and enterprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map(policy => {
          const isCurrent = policy.tier === currentTier;
          return (
            <div
              key={policy.tier}
              className={`bg-slate-900/80 border rounded-2xl p-6 shadow-xl flex flex-col justify-between relative transition-all ${
                isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow">
                  Current Plan
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{policy.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">${policy.priceMonthlyUsd}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Monthly Credits:</span>
                    <span className="text-indigo-400 font-bold">{policy.monthlyCredits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Export Limit:</span>
                    <span className="text-slate-200">{policy.maxExportLimit} / mo</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {policy.maxConcurrentJobs} Concurrent Jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Queue limit: {policy.maxQueueLimit}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={policy.allowCustomStudioMode ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                      {policy.allowCustomStudioMode ? '✓' : '✗'}
                    </span>{' '}
                    Studio Customization Mode
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={policy.allowAdvancedWorkflows ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                      {policy.allowAdvancedWorkflows ? '✓' : '✗'}
                    </span>{' '}
                    Advanced AI Workflows
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(policy.tier)}
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-xs transition-all ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20'
                }`}
              >
                {isCurrent ? 'Active Plan' : `Upgrade to ${policy.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
