const STRAPI_TOKEN_STORAGE_KEY = 'mycasebuddy_strapi_jwt';
const STRAPI_ENABLED_STORAGE_KEY = 'mycasebuddy_use_strapi';

/**
 * Returns the configured Strapi Base URL from environment variables or defaults to localhost:1337.
 */
export function getStrapiApiUrl(): string {
  const envUrl = import.meta.env.VITE_STRAPI_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:1337';
}

/**
 * Checks whether live Strapi integration is currently enabled.
 * Can be controlled via environment variable VITE_USE_STRAPI or user toggle in localStorage.
 */
export function isStrapiEnabled(): boolean {
  const localPref = localStorage.getItem(STRAPI_ENABLED_STORAGE_KEY);
  if (localPref !== null) {
    return localPref === 'true';
  }
  return import.meta.env.VITE_USE_STRAPI !== 'false';
}

/**
 * Set the user's preference for using Strapi or LocalStorage.
 */
export function setStrapiEnabled(enabled: boolean): void {
  localStorage.setItem(STRAPI_ENABLED_STORAGE_KEY, String(enabled));
}

/**
 * Stores or clears the Strapi JWT token.
 */
export function setStrapiToken(token: string | null): void {
  if (token) {
    localStorage.setItem(STRAPI_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STRAPI_TOKEN_STORAGE_KEY);
  }
}

/**
 * Retrieves the stored Strapi JWT token.
 */
export function getStrapiToken(): string | null {
  return localStorage.getItem(STRAPI_TOKEN_STORAGE_KEY);
}

export interface StrapiHealthResult {
  ok: boolean;
  message: string;
  statusCode?: number;
}

/**
 * Performs a lightweight health ping against the Strapi server.
 */
export async function checkStrapiHealth(): Promise<StrapiHealthResult> {
  const baseUrl = getStrapiApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${baseUrl}/_health`, {
      method: 'HEAD',
      signal: controller.signal,
    }).catch(async () => {
      // Fallback check on /api/cases if _health is not available
      return fetch(`${baseUrl}/api/cases?pagination[pageSize]=1`, {
        method: 'GET',
        signal: controller.signal,
      });
    });
    clearTimeout(timeoutId);

    if (response.ok || response.status === 401 || response.status === 403) {
      return {
        ok: true,
        message: 'Connected to Strapi server',
        statusCode: response.status,
      };
    }
    return {
      ok: false,
      message: `Strapi returned status ${response.status}`,
      statusCode: response.status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Connection failed';
    return {
      ok: false,
      message: `Cannot reach Strapi at ${baseUrl} (${errorMsg})`,
    };
  }
}
