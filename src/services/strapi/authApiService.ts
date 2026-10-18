import type { User, UserRole } from '../../types/domain';
import { strapiPost, strapiGet, strapiPut } from './strapiClient';
import { setStrapiToken } from './strapiConfig';

interface StrapiAuthResponse {
  jwt: string;
  user: {
    id: number | string;
    username: string;
    email: string;
    name?: string;
    userRole?: string;
    firm?: string;
    registrationNumber?: string;
    confirmed?: boolean;
    bio?: string;
    specialisms?: string[];
    yearsExperience?: number;
    phone?: string;
  };
}

function mapStrapiUserToDomain(u: StrapiAuthResponse['user']): User {
  return {
    id: String(u.id),
    name: u.name || u.username || u.email,
    email: u.email,
    role: (u.userRole as UserRole) || 'LIP',
    firm: u.firm,
    registrationNumber: u.registrationNumber,
    isVerified: u.confirmed ?? true,
    bio: u.bio,
    specialisms: Array.isArray(u.specialisms) ? u.specialisms : undefined,
    yearsExperience: u.yearsExperience,
    phone: u.phone,
  };
}

/**
 * Authenticates user credentials against Strapi /api/auth/local
 */
export async function strapiLogin(identifier: string, password: string): Promise<{ jwt: string; user: User }> {
  const result = await strapiPost<StrapiAuthResponse>('/api/auth/local', {
    identifier,
    password,
  });

  if (result.jwt) {
    setStrapiToken(result.jwt);
  }

  return {
    jwt: result.jwt,
    user: mapStrapiUserToDomain(result.user),
  };
}

/**
 * Registers a new user account with Strapi /api/auth/local/register
 */
export async function strapiRegister(data: {
  username: string;
  email: string;
  password: string;
  userRole: UserRole;
  firm?: string;
  registrationNumber?: string;
}): Promise<{ jwt: string; user: User }> {
  const result = await strapiPost<StrapiAuthResponse>('/api/auth/local/register', data);

  if (result.jwt) {
    setStrapiToken(result.jwt);
  }

  return {
    jwt: result.jwt,
    user: mapStrapiUserToDomain(result.user),
  };
}

/**
 * Retrieves the currently authenticated user profile from Strapi /api/users/me
 */
export async function strapiGetMe(): Promise<User | null> {
  try {
    const raw = await strapiGet<StrapiAuthResponse['user']>('/api/users/me');
    if (!raw || !raw.id) return null;
    return mapStrapiUserToDomain(raw);
  } catch {
    return null;
  }
}

/**
 * Clears Strapi auth token
 */
export function strapiLogout(): void {
  setStrapiToken(null);
}
