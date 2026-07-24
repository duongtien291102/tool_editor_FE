import React from 'react';
import type { UsageRecord } from '../types';

interface UsageTabProps {
  usage: UsageRecord[];
}

export const UsageTab: React.FC<UsageTabProps> = ({ usage }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xl font-bold text-white">Usage Tracking & Cost History</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4">Capability</th>
              <th className="py-3 px-4 text-right">Credits Used</th>
              <th className="py-3 px-4 text-right">Cost (USD)</th>
              <th className="py-3 px-4 text-right">Duration</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {usage.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 text-slate-400">{new Date(u.timestamp).toLocaleString()}</td>
                <td className="py-3 px-4 font-semibold text-white uppercase">{u.providerId}</td>
                <td className="py-3 px-4 text-indigo-300">{u.modelId}</td>
                <td className="py-3 px-4 text-slate-300">{u.capability}</td>
                <td className="py-3 px-4 text-right font-bold text-amber-400">{u.creditsUsed}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-300">${u.estimatedCost.toFixed(4)}</td>
                <td className="py-3 px-4 text-right text-slate-400">{u.durationMs}ms</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
