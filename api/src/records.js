import crypto from 'node:crypto';
import { getMongoDb } from './mongo.js';

const collectionNames = {
  calls: 'calls',
  callbacks: 'callbacks'
};

function createId() {
  return crypto.randomUUID();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPublicRecord(record) {
  if (!record) return null;
  const { _id, ...publicRecord } = record;
  return publicRecord;
}

async function collection(type) {
  const db = await getMongoDb();
  return db.collection(collectionNames[type]);
}

function searchFilter(q, fields) {
  if (!q) return {};

  const expression = new RegExp(escapeRegex(q), 'i');
  return {
    $or: fields.map((field) => ({ [field]: expression }))
  };
}

function containsFilter(value) {
  return new RegExp(escapeRegex(value), 'i');
}

function addTextFilter(filter, field, value) {
  if (value) filter[field] = containsFilter(value);
}

function addDateRangeFilter(filter, field, from, to) {
  const range = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  if (Object.keys(range).length > 0) filter[field] = range;
}

function paginationOptions({ page = 1, limit = 25 } = {}) {
  const normalizedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 25, 1), 100);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
}

function callFilter(filters = {}) {
  const filter = searchFilter(filters.q, ['phone', 'dni', 'accountNumber', 'state', 'detail']);

  addTextFilter(filter, 'phone', filters.phone);
  addTextFilter(filter, 'dni', filters.dni);
  addTextFilter(filter, 'accountNumber', filters.accountNumber);
  if (filters.state) filter.state = filters.state;
  addDateRangeFilter(filter, 'createdAt', filters.createdFrom, filters.createdTo);

  return filter;
}

function callbackFilter(filters = {}) {
  const filter = searchFilter(filters.q, ['phone', 'dni', 'accountNumber', 'state', 'detail']);

  addTextFilter(filter, 'phone', filters.phone);
  addTextFilter(filter, 'dni', filters.dni);
  addTextFilter(filter, 'accountNumber', filters.accountNumber);
  if (filters.state) filter.state = filters.state;
  if (filters.pending) filter.state = 'pendiente';
  if (filters.sourceCallId) filter.sourceCallId = filters.sourceCallId;
  addDateRangeFilter(filter, 'createdAt', filters.createdFrom, filters.createdTo);
  addDateRangeFilter(filter, 'recontactAt', filters.recontactFrom, filters.recontactTo);

  return filter;
}

async function paginatedFind(collection, filter, sort, pagination) {
  const { page, limit, skip } = paginationOptions(pagination);
  const [items, total] = await Promise.all([
    collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter)
  ]);

  return {
    items: items.map(toPublicRecord),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function listCalls(filters = {}, pagination = {}) {
  const calls = await collection('calls');
  return paginatedFind(calls, callFilter(filters), { createdAt: -1 }, pagination);
}

export async function listAllCalls() {
  const calls = await collection('calls');
  const records = await calls.find({}).sort({ createdAt: -1 }).toArray();
  return records.map(toPublicRecord);
}

export async function getCall(id) {
  const calls = await collection('calls');
  return toPublicRecord(await calls.findOne({ id }));
}

export async function createCall(data) {
  const calls = await collection('calls');
  const now = new Date().toISOString();
  const call = { id: createId(), ...data, createdAt: now, updatedAt: now };

  await calls.insertOne(call);
  return call;
}

export async function updateCall(id, data) {
  const calls = await collection('calls');
  const result = await calls.findOneAndUpdate(
    { id },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );

  return toPublicRecord(result);
}

export async function deleteCall(id) {
  const calls = await collection('calls');
  const result = await calls.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function listCallbacks(filters = {}, pagination = {}) {
  const callbacks = await collection('callbacks');
  const sort = filters.sort === 'createdAt' ? { createdAt: -1 } : { recontactAt: 1 };
  return paginatedFind(callbacks, callbackFilter(filters), sort, pagination);
}

export async function listAllCallbacks() {
  const callbacks = await collection('callbacks');
  const records = await callbacks.find({}).sort({ recontactAt: 1 }).toArray();
  return records.map(toPublicRecord);
}

export async function getCallback(id) {
  const callbacks = await collection('callbacks');
  return toPublicRecord(await callbacks.findOne({ id }));
}

export async function createCallback(data) {
  const callbacks = await collection('callbacks');
  const now = new Date().toISOString();
  const callback = { id: createId(), ...data, createdAt: now, updatedAt: now };

  await callbacks.insertOne(callback);
  return callback;
}

export async function updateCallback(id, data) {
  const callbacks = await collection('callbacks');
  const result = await callbacks.findOneAndUpdate(
    { id },
    { $set: { ...data, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );

  return toPublicRecord(result);
}

export async function deleteCallback(id) {
  const callbacks = await collection('callbacks');
  const result = await callbacks.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function readRecordData() {
  const [calls, callbacks] = await Promise.all([listAllCalls(), listAllCallbacks()]);
  return { calls, callbacks };
}
