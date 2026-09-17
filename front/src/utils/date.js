export function defaultRecontactAt() {
  const date = new Date();
  date.setMinutes(date.getMinutes() < 30 ? 30 : 60, 0, 0);
  return toLocalInputValue(date.toISOString());
}

export function splitRecontactAt(value) {
  const normalized = toLocalInputValue(value || defaultRecontactAt());
  const [date, time] = normalized.split('T');
  return { date, time: normalizeSlot(time) };
}

export function combineRecontactAt(date, time) {
  if (!date || !time) return '';
  return `${date}T${normalizeSlot(time)}`;
}

export function normalizeSlot(time) {
  if (!time) return '09:00';
  const [hour, minute] = time.split(':').map(Number);
  const nextMinute = minute < 30 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${nextMinute}`;
}

export function timeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
}

export function toLocalInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}
