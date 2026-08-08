import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_ITINERARY_RESPONSE_SCHEMA,
  type GeminiItineraryResponse,
  type GeminiTripRequest,
  validateGeminiItinerary,
} from './itineraryContract';
import { buildItineraryPlanningPrompt } from './planningPrompt';

export class GeminiPlanningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiPlanningError';
  }
}

/**
 * Server-side initial itinerary generation.
 * Do not import this in React/browser code: GEMINI_API_KEY must remain private.
 */
export async function generateGeminiItinerary(
  request: GeminiTripRequest,
  apiKey: string,
): Promise<GeminiItineraryResponse> {
  if (!apiKey) {
    throw new GeminiPlanningError('GEMINI_API_KEY is missing on the server.');
  }

  if (request.placeCandidates.length < 2) {
    throw new GeminiPlanningError('At least two validated place candidates are required.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildItineraryPlanningPrompt(request),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: GEMINI_ITINERARY_RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  if (!response.text) {
    throw new GeminiPlanningError('Gemini returned an empty itinerary.');
  }

  let itinerary: GeminiItineraryResponse;
  try {
    itinerary = JSON.parse(response.text) as GeminiItineraryResponse;
  } catch {
    throw new GeminiPlanningError('Gemini did not return valid itinerary JSON.');
  }

  const validationError = validateGeminiItinerary(itinerary, request.placeCandidates);
  if (validationError) {
    throw new GeminiPlanningError(validationError);
  }

  return itinerary;
}
