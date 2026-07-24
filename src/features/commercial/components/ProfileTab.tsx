import React from 'react';
import type { UserProfile } from '../types';

interface ProfileTabProps {
  profile: UserProfile;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-6">
        <img
          src={profile.avatarUrl}
          alt={profile.displayName}
          className="w-20 h-20 rounded-full border-2 border-indigo-500/30 shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{profile.displayName}</h2>
          <p className="text-slate-400 text-sm">{profile.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full">
              {profile.planName}
            </span>
            <span className="text-xs text-slate-500">Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Remaining Credits</span>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">{profile.remainingCredits.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Total Credits Purchased</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{profile.totalPurchasedCredits.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Total Credits Used</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{profile.totalUsedCredits.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
