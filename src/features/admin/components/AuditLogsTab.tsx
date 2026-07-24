import React, { useState } from 'react';
import { AuditLogEntry } from '../types';

interface AuditLogsTabProps {
  logs: AuditLogEntry[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const eventTypes = ['ALL', 'Login', 'Logout', 'PlanUpgrade', 'CreditPurchase', 'Generation', 'Download', 'ProviderChange', 'PermissionChange'];

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.eventType === filter);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Security Audit Log Ledger</h3>
          <p className="text-xs text-slate-400">Chronological security and operational system audit trail</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {eventTypes.map(et => (
            <button
              key={et}
              onClick={() => setFilter(et)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                filter === et
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Event Type</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Description</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredLogs.map(l => (
              <tr key={l.id} className="hover:bg-slate-800/40">
                <td className="p-3 font-mono text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded font-bold text-[10px]">
                    {l.eventType}
                  </span>
                </td>
                <td className="p-3 font-semibold text-white">{l.userId}</td>
                <td className="p-3 text-slate-200">{l.description}</td>
                <td className="p-3 font-mono text-slate-400">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
