import React from 'react';
import { Language, ItineraryStop } from '../types';
import { t } from '../translations';
import {
  X,
  MapPin,
  Clock,
  Building2,
  SunMedium,
  Footprints,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Compass,
} from 'lucide-react';

interface StopDetailsModalProps {
  stop: ItineraryStop | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerReplace: (stop: ItineraryStop) => void;
  lang: Language;
}

export const StopDetailsModal: React.FC<StopDetailsModalProps> = ({
  stop,
  isOpen,
  onClose,
  onTriggerReplace,
  lang,
}) => {
  if (!isOpen || !stop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
              #{stop.order}
            </span>
            <h3 className="text-lg font-bold text-white">
              {lang === 'ar' ? stop.nameAr : stop.nameEn}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Description */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-sm text-slate-200 leading-relaxed">
              {lang === 'ar' ? stop.descriptionAr : stop.descriptionEn}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">{t(lang, 'duration')}</span>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {stop.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'min'} ({stop.startTime} - {stop.endTime})
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {lang === 'ar' ? 'البيئة والحرارة' : 'Environment & Heat'}
              </span>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                {stop.isIndoor ? (
                  <>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{t(lang, 'indoor')}</span>
                  </>
                ) : (
                  <>
                    <SunMedium className="w-4 h-4 text-amber-400" />
                    <span>{t(lang, 'outdoor')}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Location & Address */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(lang, 'locationAddress')}</span>
            </span>
            <p className="text-xs text-slate-200 font-medium">
              {lang === 'ar' ? stop.location.addressAr : stop.location.addressEn}
            </p>
            <div className="text-[11px] text-sky-400 flex items-center gap-1 pt-1">
              <Footprints className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar'
                  ? `مسافة المشي الميداني المقدرة: ${stop.walkingDistanceMeters} متر`
                  : `Estimated field walking distance: ${stop.walkingDistanceMeters}m`}
              </span>
            </div>
          </div>

          {/* Prayer Buffer Details if present */}
          {stop.prayerBuffer && (
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>
                  {lang === 'ar' ? 'مساحة زمنية مخصصة للصلاة' : 'Scheduled Prayer Buffer'}
                </span>
              </div>
              <p className="text-xs text-purple-200">
                {lang === 'ar'
                  ? `تتضمن هذه المحطة فاصلاً مخصصاً لصلاة ${stop.prayerBuffer.prayerNameAr} الساعة ${stop.prayerBuffer.time} مع وجود مسجد على بُعد ${stop.prayerBuffer.nearestMosqueDistanceMeters} متر.`
                  : `Includes a dedicated buffer for ${stop.prayerBuffer.prayerNameEn} prayer at ${stop.prayerBuffer.time} with a mosque ${stop.prayerBuffer.nearestMosqueDistanceMeters}m away.`}
              </p>
            </div>
          )}

          {/* Amenities & Accessibility */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(lang, 'amenities')}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {stop.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-950 text-slate-300 px-3 py-1 rounded-lg border border-slate-800"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {t(lang, 'close')}
          </button>

          <button
            onClick={() => {
              onClose();
              onTriggerReplace(stop);
            }}
            className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t(lang, 'replaceStop')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
