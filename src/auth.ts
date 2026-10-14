import { createAuthClient } from '@neondatabase/neon-js/auth';

/**
 * Neon Managed Better Auth Client (API methods)
 *
 * Implements programmatic authentication methods:
 * - authClient.signIn.email({ email, password })
 * - authClient.signUp.email({ name, email, password })
 * - authClient.getSession()
 * - authClient.signOut()
 * - authClient.token()
 *
 * Reference: https://neon.com/docs/auth/quick-start/react
 */
export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL ||
  import.meta.env.VITE_NEON_AUTH_BASE_URL ||
  'https://ep-dawn-boat-b58fw9yw.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth'
);

export type NeonAuthClient = typeof authClient;
