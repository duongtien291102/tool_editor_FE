import React from 'react';
import { GenerationStepArtifact } from '../types';

interface DownloadCenterModalProps {
  artifacts: GenerationStepArtifact[];
  onClose: () => void;
  onDownload: (artifact: GenerationStepArtifact) => void;
}

export const DownloadCenterModal: React.FC<DownloadCenterModalProps> = ({
  artifacts,
  onClose,
  onDownload
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xl font-bold text-white">Download Center</h3>
            <p className="text-xs text-slate-400">Download generated artifacts, video, subtitles, and prompt packages</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg px-2">✕</button>
        </div>

        <div className="divide-y divide-slate-800 max-h-[60vh] overflow-auto">
          {artifacts.map(art => (
            <div key={art.id} className="py-3 flex justify-between items-center hover:bg-slate-800/30 px-2 rounded-lg">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">{art.stepName}</span>
                <p className="text-sm font-bold text-white mt-0.5">{art.fileName}</p>
                <span className="text-[10px] text-slate-500">{art.contentType} • {(art.fileSizeBytes / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => onDownload(art)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
              >
                Download
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
