import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthApi } from '@/api/AuthApi';
import { getApiError } from '@/api/httpClient';
import { installAuthInterceptors, refreshAccessToken } from './authInterceptor';
import { claimValues, decodeJwt, tokenSession } from './tokenSession';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  status: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function responseUser(
  profile: Awaited<ReturnType<typeof AuthApi.profile>>,
  accessToken: string,
): AuthUser {
  if (!profile.success || !profile.data)
    throw new Error(profile.message ?? 'Unable to load profile.');
  const claims = decodeJwt(accessToken);
  const roles = profile.data.roles ?? claimValues(claims?.role);
  const permissions =
    profile.data.permissions ?? claimValues(claims?.permissions ?? claims?.permission);
  return {
    id: profile.data.id ?? claims?.userId ?? claims?.sub ?? '',
    username: profile.data.username ?? claims?.username ?? '',
    email: profile.data.email ?? '',
    status: profile.data.status ?? '',
    roles,
    permissions,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const expireSession = useCallback(() => setUser(null), []);

  useEffect(() => installAuthInterceptors(expireSession), [expireSession]);

  const loadProfile = useCallback(async (accessToken: string) => {
    const profile = await AuthApi.profile();
    setUser(responseUser(profile, accessToken));
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const accessToken = tokenSession.get() ?? (await refreshAccessToken());
        if (active) await loadProfile(accessToken);
      } catch {
        tokenSession.clear();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void bootstrap();
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      try {
        const response = await AuthApi.login({ username, password, deviceId: 'aivideostudio-web' });
        const accessToken = response.data?.accessToken;
        if (!response.success || !accessToken) throw new Error(response.message ?? 'Login failed.');
        tokenSession.set(accessToken);
        await loadProfile(accessToken);
      } catch (loginError: unknown) {
        setError(getApiError(loginError).message);
        throw loginError;
      }
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } finally {
      tokenSession.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      hasRole: (role) => user?.roles.includes(role) ?? false,
      hasPermission: (permission) => user?.permissions.includes(permission) ?? false,
    }),
    [error, isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
