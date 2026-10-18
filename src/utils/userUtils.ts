import type { User, UserRole } from '../types/domain';

/** Roles that may offer support to litigants and appear in the legal directory. */
export const PROFESSIONAL_ROLES: readonly UserRole[] = ['Solicitor', 'Barrister', 'McKenzieFriend'];

export function isProfessionalRole(role: string | null | undefined): boolean {
  return (PROFESSIONAL_ROLES as readonly string[]).includes(role ?? '');
}

/** Case-insensitive email comparison. */
export function sameEmail(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function findUserByEmail(users: User[], email: string): User | undefined {
  return users.find((u) => sameEmail(u.email, email));
}

/** Minimal fields read from a Neon Auth user. */
export interface NeonIdentity {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

/** A new app user (role LIP) for a Neon Auth account that has no local profile yet. */
export function appUserFromNeon(nUser: NeonIdentity, fallbackName: string): User {
  return {
    id: nUser.id,
    name: nUser.name || fallbackName,
    email: nUser.email,
    role: 'LIP',
    isVerified: Boolean(nUser.emailVerified),
  };
}

/** Strapi username: lower-case, spaces as underscores, plus a random 4-character suffix. */
export function toStrapiUsername(base: string): string {
  return base.trim().replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 6);
}
