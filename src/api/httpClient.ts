import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { configService } from '@/core/config/ConfigService';

export interface ApiFailureBody {
  success?: false;
  message?: string;
  errors?: string[];
  errorCode?: string;
}

export class ApiRequestError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details: string[];

  constructor(message: string, status?: number, code?: string, details: string[] = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: configService.getApiBaseUrl(),
  timeout: 30_000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

export function getApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error;
  if (!axios.isAxiosError<ApiFailureBody>(error)) {
    return new ApiRequestError(error instanceof Error ? error.message : 'Unexpected API error.');
  }

  const axiosError: AxiosError<ApiFailureBody> = error;
  const body = axiosError.response?.data;
  return new ApiRequestError(
    body?.message ?? axiosError.message,
    axiosError.response?.status,
    body?.errorCode,
    body?.errors ?? [],
  );
}

export async function responseData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    return (await request).data;
  } catch (error: unknown) {
    throw getApiError(error);
  }
}
