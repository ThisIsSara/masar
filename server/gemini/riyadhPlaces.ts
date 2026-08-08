import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RiyadhPlace } from './itineraryContract';

/** Phase 2 has one approved place source: riyadh_places.json. */
export async function loadRiyadhPlaces(): Promise<RiyadhPlace[]> {
  const filePath = path.resolve(process.cwd(), 'riyadh_places.json');
  const raw = await readFile(filePath, 'utf8');
  const places = JSON.parse(raw) as RiyadhPlace[];

  if (!Array.isArray(places) || places.length < 2) {
    throw new Error('riyadh_places.json must contain at least two places.');
  }
  return places;
}
