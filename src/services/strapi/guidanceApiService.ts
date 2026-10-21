import type {
  GuidanceMap,
  GuidanceJourney,
  GuidanceStep,
  GuidanceArticle,
  GuidanceReference,
  ReferenceType,
} from '../../types/guidance';
import { strapiGet } from './strapiClient';
import type { StrapiListResponse } from './strapiTypes';

// Raw Strapi v5 shapes
interface RawReference {
  id: number | string;
  documentId?: string;
  name: string;
  slug: string;
  url: string;
  type: ReferenceType;
  keywords?: string;
}

interface RawArticle {
  id: number | string;
  documentId?: string;
  title: string;
  slug: string;
  content: string;
  keywords?: string;
  category?: string;
  references?: RawReference[];
}

interface RawStep {
  id: number | string;
  documentId?: string;
  name: string;
  slug: string;
  description: string;
  order?: number;
  isConditional?: boolean;
  is_conditional?: boolean;
  conditionCriteria?: string;
  condition_criteria?: string;
  category?: string;
  articles?: RawArticle[];
}

interface RawJourney {
  id: number | string;
  documentId?: string;
  name: string;
  slug: string;
  description: string;
  type?: string;
  order?: number;
  steps?: RawStep[];
}

interface RawMap {
  id: number | string;
  documentId?: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  preconditions?: string;
  postconditions?: string;
  journeys?: RawJourney[];
}

function adaptReference(raw: RawReference): GuidanceReference {
  return {
    id: String(raw.documentId || raw.id),
    name: raw.name,
    slug: raw.slug,
    url: raw.url,
    type: raw.type || 'Form',
    keywords: raw.keywords,
  };
}

function adaptArticle(raw: RawArticle): GuidanceArticle {
  return {
    id: String(raw.documentId || raw.id),
    title: raw.title,
    slug: raw.slug,
    content: raw.content || '',
    keywords: raw.keywords,
    category: raw.category,
    references: Array.isArray(raw.references) ? raw.references.map(adaptReference) : [],
  };
}

function adaptStep(raw: RawStep): GuidanceStep {
  return {
    id: String(raw.documentId || raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description || '',
    order: raw.order ?? 1,
    isConditional: Boolean(raw.isConditional ?? raw.is_conditional ?? false),
    conditionCriteria: raw.conditionCriteria ?? raw.condition_criteria,
    category: raw.category,
    articles: Array.isArray(raw.articles) ? raw.articles.map(adaptArticle) : [],
  };
}

function adaptJourney(raw: RawJourney): GuidanceJourney {
  const steps = Array.isArray(raw.steps) ? raw.steps.map(adaptStep) : [];
  steps.sort((a, b) => a.order - b.order);
  return {
    id: String(raw.documentId || raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description || '',
    type: raw.type,
    order: raw.order ?? 1,
    steps,
  };
}

export function adaptMap(raw: RawMap): GuidanceMap {
  const journeys = Array.isArray(raw.journeys) ? raw.journeys.map(adaptJourney) : [];
  journeys.sort((a, b) => a.order - b.order);
  return {
    id: String(raw.documentId || raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description || '',
    category: raw.category,
    preconditions: raw.preconditions,
    postconditions: raw.postconditions,
    journeys,
  };
}

/**
 * Common populate parameters to retrieve the entire 3-tier guidance tree
 */
const FULL_POPULATE_PARAMS: Record<string, string> = {
  'populate[journeys][populate][steps][populate][articles][populate]': 'references',
  'sort': 'id:asc',
};

/**
 * Fetch all legal maps from Strapi with nested Journeys, Steps, Articles, and References
 */
export async function fetchGuidanceMaps(): Promise<GuidanceMap[]> {
  try {
    const response = await strapiGet<StrapiListResponse<RawMap>>('/api/guidance-maps', FULL_POPULATE_PARAMS);
    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(adaptMap);
    }
  } catch (err) {
    console.warn('Guidance API fetch error, falling back to cached seed data:', err);
  }
  return [];
}

/**
 * Fetch a single legal map by slug
 */
export async function fetchGuidanceMapBySlug(slug: string): Promise<GuidanceMap | null> {
  try {
    const params: Record<string, string> = {
      'filters[slug][$eq]': slug,
      ...FULL_POPULATE_PARAMS,
    };
    const response = await strapiGet<StrapiListResponse<RawMap>>('/api/guidance-maps', params);
    if (response?.data && response.data.length > 0) {
      return adaptMap(response.data[0]);
    }
  } catch (err) {
    console.warn(`Error fetching guidance map by slug ${slug}:`, err);
  }
  return null;
}

/**
 * Fetch a guidance article by slug with references populated
 */
export async function fetchGuidanceArticleBySlug(slug: string): Promise<GuidanceArticle | null> {
  try {
    const params: Record<string, string> = {
      'filters[slug][$eq]': slug,
      'populate[references]': 'true',
    };
    const response = await strapiGet<StrapiListResponse<RawArticle>>('/api/guidance-articles', params);
    if (response?.data && response.data.length > 0) {
      return adaptArticle(response.data[0]);
    }
  } catch (err) {
    console.warn(`Error fetching guidance article by slug ${slug}:`, err);
  }
  return null;
}

/**
 * Fetch all guidance references (court forms, HMCTS finders, guidance PDFs)
 */
export async function fetchGuidanceReferences(type?: ReferenceType): Promise<GuidanceReference[]> {
  try {
    const params: Record<string, string> = {
      'sort': 'name:asc',
      'pagination[pageSize]': '100',
    };
    if (type) {
      params['filters[type][$eq]'] = type;
    }
    const response = await strapiGet<StrapiListResponse<RawReference>>('/api/guidance-references', params);
    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(adaptReference);
    }
  } catch (err) {
    console.warn('Error fetching guidance references:', err);
  }
  return [];
}
