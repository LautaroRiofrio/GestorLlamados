import { API_BASE_URL } from './apiConfig';

function buildUrl(resource) {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = String(resource).replace(/^\/+/, '');
  return new URL(`${base}/${path}`, window.location.origin);
}

export async function request(resource, options = {}) {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(resource);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
    ...fetchOptions
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado.' }));
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}
