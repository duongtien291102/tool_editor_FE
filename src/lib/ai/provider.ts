import type { AIProvider } from './types';

/**
 * Provider Registry implementing the Provider Pattern.
 * Decouples AI generation business logic from specific AI services.
 * Allows easy plug-and-play for Gemini, OpenAI, Claude, Groq, DeepSeek.
 */
export class AIProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private defaultProviderName: string = 'gemini';

  /**
   * Registers a new AI Provider instance.
   * @param provider Instance implementing AIProvider interface
   */
  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  /**
   * Sets the default provider name.
   * @param name Provider name (e.g. 'gemini', 'openai')
   */
  public setDefaultProvider(name: string): void {
    if (!this.providers.has(name.toLowerCase())) {
      throw new Error(`AI Provider "${name}" is not registered.`);
    }
    this.defaultProviderName = name.toLowerCase();
  }

  /**
   * Retrieves an AI Provider by name, or returns the default provider.
   * @param name Provider name (optional)
   * @returns AIProvider instance
   */
  public getProvider(name?: string): AIProvider {
    const targetName = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(targetName);

    if (!provider) {
      // Fall back to first registered provider if target not found
      const first = Array.from(this.providers.values())[0];
      if (first) return first;
      throw new Error(
        `No AI Provider found for "${targetName}". Ensure GeminiProvider is registered.`,
      );
    }

    return provider;
  }

  /**
   * Returns a list of all registered provider names.
   */
  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

/** Global singleton registry instance */
export const aiProviderRegistry = new AIProviderRegistry();
