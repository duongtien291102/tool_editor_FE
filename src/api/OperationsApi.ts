import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const OperationsApi = {
  health: () => responseData(apiClient.get<unknown>('/api/v1/system/health')),
  live: () => responseData(apiClient.get<unknown>('/api/v1/system/live')),
  ready: () => responseData(apiClient.get<unknown>('/api/v1/system/ready')),
  metrics: () => responseData(apiClient.get<unknown>('/api/v1/system/metrics')),
  notifications: (params?: QueryParams) =>
    responseData(apiClient.get<unknown>('/api/v1/system/notifications', { params })),
  audit: (params?: QueryParams) =>
    responseData(apiClient.get<unknown>('/api/v1/system/audit', { params })),
  configuration: () => responseData(apiClient.get<unknown>('/api/v1/system/configuration')),
  updateConfiguration: (request: ApiSchema<'UpdateConfigurationRequest'>) =>
    responseData(apiClient.put<unknown>('/api/v1/system/configuration', request)),
  maintenance: (request: ApiSchema<'RunMaintenanceRequest'>) =>
    responseData(apiClient.post<unknown>('/api/v1/system/maintenance', request)),
};
