import { GeminiProvider, repairAndParseJson } from './gemini';
import { aiProviderRegistry, AIProviderRegistry } from './provider';

// Register default Gemini provider in the registry
const defaultGeminiProvider = new GeminiProvider();
aiProviderRegistry.registerProvider(defaultGeminiProvider);
aiProviderRegistry.setDefaultProvider('gemini');

export type {
  ScriptLanguage,
  ScriptTone,
  ScriptPlatform,
  ScriptGenerationInput,
  AIScriptScene,
  AIScriptResult,
  StreamChunkCallback,
  AIProvider,
  AIProviderConfig,
} from './types';

export { buildVideoScriptPrompt } from './prompt';
export { aiProviderRegistry, AIProviderRegistry };
export { GeminiProvider, repairAndParseJson };
