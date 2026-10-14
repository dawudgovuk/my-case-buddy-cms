import { neon } from '@neondatabase/serverless';
import { getNeonConfig } from './neonConfig';

export interface DatabaseHealthResult {
  connected: boolean;
  timestamp?: string;
  version?: string;
  error?: string;
}

/**
 * Executes a healthcheck probe on Lakebase Postgres via Neon HTTP Serverless driver
 */
export async function pingNeonDatabase(): Promise<DatabaseHealthResult> {
  try {
    const { databaseUrl } = getNeonConfig();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT NOW() as now, version() as version;`;

    if (rows && rows.length > 0) {
      return {
        connected: true,
        timestamp: String(rows[0].now),
        version: String(rows[0].version),
      };
    }
    return { connected: false, error: 'No data returned from query' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}

/**
 * Execute parameterized query on Neon PostgreSQL
 */
export async function executeNeonQuery<T = Record<string, unknown>>(
  queryString: string,
  params: unknown[] = []
): Promise<T[]> {
  const { databaseUrl } = getNeonConfig();
  const sql = neon(databaseUrl);
  // @ts-expect-error - dynamic query execution with neon template/function
  const result = await sql(queryString, params);
  return result as T[];
}
