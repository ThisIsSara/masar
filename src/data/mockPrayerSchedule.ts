import { Language, PrayerBuffer } from '../types';
import { timeToMinutes } from '../utils/itineraryUtils';

export interface PrayerScheduleItem {
  id: string;
  prayerNameAr: string;
  prayerNameEn: string;
  time: string; // HH:MM 24hr format
  nearestMosqueDistanceMeters: number;
}

/**
 * Single source of truth for Phase 1 mock prayer schedule in Riyadh.
 */
export const MOCK_RIYADH_PRAYER_SCHEDULE: PrayerScheduleItem[] = [
  { id: 'fajr', prayerNameAr: 'الفجر', prayerNameEn: 'Fajr', time: '04:15', nearestMosqueDistanceMeters: 100 },
  { id: 'dhuhr', prayerNameAr: 'الظهر', prayerNameEn: 'Dhuhr', time: '12:05', nearestMosqueDistanceMeters: 80 },
  { id: 'asr', prayerNameAr: 'العصر', prayerNameEn: 'Asr', time: '15:30', nearestMosqueDistanceMeters: 90 },
  { id: 'maghrib', prayerNameAr: 'المغرب', prayerNameEn: 'Maghrib', time: '18:10', nearestMosqueDistanceMeters: 50 },
  { id: 'isha', prayerNameAr: 'العشاء', prayerNameEn: 'Isha', time: '19:40', nearestMosqueDistanceMeters: 120 },
];

/**
 * Generates header text referencing the canonical mock prayer schedule.
 */
export function getNextPrayerHeaderLabel(lang: Language, referenceTimeStr = '17:35'): string {
  const refMins = timeToMinutes(referenceTimeStr);
  const nextPrayer =
    MOCK_RIYADH_PRAYER_SCHEDULE.find((p) => timeToMinutes(p.time) > refMins) ||
    MOCK_RIYADH_PRAYER_SCHEDULE[0];

  const prayerName = lang === 'ar' ? nextPrayer.prayerNameAr : nextPrayer.prayerNameEn;

  if (lang === 'ar') {
    return `صلاة ${prayerName} ${nextPrayer.time}`;
  }
  return `${prayerName} Prayer ${nextPrayer.time}`;
}

/**
 * Finds if a scheduled prayer falls within or near a stop interval [startMins, endMins].
 * CRUCIAL: Prayer time value is ALWAYS taken directly from MOCK_RIYADH_PRAYER_SCHEDULE and never shifted/scaled.
 */
export function getPrayerBufferForInterval(startMins: number, endMins: number): PrayerBuffer | undefined {
  for (const p of MOCK_RIYADH_PRAYER_SCHEDULE) {
    const pMins = timeToMinutes(p.time);
    if (pMins >= startMins - 10 && pMins <= endMins + 10) {
      return {
        prayerNameAr: p.prayerNameAr,
        prayerNameEn: p.prayerNameEn,
        time: p.time, // Unmodified fixed prayer time
        nearestMosqueDistanceMeters: p.nearestMosqueDistanceMeters,
      };
    }
  }
  return undefined;
}
