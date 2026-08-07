import { Itinerary } from '../types';
import { getPrayerBufferForInterval } from '../data/mockPrayerSchedule';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTimeStr(minutes: number): string {
  const h = Math.floor((minutes + 1440) / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function recalculateItineraryTimes(
  itinerary: Itinerary,
  startTimeStr: string,
  endTimeStr: string
): Itinerary {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = timeToMinutes(endTimeStr);

  let totalAvailableMinutes = endMins - startMins;
  if (totalAvailableMinutes <= 0) {
    totalAvailableMinutes = 360;
  }

  const baseTotalDuration = 360;
  const scale = totalAvailableMinutes / baseTotalDuration;

  let currentMins = startMins;
  const stopsCount = itinerary.stops.length;

  const updatedStops = itinerary.stops.map((stop, idx) => {
    let scaledDuration = Math.max(15, Math.round(stop.durationMinutes * scale));
    const isLast = idx === stopsCount - 1;

    let stopStartMins = currentMins;
    let stopEndMins = stopStartMins + scaledDuration;

    if (isLast) {
      if (endMins > stopStartMins) {
        stopEndMins = endMins;
        scaledDuration = stopEndMins - stopStartMins;
      }
    }

    const scaledGap = isLast ? 0 : Math.max(5, Math.round(15 * scale));
    currentMins = stopEndMins + scaledGap;

    const newStartStr = minutesToTimeStr(stopStartMins);
    const newEndStr = minutesToTimeStr(stopEndMins);

    // Get prayer buffer for this stop's interval from single source of truth without shifting prayer time values
    const updatedPrayerBuffer = getPrayerBufferForInterval(stopStartMins, stopEndMins);

    return {
      ...stop,
      startTime: newStartStr,
      endTime: newEndStr,
      durationMinutes: Math.max(10, scaledDuration),
      prayerBuffer: updatedPrayerBuffer,
    };
  });

  return {
    ...itinerary,
    totalDurationMinutes: totalAvailableMinutes,
    stops: updatedStops,
  };
}
