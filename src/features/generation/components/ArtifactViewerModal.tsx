import React from 'react';
import { GenerationStepArtifact } from '../types';

interface ArtifactViewerModalProps {
  artifact: GenerationStepArtifact | null;
  onClose: () => void;
  onDownload: (artifact: GenerationStepArtifact) => void;
}

export const ArtifactViewerModal: React.FC<ArtifactViewerModalProps> = ({
  artifact,
  onClose,
  onDownload
}) => {
  if (!artifact) return null;

  const isVideo = artifact.contentType.includes('video');
  const isImage = artifact.contentType.includes('image');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{artifact.stepName}</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{artifact.fileName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg px-2">✕</button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
          {isVideo ? (
            <video src={artifact.contentUrl} controls className="w-full rounded-lg max-h-[50vh]" />
          ) : isImage ? (
            <img src={artifact.contentUrl} alt={artifact.fileName} className="w-full rounded-lg max-h-[50vh] object-contain mx-auto" />
          ) : (
            <pre className="whitespace-pre-wrap break-words">{artifact.rawContent}</pre>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">File size: {(artifact.fileSizeBytes / 1024).toFixed(1)} KB</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg">
              Close
            </button>
            <button
              onClick={() => onDownload(artifact)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
            >
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
