import React from 'react';
import type { AdminUserSummary } from '../types';

interface UserManagementTabProps {
  users: AdminUserSummary[];
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ users }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white">User Accounts & Credits Manager</h3>
        <p className="text-xs text-slate-400">View registered users, plan tiers, and remaining credit balances</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Plan Tier</th>
              <th className="p-3">Remaining Credits</th>
              <th className="p-3">Total Generations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(u => (
              <tr key={u.userId} className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">{u.displayName}</td>
                <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded font-bold text-[10px]">
                    {u.planTier}
                  </span>
                </td>
                <td className="p-3 font-extrabold text-amber-400">{u.remainingCredits.toLocaleString()}</td>
                <td className="p-3 text-slate-200 font-semibold">{u.totalGenerations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
