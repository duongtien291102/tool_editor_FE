import React from 'react';
import type { SystemHealthReport } from '../types';

interface SystemHealthTabProps {
  health: SystemHealthReport | null;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ health }) => {
  if (!health) return <div className="text-slate-400">Loading system health...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Overall Health</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">{health.overallStatus}</h2>
          <p className="text-xs text-slate-400 mt-1">Checked at {new Date(health.timestamp).toLocaleString()}</p>
        </div>

        <div className="flex gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">Memory Used</span>
            <span className="text-white font-bold text-sm">{health.memoryUsedMb} MB</span>
          </div>
          <div>
            <span className="text-slate-400 block">Storage Used</span>
            <span className="text-white font-bold text-sm">{health.storageUsedGb} GB</span>
          </div>
          <div>
            <span className="text-slate-400 block">CPU Load</span>
            <span className="text-white font-bold text-sm">{health.cpuUsagePercent}%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
        <h3 className="text-base font-bold text-white">Component Health Monitor</h3>
        <div className="space-y-3">
          {health.components.map((comp, idx) => (
            <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white text-sm">{comp.componentName}</span>
                <p className="text-slate-400 mt-0.5">{comp.details}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold uppercase text-[10px]">
                {comp.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
