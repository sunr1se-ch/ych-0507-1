import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PipeSegment, LeakSample } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SEED_DIR = path.join(DATA_DIR, 'seed');
const SEGMENTS_SEED = path.join(SEED_DIR, 'segments.json');
const SAMPLES_SEED = path.join(SEED_DIR, 'samples.json');

interface DataStore {
  segments: PipeSegment[];
  samples: LeakSample[];
  initialized: boolean;
}

let memoryStore: DataStore | null = null;

const loadSeedData = (): DataStore => {
  const segments: PipeSegment[] = JSON.parse(fs.readFileSync(SEGMENTS_SEED, 'utf-8'));
  const samples: LeakSample[] = JSON.parse(fs.readFileSync(SAMPLES_SEED, 'utf-8'));
  return { segments, samples, initialized: true };
};

export const initDataStore = (): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(STORE_FILE)) {
    try {
      const stored = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (stored.initialized) {
        memoryStore = stored;
        return;
      }
    } catch {
      // ignore
    }
  }

  memoryStore = loadSeedData();
  persistStore();
};

const persistStore = (): void => {
  if (memoryStore) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  }
};

export const getSegments = (): PipeSegment[] => {
  if (!memoryStore) initDataStore();
  return memoryStore!.segments;
};

export const getSamples = (): LeakSample[] => {
  if (!memoryStore) initDataStore();
  return memoryStore!.samples;
};

export const getCorridors = (): string[] => {
  const segments = getSegments();
  return [...new Set(segments.map(s => s.corridor))].sort();
};

export const addSamples = (newSamples: LeakSample[]): number => {
  if (!memoryStore) initDataStore();
  
  const existingKeys = new Set(
    memoryStore!.samples.map(s => `${s.segmentId}-${s.sampleTime}`)
  );

  let added = 0;
  for (const sample of newSamples) {
    const key = `${sample.segmentId}-${sample.sampleTime}`;
    if (!existingKeys.has(key)) {
      memoryStore!.samples.push(sample);
      existingKeys.add(key);
      added++;
    }
  }

  persistStore();
  return added;
};

export const filterSamplesByDate = (
  samples: LeakSample[],
  startDate?: string,
  endDate?: string
): LeakSample[] => {
  return samples.filter(s => {
    const t = new Date(s.sampleTime).getTime();
    if (startDate && t < new Date(startDate).getTime()) return false;
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (t > endOfDay.getTime()) return false;
    }
    return true;
  });
};

export const filterSegmentsByCorridor = (
  segments: PipeSegment[],
  corridors: string[]
): PipeSegment[] => {
  if (corridors.length === 0) return segments;
  return segments.filter(s => corridors.includes(s.corridor));
};

export const resetToSeed = (): void => {
  memoryStore = loadSeedData();
  persistStore();
};
