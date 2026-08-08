import type { GeminiTripRequest } from './itineraryContract';

export function buildItineraryPlanningPrompt(request: GeminiTripRequest): string {
  const candidates = request.placeCandidates.map((place) => ({
    placeId: place.id,
    nameAr: place.name_ar,
    nameEn: place.name_en,
    category: place.category,
    tags: place.tags,
    indoor: place.indoor,
    walkingLevel: place.walking_level,
    durationMinutes: place.duration_minutes,
    bestTime: place.best_time,
    suitableForChildren: place.suitable_for_children,
    accessible: place.accessible,
  }));

  return [
    'You are Masar, an adaptive Riyadh trip-planning assistant.',
    'Create an itinerary using ONLY the candidates from riyadh_places.json.',
    'Never invent a place, placeId, coordinate, category, or duration.',
    '',
    'Trip preferences:',
    '- City: Riyadh',
    '- Date: ' + request.tripDate,
    '- Time window: ' + request.startTime + ' to ' + request.endTime,
    '- Interests: ' + request.interests.join(', '),
    '- Avoid heat: ' + (request.avoidHeat ? 'yes' : 'no'),
    '- Walking preference: ' + request.walkingPreference,
    '- Children: ' + (request.accessibility.hasChildren ? 'yes' : 'no'),
    '- Elderly companion: ' + (request.accessibility.hasElderly ? 'yes' : 'no'),
    '- Wheelchair required: ' + (request.accessibility.wheelchairRequired ? 'yes' : 'no'),
    '',
    'Planning rules:',
    '1. Return 2 to 5 stops in chronological order.',
    '2. Select only a candidate placeId.',
    '3. If avoidHeat is true, prefer indoor places.',
    '4. For low walking, elderly, or wheelchair users, prefer accessible and low-walking places.',
    '5. Match interests against each candidate category or tags whenever possible.',
    '6. Use each candidate exact durationMinutes value.',
    '7. Give each stop a short reason in Arabic and English.',
    '8. Return only JSON matching the required schema. No markdown or chat text.',
    '',
    'Approved candidates:',
    JSON.stringify(candidates),
  ].join('\n');
}
