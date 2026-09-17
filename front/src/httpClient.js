import { API_BASE_URL } from './apiConfig';

export async function request(resource, options = {}) {
  const { params, ...fetchOptions } = options;
  const url = new URL(`${API_BASE_URL}/${resource}`, window.location.origin);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(`${url.pathname}${url.search}`, {
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
