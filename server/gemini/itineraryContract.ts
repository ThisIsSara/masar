/**
 * Masar — Student 2 contract between Gemini and the app.
 *
 * Gemini selects ONLY from real place candidates supplied by the backend.
 * This prevents invented places and coordinates.
 */

export type MasarCategory =
  | 'culture'
  | 'cafes'
  | 'dining'
  | 'shopping'
  | 'nature'
  | 'entertainment'
  | 'landmark'
  | 'heritage'
  | 'food';

export interface GeminiPlaceCandidate {
  googlePlaceId: string;
  nameAr: string;
  nameEn: string;
  category: MasarCategory;
  lat: number;
  lng: number;
  addressAr: string;
  addressEn: string;
  isIndoor: boolean;
  isAccessible: boolean;
  isOpen?: boolean;
}

export interface GeminiTripRequest {
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
  placeCandidates: GeminiPlaceCandidate[];
}

export interface GeminiItineraryStop {
  order: number;
  googlePlaceId: string;
  startTime: string;
  durationMinutes: number;
  reasonAr: string;
  reasonEn: string;
}

export interface GeminiItineraryResponse {
  tripTitleAr: string;
  tripTitleEn: string;
  summaryAr: string;
  summaryEn: string;
  stops: GeminiItineraryStop[];
}

/** JSON schema for Gemini Structured Output. */
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
        required: ['order', 'googlePlaceId', 'startTime', 'durationMinutes', 'reasonAr', 'reasonEn'],
        properties: {
          order: { type: 'integer', minimum: 1 },
          googlePlaceId: { type: 'string' },
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
  candidates: GeminiPlaceCandidate[],
): string | null {
  const allowedPlaceIds = new Set(candidates.map((place) => place.googlePlaceId));
  const usedPlaceIds = new Set<string>();

  for (const [index, stop] of itinerary.stops.entries()) {
    if (stop.order !== index + 1) return 'Stops must be ordered 1, 2, 3...';
    if (!allowedPlaceIds.has(stop.googlePlaceId)) return 'Gemini selected an unvalidated place.';
    if (usedPlaceIds.has(stop.googlePlaceId)) return 'The same place cannot appear twice.';
    if (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(stop.startTime)) return 'A stop has an invalid time.';
    usedPlaceIds.add(stop.googlePlaceId);
  }

  return null;
}
