import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_ITINERARY_RESPONSE_SCHEMA,
  type GeminiItineraryResponse,
  type GeminiTripRequest,
  validateGeminiItinerary,
} from './itineraryContract';
import { buildItineraryPlanningPrompt } from './planningPrompt';

export async function generateGeminiItinerary(
  request: GeminiTripRequest,
  apiKey: string,
): Promise<GeminiItineraryResponse> {
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required.');
  if (request.placeCandidates.length < 2) throw new Error('At least two approved places are required.');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: buildItineraryPlanningPrompt(request),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: GEMINI_ITINERARY_RESPONSE_SCHEMA as any,
      temperature: 0.2,
    },
  });

  if (!response.text) throw new Error('Gemini returned an empty response.');
  const itinerary = JSON.parse(response.text) as GeminiItineraryResponse;
  const error = validateGeminiItinerary(itinerary, request.placeCandidates, request);
  if (error) throw new Error(error);
  return itinerary;
}
