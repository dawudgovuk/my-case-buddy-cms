import { getStrapiApiUrl, getStrapiToken } from './strapiConfig';
import { getCurrentUser } from '../auth';

export interface StrapiErrorDetail {
  message?: string;
  name?: string;
  status?: number;
}

export class StrapiApiError extends Error {
  status: number;
  details?: StrapiErrorDetail;

  constructor(message: string, status: number, details?: StrapiErrorDetail) {
    super(message);
    this.name = 'StrapiApiError';
    this.status = status;
    this.details = details;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  searchParams?: Record<string, string>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorInfo = (payload as { error?: StrapiErrorDetail })?.error;
    const message = errorInfo?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new StrapiApiError(message, response.status, errorInfo);
  }

  return payload as T;
}

/** JSON headers plus the caller's JWT and email (the API uses the email for Neon Auth sessions). */
function buildHeaders(): Headers {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = getStrapiToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const currentUser = getCurrentUser();
  if (currentUser?.email) {
    headers.set('X-User-Email', currentUser.email);
  }
  return headers;
}

function buildUrl(endpoint: string, searchParams?: Record<string, string>): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${getStrapiApiUrl()}${path}`;
  if (!searchParams) return url;

  const withParams = new URL(url);
  Object.entries(searchParams).forEach(([k, v]) => withParams.searchParams.set(k, v));
  return withParams.toString();
}

/** Single request pipeline used by every verb helper below. */
async function strapiRequest<T>(method: HttpMethod, endpoint: string, { body, searchParams }: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(endpoint, searchParams), {
    method,
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export function strapiGet<T>(endpoint: string, searchParams?: Record<string, string>): Promise<T> {
  return strapiRequest<T>('GET', endpoint, { searchParams });
}

export function strapiPost<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
  return strapiRequest<T>('POST', endpoint, { body });
}

export function strapiPut<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
  return strapiRequest<T>('PUT', endpoint, { body });
}

export function strapiDelete<T>(endpoint: string): Promise<T> {
  return strapiRequest<T>('DELETE', endpoint);
}
