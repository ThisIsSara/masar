import React, { useState } from 'react';
import { Language, ItineraryStop, ReplaceFilterPreset } from '../types';
import { t } from '../translations';
import {
  findReplacementPlaceCandidate,
  createReplacementStop,
} from '../utils/replaceUtils';
import {
  X,
  RefreshCw,
  Compass,
  MapPin,
  Building2,
  Users,
  Footprints,
  Check,
  ArrowRightLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ReplaceStopModalProps {
  targetStop: ItineraryStop | null;
  allStopsInItinerary?: ItineraryStop[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwap: (oldStopId: string, newStop: ItineraryStop) => void;
  lang: Language;
}

export const ReplaceStopModal: React.FC<ReplaceStopModalProps> = ({
  targetStop,
  allStopsInItinerary = [],
  isOpen,
  onClose,
  onConfirmSwap,
  lang,
}) => {
  if (!isOpen || !targetStop) return null;

  const [activePreset, setActivePreset] = useState<ReplaceFilterPreset>('similar');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const presets: {
    preset: ReplaceFilterPreset;
    titleKey: keyof typeof import('../translations').translations['ar'];
    descKey: keyof typeof import('../translations').translations['ar'];
  }[] = [
    { preset: 'similar', titleKey: 'preset_similar', descKey: 'preset_similar_desc' },
    { preset: 'closer', titleKey: 'preset_closer', descKey: 'preset_closer_desc' },
    { preset: 'indoor', titleKey: 'preset_indoor', descKey: 'preset_indoor_desc' },
    { preset: 'less_crowded', titleKey: 'preset_less_crowded', descKey: 'preset_less_crowded_desc' },
    {
      preset: 'different_activity',
      titleKey: 'preset_different_activity',
      descKey: 'preset_different_activity_desc',
    },
  ];

  const candidateResult = findReplacementPlaceCandidate(
    targetStop,
    activePreset,
    allStopsInItinerary,
  );

  const suggestedAlternative = createReplacementStop(targetStop, candidateResult.place);

  const handleSelectPreset = (preset: ReplaceFilterPreset) => {
    setIsCalculating(true);
    setActivePreset(preset);
    setTimeout(() => {
      setIsCalculating(false);
    }, 150);
  };

  const handleSwap = () => {
    onConfirmSwap(targetStop.id, suggestedAlternative);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <span>{t(lang, 'replaceTitle')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ar'
                ? `استبدال المحطة الحالية: ${targetStop.nameAr}`
                : `Replacing current stop: ${targetStop.nameEn}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 5 Preset Filters Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2.5">
              {t(lang, 'replaceSubtitle')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {presets.map(({ preset, titleKey, descKey }) => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isActive ? 'text-amber-400' : ''}`}>
                        {t(lang, titleKey)}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {t(lang, descKey)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Cards: Current vs Alternative */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'معاينة المقارنة البديلة' : 'Alternative Comparison Preview'}</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Old Stop (Current) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 opacity-80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'المحطة السابقة (الحالية)' : 'Current Stop'}
                </span>
                <h4 className="text-sm font-bold text-slate-300 mb-2">
                  {lang === 'ar' ? targetStop.nameAr : targetStop.nameEn}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{targetStop.walkingDistanceMeters} {t(lang, 'meters')}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{targetStop.isIndoor ? t(lang, 'indoor') : t(lang, 'outdoor')}</span>
                  </p>
                </div>
              </div>

              {/* New Suggested Alternative */}
              <div className="p-4 rounded-xl border-2 border-amber-500/60 bg-amber-500/5 shadow-lg relative">
                <span className="absolute -top-2.5 start-3 text-[10px] font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full uppercase">
                  {lang === 'ar' ? 'البديل الموصى به' : 'Recommended Swap'}
                </span>
                <h4 className="text-sm font-bold text-amber-300 mt-1 mb-2">
                  {lang === 'ar' ? suggestedAlternative.nameAr : suggestedAlternative.nameEn}
                </h4>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {lang === 'ar'
                    ? suggestedAlternative.descriptionAr
                    : suggestedAlternative.descriptionEn}
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{suggestedAlternative.walkingDistanceMeters} {t(lang, 'meters')}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-sky-300">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{suggestedAlternative.isIndoor ? t(lang, 'indoor') : t(lang, 'outdoor')}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {t(lang, 'cancel')}
          </button>

          <button
            onClick={handleSwap}
            className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t(lang, 'confirmSwap')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
