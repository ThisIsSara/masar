import React, { useState } from 'react';
import { Language, ItineraryStop } from '../types';
import { t } from '../translations';
import { Check, Navigation, MapPin, ZoomIn, ZoomOut, Compass, Sparkles, RotateCcw } from 'lucide-react';

interface InteractiveMapProps {
  stops: ItineraryStop[];
  activeStopId: string | null;
  onSelectStop: (stopId: string) => void;
  lang: Language;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stops,
  activeStopId,
  onSelectStop,
  lang,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.2, +(prev + 0.2).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.7, +(prev - 0.2).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1);

  // Map dimensions for SVG overlay simulation
  const svgWidth = 800;
  const svgHeight = 450;

  // Normalized coordinate projection for Riyadh mock stops onto SVG viewBox
  // Riyadh center around lat: 24.68, lng: 46.68
  const getCoordinates = (lat: number, lng: number) => {
    // Map bounding box for central Riyadh
    const minLat = 24.62;
    const maxLat = 24.78;
    const minLng = 46.56;
    const maxLng = 46.73;

    const x = ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 160) + 80;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * (svgHeight - 160) + 80;

    return { x, y };
  };

  const points = stops.map((stop) => {
    const coords = getCoordinates(stop.location.lat, stop.location.lng);
    return { ...coords, stop };
  });

  // Polyline points string
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
      
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 start-3 end-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 pointer-events-auto shadow-lg">
          <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>{t(lang, 'adventureMap')}</span>
        </div>

        {/* Status Legend Pills */}
        <div className="hidden xs:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-[11px] font-medium pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span>{t(lang, 'stopCompleted')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{t(lang, 'stopCurrent')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>{t(lang, 'stopUpcoming')}</span>
          </div>
        </div>
      </div>

      {/* Simulated Riyadh Dark Map Canvas */}
      <div className="relative w-full h-full bg-[#0d1321] overflow-hidden">
        {/* Background Grid & Styled Riyadh Roads Simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Riyadh Highway Overlays & Pins Group */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full absolute inset-0 object-cover"
        >
          <g style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s ease-out' }}>
            {/* Simulated King Fahd Road & Northern Ring Road */}
            <line x1="0" y1="180" x2="800" y2="180" stroke="#1e293b" strokeWidth="12" />
            <line x1="380" y1="0" x2="380" y2="450" stroke="#1e293b" strokeWidth="12" />

            {/* Route Connecting Polyline */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
              className="animate-pulse opacity-80"
            />

            {/* Connected Route Dots */}
            {points.map((p) => {
              const isSelected = p.stop.id === activeStopId;
              const isCurrent = p.stop.status === 'current';
              const isCompleted = p.stop.status === 'completed';

              return (
                <g
                  key={p.stop.id}
                  onClick={() => onSelectStop(p.stop.id)}
                  className="cursor-pointer group pointer-events-auto"
                >
                  {/* Glowing Aura for Current / Selected Stop */}
                  {(isCurrent || isSelected) && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '28' : '24'}
                      fill="#f59e0b"
                      fillOpacity={isSelected ? '0.3' : '0.2'}
                      className="animate-ping"
                    />
                  )}

                  {/* Base Pin Circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected || isCurrent ? '18' : '14'}
                    fill={
                      isCompleted
                        ? '#475569'
                        : isCurrent
                        ? '#f59e0b'
                        : isSelected
                        ? '#38bdf8'
                        : '#0284c7'
                    }
                    stroke={isSelected ? '#f59e0b' : '#0f172a'}
                    strokeWidth={isSelected ? '4' : '3'}
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Pin Icon / Number */}
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {isCompleted ? '✓' : p.stop.order}
                  </text>

                  {/* Venue Label Overlay */}
                  <foreignObject
                    x={p.x - 75}
                    y={p.y + 22}
                    width="150"
                    height="40"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-lg text-center line-clamp-1 whitespace-nowrap transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                            : isSelected
                            ? 'bg-sky-400 text-slate-950 ring-2 ring-sky-200 scale-105'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {lang === 'ar' ? p.stop.nameAr : p.stop.nameEn}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Riyadh Landmark Badges on Map */}
        <div className="absolute bottom-3 start-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {lang === 'ar'
              ? 'تغطية مسار الرياض: وسط الرياض • الدرعية • العليا'
              : 'Riyadh Route Coverage: Central • Diriyah • Olaya'}
          </span>
        </div>

        {/* Functional Zoom Controls Overlay */}
        <div className="absolute bottom-3 end-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.2}
            title={lang === 'ar' ? 'تكبير الخريطة' : 'Zoom In'}
            className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.7}
            title={lang === 'ar' ? 'تصغير الخريطة' : 'Zoom Out'}
            className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {zoomLevel !== 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              title={lang === 'ar' ? 'إعادة ضبط' : 'Reset Zoom'}
              className="w-8 h-8 rounded-lg bg-slate-900/95 border border-amber-500/40 text-amber-400 hover:text-amber-300 flex items-center justify-center shadow-md cursor-pointer text-[10px] font-bold transition-colors"
            >
              1x
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
