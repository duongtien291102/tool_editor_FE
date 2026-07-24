import React from 'react';
import type { UserSubscription, PlanPolicy } from '../types';

interface SubscriptionTabProps {
  subscription: UserSubscription;
  policy: PlanPolicy;
  onUpgradeClick: () => void;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  subscription,
  policy,
  onUpgradeClick
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Subscription</span>
          <h3 className="text-2xl font-bold text-white mt-1">{policy.name}</h3>
          <p className="text-sm text-slate-400 mt-1">
            Current Period Ends: <span className="text-slate-200">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </p>
        </div>
        <button
          onClick={onUpgradeClick}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          Upgrade / Change Plan
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4">Plan Policy & System Limits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Monthly Credit Grant</span>
            <p className="text-white font-semibold mt-1">{policy.monthlyCredits.toLocaleString()} Credits</p>
          </div>
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Max Concurrent Jobs</span>
            <p className="text-white font-semibold mt-1">{policy.maxConcurrentJobs} Parallel Jobs</p>
          </div>
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Queue Limit</span>
            <p className="text-white font-semibold mt-1">{policy.maxQueueLimit} Queue Items</p>
          </div>
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Monthly Export Limit</span>
            <p className="text-white font-semibold mt-1">{policy.maxExportLimit} Exports</p>
          </div>
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Custom Studio Mode</span>
            <p className={`font-semibold mt-1 ${policy.allowCustomStudioMode ? 'text-emerald-400' : 'text-slate-500'}`}>
              {policy.allowCustomStudioMode ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
            <span className="text-slate-400 text-xs font-medium">Advanced Workflows</span>
            <p className={`font-semibold mt-1 ${policy.allowAdvancedWorkflows ? 'text-emerald-400' : 'text-slate-500'}`}>
              {policy.allowAdvancedWorkflows ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <h5 className="text-sm font-semibold text-slate-300 mb-2">Allowed AI Capabilities & Providers</h5>
          <div className="flex flex-wrap gap-2">
            {policy.allowedCapabilities.map(cap => (
              <span key={cap} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
