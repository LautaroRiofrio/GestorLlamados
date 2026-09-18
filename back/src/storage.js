import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'db.json');

const initialData = {
  calls: [],
  callbacks: []
};

async function ensureDataFile() {
  await mkdir(dirname(dataPath), { recursive: true });
  try {
    await readFile(dataPath, 'utf8');
  } catch {
    await writeFile(dataPath, JSON.stringify(initialData, null, 2));
  }
}

export async function readData() {
  await ensureDataFile();
  const raw = await readFile(dataPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeData(data) {
  await ensureDataFile();
  await writeFile(dataPath, JSON.stringify(data, null, 2));
}

export function createId() {
  return crypto.randomUUID();
}
