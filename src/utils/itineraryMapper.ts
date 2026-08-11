import { GeminiItineraryResponse } from '../itineraryContract';
import { Itinerary, ItineraryStop } from '../types';
import { RIYADH_PLACES } from '../data/riyadhPlaces';
import { timeToMinutes, minutesToTimeStr } from './itineraryUtils';
import { getPrayerBufferForInterval } from '../data/mockPrayerSchedule';

export function mapGeminiResponseToItinerary(
  response: GeminiItineraryResponse
): Itinerary {
  const placeMap = new Map(RIYADH_PLACES.map((p) => [p.id, p]));

  const stops: ItineraryStop[] = response.stops.map((gStop, index) => {
    const place = placeMap.get(gStop.placeId);
    if (!place) {
      throw new Error(`Place ID ${gStop.placeId} not found in dataset.`);
    }

    const startMins = timeToMinutes(gStop.startTime);
    const duration = gStop.durationMinutes || place.duration_minutes;
    const endMins = startMins + duration;
    const endTimeStr = minutesToTimeStr(endMins);

    const prayerBuffer = getPrayerBufferForInterval(startMins, endMins);

    return {
      id: `stop-${gStop.order}`,
      order: gStop.order,
      placeId: place.id,
      nameAr: place.name_ar,
      nameEn: place.name_en,
      category: place.category,
      startTime: gStop.startTime,
      endTime: endTimeStr,
      durationMinutes: duration,
      isIndoor: place.indoor,
      crowdLevel: 'moderate',
      walkingDistanceMeters:
        place.walking_level === 'low'
          ? 90
          : place.walking_level === 'medium'
          ? 180
          : 320,
      location: {
        lat: place.latitude,
        lng: place.longitude,
        addressAr: `${place.name_ar}، الرياض`,
        addressEn: `${place.name_en}, Riyadh`,
      },
      status: index === 0 ? 'current' : 'upcoming',
      amenities: place.indoor
        ? ['تكييف عالي', 'أماكن مغلقة', 'مواقف متوفرة']
        : ['مساحات خارجية', 'ممشى حديث', 'جلسات واسعة'],
      prayerBuffer,
      descriptionAr: gStop.reasonAr,
      descriptionEn: gStop.reasonEn,
    };
  });

  // Calculate total duration in minutes
  const firstStartMins = stops.length > 0 ? timeToMinutes(stops[0].startTime) : 0;
  const lastEndMins = stops.length > 0 ? timeToMinutes(stops[stops.length - 1].endTime) : 0;
  const totalDurationMinutes = Math.max(0, lastEndMins - firstStartMins);

  return {
    id: `gemini-trip-${Date.now()}`,
    tripTitleAr: response.tripTitleAr,
    tripTitleEn: response.tripTitleEn,
    totalDurationMinutes,
    summaryAr: response.summaryAr,
    summaryEn: response.summaryEn,
    stops,
  };
}
