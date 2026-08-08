import 'dotenv/config';
import { generateGeminiItinerary } from './geminiPlanner';
import type { GeminiTripPreferences } from './itineraryContract';
import { loadRiyadhPlaces } from './riyadhPlaces';

const TEST_CASES: Array<{ name: string; preferences: GeminiTripPreferences }> = [
  {
    name: 'Heat-safe family afternoon',
    preferences: {
      city: 'Riyadh', tripDate: '2026-08-09', startTime: '14:00', endTime: '19:00',
      avoidHeat: true, interests: ['culture', 'shopping'], walkingPreference: 'low',
      accessibility: { hasChildren: true, hasElderly: false, wheelchairRequired: false },
    },
  },
  {
    name: 'Evening heritage trip',
    preferences: {
      city: 'Riyadh', tripDate: '2026-08-09', startTime: '17:00', endTime: '22:00',
      avoidHeat: false, interests: ['heritage', 'shopping', 'food'], walkingPreference: 'moderate',
      accessibility: { hasChildren: false, hasElderly: false, wheelchairRequired: false },
    },
  },
  {
    name: 'Accessible low-walking visitor',
    preferences: {
      city: 'Riyadh', tripDate: '2026-08-09', startTime: '16:00', endTime: '20:00',
      avoidHeat: true, interests: ['culture', 'landmark'], walkingPreference: 'low',
      accessibility: { hasChildren: false, hasElderly: true, wheelchairRequired: true },
    },
  },
];

async function run(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Add GEMINI_API_KEY to your local .env file before testing.');
  const placeCandidates = await loadRiyadhPlaces();

  for (const testCase of TEST_CASES) {
    const itinerary = await generateGeminiItinerary({ ...testCase.preferences, placeCandidates }, apiKey);
    console.log('\nPASS: ' + testCase.name);
    console.log(JSON.stringify(itinerary, null, 2));
  }
}

run().catch((error) => {
  console.error('FAIL:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
