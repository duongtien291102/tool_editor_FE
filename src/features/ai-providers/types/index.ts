export type SecretSourceType =
  | 'InMemory'
  | 'EnvironmentVariable'
  | 'AzureKeyVault'
  | 'AwsSecretsManager'
  | 'EncryptedDatabase';

export interface SecretBinding {
  sourceType: SecretSourceType;
  keyName: string;
  maskedValue: string;
  isBound: boolean;
  vaultUri?: string;
  region?: string;
}

export interface ProviderConfig {
  endpoint: string;
  model: string;
  temperature: number;
  timeout: number;
  maxRetry: number;
  priority: number;
  enabled: boolean;
}

export interface CostProfile {
  costPerImage: number;
  costPerVideoMinute: number;
  costPerAudioMinute: number;
  costPer1kTokens: number;
}

export interface RateLimitProfile {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: string;
  initialDelayMs: number;
}

export interface AiProviderProfile {
  provider: string;
  status: 'Available' | 'Unavailable' | 'Disabled';
  enabled: boolean;
  priority: number;
  supportedCapabilities: string[];
  healthStatus:
    | 'Unknown'
    | 'Healthy'
    | 'Offline'
    | 'Connection failed'
    | 'Provider unavailable'
    | 'Invalid API Key'
    | 'Unauthorized'
    | 'Forbidden'
    | 'Rate Limited'
    | 'Timeout'
    | 'Not Found'
    | 'Server Error'
    | 'Disabled';
  lastHealthCheck?: string | null;
  secretBinding: SecretBinding;
  isDefault: boolean;
  configuration: ProviderConfig;
  costProfile: CostProfile;
  rateLimitProfile: RateLimitProfile;
  timeoutSeconds: number;
  retryPolicy: RetryPolicy;
  fallbackProvider?: string;
  latencyMs?: number;
  healthDetails?: string | null;
  lastHttpStatusCode?: number | null;
  lastErrorCode?: string | null;
}

export interface HealthCheckResult {
  provider: string;
  status: string;
  isHealthy: boolean;
  latencyMs: number;
  checkedAt: string;
  details: string;
  httpStatusCode?: number | null;
  errorCode?: string | null;
}

export interface CostEstimateRequest {
  capability: string;
  imageCount?: number;
  videoSeconds?: number;
  audioSeconds?: number;
  tokenCount?: number;
}

export interface CostEstimateResponse {
  provider: string;
  capability: string;
  estimatedCostUsd: number;
  currency: string;
  breakdown: string;
}

export interface DurationEstimateRequest {
  capability: string;
  itemsCount?: number;
  videoLengthSeconds?: number;
}

export interface DurationEstimateResponse {
  provider: string;
  capability: string;
  estimatedDurationMs: number;
  formattedDuration: string;
  confidenceScore: number;
}
