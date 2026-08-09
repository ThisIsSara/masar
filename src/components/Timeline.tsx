import React, { useEffect } from 'react';
import { Language, ItineraryStop } from '../types';
import { t } from '../translations';
import {
  Clock,
  MapPin,
  SunMedium,
  Building2,
  Footprints,
  Sparkles,
  CheckCircle2,
  Circle,
  RefreshCw,
  Info,
  ChevronRight,
  ChevronLeft,
  Flame,
} from 'lucide-react';

interface TimelineProps {
  stops: ItineraryStop[];
  activeStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onOpenDetails: (stop: ItineraryStop) => void;
  onOpenReplace: (stop: ItineraryStop) => void;
  onStatusChange: (stopId: string, status: 'completed' | 'current' | 'upcoming') => void;
  lang: Language;
}

export const Timeline: React.FC<TimelineProps> = ({
  stops,
  activeStopId,
  onSelectStop,
  onOpenDetails,
  onOpenReplace,
  onStatusChange,
  lang,
}) => {
  useEffect(() => {
    if (activeStopId) {
      const cardEl = document.getElementById(`stop-card-${activeStopId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeStopId]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'culture':
        return t(lang, 'cat_culture');
      case 'cafes':
        return t(lang, 'cat_cafes');
      case 'dining':
        return t(lang, 'cat_dining');
      case 'shopping':
        return t(lang, 'cat_shopping');
      case 'nature':
        return t(lang, 'cat_nature');
      case 'entertainment':
        return t(lang, 'cat_entertainment');
      case 'landmark':
        return t(lang, 'cat_landmark');
      case 'heritage':
        return t(lang, 'cat_heritage');
      case 'food':
        return t(lang, 'cat_food');
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stream Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ar' ? 'الجدول الزمني والمحطات' : 'Itinerary Timeline'}</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {stops.length} {lang === 'ar' ? 'محطات' : 'stops'}
        </span>
      </div>

      {/* Timeline Stream Items */}
      <div className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:start-4 sm:before:start-5 before:w-0.5 before:bg-slate-800">
        {stops.map((stop, idx) => {
          const isSelected = stop.id === activeStopId;
          const isCurrent = stop.status === 'current';
          const isCompleted = stop.status === 'completed';

          return (
            <div
              key={stop.id}
              id={`stop-card-${stop.id}`}
              onClick={() => onSelectStop(stop.id)}
              className={`relative ps-10 sm:ps-12 group transition-all cursor-pointer ${
                isSelected ? 'scale-[1.01]' : ''
              }`}
            >
              {/* Timeline Node Bullet */}
              <div
                className={`absolute start-1 sm:start-2 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all z-10 ${
                  isCompleted
                    ? 'bg-slate-700 text-slate-300 border border-slate-600'
                    : isCurrent
                    ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 shadow-amber-500/30'
                    : 'bg-slate-900 text-sky-400 border-2 border-sky-500'
                } ${isSelected ? 'ring-2 ring-amber-500/60 ring-offset-2 ring-offset-slate-950' : ''}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{stop.order}</span>
                )}
              </div>

              {/* Stop Card */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                    : isCurrent
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-xl shadow-amber-500/5'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Category + Time + Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {getCategoryLabel(stop.category)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>
                        {stop.startTime} - {stop.endTime} ({stop.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'min'})
                      </span>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {t(lang, 'stopCompleted')}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                        {t(lang, 'stopCurrent')}
                      </span>
                    )}
                    {stop.status === 'upcoming' && (
                      <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                        {t(lang, 'stopUpcoming')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Venue Name & Description */}
                <h4 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                  {lang === 'ar' ? stop.nameAr : stop.nameEn}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {lang === 'ar' ? stop.descriptionAr : stop.descriptionEn}
                </p>

                {/* Specs Pill Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                  {/* Indoor / Outdoor Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                      stop.isIndoor
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {stop.isIndoor ? (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{t(lang, 'indoor')}</span>
                      </>
                    ) : (
                      <>
                        <SunMedium className="w-3.5 h-3.5" />
                        <span>{t(lang, 'outdoor')}</span>
                      </>
                    )}
                  </div>

                  {/* Walking Distance */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                    <Footprints className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {stop.walkingDistanceMeters} {t(lang, 'meters')}
                    </span>
                  </div>

                  {/* Prayer Buffer Alert if present */}
                  {stop.prayerBuffer && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        {t(lang, 'prayerBufferAlert')}:{' '}
                        {lang === 'ar' ? stop.prayerBuffer.prayerNameAr : stop.prayerBuffer.prayerNameEn} (
                        {stop.prayerBuffer.time})
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(stop);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t(lang, 'viewDetails')}</span>
                    </button>

                    {/* Replace Stop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReplace(stop);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t(lang, 'replaceStop')}</span>
                    </button>
                  </div>

                  {/* Status Toggle Helpers */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {!isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(stop.id, 'completed');
                        }}
                        className="text-[11px] font-medium text-slate-400 hover:text-white underline decoration-slate-600"
                      >
                        {t(lang, 'markAsCompleted')}
                      </button>
                    )}
                    {!isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(stop.id, 'current');
                        }}
                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 underline decoration-amber-500/40"
                      >
                        {t(lang, 'markAsCurrent')}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
