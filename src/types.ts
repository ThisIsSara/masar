export type Language = 'ar' | 'en';

export type WalkingPreference = 'low' | 'moderate' | 'high';

export type CrowdLevel = 'low' | 'moderate' | 'high';

export type StopStatus = 'completed' | 'current' | 'upcoming';

export type Category =
  | 'culture'
  | 'cafes'
  | 'dining'
  | 'shopping'
  | 'nature'
  | 'entertainment'
  | 'landmark'
  | 'heritage'
  | 'food';

export type ReplaceFilterPreset = 'similar' | 'closer' | 'indoor' | 'less_crowded' | 'different_activity';

export interface AccessibilityOptions {
  hasChildren: boolean;
  hasElderly: boolean;
  wheelchairRequired: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  addressAr: string;
  addressEn: string;
  nameAr?: string;
  nameEn?: string;
}

export interface PrayerBuffer {
  prayerNameAr: string;
  prayerNameEn: string;
  time: string;
  nearestMosqueDistanceMeters: number;
}

export interface RiyadhPlace {
  id: number;
  name_ar: string;
  name_en: string;
  category: Category;
  tags: string[];
  indoor: boolean;
  walking_level: 'low' | 'medium' | 'high';
  duration_minutes: number;
  best_time: string[];
  suitable_for_children: boolean;
  accessible: boolean;
  price_level: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
}

export interface ItineraryStop {
  id: string;
  order: number;
  nameAr: string;
  nameEn: string;
  category: Category;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isIndoor: boolean;
  crowdLevel: CrowdLevel;
  walkingDistanceMeters: number;
  location: Location;
  status: StopStatus;
  amenities: string[];
  prayerBuffer?: PrayerBuffer;
  descriptionAr: string;
  descriptionEn: string;
  placeId?: number;
}

export interface Itinerary {
  id: string;
  tripTitleAr: string;
  tripTitleEn: string;
  totalDurationMinutes: number;
  summaryAr: string;
  summaryEn: string;
  stops: ItineraryStop[];
}

export interface TripPreferences {
  city: 'Riyadh';
  tripDate: string;
  startTime: string;
  endTime: string;
  avoidHeat: boolean;
  interests: Category[];
  walkingPreference: WalkingPreference;
  accessibility: AccessibilityOptions;
  currentLocation: Location;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  textAr: string;
  textEn: string;
  timestamp: string;
  actionTakenAr?: string;
  actionTakenEn?: string;
}
