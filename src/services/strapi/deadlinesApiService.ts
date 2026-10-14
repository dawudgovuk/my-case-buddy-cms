import type { DocumentDeadline } from '../../types/domain';
import { strapiGet, strapiPost, strapiPut } from './strapiClient';
import { toDomainDeadline, type StrapiDeadlineRaw } from './strapiAdapters';
import { fetchStrapiCaseById } from './casesApiService';

interface StrapiListResponse<T> {
  data: T[];
}

interface StrapiSingleResponse<T> {
  data: T;
}

/**
 * Fetches filing deadlines from Strapi with optional filters
 */
export async function fetchStrapiDeadlines(filters?: {
  caseId?: string;
  assignedTo?: string;
}): Promise<DocumentDeadline[]> {
  const query: Record<string, string> = {
    'populate[case]': '*',
    'populate[assignedTo]': '*',
    'sort': 'deadlineDate:asc',
  };

  if (filters?.caseId) {
    query['filters[case][caseNumber][$eq]'] = filters.caseId;
  }

  if (filters?.assignedTo) {
    query['filters[assignedTo][id][$eq]'] = filters.assignedTo;
  }

  const response = await strapiGet<StrapiListResponse<StrapiDeadlineRaw>>('/api/document-deadlines', query);
  if (!response?.data || !Array.isArray(response.data)) {
    return [];
  }

  return response.data.map((d) => toDomainDeadline(d));
}

/**
 * Creates a new filing deadline in Strapi
 */
export async function createStrapiDeadline(deadline: {
  caseId: string;
  title: string;
  description?: string;
  deadlineDate: string;
  documentType?: string;
  status?: 'pending' | 'submitted' | 'overdue';
  assignedTo?: string;
}): Promise<DocumentDeadline> {
  const existingCase = await fetchStrapiCaseById(deadline.caseId);
  const targetCaseDocId = existingCase?.id || deadline.caseId;

  const payload = {
    data: {
      case: targetCaseDocId,
      title: deadline.title,
      description: deadline.description,
      deadlineDate: deadline.deadlineDate,
      documentType: deadline.documentType,
      status: deadline.status || 'pending',
      assignedTo: deadline.assignedTo || undefined,
    },
  };

  const response = await strapiPost<StrapiSingleResponse<StrapiDeadlineRaw>>('/api/document-deadlines', payload);
  return toDomainDeadline(response.data, deadline.caseId);
}

/**
 * Updates status of a filing deadline in Strapi (e.g. mark submitted or pending)
 */
export async function updateStrapiDeadlineStatus(
  deadlineId: string,
  status: 'pending' | 'submitted' | 'overdue'
): Promise<DocumentDeadline> {
  const payload = {
    data: {
      status,
      submittedAt: status === 'submitted' ? new Date().toISOString() : null,
    },
  };

  const response = await strapiPut<StrapiSingleResponse<StrapiDeadlineRaw>>(
    `/api/document-deadlines/${encodeURIComponent(deadlineId)}`,
    payload
  );
  return toDomainDeadline(response.data);
}
