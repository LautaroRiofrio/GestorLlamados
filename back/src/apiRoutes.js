const API_PREFIX = '/api';

export const apiRoutes = {
  options: `${API_PREFIX}/options`,
  mongoHealth: `${API_PREFIX}/health/mongo`,
  calls: `${API_PREFIX}/calls`,
  call: `${API_PREFIX}/calls/:id`,
  callbacks: `${API_PREFIX}/callbacks`,
  callback: `${API_PREFIX}/callbacks/:id`,
  metrics: `${API_PREFIX}/metrics`
};
