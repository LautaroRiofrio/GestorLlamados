const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado.' }));
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const api = {
  options: () => request('/options'),
  calls: ({ q = '', page = 1, limit = 25, state = '' } = {}) =>
    request(`/calls${buildQuery({ q, page, limit, state })}`),
  call: (id) => request(`/calls/${id}`),
  createCall: (payload) => request('/calls', { method: 'POST', body: JSON.stringify(payload) }),
  updateCall: (id, payload) => request(`/calls/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCall: (id) => request(`/calls/${id}`, { method: 'DELETE' }),
  callbacks: ({ q = '', pending = false } = {}) => {
    return request(`/callbacks${buildQuery({ q, pending: pending ? 'true' : '', page: 1, limit: 25 })}`);
  },
  callback: (id) => request(`/callbacks/${id}`),
  createCallback: (payload) => request('/callbacks', { method: 'POST', body: JSON.stringify(payload) }),
  updateCallback: (id, payload) =>
    request(`/callbacks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCallback: (id) => request(`/callbacks/${id}`, { method: 'DELETE' }),
  metrics: () => request('/metrics')
};
