import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Language, ItineraryStop } from '../types';
import { t } from '../translations';
import {
  Check,
  Navigation,
  ZoomIn,
  ZoomOut,
  Compass,
  Sparkles,
  RotateCcw,
  Car,
  Footprints,
} from 'lucide-react';

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: 'weekly',
});

interface InteractiveMapProps {
  stops: ItineraryStop[];
  activeStopId: string | null;
  onSelectStop: (stopId: string) => void;
  lang: Language;
}

type TravelMode = 'DRIVING' | 'WALKING';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stops,
  activeStopId,
  onSelectStop,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMap = async () => {
      try {
        const { Map } = (await importLibrary('maps')) as google.maps.MapsLibrary;
        await importLibrary('marker');
        await importLibrary('routes');
        if (!mapContainerRef.current || cancelled) return;

        const map = new Map(mapContainerRef.current, {
          center: { lat: 24.7136, lng: 46.6753 },
          zoom: 12,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });

        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Google Maps failed to load:', error);
      }
    };

    loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const updateMap = async () => {
      try {
        await importLibrary('marker');

        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach((marker) => {
          marker.map = null;
        });

        markersRef.current = [];

       routePolylinesRef.current.forEach((polyline) => {
  polyline.setMap(null);
});

routePolylinesRef.current = [];

        if (stops.length === 0) return;

        const bounds = new google.maps.LatLngBounds();

        stops.forEach((stop) => {
          bounds.extend({
            lat: stop.location.lat,
            lng: stop.location.lng,
          });

          const markerElement = document.createElement('div');

          const isActive = stop.id === activeStopId;
          const isCompleted = stop.status === 'completed';
          const isCurrent = stop.status === 'current';

          markerElement.style.width = isActive || isCurrent ? '42px' : '36px';
          markerElement.style.height = isActive || isCurrent ? '42px' : '36px';
          markerElement.style.borderRadius = '50%';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';
          markerElement.style.fontWeight = '800';
          markerElement.style.fontSize = '14px';
          markerElement.style.cursor = 'pointer';
          markerElement.style.border = isActive
            ? '4px solid #f59e0b'
            : '3px solid #0f172a';

          markerElement.style.background =
            isCompleted
              ? '#475569'
              : isCurrent
                ? '#f59e0b'
                : isActive
                  ? '#38bdf8'
                  : '#0284c7';

          markerElement.style.color = '#0f172a';
          markerElement.style.boxShadow =
            isActive || isCurrent
              ? '0 0 0 8px rgba(245,158,11,0.20), 0 6px 18px rgba(0,0,0,0.35)'
              : '0 4px 12px rgba(0,0,0,0.35)';

          markerElement.textContent = isCompleted
            ? '✓'
            : String(stop.order);

          const marker =
            new google.maps.marker.AdvancedMarkerElement({
              map,
              position: {
                lat: stop.location.lat,
                lng: stop.location.lng,
              },
              title: lang === 'ar' ? stop.nameAr : stop.nameEn,
              content: markerElement,
            });

          marker.addListener('click', () => {
            onSelectStop(stop.id);
          });

          markersRef.current.push(marker);
        });

if (stops.length > 1) {
  const { Route } =
    (await importLibrary('routes')) as google.maps.RoutesLibrary;

  const origin = {
    lat: stops[0].location.lat,
    lng: stops[0].location.lng,
  };

  const destination = {
    lat: stops[stops.length - 1].location.lat,
    lng: stops[stops.length - 1].location.lng,
  };

  const intermediates = stops.slice(1, -1).map((stop) => ({
    lat: stop.location.lat,
    lng: stop.location.lng,
  }));

  try {
    const request: google.maps.routes.ComputeRoutesRequest = {
      origin,
      destination,
      intermediates,
travelMode: travelMode === 'DRIVING' ? 'DRIVING' : 'WALKING',      optimizeWaypointOrder: false,
      units: google.maps.UnitSystem.METRIC,
      language: lang === 'ar' ? 'ar' : 'en',
      fields: [
        'distanceMeters',
        'durationMillis',
        'legs',
        'path',
      ],
    };

    const { routes } = await Route.computeRoutes(request);

    if (!routes || routes.length === 0) {
      console.error('Google Routes returned no routes');
      setRouteDistance('');
      setRouteDuration('');
      return;
    }

    const route = routes[0];

    // Draw the real Google route on the map
    const polylines = route.createPolylines();

    polylines.forEach((polyline) => {
      polyline.setOptions({
        strokeColor: '#f59e0b',
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });

      polyline.setMap(map);
    });

    routePolylinesRef.current = polylines;

    // Total distance
    const totalMeters = route.distanceMeters ?? 0;

    // Total duration
    const totalSeconds = Math.round(
      (route.durationMillis ?? 0) / 1000,
    );

    const distanceKm = totalMeters / 1000;
    const minutes = Math.round(totalSeconds / 60);

    setRouteDistance(
      distanceKm < 1
        ? `${Math.round(totalMeters)} m`
        : `${distanceKm.toFixed(1)} km`,
    );

    setRouteDuration(
      minutes < 60
        ? `${minutes} min`
        : `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
    );
  } catch (error) {
    console.error('Google Routes failed:', error);
    setRouteDistance('');
    setRouteDuration('');
  }
}

        if (stops.length > 1) {
          map.fitBounds(bounds, 70);
        } else {
          map.setCenter({
            lat: stops[0].location.lat,
            lng: stops[0].location.lng,
          });
          map.setZoom(14);
        }
      } catch (error) {
        console.error('Failed to update Google Maps:', error);
      }
    };

    updateMap();
  }, [mapReady, stops, activeStopId, travelMode, lang, onSelectStop]);

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map) return;

    const zoom = map.getZoom() ?? 12;
    map.setZoom(Math.min(20, zoom + 1));
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map) return;

    const zoom = map.getZoom() ?? 12;
    map.setZoom(Math.max(3, zoom - 1));
  };

  const handleResetMap = () => {
    const map = mapRef.current;
    if (!map || stops.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    stops.forEach((stop) => {
      bounds.extend({
        lat: stop.location.lat,
        lng: stop.location.lng,
      });
    });

    map.fitBounds(bounds, 70);
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top controls */}
      <div className="absolute top-3 start-3 end-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>{t(lang, 'adventureMap')}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => setTravelMode('DRIVING')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
              travelMode === 'DRIVING'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'سيارة' : 'Driving'}
          </button>

          <button
            type="button"
            onClick={() => setTravelMode('WALKING')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
              travelMode === 'WALKING'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'مشي' : 'Walking'}
          </button>
        </div>
      </div>

      {/* Google Map */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Route information */}
      {(routeDistance || routeDuration) && (
        <div className="absolute bottom-3 start-3 z-20 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 text-xs">
            <div>
              <div className="text-slate-500">
                {lang === 'ar' ? 'المسافة' : 'Distance'}
              </div>
              <div className="font-bold text-slate-200">
                {routeDistance}
              </div>
            </div>

            <div className="w-px h-7 bg-slate-700" />

            <div>
              <div className="text-slate-500">
                {lang === 'ar' ? 'المدة' : 'Duration'}
              </div>
              <div className="font-bold text-slate-200">
                {routeDuration}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-3 end-3 flex flex-col gap-1.5 z-20">
        <button
          type="button"
          onClick={handleZoomIn}
          title={lang === 'ar' ? 'تكبير الخريطة' : 'Zoom In'}
          className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-md"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title={lang === 'ar' ? 'تصغير الخريطة' : 'Zoom Out'}
          className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-md"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetMap}
          title={lang === 'ar' ? 'إعادة ضبط الخريطة' : 'Reset Map'}
          className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Loading state */}
      {!mapReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Navigation className="w-4 h-4 animate-pulse text-amber-400" />
            {lang === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </div>
        </div>
      )}
    </div>
  );
};