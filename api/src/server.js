import cors from 'cors';
import './config.js';
import express from 'express';
import { checkMongoConnection, hasMongoConfig } from './mongo.js';
import {
  createCall,
  createCallback,
  deleteCall,
  deleteCallback,
  getCall,
  getCallback,
  listCalls,
  listCallbacks,
  readRecordData,
  updateCall,
  updateCallback
} from './records.js';

const app = express();
const port = process.env.PORT || 4000;

const callStates = [
  'no venta',
  'venta desde 0',
  'mudanza',
  'venta ya cliente',
  'no responde',
  'transferencia',
  'OUT'
];

const callbackStates = [
  'pendiente',
  'no venta',
  'venta desde 0',
  'mudanza',
  'venta ya cliente',
  'no responde'
];

app.use(cors());
app.use(express.json());

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateCall(body) {
  const errors = {};
  const phone = normalizeText(body.phone);
  const state = normalizeText(body.state);

  if (!phone) errors.phone = 'El telefono es obligatorio.';
  if (!state) errors.state = 'El estado es obligatorio.';
  if (state && !callStates.includes(state)) errors.state = 'Estado de llamado invalido.';

  return { errors, data: pickBaseFields(body, state) };
}

function validateCallback(body) {
  const errors = {};
  const phone = normalizeText(body.phone);
  const state = normalizeText(body.state || 'pendiente');
  const recontactAt = normalizeText(body.recontactAt);

  if (!phone) errors.phone = 'El telefono es obligatorio.';
  if (!state) errors.state = 'El estado es obligatorio.';
  if (state && !callbackStates.includes(state)) errors.state = 'Estado de rellamado invalido.';
  if (!recontactAt) errors.recontactAt = 'La fecha de recontacto es obligatoria.';

  return {
    errors,
    data: {
      ...pickBaseFields(body, state),
      recontactAt,
      sourceCallId: normalizeText(body.sourceCallId) || null
    }
  };
}

function pickBaseFields(body, state) {
  return {
    phone: normalizeText(body.phone),
    dni: normalizeText(body.dni),
    accountNumber: normalizeText(body.accountNumber),
    state,
    detail: normalizeText(body.detail)
  };
}

function sendValidationErrors(res, errors) {
  if (Object.keys(errors).length === 0) return false;
  res.status(400).json({ errors });
  return true;
}

function inRange(dateValue, start, end) {
  const date = new Date(dateValue);
  return date >= start && date <= end;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = date.getDay() || 7;
  const start = startOfDay(date);
  start.setDate(start.getDate() - day + 1);
  return start;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function metricBlock(items, start, end) {
  return {
    total: items.filter((item) => inRange(item.createdAt, start, end)).length,
    ventas: items.filter((item) => inRange(item.createdAt, start, end) && item.state.startsWith('venta')).length,
    noVentas: items.filter((item) => inRange(item.createdAt, start, end) && item.state === 'no venta').length
  };
}

function countByState(items, states) {
  return states.map((state) => ({
    state,
    total: items.filter((item) => item.state === state).length
  }));
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function paginationFromQuery(query) {
  return {
    page: query.page,
    limit: query.limit
  };
}

function callFiltersFromQuery(query) {
  return {
    q: normalizeText(query.q).toLowerCase(),
    phone: normalizeText(query.phone),
    dni: normalizeText(query.dni),
    accountNumber: normalizeText(query.accountNumber),
    state: normalizeText(query.state),
    createdFrom: normalizeText(query.createdFrom),
    createdTo: normalizeText(query.createdTo)
  };
}

function callbackFiltersFromQuery(query) {
  return {
    ...callFiltersFromQuery(query),
    pending: query.pending === 'true',
    sourceCallId: normalizeText(query.sourceCallId),
    recontactFrom: normalizeText(query.recontactFrom),
    recontactTo: normalizeText(query.recontactTo)
  };
}

app.get('/api/options', (_req, res) => {
  res.json({ callStates, callbackStates });
});

app.get('/api/health/mongo', asyncHandler(async (_req, res) => {
  if (!hasMongoConfig()) {
    return res.status(503).json({
      connected: false,
      message: 'MONGODB_URI no esta configurado.'
    });
  }

  try {
    const result = await checkMongoConnection();
    res.json({ connected: true, database: result.database });
  } catch (error) {
    res.status(503).json({
      connected: false,
      message: 'No se pudo conectar a MongoDB.',
      error: error.message
    });
  }
}));

app.get('/api/calls', asyncHandler(async (req, res) => {
  res.json(await listCalls(callFiltersFromQuery(req.query), paginationFromQuery(req.query)));
}));

app.get('/api/calls/:id', asyncHandler(async (req, res) => {
  const call = await getCall(req.params.id);
  if (!call) return res.status(404).json({ message: 'Llamado no encontrado.' });
  res.json(call);
}));

app.post('/api/calls', asyncHandler(async (req, res) => {
  const { errors, data: callData } = validateCall(req.body);
  if (sendValidationErrors(res, errors)) return;

  const call = await createCall(callData);
  res.status(201).json(call);
}));

app.put('/api/calls/:id', asyncHandler(async (req, res) => {
  const { errors, data: callData } = validateCall(req.body);
  if (sendValidationErrors(res, errors)) return;

  const call = await updateCall(req.params.id, callData);
  if (!call) return res.status(404).json({ message: 'Llamado no encontrado.' });
  res.json(call);
}));

app.delete('/api/calls/:id', asyncHandler(async (req, res) => {
  const deleted = await deleteCall(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Llamado no encontrado.' });
  res.status(204).end();
}));

app.get('/api/callbacks', asyncHandler(async (req, res) => {
  res.json(await listCallbacks(callbackFiltersFromQuery(req.query), paginationFromQuery(req.query)));
}));

app.get('/api/callbacks/:id', asyncHandler(async (req, res) => {
  const callback = await getCallback(req.params.id);
  if (!callback) return res.status(404).json({ message: 'Rellamado no encontrado.' });
  res.json(callback);
}));

app.post('/api/callbacks', asyncHandler(async (req, res) => {
  const { errors, data: callbackData } = validateCallback(req.body);
  if (sendValidationErrors(res, errors)) return;

  const callback = await createCallback(callbackData);
  res.status(201).json(callback);
}));

app.put('/api/callbacks/:id', asyncHandler(async (req, res) => {
  const { errors, data: callbackData } = validateCallback(req.body);
  if (sendValidationErrors(res, errors)) return;

  const callback = await updateCallback(req.params.id, callbackData);
  if (!callback) return res.status(404).json({ message: 'Rellamado no encontrado.' });
  res.json(callback);
}));

app.delete('/api/callbacks/:id', asyncHandler(async (req, res) => {
  const deleted = await deleteCallback(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Rellamado no encontrado.' });
  res.status(204).end();
}));

app.get('/api/metrics', asyncHandler(async (_req, res) => {
  const data = await readRecordData();
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const end = new Date();
  const todayCalls = data.calls.filter((call) => inRange(call.createdAt, todayStart, end));

  res.json({
    calls: {
      day: metricBlock(data.calls, todayStart, end),
      week: metricBlock(data.calls, weekStart, end),
      month: metricBlock(data.calls, monthStart, end),
      byStateToday: countByState(todayCalls, callStates),
      byStateMonth: countByState(
        data.calls.filter((call) => inRange(call.createdAt, monthStart, end)),
        callStates
      )
    },
    callbacks: {
      pending: data.callbacks.filter((callback) => callback.state === 'pendiente').length,
      dueToday: data.callbacks.filter(
        (callback) => callback.state === 'pendiente' && inRange(callback.recontactAt, todayStart, end)
      ).length,
      byState: countByState(data.callbacks, callbackStates)
    }
  });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});
