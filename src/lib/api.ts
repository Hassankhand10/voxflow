import { API_ENDPOINTS } from '@/lib/api-endpoints';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('voxflow_token');
}

export function getStoredToken(): string | null {
  return getToken();
}

export function setToken(token: string) {
  localStorage.setItem('voxflow_token', token);
}

export function clearToken() {
  localStorage.removeItem('voxflow_token');
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, err.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api<{ url: string; filename: string; mimetype: string }>(
    API_ENDPOINTS.media.uploads,
    {
      method: 'POST',
      body: formData,
    },
  );
}
