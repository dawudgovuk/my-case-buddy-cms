import type { User, UserRole } from '../../types/domain';
import { strapiGet } from './strapiClient';

interface StrapiUserRaw {
  id: number | string;
  username?: string;
  email?: string;
  userRole?: string;
  firm?: string;
  registrationNumber?: string;
  bio?: string;
  specialisms?: string[];
  yearsExperience?: number;
  confirmed?: boolean;
}

/**
 * Fetches registered legal professionals (Solicitor, Barrister, McKenzie Friend) from Strapi API
 */
export async function fetchStrapiProfessionals(): Promise<User[]> {
  try {
    const rawUsers = await strapiGet<StrapiUserRaw[]>('/api/users');
    if (!Array.isArray(rawUsers)) {
      return [];
    }

    return rawUsers
      .filter((u) => u.userRole === 'Solicitor' || u.userRole === 'Barrister' || u.userRole === 'McKenzieFriend')
      .map((u) => ({
        id: String(u.id),
        name: u.username || u.email || 'Legal Professional',
        email: u.email || '',
        role: (u.userRole as UserRole) || 'McKenzieFriend',
        firm: u.firm,
        registrationNumber: u.registrationNumber,
        isVerified: u.confirmed ?? true,
        bio: u.bio,
        specialisms: u.specialisms,
        yearsExperience: u.yearsExperience,
      }));
  } catch {
    return [];
  }
}
