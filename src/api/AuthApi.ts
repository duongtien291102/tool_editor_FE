import { apiClient, responseData } from './httpClient';
import type { ApiSchema } from './types';

export const AuthApi = {
  login: (request: ApiSchema<'LoginRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'AuthResponseApiResponse'>>('/api/v1/auth/login', request),
    ),
  register: (request: ApiSchema<'RegisterRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'AuthResponseApiResponse'>>('/api/v1/auth/register', request),
    ),
  refresh: (request: ApiSchema<'RefreshTokenRequest'> = {}) =>
    responseData(
      apiClient.post<ApiSchema<'AuthResponseApiResponse'>>('/api/v1/auth/refresh', request),
    ),
  logout: () =>
    responseData(apiClient.post<ApiSchema<'BooleanApiResponse'>>('/api/v1/auth/logout')),
  profile: () =>
    responseData(apiClient.get<ApiSchema<'UserResponseApiResponse'>>('/api/v1/users/me')),
  updateProfile: (request: ApiSchema<'UpdateProfileRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'BooleanApiResponse'>>('/api/v1/users/me/profile', request),
    ),
  changePassword: (request: ApiSchema<'ChangePasswordRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'BooleanApiResponse'>>('/api/v1/users/me/password', request),
    ),
  verifyEmail: (request: ApiSchema<'VerifyEmailRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'BooleanApiResponse'>>('/api/v1/auth/verify-email', request),
    ),
  forgotPassword: (request: ApiSchema<'ForgotPasswordRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'BooleanApiResponse'>>('/api/v1/auth/forgot-password', request),
    ),
  resetPassword: (request: ApiSchema<'ResetPasswordRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'BooleanApiResponse'>>('/api/v1/auth/reset-password', request),
    ),
};
