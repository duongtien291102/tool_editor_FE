import React from 'react';
import { FeatureFlag } from '../types';

interface FeatureFlagsTabProps {
  flags: FeatureFlag[];
  onToggleFlag: (key: string, isEnabled: boolean) => void;
}

export const FeatureFlagsTab: React.FC<FeatureFlagsTabProps> = ({ flags, onToggleFlag }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white">Dynamic Feature Flags System</h3>
        <p className="text-xs text-slate-400">Control system capabilities, provider availability, and studio features at runtime without redeployment</p>
      </div>

      <div className="space-y-3">
        {flags.map(flag => (
          <div key={flag.key} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex justify-between items-center text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] rounded">{flag.category}</span>
                <span className="font-bold text-white text-sm">{flag.name}</span>
                <span className="font-mono text-slate-500 text-[10px]">({flag.key})</span>
              </div>
              <p className="text-slate-400 mt-1">{flag.description}</p>
            </div>

            <button
              onClick={() => onToggleFlag(flag.key, !flag.isEnabled)}
              className={`px-4 py-2 rounded-lg font-bold text-xs shadow transition-all ${
                flag.isEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {flag.isEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
