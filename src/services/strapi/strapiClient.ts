import { getStrapiApiUrl, getStrapiToken } from './strapiConfig';

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

function buildHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers(customHeaders || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStrapiToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function strapiGet<T>(endpoint: string, searchParams?: Record<string, string>): Promise<T> {
  const baseUrl = getStrapiApiUrl();
  const url = new URL(`${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(),
  });
  return handleResponse<T>(response);
}

export async function strapiPost<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
  const baseUrl = getStrapiApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function strapiPut<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
  const baseUrl = getStrapiApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function strapiDelete<T>(endpoint: string): Promise<T> {
  const baseUrl = getStrapiApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse<T>(response);
}
