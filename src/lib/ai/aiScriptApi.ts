import { apiClient, responseData } from '@/api/httpClient';
import type { AIScriptResult, ScriptGenerationInput } from './types';

interface ScriptDraftEnvelope {
  success: boolean;
  data: {
    scripts: Array<{
      title: string;
      description: string;
      scenes: Array<{
        title: string;
        narration: string;
        visual: string;
      }>;
    }>;
  };
  message?: string;
}

export async function postGenerateScript(
  input: ScriptGenerationInput,
  signal?: AbortSignal,
): Promise<AIScriptResult> {
  const envelope = await responseData(
    apiClient.post<ScriptDraftEnvelope>(
      '/api/v1/generation/script-drafts',
      { idea: input.prompt },
      { signal },
    ),
  );
  const draft = envelope.data?.scripts?.[0];
  if (!envelope.success || !draft)
    throw new Error(envelope.message || 'Gemini did not return a script.');

  const totalDuration = Math.max(input.duration ?? 60, draft.scenes.length);
  const sceneDuration = totalDuration / draft.scenes.length;
  return {
    title: draft.title,
    description: draft.description,
    duration: totalDuration,
    language: input.language ?? 'vi',
    platform: input.platform ?? 'youtube',
    scenes: draft.scenes.map((scene, index) => ({
      id: index + 1,
      title: scene.title,
      start: index * sceneDuration,
      duration: sceneDuration,
      narration: scene.narration,
      subtitle: scene.narration,
      visualPrompt: scene.visual,
      pexelsQuery: scene.title,
      keywords: [],
      transition: 'cut',
    })),
  };
}
