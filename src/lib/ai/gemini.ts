import { GoogleGenAI } from '@google/genai';
import { configService } from '@/core/config/ConfigService';
import type {
  AIProvider,
  AIProviderConfig,
  AIScriptResult,
  AIScriptScene,
  ScriptGenerationInput,
  StreamChunkCallback,
} from './types';
import { buildVideoScriptPrompt } from './prompt';

/**
 * Clean and repair raw text from AI model into valid AIScriptResult JSON object.
 * Handles markdown fence removal, trailing commas, missing braces, etc.
 */
export function repairAndParseJson(
  rawText: string,
  fallbackInput: ScriptGenerationInput,
): AIScriptResult {
  let cleaned = rawText.trim();

  // Strip Markdown code block wrappers
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }

  // Find first '{' and last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Attempt initial JSON parse
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return sanitizeScriptResult(parsed, fallbackInput);
  } catch {
    // Basic repair for common LLM JSON syntax issues
    const repaired = cleaned
      .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // quote unquoted keys

    try {
      const parsed = JSON.parse(repaired) as Record<string, unknown>;
      return sanitizeScriptResult(parsed, fallbackInput);
    } catch {
      // Fallback construction if JSON parse completely fails
      return createFallbackScriptResult(fallbackInput, rawText);
    }
  }
}

function safeString(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.length > 0) return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

/**
 * Ensures all required fields exist in parsed JSON with fallback defaults.
 */
function sanitizeScriptResult(
  rawObj: Record<string, unknown>,
  input: ScriptGenerationInput,
): AIScriptResult {
  const targetDuration = input.duration && input.duration > 0 ? input.duration : 60;
  const rawScenes = Array.isArray(rawObj.scenes) ? rawObj.scenes : [];

  const sanitizedScenes: AIScriptScene[] = rawScenes.map((item: unknown, index: number) => {
    const sceneObj = (typeof item === 'object' && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    const sceneId = typeof sceneObj.id === 'number' ? sceneObj.id : index + 1;
    const sceneDuration = typeof sceneObj.duration === 'number' ? sceneObj.duration : 5;
    const sceneStart = typeof sceneObj.start === 'number' ? sceneObj.start : index * 5;

    return {
      id: sceneId,
      title: safeString(sceneObj.title, `Cảnh ${sceneId}`),
      start: sceneStart,
      duration: sceneDuration,
      narration: safeString(sceneObj.narration, safeString(sceneObj.subtitle, '')),
      subtitle: safeString(sceneObj.subtitle, safeString(sceneObj.narration, '')),
      visualPrompt: safeString(
        sceneObj.visualPrompt,
        safeString(sceneObj.title, 'Cinematic video shot'),
      ),
      pexelsQuery: safeString(sceneObj.pexelsQuery, 'cinematic video'),
      keywords: Array.isArray(sceneObj.keywords)
        ? sceneObj.keywords.map((k: unknown) => (typeof k === 'string' ? k : String(k)))
        : ['video'],
      transition: safeString(sceneObj.transition, 'fade'),
    };
  });

  // If no scenes returned, create default fallback scenes
  if (sanitizedScenes.length === 0) {
    sanitizedScenes.push(...createDefaultScenes(targetDuration, input.prompt));
  }

  return {
    title: safeString(rawObj.title, `Kịch bản: ${input.prompt.slice(0, 30)}`),
    description: safeString(rawObj.description, `Video script generated for: ${input.prompt}`),
    duration: typeof rawObj.duration === 'number' ? rawObj.duration : targetDuration,
    language: safeString(rawObj.language, input.language || 'vi'),
    platform: safeString(rawObj.platform, input.platform || 'youtube'),
    scenes: sanitizedScenes,
  };
}

/**
 * Creates fallback scenes if AI response is missing or broken.
 */
function createDefaultScenes(totalDuration: number, prompt: string): AIScriptScene[] {
  const sceneCount = Math.max(2, Math.floor(totalDuration / 6));
  const sceneDuration = Math.max(3, Math.floor(totalDuration / sceneCount));
  const scenes: AIScriptScene[] = [];

  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      id: i + 1,
      title:
        i === 0 ? 'Mở đầu (Hook)' : i === sceneCount - 1 ? 'Kết thúc (CTA)' : `Nội dung ${i + 1}`,
      start: i * sceneDuration,
      duration: sceneDuration,
      narration: `Lời dẫn cho cảnh ${i + 1}: ${prompt}`,
      subtitle: `Phụ đề cảnh ${i + 1}: ${prompt}`,
      visualPrompt: `High quality cinematic shot illustrating ${prompt}`,
      pexelsQuery: prompt.split(' ').slice(0, 3).join(' ') || 'cinematic scenery',
      keywords: ['video', 'creative'],
      transition: 'fade',
    });
  }

  return scenes;
}

function createFallbackScriptResult(
  input: ScriptGenerationInput,
  rawErrorContent?: string,
): AIScriptResult {
  const targetDuration = input.duration || 60;
  return {
    title: `Kịch bản: ${input.prompt.slice(0, 40)}`,
    description: rawErrorContent || 'Kịch bản tự động được tạo cho video.',
    duration: targetDuration,
    language: input.language || 'vi',
    platform: input.platform || 'youtube',
    scenes: createDefaultScenes(targetDuration, input.prompt),
  };
}

/**
 * Gemini AI Engine Provider implementation.
 * Uses official @google/genai SDK with retry, repair, streaming, and AbortController.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig = {}) {
    this.config = {
      model: 'gemini-2.5-flash',
      timeoutMs: 30000,
      maxRetries: 2,
      ...config,
    };
  }

  /**
   * Generates video script using Google Gemini SDK.
   */
  async generateScript(
    input: ScriptGenerationInput,
    signal?: AbortSignal,
  ): Promise<AIScriptResult> {
    const apiKey = this.config.apiKey || configService.getGeminiApiKey();

    if (!apiKey) {
      // Friendly fallback if API key is not configured in environment
      // eslint-disable-next-line no-console
      console.warn(
        'GEMINI_API_KEY environment variable is missing. Returning structured fallback script.',
      );
      return createFallbackScriptResult(
        input,
        'GEMINI_API_KEY chưa được cấu hình trong .env.local',
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptText = buildVideoScriptPrompt(input);
    const maxRetries = this.config.maxRetries ?? 2;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new Error('Yêu cầu tạo kịch bản đã bị hủy.');
      }

      try {
        const response = await ai.models.generateContent({
          model: this.config.model || 'gemini-2.5-flash',
          contents: promptText,
        });

        const text = response.text;
        if (!text) {
          throw new Error('Gemini AI không trả về nội dung text.');
        }

        return repairAndParseJson(text, input);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (signal?.aborted) {
          throw new Error('Yêu cầu tạo kịch bản đã bị hủy.', { cause: err });
        }
        // eslint-disable-next-line no-console
        console.warn(`Gemini API call attempt ${attempt + 1} failed: ${lastError.message}`);
      }
    }

    // Return fallback result if retries exhausted
    return createFallbackScriptResult(
      input,
      `Không thể tạo kịch bản qua Gemini API: ${lastError?.message || 'Lỗi hệ thống'}`,
    );
  }

  /**
   * Streams script generation using Gemini generateContentStream SDK if supported.
   */
  async generateScriptStream(
    input: ScriptGenerationInput,
    onChunk: StreamChunkCallback,
    signal?: AbortSignal,
  ): Promise<AIScriptResult> {
    const apiKey = this.config.apiKey || configService.getGeminiApiKey();

    if (!apiKey) {
      const fallback = createFallbackScriptResult(input);
      onChunk(fallback);
      return fallback;
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptText = buildVideoScriptPrompt(input);

    try {
      const streamResult = await ai.models.generateContentStream({
        model: this.config.model || 'gemini-2.5-flash',
        contents: promptText,
      });

      let accumulatedText = '';

      for await (const chunk of streamResult) {
        if (signal?.aborted) {
          throw new Error('Yêu cầu tạo kịch bản đã bị hủy.');
        }
        if (chunk.text) {
          accumulatedText += chunk.text;
          onChunk({
            title: `Đang tạo kịch bản... (${accumulatedText.length} kí tự)`,
          });
        }
      }

      const finalScript = repairAndParseJson(accumulatedText, input);
      onChunk(finalScript);
      return finalScript;
    } catch {
      // Fallback to standard generation on stream error
      return this.generateScript(input, signal);
    }
  }
}
