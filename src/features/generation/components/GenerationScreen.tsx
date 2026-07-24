import React, { useEffect, useState } from 'react';
import { generationService } from '../services/generationService';
import { GenerationSession, GenerationStepArtifact } from '../types';
import { GenerationWizard } from './GenerationWizard';
import { GenerationHistory } from './GenerationHistory';
import { SessionDetailModal } from './SessionDetailModal';
import { ArtifactViewerModal } from './ArtifactViewerModal';
import { DownloadCenterModal } from './DownloadCenterModal';

export type GenerationTab = 'wizard' | 'history';

interface GenerationScreenProps {
  defaultTab?: GenerationTab;
}

export const GenerationScreen: React.FC<GenerationScreenProps> = ({ defaultTab = 'wizard' }) => {
  const [activeTab, setActiveTab] = useState<GenerationTab>(defaultTab);
  const [sessions, setSessions] = useState<GenerationSession[]>([]);

  const [selectedSession, setSelectedSession] = useState<GenerationSession | null>(null);
  const [viewingArtifact, setViewingArtifact] = useState<GenerationStepArtifact | null>(null);
  const [downloadArtifacts, setDownloadArtifacts] = useState<GenerationStepArtifact[] | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const list = await generationService.listSessions();
    setSessions(list);
  };

  const handleDownloadSingle = (artifact: GenerationStepArtifact) => {
    generationService.mockDownloadArtifact(artifact);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Video Generation Experience</h1>
          <p className="text-slate-400 text-sm mt-1">End-to-end video pipeline wizard, artifact outputs, and session management</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'wizard'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            ✨ New Generation Wizard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            📜 Generation History ({sessions.length})
          </button>
        </div>
      </div>

      {activeTab === 'wizard' && (
        <GenerationWizard
          onGenerationComplete={loadSessions}
          onOpenDownloadCenter={artifacts => setDownloadArtifacts(artifacts)}
        />
      )}

      {activeTab === 'history' && (
        <GenerationHistory
          sessions={sessions}
          onSelectSession={sess => setSelectedSession(sess)}
        />
      )}

      {/* Modals */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onViewArtifact={art => setViewingArtifact(art)}
        onOpenDownloadCenter={() => {
          if (selectedSession) setDownloadArtifacts(selectedSession.artifacts);
        }}
      />

      <ArtifactViewerModal
        artifact={viewingArtifact}
        onClose={() => setViewingArtifact(null)}
        onDownload={handleDownloadSingle}
      />

      {downloadArtifacts && (
        <DownloadCenterModal
          artifacts={downloadArtifacts}
          onClose={() => setDownloadArtifacts(null)}
          onDownload={handleDownloadSingle}
        />
      )}
    </div>
  );
};
