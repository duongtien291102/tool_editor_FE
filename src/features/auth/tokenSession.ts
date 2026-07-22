const ACCESS_TOKEN_KEY = 'aivideostudio.accessToken';

export interface JwtClaims {
  sub?: string;
  userId?: string;
  username?: string;
  role?: string | string[];
  permission?: string | string[];
  permissions?: string | string[];
  exp?: number;
}

function getSessionStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.sessionStorage;
}

export const tokenSession = {
  get: (): string | null => getSessionStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null,
  set: (token: string): void => getSessionStorage()?.setItem(ACCESS_TOKEN_KEY, token),
  clear: (): void => getSessionStorage()?.removeItem(ACCESS_TOKEN_KEY),
};

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      window
        .atob(normalized)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(decoded) as JwtClaims;
  } catch {
    return null;
  }
}

export function claimValues(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
