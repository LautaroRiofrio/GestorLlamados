export function firstError(error) {
  if (error?.errors) return Object.values(error.errors)[0];
  return error?.message || 'No se pudo guardar.';
}
