import type { User, UserRole } from '../../types/domain';
import { strapiGet } from './strapiClient';
import type { StrapiListResponse } from './strapiTypes';
import { isProfessionalRole } from '../../utils/userUtils';

interface StrapiUserRaw {
  id: number | string;
  name?: string;
  username?: string;
  email?: string;
  userRole?: string;
  role?: string | { name?: string };
  firm?: string;
  registrationNumber?: string;
  bio?: string;
  specialisms?: string[];
  yearsExperience?: number;
  confirmed?: boolean;
  isVerified?: boolean;
}

/** The user's role, read from `role` (string or relation) or the custom `userRole` field. */
function rawRoleOf(u: StrapiUserRaw): string | undefined {
  return typeof u.role === 'string' ? u.role : u.role?.name || u.userRole;
}

function toDomainProfessional(u: StrapiUserRaw): User {
  return {
    id: String(u.id),
    name: u.name || u.username || u.email || 'Legal Professional',
    email: u.email || '',
    role: (rawRoleOf(u) || 'McKenzieFriend') as UserRole,
    firm: u.firm,
    registrationNumber: u.registrationNumber,
    isVerified: u.isVerified ?? u.confirmed ?? true,
    bio: u.bio,
    specialisms: Array.isArray(u.specialisms) ? u.specialisms : undefined,
    yearsExperience: u.yearsExperience,
  };
}

function itemsOf(res: StrapiListResponse<StrapiUserRaw> | StrapiUserRaw[]): StrapiUserRaw[] {
  if (Array.isArray(res)) return res;
  return Array.isArray(res?.data) ? res.data : [];
}

/**
 * Fetches registered legal professionals (Solicitor, Barrister, McKenzie Friend):
 * first from the dedicated /api/professionals endpoint, then from /api/users.
 */
export async function fetchStrapiProfessionals(): Promise<User[]> {
  try {
    const items = itemsOf(await strapiGet<StrapiListResponse<StrapiUserRaw> | StrapiUserRaw[]>('/api/professionals'));
    if (items.length > 0) {
      return items.map(toDomainProfessional);
    }
  } catch {
    // Continue to standard /api/users endpoint
  }

  try {
    const rawUsers = await strapiGet<StrapiUserRaw[]>('/api/users');
    if (!Array.isArray(rawUsers)) {
      return [];
    }
    return rawUsers.filter((u) => isProfessionalRole(rawRoleOf(u))).map(toDomainProfessional);
  } catch {
    return [];
  }
}
