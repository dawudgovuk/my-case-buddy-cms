/**
 * Neon Cloud Backend Configuration
 * Centralizes environment variables for Neon Lakebase Postgres, Neon Auth, and Neon Functions.
 */

export interface NeonConfig {
  databaseUrl: string;
  authBaseUrl: string;
  authJwksUrl: string;
  helloFunctionUrl: string;
  branch: string;
}

export function getNeonConfig(): NeonConfig {
  const env = import.meta.env;

  return {
    databaseUrl:
      env.VITE_NEON_DATABASE_URL ||
      'postgresql://neondb_owner:npg_KER8cVz0nNsw@ep-dawn-boat-b58fw9yw-pooler.c-7.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    authBaseUrl:
      env.VITE_NEON_AUTH_URL ||
      env.VITE_NEON_AUTH_BASE_URL ||
      'https://ep-dawn-boat-b58fw9yw.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth',
    authJwksUrl:
      env.VITE_NEON_AUTH_JWKS_URL ||
      'https://ep-dawn-boat-b58fw9yw.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json',
    helloFunctionUrl:
      env.VITE_NEON_FUNCTION_HELLO_URL ||
      'https://br-spring-frog-b5n3et3v-hello.compute.c-7.us-east-2.aws.neon.tech',
    branch: env.VITE_NEON_BRANCH || 'production',
  };
}
