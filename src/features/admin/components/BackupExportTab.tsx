import React from 'react';
import { adminService } from '../services/adminService';

export const BackupExportTab: React.FC = () => {
  const handleExport = (type: 'user' | 'audit' | 'project') => {
    adminService.exportData(type);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Backup & Export Center</h3>
        <p className="text-xs text-slate-400">Export user account data, security audit ledgers, and project metadata packages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-white text-sm">Export User Account Data</h4>
          <p className="text-xs text-slate-400">Generates JSON bundle containing profile, wallet transactions, and usage history.</p>
          <button
            onClick={() => handleExport('user')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow"
          >
            Export User Data JSON
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-white text-sm">Export Audit Log Ledger</h4>
          <p className="text-xs text-slate-400">Exports all security events, plan upgrades, and generation logs.</p>
          <button
            onClick={() => handleExport('audit')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow"
          >
            Export Audit Logs JSON
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-white text-sm">Backup Project Metadata</h4>
          <p className="text-xs text-slate-400">Creates structured JSON backup of timeline tracks, clips, and asset metadata.</p>
          <button
            onClick={() => handleExport('project')}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow"
          >
            Export Project Backup
          </button>
        </div>
      </div>
    </div>
  );
};
