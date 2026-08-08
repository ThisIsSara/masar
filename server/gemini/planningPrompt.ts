import type { GeminiTripRequest } from './itineraryContract';

/**
 * Creates the instruction used for initial Gemini itinerary generation.
 * The backend must pass only real, prevalidated Places results in placeCandidates.
 */
export function buildItineraryPlanningPrompt(request: GeminiTripRequest): string {
  const candidates = request.placeCandidates.map((place) => ({
    googlePlaceId: place.googlePlaceId,
    nameAr: place.nameAr,
    nameEn: place.nameEn,
    category: place.category,
    isIndoor: place.isIndoor,
    isAccessible: place.isAccessible,
    isOpen: place.isOpen,
  }));

  return `You are Masar, an adaptive Riyadh trip-planning assistant.

Create a realistic itinerary using ONLY the supplied place candidates. Never invent a place, Google Place ID, coordinate, opening status, or travel time.

Trip preferences:
- City: Riyadh
- Date: ${request.tripDate}
- Time window: ${request.startTime} to ${request.endTime}
- Interests: ${request.interests.join(', ')}
- Avoid heat: ${request.avoidHeat ? 'yes' : 'no'}
- Walking preference: ${request.walkingPreference}
- Children: ${request.accessibility.hasChildren ? 'yes' : 'no'}
- Elderly companion: ${request.accessibility.hasElderly ? 'yes' : 'no'}
- Wheelchair required: ${request.accessibility.wheelchairRequired ? 'yes' : 'no'}

Planning rules:
1. Return 2 to 5 stops in chronological order.
2. Select only candidates with a matching googlePlaceId.
3. If avoid heat is true, prefer indoor places for daytime stops.
4. If walking preference is low, an elderly companion is present, or a wheelchair is required, prefer accessible candidates and keep the trip short.
5. Do not include a candidate marked isOpen: false.
6. Keep each stop between 30 and 180 minutes.
7. Give a short reason in Arabic and English for every stop.
8. Return only the required structured response; do not add markdown or normal chat text.

Validated place candidates:
${JSON.stringify(candidates)}
`;
}
