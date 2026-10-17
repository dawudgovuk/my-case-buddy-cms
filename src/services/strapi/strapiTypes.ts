/** Envelope Strapi uses for collection responses. */
export interface StrapiListResponse<T> {
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

/** Envelope Strapi uses for single-entry responses. */
export interface StrapiSingleResponse<T> {
  data: T;
}

/** A Strapi v4-style entry may wrap its fields in `attributes`; v5 returns them flat. */
export interface MaybeWrapped {
  attributes?: Record<string, unknown>;
}

/** Returns an entry's fields whether or not they are wrapped in `attributes`. */
export function unwrapEntry<T extends MaybeWrapped>(item: T): Record<string, unknown> {
  if (item.attributes && typeof item.attributes === 'object') {
    return { ...item.attributes, id: (item as { id?: unknown }).id };
  }
  return item as unknown as Record<string, unknown>;
}
