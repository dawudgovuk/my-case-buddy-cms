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
    role?: string | { id?: number; name?: string; type?: string };
    firm?: string;
    registrationNumber?: string;
    confirmed?: boolean;
    bio?: string;
    specialisms?: string[];
    yearsExperience?: number;
    phone?: string;
  };
}

export function normalizeUserRole(roleVal: unknown, userRoleVal?: unknown): UserRole {
  // First check role object or string
  if (roleVal && typeof roleVal === 'object') {
    const r = roleVal as { type?: string; name?: string };
    const raw = (r.type || r.name || '').toLowerCase().replace(/[-_\s]/g, '');
    if (raw === 'lip' || raw === 'litigantinperson') return 'LIP';
    if (raw === 'mckenziefriend' || raw === 'mckenzie') return 'McKenzieFriend';
    if (raw === 'solicitor') return 'Solicitor';
    if (raw === 'barrister') return 'Barrister';
  } else if (typeof roleVal === 'string' && roleVal.trim()) {
    const raw = roleVal.toLowerCase().replace(/[-_\s]/g, '');
    if (raw === 'lip' || raw === 'litigantinperson') return 'LIP';
    if (raw === 'mckenziefriend' || raw === 'mckenzie') return 'McKenzieFriend';
    if (raw === 'solicitor') return 'Solicitor';
    if (raw === 'barrister') return 'Barrister';
  }

  // Fallback to userRole
  if (typeof userRoleVal === 'string' && userRoleVal.trim()) {
    const raw = userRoleVal.toLowerCase().replace(/[-_\s]/g, '');
    if (raw === 'lip' || raw === 'litigantinperson') return 'LIP';
    if (raw === 'mckenziefriend' || raw === 'mckenzie') return 'McKenzieFriend';
    if (raw === 'solicitor') return 'Solicitor';
    if (raw === 'barrister') return 'Barrister';
  }

  return 'LIP';
}

function mapStrapiUserToDomain(u: StrapiAuthResponse['user']): User {
  return {
    id: String(u.id),
    name: u.name || u.username || u.email,
    email: u.email,
    role: normalizeUserRole(u.role, u.userRole),
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
  const result = await strapiPost<StrapiAuthResponse>('/api/auth/local/register', {
    ...data,
    role: data.userRole,
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
 * Retrieves the currently authenticated user profile from Strapi /api/users/me
 */
export async function strapiGetMe(): Promise<User | null> {
  try {
    const raw = await strapiGet<StrapiAuthResponse['user']>('/api/users/me?populate=role');
    if (!raw || !raw.id) return null;
    return mapStrapiUserToDomain(raw);
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user profile from Strapi /api/user-profile (or /api/users/me fallback)
 */
export async function strapiGetProfile(): Promise<User | null> {
  try {
    const res = await strapiGet<{ success: boolean; user: StrapiAuthResponse['user'] }>('/api/user-profile');
    if (res?.user?.id) {
      return mapStrapiUserToDomain(res.user);
    }
  } catch {
    // Fallback to /api/users/me
  }
  return strapiGetMe();
}

/**
 * Updates the user's profile on Strapi via /api/user-profile
 */
export async function updateStrapiUserProfile(data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await strapiPut<{ success: boolean; user: StrapiAuthResponse['user'] }>('/api/user-profile', {
      name: data.name,
      userRole: data.role,
      firm: data.firm,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
      bio: data.bio,
      specialisms: data.specialisms,
      yearsExperience: data.yearsExperience,
    });

    if (res?.user) {
      return { success: true, user: mapStrapiUserToDomain(res.user) };
    }
    return { success: false, error: 'Failed to update profile' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
  }
}

/**
 * Clears Strapi auth token
 */
export function strapiLogout(): void {
  setStrapiToken(null);
}
