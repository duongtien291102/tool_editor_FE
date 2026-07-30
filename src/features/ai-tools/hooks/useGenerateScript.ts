import { useState, useRef, useCallback } from 'react';
import type {
  AIScriptResult,
  ScriptGenerationInput,
  ScriptLanguage,
  ScriptPlatform,
  ScriptTone,
} from '@/lib/ai/types';
import type { StylePreset } from '@/lib/ai/director';
import { postGenerateScript } from '@/lib/ai/aiScriptApi';
import { syncAiScriptToTimeline } from '@/services/aiTimelineSyncService';

/** In-memory Prompt Cache for caching identical generation requests */
const promptCache = new Map<string, AIScriptResult>();

function buildCacheKey(input: ScriptGenerationInput, stylePreset: StylePreset): string {
  return `${(input.prompt || '').trim().toLowerCase()}_${input.language || 'vi'}_${input.tone || 'Educational'}_${input.duration || 60}_${input.platform || 'youtube'}_${stylePreset}`;
}

export interface UseGenerateScriptReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  language: ScriptLanguage;
  setLanguage: (lang: ScriptLanguage) => void;
  tone: ScriptTone;
  setTone: (tone: ScriptTone) => void;
  duration: number;
  setDuration: (dur: number) => void;
  platform: ScriptPlatform;
  setPlatform: (plat: ScriptPlatform) => void;
  stylePreset: StylePreset;
  setStylePreset: (preset: StylePreset) => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  result: AIScriptResult | null;
  generateScript: () => Promise<void>;
  cancelGeneration: () => void;
}

export function useGenerateScript(): UseGenerateScriptReturn {
  const [prompt, setPrompt] = useState<string>('');
  const [language, setLanguage] = useState<ScriptLanguage>('vi');
  const [tone, setTone] = useState<ScriptTone>('Educational');
  const [duration, setDuration] = useState<number>(60);
  const [platform, setPlatform] = useState<ScriptPlatform>('youtube');
  const [stylePreset, setStylePreset] = useState<StylePreset>('YouTube');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIScriptResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setError('Tạo kịch bản đã bị hủy.');
    }
  }, []);

  const generateScript = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập Prompt hoặc ý tưởng kịch bản.');
      return;
    }

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const input: ScriptGenerationInput = {
      prompt: prompt.trim(),
      language,
      tone,
      duration,
      platform,
    };

    const cacheKey = buildCacheKey(input, stylePreset);
    if (promptCache.has(cacheKey)) {
      const cachedResult = promptCache.get(cacheKey)!;
      setResult(cachedResult);
      setError(null);
      await syncAiScriptToTimeline(cachedResult, stylePreset);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scriptOutput = await postGenerateScript(input, abortController.signal);

      if (abortController.signal.aborted) return;

      // Save to prompt cache
      promptCache.set(cacheKey, scriptOutput);

      setResult(scriptOutput);
      setLoading(false);

      // Automatically sync to Timeline with AI Director 6-layer Plan
      await syncAiScriptToTimeline(scriptOutput, stylePreset);
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;

      setLoading(false);
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo kịch bản.';
      setError(errMsg);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [prompt, language, tone, duration, platform, stylePreset]);

  return {
    prompt,
    setPrompt,
    language,
    setLanguage,
    tone,
    setTone,
    duration,
    setDuration,
    platform,
    setPlatform,
    stylePreset,
    setStylePreset,
    loading,
    error,
    setError,
    result,
    generateScript,
    cancelGeneration,
  };
}
