import { getNeonConfig } from './neonConfig';

export interface NeonFunctionResult {
  success: boolean;
  message?: string;
  status?: number;
  durationMs?: number;
  error?: string;
}

/**
 * Invokes the deployed Neon Serverless Function (hello)
 */
export async function invokeHelloFunction(): Promise<NeonFunctionResult> {
  const { helloFunctionUrl } = getNeonConfig();
  const startTime = Date.now();

  try {
    const response = await fetch(helloFunctionUrl, {
      method: 'GET',
    });

    const durationMs = Date.now() - startTime;
    const text = await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        durationMs,
        error: `Function returned HTTP ${response.status}: ${text}`,
      };
    }

    return {
      success: true,
      message: text.trim(),
      status: response.status,
      durationMs,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      durationMs: Date.now() - startTime,
      error: message,
    };
  }
}
