import type {
  AiProviderProfile,
  CostEstimateRequest,
  CostEstimateResponse,
  DurationEstimateRequest,
  DurationEstimateResponse,
  HealthCheckResult,
} from '../types';

const INITIAL_MOCK_PROVIDERS: AiProviderProfile[] = [
  {
    provider: 'OpenAI',
    status: 'Available',
    enabled: true,
    priority: 10,
    supportedCapabilities: [
      'GenerateImage',
      'GenerateSubtitle',
      'Inpainting',
      'Outpainting',
      'ImageEditing',
    ],
    healthStatus: 'Healthy',
    lastHealthCheck: new Date().toISOString(),
    secretBinding: {
      sourceType: 'InMemory',
      keyName: 'OPENAI_API_KEY',
      maskedValue: 'sk-proj-••••••••8f4b',
      isBound: true,
    },
    isDefault: true,
    configuration: {
      endpoint: 'https://api.openai.com/v1',
      model: 'dall-e-3 / gpt-4o',
      temperature: 0.7,
      timeout: 30,
      maxRetry: 3,
      priority: 10,
      enabled: true,
    },
    costProfile: {
      costPerImage: 0.04,
      costPerVideoMinute: 0.0,
      costPerAudioMinute: 0.0,
      costPer1kTokens: 0.002,
    },
    rateLimitProfile: { requestsPerMinute: 120, tokensPerMinute: 60000 },
    timeoutSeconds: 30,
    retryPolicy: { maxRetries: 3, backoffStrategy: 'ExponentialBackoff', initialDelayMs: 200 },
    latencyMs: 142,
  },
  {
    provider: 'Gemini',
    status: 'Available',
    enabled: true,
    priority: 15,
    supportedCapabilities: [
      'GenerateImage',
      'GenerateVideo',
      'GenerateVoice',
      'GenerateSubtitle',
      'Inpainting',
      'ImageEditing',
    ],
    healthStatus: 'Healthy',
    lastHealthCheck: new Date().toISOString(),
    secretBinding: {
      sourceType: 'EnvironmentVariable',
      keyName: 'GEMINI_API_KEY',
      maskedValue: 'AIzaSy••••••••3x9q',
      isBound: true,
    },
    isDefault: false,
    configuration: {
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-pro / veo',
      temperature: 0.6,
      timeout: 45,
      maxRetry: 3,
      priority: 15,
      enabled: true,
    },
    costProfile: {
      costPerImage: 0.03,
      costPerVideoMinute: 0.4,
      costPerAudioMinute: 0.05,
      costPer1kTokens: 0.0015,
    },
    rateLimitProfile: { requestsPerMinute: 150, tokensPerMinute: 90000 },
    timeoutSeconds: 45,
    retryPolicy: { maxRetries: 3, backoffStrategy: 'ExponentialBackoff', initialDelayMs: 250 },
    latencyMs: 98,
  },
  {
    provider: 'Veo',
    status: 'Available',
    enabled: true,
    priority: 20,
    supportedCapabilities: ['GenerateVideo'],
    healthStatus: 'Healthy',
    lastHealthCheck: new Date().toISOString(),
    secretBinding: {
      sourceType: 'AzureKeyVault',
      keyName: 'VEO_SERVICE_KEY',
      maskedValue: 'veo-vault-••••••••1102',
      isBound: true,
      vaultUri: 'https://kv-studio-prod.vault.azure.net',
    },
    isDefault: false,
    configuration: {
      endpoint: 'https://veo.googleapis.com/v1',
      model: 'google-veo-2.0',
      temperature: 0.5,
      timeout: 60,
      maxRetry: 2,
      priority: 20,
      enabled: true,
    },
    costProfile: {
      costPerImage: 0.0,
      costPerVideoMinute: 0.75,
      costPerAudioMinute: 0.0,
      costPer1kTokens: 0.0,
    },
    rateLimitProfile: { requestsPerMinute: 60, tokensPerMinute: 30000 },
    timeoutSeconds: 60,
    retryPolicy: { maxRetries: 2, backoffStrategy: 'ExponentialBackoff', initialDelayMs: 500 },
    latencyMs: 320,
  },
  {
    provider: 'Runway',
    status: 'Available',
    enabled: true,
    priority: 25,
    supportedCapabilities: ['GenerateVideo', 'ImageEditing', 'Inpainting', 'Upscale'],
    healthStatus: 'Healthy',
    lastHealthCheck: new Date().toISOString(),
    secretBinding: {
      sourceType: 'AwsSecretsManager',
      keyName: 'RUNWAY_ML_KEY',
      maskedValue: 'rw-secret-••••••••77a2',
      isBound: true,
      region: 'us-east-1',
    },
    isDefault: false,
    configuration: {
      endpoint: 'https://api.runwayml.com/v1',
      model: 'gen-3-alpha-turbo',
      temperature: 0.7,
      timeout: 90,
      maxRetry: 3,
      priority: 25,
      enabled: true,
    },
    costProfile: {
      costPerImage: 0.05,
      costPerVideoMinute: 0.85,
      costPerAudioMinute: 0.0,
      costPer1kTokens: 0.0,
    },
    rateLimitProfile: { requestsPerMinute: 45, tokensPerMinute: 20000 },
    timeoutSeconds: 90,
    retryPolicy: { maxRetries: 3, backoffStrategy: 'ExponentialBackoff', initialDelayMs: 400 },
    fallbackProvider: 'Kling',
    latencyMs: 410,
  },
  {
    provider: 'Kling',
    status: 'Disabled',
    enabled: false,
    priority: 30,
    supportedCapabilities: ['GenerateVideo', 'ImageEditing'],
    healthStatus: 'Disabled',
    lastHealthCheck: new Date().toISOString(),
    secretBinding: {
      sourceType: 'EncryptedDatabase',
      keyName: 'KLING_AI_KEY',
      maskedValue: 'kling-enc-••••••••9901',
      isBound: true,
    },
    isDefault: false,
    configuration: {
      endpoint: 'https://api.klingai.com/v1',
      model: 'kling-v1.5-pro',
      temperature: 0.8,
      timeout: 120,
      maxRetry: 2,
      priority: 30,
      enabled: false,
    },
    costProfile: {
      costPerImage: 0.0,
      costPerVideoMinute: 0.6,
      costPerAudioMinute: 0.0,
      costPer1kTokens: 0.0,
    },
    rateLimitProfile: { requestsPerMinute: 30, tokensPerMinute: 15000 },
    timeoutSeconds: 120,
    retryPolicy: { maxRetries: 2, backoffStrategy: 'Linear', initialDelayMs: 1000 },
    latencyMs: 0,
  },
];

class AiProviderService {
  private localProviders: AiProviderProfile[] = [...INITIAL_MOCK_PROVIDERS];

  async getProviders(): Promise<AiProviderProfile[]> {
    try {
      const res = await fetch('/api/v1/ai-providers');
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback to local memory state
    }
    return [...this.localProviders];
  }

  async updateProvider(
    provider: string,
    changes: Partial<AiProviderProfile['configuration']> & {
      apiKey?: string;
      secretSource?: string;
      secretKeyName?: string;
      isDefault?: boolean;
      fallbackProvider?: string;
    },
  ): Promise<AiProviderProfile> {
    try {
      const res = await fetch(`/api/v1/ai-providers/${provider.toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const index = this.localProviders.findIndex(
      (p) => p.provider.toLowerCase() === provider.toLowerCase(),
    );
    if (index !== -1) {
      const existing = this.localProviders[index];
      const updatedConfig = { ...existing.configuration, ...changes };
      const updated: AiProviderProfile = {
        ...existing,
        enabled: changes.enabled ?? existing.enabled,
        status: (changes.enabled ?? existing.enabled) ? 'Available' : 'Disabled',
        priority: changes.priority ?? existing.priority,
        isDefault: changes.isDefault ?? existing.isDefault,
        fallbackProvider: changes.fallbackProvider ?? existing.fallbackProvider,
        configuration: updatedConfig,
        secretBinding: {
          ...existing.secretBinding,
          sourceType: (changes.secretSource as any) || existing.secretBinding.sourceType,
          keyName: changes.secretKeyName || existing.secretBinding.keyName,
          maskedValue: changes.apiKey
            ? `${changes.apiKey.slice(0, 3)}••••••••${changes.apiKey.slice(-4)}`
            : existing.secretBinding.maskedValue,
        },
      };

      if (changes.isDefault) {
        this.localProviders.forEach((p) => {
          p.isDefault = p.provider.toLowerCase() === provider.toLowerCase();
        });
      }

      this.localProviders[index] = updated;
      return updated;
    }
    throw new Error(`Provider ${provider} not found`);
  }

  async toggleProvider(provider: string, enable: boolean): Promise<AiProviderProfile> {
    try {
      const endpoint = enable ? 'enable' : 'disable';
      const res = await fetch(`/api/v1/ai-providers/${provider.toLowerCase()}/${endpoint}`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const index = this.localProviders.findIndex(
      (p) => p.provider.toLowerCase() === provider.toLowerCase(),
    );
    if (index !== -1) {
      this.localProviders[index].enabled = enable;
      this.localProviders[index].status = enable ? 'Available' : 'Disabled';
      this.localProviders[index].healthStatus = enable ? 'Healthy' : 'Disabled';
      return this.localProviders[index];
    }
    throw new Error(`Provider ${provider} not found`);
  }

  async runHealthCheck(provider: string): Promise<HealthCheckResult> {
    try {
      const res = await fetch(`/api/v1/ai-providers/${provider.toLowerCase()}/health-check`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const latency = Math.floor(Math.random() * 80) + 40;
    const result: HealthCheckResult = {
      provider,
      status: 'Healthy',
      isHealthy: true,
      latencyMs: latency,
      checkedAt: new Date().toISOString(),
      details: 'Mock synthetic ping response nominal.',
    };

    const index = this.localProviders.findIndex(
      (p) => p.provider.toLowerCase() === provider.toLowerCase(),
    );
    if (index !== -1) {
      this.localProviders[index].healthStatus = 'Healthy';
      this.localProviders[index].lastHealthCheck = result.checkedAt;
      this.localProviders[index].latencyMs = latency;
    }

    return result;
  }

  async estimateCost(provider: string, request: CostEstimateRequest): Promise<CostEstimateResponse> {
    try {
      const res = await fetch(`/api/v1/ai-providers/${provider.toLowerCase()}/estimate-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const p = this.localProviders.find(
      (item) => item.provider.toLowerCase() === provider.toLowerCase(),
    );
    const profile = p?.costProfile || {
      costPerImage: 0.04,
      costPerVideoMinute: 0.75,
      costPerAudioMinute: 0.05,
      costPer1kTokens: 0.002,
    };

    let total = 0;
    const parts: string[] = [];
    if (request.imageCount && request.imageCount > 0) {
      const c = request.imageCount * profile.costPerImage;
      total += c;
      parts.push(`${request.imageCount} imgs ($${c.toFixed(4)})`);
    }
    if (request.videoSeconds && request.videoSeconds > 0) {
      const c = (request.videoSeconds / 60) * profile.costPerVideoMinute;
      total += c;
      parts.push(`${request.videoSeconds}s video ($${c.toFixed(4)})`);
    }
    if (request.audioSeconds && request.audioSeconds > 0) {
      const c = (request.audioSeconds / 60) * profile.costPerAudioMinute;
      total += c;
      parts.push(`${request.audioSeconds}s audio ($${c.toFixed(4)})`);
    }
    if (request.tokenCount && request.tokenCount > 0) {
      const c = (request.tokenCount / 1000) * profile.costPer1kTokens;
      total += c;
      parts.push(`${request.tokenCount} tokens ($${c.toFixed(4)})`);
    }
    if (total === 0) total = 0.02;

    return {
      provider,
      capability: request.capability,
      estimatedCostUsd: Number(total.toFixed(4)),
      currency: 'USD',
      breakdown: parts.join(' + ') || 'Base workload unit',
    };
  }

  async estimateDuration(
    provider: string,
    request: DurationEstimateRequest,
  ): Promise<DurationEstimateResponse> {
    try {
      const res = await fetch(`/api/v1/ai-providers/${provider.toLowerCase()}/estimate-duration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    const baseSec = request.videoLengthSeconds ? request.videoLengthSeconds * 2.2 : (request.itemsCount || 1) * 3.5;
    const ms = Math.round(baseSec * 1000);
    return {
      provider,
      capability: request.capability,
      estimatedDurationMs: ms,
      formattedDuration: baseSec >= 60 ? `${(baseSec / 60).toFixed(1)}m` : `${baseSec.toFixed(1)}s`,
      confidenceScore: 0.94,
    };
  }
}

export const aiProviderService = new AiProviderService();
