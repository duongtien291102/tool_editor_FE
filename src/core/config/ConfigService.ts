/**
 * ConfigService is the only place in the application permitted to read `import.meta.env`.
 * Business logic must use this service to access configuration values.
 */
class ConfigService {
  public isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  public isProduction(): boolean {
    return import.meta.env.PROD;
  }

  public isTest(): boolean {
    return import.meta.env.MODE === 'test';
  }

  public getEnvironment(): string {
    return import.meta.env.MODE;
  }

  public getApiBaseUrl(): string {
    const configuredUrl: unknown =
      import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
    return typeof configuredUrl === 'string' && configuredUrl.length > 0
      ? configuredUrl.replace(/\/$/, '')
      : 'http://localhost:8080';
  }
}

export const configService = new ConfigService();
