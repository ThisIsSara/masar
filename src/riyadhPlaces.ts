import { RIYADH_PLACES } from './data/riyadhPlaces';
import type { RiyadhPlace } from './itineraryContract';

/** Phase 2 approved place source: riyadh_places.json */
export async function loadRiyadhPlaces(): Promise<RiyadhPlace[]> {
  return RIYADH_PLACES as RiyadhPlace[];
}
