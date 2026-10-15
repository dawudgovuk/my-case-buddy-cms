import type { User, UserRole } from '../../types/domain';
import { strapiGet } from './strapiClient';

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

interface StrapiListResponse<T> {
  data: T[];
}

/**
 * Fetches registered legal professionals (Solicitor, Barrister, McKenzie Friend) from Strapi API
 */
export async function fetchStrapiProfessionals(): Promise<User[]> {
  // 1. Try dedicated /api/professionals endpoint
  try {
    const customRes = await strapiGet<StrapiListResponse<StrapiUserRaw> | StrapiUserRaw[]>('/api/professionals');
    const items = Array.isArray(customRes)
      ? customRes
      : Array.isArray((customRes as StrapiListResponse<StrapiUserRaw>)?.data)
      ? (customRes as StrapiListResponse<StrapiUserRaw>).data
      : [];

    if (items.length > 0) {
      return items.map((u) => {
        const rawRole = (typeof u.role === 'string' ? u.role : (u.role as { name?: string })?.name || u.userRole) || 'McKenzieFriend';
        return {
          id: String(u.id),
          name: u.name || u.username || u.email || 'Legal Professional',
          email: u.email || '',
          role: rawRole as UserRole,
          firm: u.firm,
          registrationNumber: u.registrationNumber,
          isVerified: u.isVerified ?? u.confirmed ?? true,
          bio: u.bio,
          specialisms: Array.isArray(u.specialisms) ? u.specialisms : undefined,
          yearsExperience: u.yearsExperience,
        };
      });
    }
  } catch {
    // Continue to standard /api/users endpoint
  }

  // 2. Fallback to /api/users endpoint
  try {
    const rawUsers = await strapiGet<StrapiUserRaw[]>('/api/users');
    if (!Array.isArray(rawUsers)) {
      return [];
    }

    return rawUsers
      .filter((u) => {
        const r = typeof u.role === 'string' ? u.role : (u.role as { name?: string })?.name || u.userRole;
        return r === 'Solicitor' || r === 'Barrister' || r === 'McKenzieFriend';
      })
      .map((u) => {
        const rawRole = (typeof u.role === 'string' ? u.role : (u.role as { name?: string })?.name || u.userRole) || 'McKenzieFriend';
        return {
          id: String(u.id),
          name: u.name || u.username || u.email || 'Legal Professional',
          email: u.email || '',
          role: rawRole as UserRole,
          firm: u.firm,
          registrationNumber: u.registrationNumber,
          isVerified: u.isVerified ?? u.confirmed ?? true,
          bio: u.bio,
          specialisms: Array.isArray(u.specialisms) ? u.specialisms : undefined,
          yearsExperience: u.yearsExperience,
        };
      });
  } catch {
    return [];
  }
}
