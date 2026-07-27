import { apiClient, getApiError, responseData } from '@/api/httpClient';
import type {
  AiProviderProfile,
  CostEstimateRequest,
  CostEstimateResponse,
  DurationEstimateRequest,
  DurationEstimateResponse,
  HealthCheckResult,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  errorCode?: string | null;
}

async function apiData<T>(request: ReturnType<typeof apiClient.get<ApiResponse<T>>>): Promise<T> {
  const response = await responseData(request);
  if (!response.success || response.data === undefined || response.data === null) {
    throw getApiError(new Error(response.message || 'Backend returned an invalid response.'));
  }
  return response.data;
}

class AiProviderService {
  getProviders(): Promise<AiProviderProfile[]> {
    return apiData(apiClient.get<ApiResponse<AiProviderProfile[]>>('/api/v1/ai-providers'));
  }

  updateProvider(
    provider: string,
    changes: Partial<AiProviderProfile['configuration']> & {
      apiKey?: string;
      secretSource?: string;
      secretKeyName?: string;
      isDefault?: boolean;
      fallbackProvider?: string;
    },
  ): Promise<AiProviderProfile> {
    return apiData(
      apiClient.put<ApiResponse<AiProviderProfile>>(
        `/api/v1/ai-providers/${provider.toLowerCase()}`,
        changes,
      ),
    );
  }

  toggleProvider(provider: string, enable: boolean): Promise<AiProviderProfile> {
    const action = enable ? 'enable' : 'disable';
    return apiData(
      apiClient.post<ApiResponse<AiProviderProfile>>(
        `/api/v1/ai-providers/${provider.toLowerCase()}/${action}`,
      ),
    );
  }

  runHealthCheck(provider: string): Promise<HealthCheckResult> {
    return apiData(
      apiClient.post<ApiResponse<HealthCheckResult>>(
        `/api/v1/ai-providers/${provider.toLowerCase()}/health-check`,
      ),
    );
  }

  estimateCost(
    provider: string,
    request: CostEstimateRequest,
  ): Promise<CostEstimateResponse> {
    return apiData(
      apiClient.post<ApiResponse<CostEstimateResponse>>(
        `/api/v1/ai-providers/${provider.toLowerCase()}/estimate-cost`,
        request,
      ),
    );
  }

  estimateDuration(
    provider: string,
    request: DurationEstimateRequest,
  ): Promise<DurationEstimateResponse> {
    return apiData(
      apiClient.post<ApiResponse<DurationEstimateResponse>>(
        `/api/v1/ai-providers/${provider.toLowerCase()}/estimate-duration`,
        request,
      ),
    );
  }
}

export const aiProviderService = new AiProviderService();
