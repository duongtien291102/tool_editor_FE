import React from 'react';
import { GenerationSession } from '../types';

interface GenerationHistoryProps {
  sessions: GenerationSession[];
  onSelectSession: (session: GenerationSession) => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  sessions,
  onSelectSession
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Generation History & Past Sessions</h3>
        <span className="text-xs text-slate-400">{sessions.length} sessions recorded</span>
      </div>

      <div className="space-y-3">
        {sessions.map(sess => (
          <div
            key={sess.id}
            onClick={() => onSelectSession(sess)}
            className="p-4 bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded">
                  {sess.workflowType}
                </span>
                <span className="text-xs text-slate-500">{new Date(sess.createdAt).toLocaleString()}</span>
              </div>
              <h4 className="text-base font-bold text-white line-clamp-1">{sess.prompt}</h4>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-amber-400 font-semibold">{sess.totalCreditsConsumed} Credits</span>
              <span className="text-slate-400">{sess.artifacts.length} Artifacts</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold">
                {sess.state}
              </span>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded text-xs">
                View Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
