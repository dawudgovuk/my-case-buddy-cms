import type { CaseInvite } from '../../types/domain';
import { strapiGet, strapiPost } from './strapiClient';
import { fetchStrapiCaseById } from './casesApiService';

interface StrapiInviteRaw {
  id: number;
  documentId?: string;
  token?: string;
  role?: 'McKenzieFriend' | 'Solicitor' | 'Barrister';
  expiresAt?: string;
  usedAt?: string;
  createdAt?: string;
  case?: { id?: number; documentId?: string; caseNumber?: string };
  createdBy?: { id?: number; documentId?: string };
  usedBy?: { id?: number; documentId?: string };
  attributes?: Record<string, unknown>;
}

interface StrapiListResponse<T> {
  data: T[];
}

interface StrapiSingleResponse<T> {
  data: T;
}

function unwrap<T extends { attributes?: Record<string, unknown> }>(item: T): Record<string, unknown> {
  if (item.attributes && typeof item.attributes === 'object') {
    return { ...item.attributes, id: (item as { id?: unknown }).id };
  }
  return item as unknown as Record<string, unknown>;
}

export function toDomainInvite(raw: StrapiInviteRaw, fallbackCaseId?: string): CaseInvite {
  const data = unwrap(raw);
  const caseRel = data.case as { caseNumber?: string; id?: number; documentId?: string } | undefined;
  const createdByRel = data.createdBy as { id?: number; documentId?: string } | undefined;
  const usedByRel = data.usedBy as { id?: number; documentId?: string } | undefined;

  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    caseId: caseRel?.caseNumber || (caseRel?.documentId ? String(caseRel.documentId) : fallbackCaseId || ''),
    token: String(data.token || ''),
    role: (data.role as CaseInvite['role']) || 'McKenzieFriend',
    createdBy: createdByRel?.id ? String(createdByRel.id) : '',
    createdAt: String(data.createdAt || new Date().toISOString()),
    expiresAt: data.expiresAt ? String(data.expiresAt) : undefined,
    usedAt: data.usedAt ? String(data.usedAt) : undefined,
    usedBy: usedByRel?.id ? String(usedByRel.id) : undefined,
  };
}

/**
 * Creates an invitation token in Strapi for a case
 */
export async function createStrapiInvite(
  caseIdOrNumber: string,
  role: 'McKenzieFriend' | 'Solicitor' | 'Barrister',
  createdById?: string
): Promise<CaseInvite> {
  // Locate case to get documentId
  const existingCase = await fetchStrapiCaseById(caseIdOrNumber);
  const targetCaseDocId = existingCase?.id || caseIdOrNumber;

  const payload = {
    data: {
      case: targetCaseDocId,
      role,
      createdBy: createdById || undefined,
    },
  };

  const response = await strapiPost<StrapiSingleResponse<StrapiInviteRaw>>('/api/case-invites', payload);
  return toDomainInvite(response.data, caseIdOrNumber);
}

/**
 * Fetches an invite by its unique token
 */
export async function fetchStrapiInviteByToken(token: string): Promise<CaseInvite | null> {
  const query = {
    'filters[token][$eq]': token,
    'populate[case]': 'true',
    'populate[createdBy]': 'true',
  };

  const response = await strapiGet<StrapiListResponse<StrapiInviteRaw>>('/api/case-invites', query);
  if (!response?.data || response.data.length === 0) {
    return null;
  }
  return toDomainInvite(response.data[0]);
}

/**
 * Accepts an invitation token via Strapi endpoint /api/case-invites/accept
 */
export async function acceptStrapiInvite(token: string): Promise<{ success: boolean; role?: string }> {
  const response = await strapiPost<{ success: boolean; role?: string }>('/api/case-invites/accept', {
    token,
  });
  return response;
}
