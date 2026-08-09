/**
 * Masar Phase 2 contract. Gemini may select only IDs from riyadh_places.json.
 */
export type MasarCategory =
  | 'culture' | 'cafes' | 'dining' | 'shopping' | 'nature'
  | 'entertainment' | 'landmark' | 'heritage' | 'food';

export interface RiyadhPlace {
  id: number;
  name_ar: string;
  name_en: string;
  category: MasarCategory;
  tags: string[];
  indoor: boolean;
  walking_level: 'low' | 'medium' | 'high';
  duration_minutes: number;
  best_time: string[];
  suitable_for_children: boolean;
  accessible: boolean;
  price_level: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
}

/** Input Schema: data received from the trip-setup screen. */
export interface GeminiTripPreferences {
  city: 'Riyadh';
  tripDate: string;
  startTime: string;
  endTime: string;
  avoidHeat: boolean;
  interests: MasarCategory[];
  walkingPreference: 'low' | 'moderate' | 'high';
  accessibility: {
    hasChildren: boolean;
    hasElderly: boolean;
    wheelchairRequired: boolean;
  };
}

export interface GeminiTripRequest extends GeminiTripPreferences {
  placeCandidates: RiyadhPlace[];
}

export interface GeminiItineraryStop {
  order: number;
  placeId: number;
  startTime: string;
  durationMinutes: number;
  reasonAr: string;
  reasonEn: string;
}

/** Structured Output / JSON Schema: the only format Gemini may return. */
export interface GeminiItineraryResponse {
  tripTitleAr: string;
  tripTitleEn: string;
  summaryAr: string;
  summaryEn: string;
  stops: GeminiItineraryStop[];
}

export const GEMINI_ITINERARY_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tripTitleAr', 'tripTitleEn', 'summaryAr', 'summaryEn', 'stops'],
  properties: {
    tripTitleAr: { type: 'string' },
    tripTitleEn: { type: 'string' },
    summaryAr: { type: 'string' },
    summaryEn: { type: 'string' },
    stops: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['order', 'placeId', 'startTime', 'durationMinutes', 'reasonAr', 'reasonEn'],
        properties: {
          order: { type: 'integer', minimum: 1 },
          placeId: { type: 'integer', minimum: 1 },
          startTime: { type: 'string', description: '24-hour time in HH:mm format' },
          durationMinutes: { type: 'integer', minimum: 30, maximum: 180 },
          reasonAr: { type: 'string' },
          reasonEn: { type: 'string' },
        },
      },
    },
  },
} as const;

export function validateGeminiItinerary(
  itinerary: GeminiItineraryResponse,
  places: RiyadhPlace[],
  tripPreferences: Pick<GeminiTripPreferences, 'startTime' | 'endTime'>,
): string | null {
  const placeById = new Map(places.map((place) => [place.id, place]));
  const selected = new Set<number>();
  const tripStart = timeToMinutes(tripPreferences.startTime);
  const tripEnd = timeToMinutes(tripPreferences.endTime);
  let previousStopEnd = tripStart;

  if (!isValidTime(tripPreferences.startTime) || !isValidTime(tripPreferences.endTime)) {
    return 'The trip start or end time is invalid.';
  }
  if (tripEnd <= tripStart) return 'The trip end time must be after the start time.';

  for (const [index, stop] of itinerary.stops.entries()) {
    const place = placeById.get(stop.placeId);
    if (stop.order !== index + 1) return 'Stops must be ordered 1, 2, 3...';
    if (!place) return 'Gemini selected a place outside riyadh_places.json.';
    if (selected.has(stop.placeId)) return 'The same place cannot appear twice.';
    if (!isValidTime(stop.startTime)) return 'A stop has an invalid time.';
    if (stop.durationMinutes !== place.duration_minutes) return 'A stop duration differs from riyadh_places.json.';
    
    const stopStart = timeToMinutes(stop.startTime);
    const stopEnd = stopStart + stop.durationMinutes;
    if (stopStart < tripStart || stopEnd > tripEnd) {
      return 'A stop falls outside the selected trip time window.';
    }
    if (stopStart < previousStopEnd) {
      return 'Two itinerary stops overlap.';
    }

    previousStopEnd = stopEnd;
    selected.add(stop.placeId);
  }

  return null;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
