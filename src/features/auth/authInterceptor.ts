import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { configService } from '@/core/config/ConfigService';
import { apiClient } from '@/api/httpClient';
import type { ApiSchema } from '@/api/types';
import { tokenSession } from './tokenSession';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

let refreshRequest: Promise<string> | null = null;

function readAccessToken(response: ApiSchema<'AuthResponseApiResponse'>): string {
  const accessToken = response.data?.accessToken;
  if (!response.success || !accessToken)
    throw new Error(response.message ?? 'Authentication failed.');
  return accessToken;
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshRequest) {
    refreshRequest = axios
      .post<ApiSchema<'AuthResponseApiResponse'>>(
        `${configService.getApiBaseUrl()}/api/v1/auth/refresh`,
        { deviceId: 'aivideostudio-web' },
        { withCredentials: true, headers: { Accept: 'application/json' } },
      )
      .then((response) => {
        const accessToken = readAccessToken(response.data);
        tokenSession.set(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export function installAuthInterceptors(onSessionExpired: () => void): () => void {
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const accessToken = tokenSession.get();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const request = error.config as RetryableRequest | undefined;
      const isAuthEndpoint = request?.url?.includes('/auth/') ?? false;
      if (error.response?.status !== 401 || !request || request._authRetry || isAuthEndpoint) {
        return Promise.reject(error);
      }

      request._authRetry = true;
      try {
        const accessToken = await refreshAccessToken();
        request.headers.Authorization = `Bearer ${accessToken}`;
        return await apiClient.request(request);
      } catch (refreshError: unknown) {
        tokenSession.clear();
        onSessionExpired();
        return Promise.reject(
          refreshError instanceof Error ? refreshError : new Error('Session refresh failed.'),
        );
      }
    },
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptor);
    apiClient.interceptors.response.eject(responseInterceptor);
  };
}
