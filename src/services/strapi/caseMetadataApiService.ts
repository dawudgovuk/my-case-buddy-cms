import { strapiGet } from './strapiClient';
import { unwrapEntry as unwrap, type StrapiListResponse } from './strapiTypes';

export interface CourtJurisdictionDomain {
  id: string;
  documentId?: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface CaseStageDomain {
  id: string;
  documentId?: string;
  key: string;
  name: string;
  description: string;
  order: number;
  caseTypeCode?: string;
  isActive: boolean;
}

export interface CaseTypeDomain {
  id: string;
  documentId?: string;
  name: string;
  code: string;
  description?: string;
  order: number;
  isActive: boolean;
  stages: CaseStageDomain[];
}

interface StrapiCourtRaw {
  id: number;
  documentId?: string;
  name?: string;
  code?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
}

interface StrapiStageRaw {
  id: number;
  documentId?: string;
  key?: string;
  name?: string;
  description?: string;
  order?: number;
  caseTypeCode?: string;
  isActive?: boolean;
  caseType?: { id?: number; code?: string; name?: string };
  attributes?: Record<string, unknown>;
}

interface StrapiCaseTypeRaw {
  id: number;
  documentId?: string;
  name?: string;
  code?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  stages?: StrapiStageRaw[];
  attributes?: Record<string, unknown>;
}

export async function fetchStrapiCourtJurisdictions(): Promise<CourtJurisdictionDomain[]> {
  try {
    const query = {
      'sort': 'order:asc',
      'filters[isActive][$eq]': 'true',
      'pagination[pageSize]': '100',
    };
    const response = await strapiGet<StrapiListResponse<StrapiCourtRaw>>('/api/court-jurisdictions', query);
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((raw) => {
      const data = unwrap(raw);
      return {
        id: String(data.documentId || data.id || raw.id || ''),
        documentId: raw.documentId || (data.documentId as string | undefined),
        name: String(data.name || ''),
        code: String(data.code || ''),
        description: data.description ? String(data.description) : undefined,
        order: typeof data.order === 'number' ? data.order : 1,
        isActive: data.isActive !== false,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch Strapi court jurisdictions, using defaults:', err);
    return [];
  }
}

export async function fetchStrapiCaseStages(): Promise<CaseStageDomain[]> {
  try {
    const query = {
      'sort': 'order:asc',
      'filters[isActive][$eq]': 'true',
      'pagination[pageSize]': '100',
    };
    const response = await strapiGet<StrapiListResponse<StrapiStageRaw>>('/api/case-stages', query);
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((raw) => {
      const data = unwrap(raw);
      return {
        id: String(data.documentId || data.id || raw.id || ''),
        documentId: raw.documentId || (data.documentId as string | undefined),
        key: String(data.key || ''),
        name: String(data.name || ''),
        description: String(data.description || ''),
        order: typeof data.order === 'number' ? data.order : 1,
        caseTypeCode: data.caseTypeCode ? String(data.caseTypeCode) : undefined,
        isActive: data.isActive !== false,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch Strapi case stages, using defaults:', err);
    return [];
  }
}

export async function fetchStrapiCaseTypes(): Promise<CaseTypeDomain[]> {
  try {
    const query = {
      'populate': '*',
      'sort': 'order:asc',
      'filters[isActive][$eq]': 'true',
      'pagination[pageSize]': '100',
    };
    const response = await strapiGet<StrapiListResponse<StrapiCaseTypeRaw>>('/api/case-types', query);
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((raw) => {
      const data = unwrap(raw);
      const rawStages = Array.isArray(data.stages) ? data.stages : [];
      const stages: CaseStageDomain[] = rawStages
        .map((s) => {
          const sData = unwrap(s);
          return {
            id: String(sData.documentId || sData.id || s.id || ''),
            documentId: s.documentId || (sData.documentId as string | undefined),
            key: String(sData.key || ''),
            name: String(sData.name || ''),
            description: String(sData.description || ''),
            order: typeof sData.order === 'number' ? sData.order : 1,
            caseTypeCode: String(data.code || ''),
            isActive: sData.isActive !== false,
          };
        })
        .sort((a, b) => a.order - b.order);

      return {
        id: String(data.documentId || data.id || raw.id || ''),
        documentId: raw.documentId || (data.documentId as string | undefined),
        name: String(data.name || ''),
        code: String(data.code || ''),
        description: data.description ? String(data.description) : undefined,
        order: typeof data.order === 'number' ? data.order : 1,
        isActive: data.isActive !== false,
        stages,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch Strapi case types, using defaults:', err);
    return [];
  }
}

export interface CasePresetDomain {
  id: string;
  documentId?: string;
  presetKey: string;
  label: string;
  titleTemplate: string;
  caseType: string;
  court: string;
  icon: string;
  description: string;
  order: number;
  isActive: boolean;
}

interface StrapiCasePresetRaw {
  id: number;
  documentId?: string;
  presetKey?: string;
  label?: string;
  titleTemplate?: string;
  caseType?: string;
  court?: string;
  icon?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
}

export async function fetchStrapiCasePresets(): Promise<CasePresetDomain[]> {
  try {
    const query = {
      'sort': 'order:asc',
      'filters[isActive][$eq]': 'true',
      'pagination[pageSize]': '100',
    };
    const response = await strapiGet<StrapiListResponse<StrapiCasePresetRaw>>('/api/case-presets', query);
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((raw) => {
      const data = unwrap(raw);
      return {
        id: String(data.documentId || data.id || raw.id || ''),
        documentId: raw.documentId || (data.documentId as string | undefined),
        presetKey: String(data.presetKey || ''),
        label: String(data.label || ''),
        titleTemplate: String(data.titleTemplate || ''),
        caseType: String(data.caseType || ''),
        court: String(data.court || 'Family Court'),
        icon: String(data.icon || 'child'),
        description: String(data.description || ''),
        order: typeof data.order === 'number' ? data.order : 1,
        isActive: data.isActive !== false,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch Strapi case presets, using defaults:', err);
    return [];
  }
}
