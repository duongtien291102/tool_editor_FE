import { apiClient, responseData } from '@/api/httpClient';
import type { AIScriptResult, ScriptGenerationInput } from './types';
import { aiProviderRegistry } from './provider';

/**
 * API client to call POST /api/ai/script endpoint.
 *
 * @param input ScriptGenerationInput
 * @param signal AbortSignal to cancel request
 * @returns Promise<AIScriptResult>
 */
export async function postGenerateScript(
  input: ScriptGenerationInput,
  signal?: AbortSignal,
): Promise<AIScriptResult> {
  try {
    const response = await responseData(
      apiClient.post<AIScriptResult>('/api/ai/script', input, { signal }),
    );
    return response;
  } catch (error: unknown) {
    // If backend or MSW call fails, fallback gracefully to client-side provider execution
    // eslint-disable-next-line no-console
    console.warn('API endpoint /api/ai/script error, invoking local provider fallback:', error);
    const provider = aiProviderRegistry.getProvider('gemini');
    return provider.generateScript(input, signal);
  }
}
