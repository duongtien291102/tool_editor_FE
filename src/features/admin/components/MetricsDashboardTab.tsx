import React from 'react';
import { SystemMetrics } from '../types';

interface MetricsDashboardTabProps {
  metrics: SystemMetrics | null;
}

export const MetricsDashboardTab: React.FC<MetricsDashboardTabProps> = ({ metrics }) => {
  if (!metrics) return <div className="text-slate-400">Loading system metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
          <p className="text-2xl font-extrabold text-white mt-1">{metrics.activeUsersCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Generations</span>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">{metrics.totalGenerationsCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{metrics.successRatePercent}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Queue Length</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{metrics.queueLength} Jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Generation Time</span>
          <p className="text-xl font-bold text-white mt-1">{metrics.avgGenerationTimeMs} ms</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Credits Consumed</span>
          <p className="text-xl font-bold text-amber-400 mt-1">{metrics.totalCreditsConsumed.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Latency</span>
          <p className="text-xl font-bold text-white mt-1">{metrics.apiLatencyMs} ms</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <h3 className="text-base font-bold text-white">Provider Usage Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(metrics.providerUsageCounts).map(([provider, count]) => (
            <div key={provider} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg text-center">
              <span className="text-xs font-bold uppercase text-indigo-400 block">{provider}</span>
              <p className="text-lg font-extrabold text-white mt-0.5">{count}</p>
              <span className="text-[10px] text-slate-500">calls</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
