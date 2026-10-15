import type { FamilyCase } from '../../types/domain';
import { strapiGet, strapiPost, strapiPut, strapiDelete } from './strapiClient';
import {
  toDomainCase,
  toStrapiCasePayload,
  type StrapiCaseRaw,
} from './strapiAdapters';

interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
}

const COMMON_POPULATE_PARAMS = {
  'populate[parties]': 'true',
  'populate[hearings]': 'true',
  'populate[orders]': 'true',
  'populate[documents]': 'true',
  'populate[notes]': 'true',
  'populate[members]': 'true',
  'populate[deadlines]': 'true',
  'populate[owner]': 'true',
};

/**
 * Fetches all cases from Strapi with nested relations populated.
 */
export async function fetchStrapiCases(): Promise<FamilyCase[]> {
  const query = {
    ...COMMON_POPULATE_PARAMS,
    'sort': 'updatedAt:desc',
    'pagination[pageSize]': '100',
  };

  const response = await strapiGet<StrapiListResponse<StrapiCaseRaw>>('/api/cases', query);
  if (!response?.data || !Array.isArray(response.data)) {
    return [];
  }
  return response.data.map(toDomainCase);
}

/**
 * Fetches a single case by caseNumber or Strapi documentId.
 */
export async function fetchStrapiCaseById(caseIdOrNumber: string): Promise<FamilyCase | null> {
  // Try querying by caseNumber filter first
  const query = {
    'filters[caseNumber][$eq]': caseIdOrNumber,
    ...COMMON_POPULATE_PARAMS,
  };

  const listResponse = await strapiGet<StrapiListResponse<StrapiCaseRaw>>('/api/cases', query);
  if (listResponse?.data && listResponse.data.length > 0) {
    return toDomainCase(listResponse.data[0]);
  }

  // Fallback to direct ID / documentId fetch
  try {
    const single = await strapiGet<StrapiSingleResponse<StrapiCaseRaw>>(
      `/api/cases/${encodeURIComponent(caseIdOrNumber)}`,
      COMMON_POPULATE_PARAMS
    );
    if (single?.data) {
      return toDomainCase(single.data);
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Creates a new case in Strapi including initial relational children.
 */
export async function createStrapiCase(fc: FamilyCase): Promise<FamilyCase> {
  const payload = toStrapiCasePayload(fc);
  const response = await strapiPost<StrapiSingleResponse<StrapiCaseRaw>>('/api/cases', payload);
  return toDomainCase(response.data);
}

/**
 * Updates an existing case in Strapi including relational children.
 */
export async function updateStrapiCase(fc: FamilyCase): Promise<FamilyCase> {
  // First locate the Strapi record to obtain its internal documentId
  const existing = await fetchStrapiCaseById(fc.id);
  const targetId = existing?.documentId || existing?.id || fc.documentId || fc.id;

  const payload = toStrapiCasePayload(fc);
  const response = await strapiPut<StrapiSingleResponse<StrapiCaseRaw>>(
    `/api/cases/${encodeURIComponent(targetId)}`,
    payload
  );
  return toDomainCase(response.data);
}

/**
 * Deletes a case from Strapi.
 */
export async function deleteStrapiCase(caseIdOrNumber: string): Promise<boolean> {
  // If numeric or alphanumeric, try delete by ID / documentId
  const existing = await fetchStrapiCaseById(caseIdOrNumber);
  const targetId = existing?.documentId || existing?.id || caseIdOrNumber;
  await strapiDelete(`/api/cases/${encodeURIComponent(targetId)}`);
  return true;
}

/**
 * Toggles peer-support status directly on Strapi.
 */
export async function toggleStrapiPeerSupport(
  caseId: string,
  seeking: boolean,
  note?: string
): Promise<FamilyCase | null> {
  const existing = await fetchStrapiCaseById(caseId);
  if (!existing) return null;

  const updatedCase: FamilyCase = {
    ...existing,
    seekingPeerSupport: seeking,
    peerSupportNote: note !== undefined ? note : existing.peerSupportNote,
    peerSupportRequestedAt: seeking
      ? (existing.peerSupportRequestedAt || new Date().toISOString())
      : undefined,
    lastUpdatedAt: new Date().toISOString(),
  };

  return updateStrapiCase(updatedCase);
}

/**
 * Sends a targeted peer support request to a legal professional for a case via Strapi.
 */
export async function requestStrapiPeerSupport(
  caseId: string,
  targetUserId: string,
  note?: string
): Promise<{ success: boolean; case: FamilyCase }> {
  const existing = await fetchStrapiCaseById(caseId);
  const targetId = existing?.documentId || existing?.id || caseId;

  try {
    const response = await strapiPost<{ success: boolean; data: StrapiCaseRaw }>(
      `/api/cases/${encodeURIComponent(targetId)}/request-peer-support`,
      {
        targetUserId,
        note,
      }
    );

    if (response?.data) {
      return {
        success: true,
        case: toDomainCase(response.data),
      };
    }
  } catch {
    // Graceful fallback to toggleStrapiPeerSupport
  }

  const updatedCase = await toggleStrapiPeerSupport(caseId, true, note);
  return {
    success: true,
    case: updatedCase || existing || {
      id: caseId,
      title: 'Updated Case',
      court: 'Family Court',
      caseType: 'Private Law (Child Arrangements)',
      status: 'Open',
      startedAt: new Date().toISOString().slice(0, 10),
      parties: [],
      hearings: [],
      orders: [],
      documents: [],
      notes: [],
      lastUpdatedAt: new Date().toISOString(),
      seekingPeerSupport: true,
      peerSupportNote: note,
    },
  };
}
