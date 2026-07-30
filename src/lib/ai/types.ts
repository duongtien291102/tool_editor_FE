/**
 * AI Module Type Definitions
 * Strict TypeScript types for AI Video Script Generation in AI Studio.
 */

export type ScriptLanguage = 'vi' | 'en';

export type ScriptTone =
  | 'Professional'
  | 'Funny'
  | 'Educational'
  | 'Storytelling'
  | 'Marketing'
  | 'Emotional'
  | 'Documentary';

export type ScriptPlatform = 'tiktok' | 'youtube' | 'facebook' | 'instagram' | 'shorts';

export interface ScriptGenerationInput {
  prompt: string;
  language?: ScriptLanguage;
  tone?: ScriptTone;
  duration?: number;
  platform?: ScriptPlatform;
}

export interface AIScriptScene {
  id: number;
  title: string;
  start: number;
  duration: number;
  narration: string;
  subtitle: string;
  visualPrompt: string;
  pexelsQuery: string;
  keywords: string[];
  transition: string;
}

export interface AIScriptResult {
  title: string;
  description: string;
  duration: number;
  language: string;
  platform: string;
  scenes: AIScriptScene[];
}

export type StreamChunkCallback = (chunk: Partial<AIScriptResult>) => void;

/**
 * Interface for AI Engine Providers (Provider Pattern).
 * Allows plugging in Gemini, OpenAI, Claude, Groq, DeepSeek seamlessly.
 */
export interface AIProvider {
  /** Provider unique identifier name */
  readonly name: string;

  /**
   * Generates a complete video script from user input prompt & parameters.
   * @param input User prompt and options
   * @param signal AbortSignal to cancel in-flight requests
   */
  generateScript(input: ScriptGenerationInput, signal?: AbortSignal): Promise<AIScriptResult>;

  /**
   * Streams video script generation progress if supported by provider SDK.
   * @param input User prompt and options
   * @param onChunk Callback called with partial output chunks
   * @param signal AbortSignal to cancel in-flight requests
   */
  generateScriptStream?(
    input: ScriptGenerationInput,
    onChunk: StreamChunkCallback,
    signal?: AbortSignal,
  ): Promise<AIScriptResult>;
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}
