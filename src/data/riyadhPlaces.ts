import { RiyadhPlace } from '../types';
import rawPlaces from './riyadh_places.json';

export const RIYADH_PLACES: RiyadhPlace[] = rawPlaces as RiyadhPlace[];

export const getPlaceById = (id: number): RiyadhPlace | undefined => {
  return RIYADH_PLACES.find((p) => p.id === id);
};
