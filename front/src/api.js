import { request } from './httpClient';

export const api = {
  options: () => request('options'),
  calls: (params) => request('calls', { params }),
  call: (id) => request(`calls/${id}`),
  createCall: (payload) => request('calls', { method: 'POST', body: JSON.stringify(payload) }),
  updateCall: (id, payload) => request(`calls/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCall: (id) => request(`calls/${id}`, { method: 'DELETE' }),
  callbacks: (params) => request('callbacks', { params }),
  callback: (id) => request(`callbacks/${id}`),
  createCallback: (payload) => request('callbacks', { method: 'POST', body: JSON.stringify(payload) }),
  updateCallback: (id, payload) => request(`callbacks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCallback: (id) => request(`callbacks/${id}`, { method: 'DELETE' }),
  metrics: () => request('metrics')
};
