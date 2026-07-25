import { http, HttpResponse } from 'msw';
import { aiProviderRegistry } from '@/lib/ai/provider';
import type { ScriptGenerationInput } from '@/lib/ai/types';

/**
 * MSW Handler intercepting POST /api/ai/script network requests.
 * Uses Gemini AI Provider to generate video script JSON.
 */
export const aiScriptHandler = http.post('/api/ai/script', async ({ request }) => {
  try {
    const body = (await request.json()) as ScriptGenerationInput;

    if (!body || !body.prompt || typeof body.prompt !== 'string') {
      return HttpResponse.json(
        { error: 'Invalid input. Field "prompt" is required.' },
        { status: 400 },
      );
    }

    const provider = aiProviderRegistry.getProvider('gemini');
    const result = await provider.generateScript(body);

    return HttpResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown AI error';
    return HttpResponse.json({ error: `Tạo kịch bản AI thất bại: ${message}` }, { status: 500 });
  }
});
