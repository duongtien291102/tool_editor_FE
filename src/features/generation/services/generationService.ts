import axios from 'axios';
import { apiClient, getApiError, responseData } from '@/api/httpClient';
import { configService } from '@/core/config/ConfigService';
import { createLogger } from '@/core/logger';
import type { GenerationSession, GenerationStepArtifact } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

const logger = createLogger('GenerationService');

async function apiData<T>(
  request: ReturnType<typeof apiClient.get<ApiResponse<T>>>,
): Promise<T> {
  const envelope = await responseData(request);
  if (!envelope?.success || envelope.data === undefined) {
    throw new Error(envelope?.message || envelope?.errors?.join(', ') || 'Generation API request failed');
  }
  return envelope.data;
}

function normalizeSession(session: GenerationSession): GenerationSession {
  const baseUrl = configService.getApiBaseUrl().replace(/\/$/, '');
  const absolute = (url?: string) =>
    url?.startsWith('/') && baseUrl ? `${baseUrl}${url}` : url;
  return {
    ...session,
    finalVideoUrl: absolute(session.finalVideoUrl),
    artifacts: session.artifacts.map(artifact => ({
      ...artifact,
      contentUrl: absolute(artifact.contentUrl) ?? artifact.contentUrl,
    })),
  };
}

class GenerationService {
  private readonly startRequests = new Map<string, Promise<GenerationSession>>();

  async createSession(
    prompt: string,
    workflowType = 'Commercial Promo',
    projectId = 'proj-default',
  ): Promise<GenerationSession> {
    try {
      return normalizeSession(await apiData(apiClient.post<ApiResponse<GenerationSession>>('/api/v1/generation/sessions', {
        prompt,
        workflowType,
        projectId,
      })));
    } catch (error) {
      throw getApiError(error);
    }
  }

  async getSession(id: string): Promise<GenerationSession | null> {
    try {
      return normalizeSession(await apiData(apiClient.get<ApiResponse<GenerationSession>>(`/api/v1/generation/sessions/${id}`)));
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.status === 404) return null;
      throw apiError;
    }
  }

  async listSessions(): Promise<GenerationSession[]> {
    try {
      return (await apiData(apiClient.get<ApiResponse<GenerationSession[]>>('/api/v1/generation/sessions')))
        .map(normalizeSession);
    } catch (error) {
      throw getApiError(error);
    }
  }

  async startGeneration(
    id: string,
    onProgress?: (session: GenerationSession) => void,
  ): Promise<GenerationSession> {
    const existingRequest = this.startRequests.get(id);
    if (existingRequest) {
      logger.warn('Duplicate generation start suppressed', { sessionId: id });
      return existingRequest;
    }

    const url = `/api/v1/generation/sessions/${id}/start`;
    const request = (async () => {
      logger.info('Generation start request', {
        method: 'POST',
        url,
        sessionId: id,
        body: null,
      });

      try {
        const response = await apiClient.post<ApiResponse<GenerationSession>>(
          url,
          undefined,
          { timeout: 0 },
        );
        logger.info('Generation start response', {
          method: 'POST',
          url,
          sessionId: id,
          status: response.status,
          body: response.data,
        });
        const session = normalizeSession(await apiData(Promise.resolve(response)));
        onProgress?.(session);
        return session;
      } catch (error) {
        logger.error('Generation start error response', {
          method: 'POST',
          url,
          sessionId: id,
          status: axios.isAxiosError(error) ? error.response?.status : undefined,
          body: axios.isAxiosError(error) ? error.response?.data : undefined,
          message: error instanceof Error ? error.message : String(error),
        });
        throw getApiError(error);
      }
    })();

    // Retain the settled promise so this browser session can never submit /start
    // twice for the same backend session, including after a terminal failure.
    this.startRequests.set(id, request);
    return request;
  }

  async cancelGeneration(id: string): Promise<GenerationSession> {
    try {
      return normalizeSession(await apiData(
        apiClient.post<ApiResponse<GenerationSession>>(`/api/v1/generation/sessions/${id}/cancel`),
      ));
    } catch (error) {
      throw getApiError(error);
    }
  }

  async downloadArtifact(artifact: GenerationStepArtifact): Promise<void> {
    const response = await apiClient.get(
      `/api/v1/generation/sessions/${artifact.sessionId}/artifacts/${artifact.id}/download`,
      { responseType: 'blob' },
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const generationService = new GenerationService();
