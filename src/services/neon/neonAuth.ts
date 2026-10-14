import { getNeonConfig } from './neonConfig';
import { authClient } from '../../auth';

export { authClient };

export interface NeonAuthHealthResult {
  reachable: boolean;
  keyCount?: number;
  keys?: unknown[];
  error?: string;
}

/**
 * Pings the Neon Auth (Managed Better Auth) public JWKS endpoint to verify service reachability
 */
export async function pingNeonAuth(): Promise<NeonAuthHealthResult> {
  const { authJwksUrl } = getNeonConfig();

  try {
    const response = await fetch(authJwksUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        reachable: false,
        error: `Neon Auth returned HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as { keys?: unknown[] };
    return {
      reachable: true,
      keyCount: Array.isArray(data.keys) ? data.keys.length : 0,
      keys: data.keys,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      reachable: false,
      error: message,
    };
  }
}
