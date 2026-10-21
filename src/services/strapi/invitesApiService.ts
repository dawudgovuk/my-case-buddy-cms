import type { CaseInvite } from '../../types/domain';
import { strapiGet, strapiPost, strapiDelete } from './strapiClient';
import { fetchStrapiCaseById } from './casesApiService';
import { unwrapEntry as unwrap, type StrapiListResponse, type StrapiSingleResponse } from './strapiTypes';

interface StrapiInviteRaw {
  id: number;
  documentId?: string;
  token?: string;
  role?: 'McKenzieFriend' | 'Solicitor' | 'Barrister';
  expiresAt?: string;
  usedAt?: string;
  createdAt?: string;
  case?: {
    id?: number;
    documentId?: string;
    caseNumber?: string;
    title?: string;
    court?: string;
    caseType?: string;
    currentStage?: string;
  };
  createdBy?: { id?: number; documentId?: string };
  usedBy?: { id?: number; documentId?: string };
  attributes?: Record<string, unknown>;
}

export function toDomainInvite(raw: StrapiInviteRaw, fallbackCaseId?: string): CaseInvite {
  const data = unwrap(raw);
  const caseRel = data.case as StrapiInviteRaw['case'] | undefined;
  const createdByRel = data.createdBy as { id?: number; documentId?: string } | undefined;
  const usedByRel = data.usedBy as { id?: number; documentId?: string } | undefined;

  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    documentId: raw.documentId || (data.documentId as string | undefined),
    caseId: caseRel?.caseNumber || (caseRel?.documentId ? String(caseRel.documentId) : fallbackCaseId || ''),
    token: String(data.token || ''),
    role: (data.role as CaseInvite['role']) || 'McKenzieFriend',
    createdBy: createdByRel?.id ? String(createdByRel.id) : '',
    createdAt: String(data.createdAt || new Date().toISOString()),
    expiresAt: data.expiresAt ? String(data.expiresAt) : undefined,
    usedAt: data.usedAt ? String(data.usedAt) : undefined,
    usedBy: usedByRel?.id ? String(usedByRel.id) : undefined,
    caseSummary: caseRel
      ? {
          caseNumber: caseRel.caseNumber,
          title: caseRel.title,
          court: caseRel.court,
          caseType: caseRel.caseType,
          currentStage: caseRel.currentStage,
        }
      : undefined,
  };
}

/**
 * Creates an invitation token in Strapi for a case
 */
export async function createStrapiInvite(
  caseIdOrNumber: string,
  role: 'McKenzieFriend' | 'Solicitor' | 'Barrister',
  _createdById?: string,
  token?: string
): Promise<CaseInvite> {
  // Locate case to get documentId
  const existingCase = await fetchStrapiCaseById(caseIdOrNumber);
  const targetCaseDocId = existingCase?.documentId || existingCase?.id || caseIdOrNumber;

  const dataPayload: Record<string, unknown> = {
    case: targetCaseDocId,
    role,
  };

  if (token) {
    dataPayload.token = token;
  }

  const response = await strapiPost<StrapiSingleResponse<StrapiInviteRaw>>('/api/case-invites', {
    data: dataPayload,
  });
  return toDomainInvite(response.data, caseIdOrNumber);
}

/**
 * Fetches all invites for a specific case from Strapi
 */
export async function fetchStrapiInvitesForCase(caseIdOrNumber: string): Promise<CaseInvite[]> {
  try {
    const existingCase = await fetchStrapiCaseById(caseIdOrNumber);
    const targetCaseDocId = existingCase?.documentId || existingCase?.id || caseIdOrNumber;

    const query = {
      'filters[$or][0][case][documentId][$eq]': targetCaseDocId,
      'filters[$or][1][case][caseNumber][$eq]': caseIdOrNumber,
      'populate': '*',
      'sort': 'createdAt:desc',
    };

    const response = await strapiGet<StrapiListResponse<StrapiInviteRaw>>('/api/case-invites', query);
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((raw) => toDomainInvite(raw, caseIdOrNumber));
  } catch (err) {
    console.warn('Failed to fetch Strapi invites for case:', err);
    return [];
  }
}

/**
 * Fetches an invite by its unique token
 */
export async function fetchStrapiInviteByToken(token: string): Promise<CaseInvite | null> {
  const query = {
    'filters[token][$eq]': token,
    'populate': '*',
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

/**
 * Deletes / revokes an invitation from Strapi
 */
export async function deleteStrapiInvite(documentIdOrId: string): Promise<boolean> {
  try {
    await strapiDelete(`/api/case-invites/${encodeURIComponent(documentIdOrId)}`);
    return true;
  } catch (err) {
    console.warn('Failed to delete invite from Strapi:', err);
    return false;
  }
}
