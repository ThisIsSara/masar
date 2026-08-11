import { ItineraryStop, ReplaceFilterPreset, RiyadhPlace } from '../types';
import { RIYADH_PLACES } from '../data/riyadhPlaces';

/**
/ Calculate distance in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Helper to normalize name strings for place comparison
 */
function normalizeName(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[أإآآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[^\w\s\u0600-\u06FF]/g, '');
}

/**
 * Returns true if a candidate place represents the same physical place as targetStop
 */
export function isSamePlace(candidate: RiyadhPlace, targetStop: ItineraryStop): boolean {
  if (targetStop.placeId !== undefined && candidate.id === targetStop.placeId) {
    return true;
  }
  const candNameAr = normalizeName(candidate.name_ar);
  const targetNameAr = normalizeName(targetStop.nameAr);
  if (candNameAr && targetNameAr && candNameAr === targetNameAr) {
    return true;
  }
  const candNameEn = normalizeName(candidate.name_en);
  const targetNameEn = normalizeName(targetStop.nameEn);
  if (candNameEn && targetNameEn && candNameEn === targetNameEn) {
    return true;
  }
  if (targetStop.location && targetStop.location.lat && targetStop.location.lng) {
    const dist = calculateDistanceMeters(
      candidate.latitude,
      candidate.longitude,
      targetStop.location.lat,
      targetStop.location.lng,
    );
    if (dist < 50) {
      return true;
    }
  }
  return false;
}

/**
 * Finds a candidate place from RIYADH_PLACES matching the requested replace preset.
 * Strictly uses real places from the project dataset.
 */
export function findReplacementPlaceCandidate(
  targetStop: ItineraryStop,
  preset: ReplaceFilterPreset,
  allStopsInItinerary: ItineraryStop[],
  allPlaces: RiyadhPlace[] = RIYADH_PLACES,
): { place: RiyadhPlace; reasonAr: string; reasonEn: string } {
  const usedPlaceIds = new Set(allStopsInItinerary.map((s) => s.placeId).filter(Boolean));

  // Exclude targetStop (by ID, normalized Arabic/English names, or location) from candidates
  const candidatePool = allPlaces.filter((p) => !isSamePlace(p, targetStop));

  // Prefer candidates NOT currently present in the itinerary
  const unusedCandidates = candidatePool.filter((p) => !usedPlaceIds.has(p.id));
  const pool = unusedCandidates.length > 0 ? unusedCandidates : candidatePool;

  // Reference coordinates for distance calculation
  const stopIndex = allStopsInItinerary.findIndex((s) => s.id === targetStop.id);
  const refLat =
    stopIndex > 0
      ? allStopsInItinerary[stopIndex - 1].location.lat
      : targetStop.location.lat;
  const refLng =
    stopIndex > 0
      ? allStopsInItinerary[stopIndex - 1].location.lng
      : targetStop.location.lng;

  let selectedPlace: RiyadhPlace = pool[0] || candidatePool[0] || allPlaces[0];
  let reasonAr = '';
  let reasonEn = '';

  switch (preset) {
    case 'similar': {
      // 1. Same category is top priority
      // 2. Overlapping tags
      // 3. Distance tie-breaker
      const ranked = pool.map((p) => {
        const sameCategoryScore = p.category === targetStop.category ? 100 : 0;
        const tagOverlap = p.tags.filter((t) =>
          targetStop.category ? (targetStop.category as string).includes(t) : false,
        ).length;
        const dist = calculateDistanceMeters(refLat, refLng, p.latitude, p.longitude);
        return {
          place: p,
          score: sameCategoryScore + tagOverlap * 10 - dist / 10000,
        };
      });

      ranked.sort((a, b) => b.score - a.score);
      selectedPlace = ranked[0].place;
      reasonAr = `بديل مشابه في الفئة والاهتمام (${selectedPlace.name_ar})`;
      reasonEn = `Similar alternative in category and interest (${selectedPlace.name_en})`;
      break;
    }

    case 'closer': {
      const ranked = pool
        .map((p) => ({
          place: p,
          dist: calculateDistanceMeters(refLat, refLng, p.latitude, p.longitude),
        }))
        .sort((a, b) => a.dist - b.dist);

      selectedPlace = ranked[0].place;
      const km = (ranked[0].dist / 1000).toFixed(1);
      reasonAr = `مكان أقرب جغرافياً (${selectedPlace.name_ar} على بعد ${km} كم)`;
      reasonEn = `Geographically closer location (${selectedPlace.name_en}, ${km} km away)`;
      break;
    }

    case 'indoor': {
      // Must be a real indoor venue (indoor === true)
      const indoorCandidates = pool.filter((p) => p.indoor === true);
      const indoorPool =
        indoorCandidates.length > 0
          ? indoorCandidates
          : allPlaces.filter((p) => p.indoor === true && !isSamePlace(p, targetStop));

      // Rank indoor candidates: prefer same category, then distance
      const ranked = indoorPool.map((p) => {
        const sameCategoryBonus = p.category === targetStop.category ? 50 : 0;
        const dist = calculateDistanceMeters(refLat, refLng, p.latitude, p.longitude);
        return {
          place: p,
          score: sameCategoryBonus - dist / 1000,
        };
      });

      ranked.sort((a, b) => b.score - a.score);
      selectedPlace = ranked[0].place;
      reasonAr = `مكان داخلي ومكيف بالكامل (${selectedPlace.name_ar})`;
      reasonEn = `Fully air-conditioned indoor venue (${selectedPlace.name_en})`;
      break;
    }

    case 'less_crowded': {
      const crowdScoreMap: Record<string, number> = { high: 3, moderate: 2, low: 1 };
      const targetCrowdRank = crowdScoreMap[targetStop.crowdLevel] || 2;

      const getCandidateCrowdRank = (p: RiyadhPlace): number => {
        if (p.walking_level === 'low') return 1;
        if (p.walking_level === 'medium') return 2;
        return 3;
      };

      const lowerCrowdCandidates = pool.filter(
        (p) => getCandidateCrowdRank(p) < targetCrowdRank,
      );

      if (lowerCrowdCandidates.length === 0) {
        // Return clear "no suitable less-crowded alternative available" result without selecting target stop
        selectedPlace = pool[0] || candidatePool[0] || allPlaces[0];
        reasonAr = 'لا يوجد خيار مناسب أقل ازدحاماً متاح حالياً';
        reasonEn = 'No suitable less-crowded alternative available currently';
      } else {
        const ranked = lowerCrowdCandidates.map((p) => {
          const categoryBonus = p.category === targetStop.category ? 50 : 0;
          const dist = calculateDistanceMeters(refLat, refLng, p.latitude, p.longitude);
          return {
            place: p,
            score: categoryBonus - dist / 1000,
          };
        });
        ranked.sort((a, b) => b.score - a.score);
        selectedPlace = ranked[0].place;
        reasonAr = `وجهة هادئة وأقل ازدحاماً (${selectedPlace.name_ar})`;
        reasonEn = `Quieter, lower-crowd destination (${selectedPlace.name_en})`;
      }
      break;
    }

    case 'different_activity': {
      // Must be a DIFFERENT category
      const diffCategoryCandidates = pool.filter((p) => p.category !== targetStop.category);
      const diffPool =
        diffCategoryCandidates.length > 0
          ? diffCategoryCandidates
          : allPlaces.filter(
              (p) => p.category !== targetStop.category && !isSamePlace(p, targetStop),
            );

      const prevStopCategory = stopIndex > 0 ? allStopsInItinerary[stopIndex - 1].category : null;
      const nextStopCategory =
        stopIndex < allStopsInItinerary.length - 1
          ? allStopsInItinerary[stopIndex + 1].category
          : null;

      const ranked = diffPool.map((p) => {
        let penalty = 0;
        if (p.category === prevStopCategory) penalty += 40;
        if (p.category === nextStopCategory) penalty += 40;
        const dist = calculateDistanceMeters(refLat, refLng, p.latitude, p.longitude);
        return {
          place: p,
          score: -penalty - dist / 1000,
        };
      });

      ranked.sort((a, b) => b.score - a.score);
      selectedPlace = ranked[0].place;

      reasonAr = `تغيير النشاط إلى فئة مختلفة (${selectedPlace.name_ar})`;
      reasonEn = `Switched activity to a different category (${selectedPlace.name_en})`;
      break;
    }
  }

  return { place: selectedPlace, reasonAr, reasonEn };
}

/**
 * Creates a replacement ItineraryStop preserving UI order, status, and times while updating place attributes.
 */
export function createReplacementStop(
  targetStop: ItineraryStop,
  candidate: RiyadhPlace,
): ItineraryStop {
  const walkMeters =
    candidate.walking_level === 'low'
      ? 70
      : candidate.walking_level === 'medium'
      ? 160
      : 280;

  return {
    id: targetStop.id, // preserve stop ID for UI stability
    order: targetStop.order, // preserve order
    placeId: candidate.id,
    nameAr: candidate.name_ar,
    nameEn: candidate.name_en,
    category: candidate.category,
    startTime: targetStop.startTime,
    endTime: targetStop.endTime,
    durationMinutes: candidate.duration_minutes || targetStop.durationMinutes,
    isIndoor: candidate.indoor,
    crowdLevel: candidate.walking_level === 'low' ? 'low' : 'moderate',
    walkingDistanceMeters: walkMeters,
    location: {
      lat: candidate.latitude,
      lng: candidate.longitude,
      addressAr: `${candidate.name_ar}، الرياض`,
      addressEn: `${candidate.name_en}, Riyadh`,
    },
    status: targetStop.status, // preserve status
    amenities: candidate.indoor
      ? ['تكييف كامل', 'مواقف مخصصة', 'مناسب للعائلات']
      : ['جلسات خارجية', 'مواقف متوفرة', 'مناسب للعائلات'],
    prayerBuffer: targetStop.prayerBuffer,
    descriptionAr: `استبدال إلى ${candidate.name_ar} (${candidate.indoor ? 'مكان داخلي' : 'مكان خارجي'}).`,
    descriptionEn: `Replaced with ${candidate.name_en} (${candidate.indoor ? 'Indoor' : 'Outdoor'}).`,
  };
}
