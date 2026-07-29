import React, { useEffect, useRef, useState } from 'react';
import { apiClient, responseData } from '@/api/httpClient';
import { generationService } from '../services/generationService';
import type { GenerationSession, GenerationStepArtifact } from '../types';
import { useProductionFlowStore } from '@/features/workflow';

interface GenerationWizardProps {
  onGenerationComplete?: (session: GenerationSession) => void;
  onOpenDownloadCenter?: (artifacts: GenerationStepArtifact[]) => void;
}

export const GenerationWizard: React.FC<GenerationWizardProps> = ({
  onGenerationComplete,
  onOpenDownloadCenter,
}) => {
  const legacyDraft = useRef(localStorage.getItem('ai-studio-generation-draft'));
  const [sourceProjectId] = useState(() => {
    const queryProjectId = new URLSearchParams(window.location.search).get('projectId');
    return queryProjectId ?? localStorage.getItem('ai-studio-generation-project') ?? 'proj-default';
  });
  const syncProductionGeneration = useProductionFlowStore((state) => state.syncGeneration);
  const markProductionStarted = useProductionFlowStore((state) => state.markGenerationStarted);
  const [prompt, setPrompt] = useState(
    () =>
      legacyDraft.current ??
      'Create a high-energy 15-second cinematic promo for an AI Video Studio platform.',
  );
  const [workflowType, setWorkflowType] = useState('Commercial Promo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<GenerationSession | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const submissionInFlight = useRef(false);

  const workflows = ['Commercial Promo', 'Social Media Reel', 'Product Showcase', 'Movie Teaser'];

  useEffect(() => {
    if (legacyDraft.current || sourceProjectId === 'proj-default') return;
    void responseData(
      apiClient.get<{
        success: boolean;
        data?: {
          title?: string;
          body?: string;
          scenes?: Array<{ title: string; narration: string; visual: string }>;
        };
      }>(`/api/v1/generation/script-workspaces/${encodeURIComponent(sourceProjectId)}`),
    )
      .then((envelope) => {
        if (!envelope.data) return;
        const workspace = envelope.data;
        const sceneText = (workspace.scenes ?? [])
          .map(
            (scene, index) =>
              `${index + 1}. ${scene.title}\nLời thoại: ${scene.narration}\nHình ảnh: ${scene.visual}`,
          )
          .join('\n\n');
        setPrompt(
          [
            workspace.title && `Tên kịch bản: ${workspace.title}`,
            workspace.body && `Kịch bản tổng:\n${workspace.body}`,
            sceneText && `Phân cảnh:\n${sceneText}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
      })
      .catch(() => undefined);
  }, [sourceProjectId]);

  const handleStartGeneration = async () => {
    if (!prompt.trim() || submissionInFlight.current) return;

    submissionInFlight.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    let sessionId: string | undefined;
    try {
      const session = await generationService.createSession(prompt, workflowType, sourceProjectId);
      if (legacyDraft.current) {
        localStorage.removeItem('ai-studio-generation-draft');
        localStorage.removeItem('ai-studio-generation-project');
        legacyDraft.current = null;
      }
      sessionId = session.id;
      setCurrentSession(session);
      markProductionStarted(sourceProjectId, session.id);

      const completedSession = await generationService.startGeneration(
        session.id,
        (updatedSession) => {
          setCurrentSession({ ...updatedSession });
        },
      );

      setCurrentSession(completedSession);
      syncProductionGeneration(sourceProjectId, completedSession);
      onGenerationComplete?.(completedSession);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Video generation failed');
      if (sessionId) {
        const failedSession = await generationService.getSession(sessionId).catch(() => null);
        if (failedSession) {
          setCurrentSession(failedSession);
          syncProductionGeneration(sourceProjectId, failedSession);
        }
      }
    } finally {
      submissionInFlight.current = false;
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Input Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white">AI Video Generation Wizard</h2>
          <p className="text-slate-400 text-sm mt-1">
            Transform ideas into a complete video production pipeline with storyboards, prompt
            packs, timeline drafts, and render jobs.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Production Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-sm text-white outline-none"
              placeholder="Describe what video you want to create..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Workflow Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {workflows.map((wf) => (
                  <button
                    key={wf}
                    onClick={() => setWorkflowType(wf)}
                    disabled={isGenerating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workflowType === wf
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => void handleStartGeneration()}
              disabled={isGenerating || !prompt.trim()}
              className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white shadow-indigo-500/25'
              }`}
            >
              {isGenerating ? 'Generating Video Pipeline...' : '✨ Generate Video Now'}
            </button>
          </div>
        </div>
      </div>

      {generationError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-bold">Video generation failed</p>
          <p className="mt-1 break-words">{generationError}</p>
        </div>
      )}

      {/* Real-time Pipeline Execution Steps */}
      {currentSession && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-full">
                  Status: {currentSession.state}
                </span>
                <span className="text-xs text-slate-500">Session ID: {currentSession.id}</span>
              </div>
              <p className="text-sm font-semibold text-white mt-1 line-clamp-1">
                {currentSession.prompt}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Total Cost</span>
                <span className="text-amber-400 font-extrabold text-base">
                  {currentSession.totalCreditsConsumed} Credits
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Artifacts</span>
                <span className="text-indigo-400 font-extrabold text-base">
                  {currentSession.artifacts.length} Files
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Step Executions List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Pipeline Execution Log
            </h3>
            {currentSession.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold text-[10px]">
                      ✓
                    </span>
                    <span className="font-bold text-white text-sm">{step.stepName}</span>
                    <span className="text-slate-400">
                      ({step.providerId} / {step.modelId})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-amber-400 font-semibold">
                      {step.creditsConsumed} Credits
                    </span>
                    <span className="text-slate-500">{step.durationMs}ms</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pl-7 flex gap-4">
                  <span>
                    Input: <strong className="text-slate-300">{step.inputPayload}</strong>
                  </span>
                  <span>
                    Output:{' '}
                    <strong className="text-indigo-300">
                      {step.outputPayload.substring(0, 60)}...
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Video Preview & Download Center Trigger when Completed */}
          {currentSession.state === 'Completed' && currentSession.finalVideoUrl && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Generation Result Preview</h3>
              <div className="bg-black rounded-xl overflow-hidden border border-slate-800 max-w-3xl mx-auto">
                <video
                  src={currentSession.finalVideoUrl}
                  controls
                  className="w-full max-h-[50vh]"
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => onOpenDownloadCenter?.(currentSession.artifacts)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                  📦 Download All Project Artifacts
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
