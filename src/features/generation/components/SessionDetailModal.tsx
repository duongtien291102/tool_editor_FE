import React from 'react';
import { GenerationSession, GenerationStepArtifact } from '../types';

interface SessionDetailModalProps {
  session: GenerationSession | null;
  onClose: () => void;
  onViewArtifact: (artifact: GenerationStepArtifact) => void;
  onOpenDownloadCenter: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onViewArtifact,
  onOpenDownloadCenter
}) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Generation Session</span>
            <h2 className="text-2xl font-bold text-white mt-1">{session.prompt}</h2>
            <div className="mt-2 flex gap-3 text-xs text-slate-400">
              <span>Workflow: <strong className="text-slate-200">{session.workflowType}</strong></span>
              <span>•</span>
              <span>Credits Consumed: <strong className="text-amber-400">{session.totalCreditsConsumed}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-slate-200">{session.totalDurationMs}ms</strong></span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl px-2">✕</button>
        </div>

        {session.finalVideoUrl && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-white">Final Output Preview</h4>
            <video src={session.finalVideoUrl} controls className="w-full rounded-lg max-h-[40vh]" />
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Execution Pipeline Steps</h4>
          <div className="space-y-2">
            {session.steps.map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{step.stepName}</span>
                  <span className="ml-2 text-slate-400">Provider: {step.providerId} ({step.modelId})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-semibold">{step.creditsConsumed} Credits</span>
                  <span className="text-slate-400">{step.durationMs}ms</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Generated Artifacts ({session.artifacts.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {session.artifacts.map(art => (
              <button
                key={art.id}
                onClick={() => onViewArtifact(art)}
                className="p-3 bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500 rounded-lg text-left transition-all"
              >
                <span className="text-[10px] text-indigo-400 block truncate">{art.stepName}</span>
                <p className="text-xs font-bold text-white truncate mt-1">{art.fileName}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between">
          <button
            onClick={onOpenDownloadCenter}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow"
          >
            Open Download Center
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
