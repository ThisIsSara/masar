import React, { useState, useEffect } from 'react';
import { Language, TripPreferences, Category, WalkingPreference } from '../types';
import { t } from '../translations';
import { timeToMinutes } from '../utils/itineraryUtils';
import { X, Calendar, Clock, SunMedium, Flame, Footprints, Users, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface TripSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  preferences: TripPreferences;
  onSavePreferences: (updated: TripPreferences) => Promise<void> | void;
  isLoading?: boolean;
}

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const TripSetupModal: React.FC<TripSetupModalProps> = ({
  isOpen,
  onClose,
  lang,
  preferences,
  onSavePreferences,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TripPreferences>(preferences);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(preferences);
      setFormError(null);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const categories: { key: Category; labelKey: keyof typeof import('../translations').translations['ar'] }[] = [
    { key: 'culture', labelKey: 'cat_culture' },
    { key: 'cafes', labelKey: 'cat_cafes' },
    { key: 'dining', labelKey: 'cat_dining' },
    { key: 'shopping', labelKey: 'cat_shopping' },
    { key: 'nature', labelKey: 'cat_nature' },
    { key: 'entertainment', labelKey: 'cat_entertainment' },
  ];

  const toggleInterest = (cat: Category) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(cat);
      const updated = exists
        ? prev.interests.filter((i) => i !== cat)
        : [...prev.interests, cat];
      return { ...prev, interests: updated };
    });
  };

  const parseDateParts = (dateStr: string) => {
    const parts = dateStr ? dateStr.split('-').map(Number) : [];
    const now = new Date();
    const year = parts[0] || now.getFullYear();
    const month = parts[1] || (now.getMonth() + 1);
    const day = parts[2] || now.getDate();
    return { year, month, day };
  };

  const currentParsedDate = parseDateParts(formData.tripDate);
  const currentYearNow = new Date().getFullYear();
  const availableYears = [currentYearNow, currentYearNow + 1];
  const monthNames = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  const maxDaysInCurrentMonth = new Date(
    currentParsedDate.year,
    currentParsedDate.month,
    0
  ).getDate();

  const validateDateAndTimes = (dateStr: string, startTime: string, endTime: string): boolean => {
    // 1. Validate Date
    const parts = dateStr.split('-').map(Number);
    const yr = parts[0];
    const mo = parts[1];
    const dy = parts[2];

    const dateObj = new Date(yr, mo - 1, dy);
    const isValidDate =
      dateObj.getFullYear() === yr &&
      dateObj.getMonth() === mo - 1 &&
      dateObj.getDate() === dy;

    if (!isValidDate) {
      setFormError(lang === 'ar' ? 'التاريخ المحدد غير صحيح.' : 'Selected date is invalid.');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(yr, mo - 1, dy);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      setFormError(
        lang === 'ar' ? 'تاريخ الرحلة لا يمكن أن يكون في الماضي.' : 'Trip date cannot be in the past.'
      );
      return false;
    }

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (checkDate > maxDate) {
      setFormError(
        lang === 'ar'
          ? 'تاريخ الرحلة لا يمكن أن يتجاوز سنة من اليوم.'
          : 'Trip date cannot exceed 1 year from today.'
      );
      return false;
    }

    // 2. Validate Time Range
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (endMins <= startMins) {
      setFormError(t(lang, 'invalidTimeError'));
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleDayChange = (newDayVal: string) => {
    const d = Number(newDayVal);
    const newDateStr = `${currentParsedDate.year}-${currentParsedDate.month
      .toString()
      .padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, tripDate: newDateStr }));
    validateDateAndTimes(newDateStr, formData.startTime, formData.endTime);
  };

  const handleMonthChange = (newMonthVal: string) => {
    const m = Number(newMonthVal);
    const maxDays = new Date(currentParsedDate.year, m, 0).getDate();
    const d = Math.min(currentParsedDate.day, maxDays);
    const newDateStr = `${currentParsedDate.year}-${m.toString().padStart(2, '0')}-${d
      .toString()
      .padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, tripDate: newDateStr }));
    validateDateAndTimes(newDateStr, formData.startTime, formData.endTime);
  };

  const handleYearChange = (newYearVal: string) => {
    const y = Number(newYearVal);
    const maxDays = new Date(y, currentParsedDate.month, 0).getDate();
    const d = Math.min(currentParsedDate.day, maxDays);
    const newDateStr = `${y}-${currentParsedDate.month.toString().padStart(2, '0')}-${d
      .toString()
      .padStart(2, '0')}`;
    setFormData((prev) => ({ ...prev, tripDate: newDateStr }));
    validateDateAndTimes(newDateStr, formData.startTime, formData.endTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDateAndTimes(formData.tripDate, formData.startTime, formData.endTime)) {
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSavePreferences(formData);
      onClose();
    } catch (err: any) {
      setFormError(
        err?.message ||
          (lang === 'ar'
            ? 'حدث خطأ أثناء توليد المسار بالذكاء الاصطناعي.'
            : 'An error occurred while generating the plan with Gemini AI.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{t(lang, 'setupTitle')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t(lang, 'setupSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="bg-amber-500/10 border-y border-amber-500/20 px-5 py-3 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'مؤشر طقس الرياض اليوم: 42° م (حار نهاراً) | المغرب 18:10'
                : 'Today’s Riyadh Index: 42°C High Heat | Maghrib 18:10'}
            </span>
          </div>
          <span className="font-semibold bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">
            {lang === 'ar' ? 'الرياض' : 'Riyadh'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Validation Error Banner */}
          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Trip Date & Time */}
          <div className="space-y-4">
            {/* 3-Dropdown Date Selector (Day / Month / Year) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t(lang, 'tripDate')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Day Select */}
                <div>
                  <select
                    id="tripDateDay"
                    name="tripDateDay"
                    value={currentParsedDate.day}
                    onChange={(e) => handleDayChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                  >
                    {Array.from({ length: maxDaysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                      <option key={`day-${d}`} value={d} className="bg-slate-900 text-slate-100">
                        {d} {lang === 'ar' ? 'اليوم' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Select */}
                <div>
                  <select
                    id="tripDateMonth"
                    name="tripDateMonth"
                    value={currentParsedDate.month}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={`month-${idx + 1}`} value={idx + 1} className="bg-slate-900 text-slate-100">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Select */}
                <div>
                  <select
                    id="tripDateYear"
                    name="tripDateYear"
                    value={currentParsedDate.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                  >
                    {availableYears.map((yr) => (
                      <option key={`year-${yr}`} value={yr} className="bg-slate-900 text-slate-100">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Start & End Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t(lang, 'startTime')}</span>
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setFormData((prev) => ({ ...prev, startTime: newStart }));
                    validateDateAndTimes(formData.tripDate, newStart, formData.endTime);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                  required
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                    const m = i % 2 === 0 ? '00' : '30';
                    const timeVal = `${h}:${m}`;
                    return (
                      <option key={`start-${timeVal}`} value={timeVal} className="bg-slate-900 text-slate-100">
                        {timeVal}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t(lang, 'endTime')}</span>
                </label>
                <select
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setFormData((prev) => ({ ...prev, endTime: newEnd }));
                    validateDateAndTimes(formData.tripDate, formData.startTime, newEnd);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                  required
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                    const m = i % 2 === 0 ? '00' : '30';
                    const timeVal = `${h}:${m}`;
                    return (
                      <option key={`end-${timeVal}`} value={timeVal} className="bg-slate-900 text-slate-100">
                        {timeVal}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Heat Mitigation Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <SunMedium className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-200 block">
                  {t(lang, 'avoidHeatToggle')}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {lang === 'ar'
                    ? 'يحوّل المحطات النهارية القادمة إلى أماكن مغلقة ومكيفة تلقائياً'
                    : 'Automatically prioritizes air-conditioned indoor stops during sun peak hours'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.avoidHeat}
                onChange={(e) => setFormData({ ...formData, avoidHeat: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Interests Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2.5">
              {t(lang, 'interestsTitle')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map(({ key, labelKey }) => {
                const isSelected = formData.interests.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInterest(key)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all text-start ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{t(lang, labelKey)}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Walking Preference Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(lang, 'walkingPrefTitle')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(['low', 'moderate', 'high'] as WalkingPreference[]).map((pref) => {
                const active = formData.walkingPreference === pref;
                const label =
                  pref === 'low'
                    ? t(lang, 'walkingLow')
                    : pref === 'moderate'
                    ? t(lang, 'walkingModerate')
                    : t(lang, 'walkingHigh');
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, walkingPreference: pref })}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility & Family Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(lang, 'accessibilityTitle')}</span>
            </label>
            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accessibility.hasChildren}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessibility: { ...formData.accessibility, hasChildren: e.target.checked },
                    })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>{t(lang, 'hasChildren')}</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accessibility.hasElderly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessibility: { ...formData.accessibility, hasElderly: e.target.checked },
                    })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>{t(lang, 'hasElderly')}</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessibility: {
                        ...formData.accessibility,
                        wheelchairRequired: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>{t(lang, 'wheelchairRequired')}</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {lang === 'ar'
                      ? 'جاري توليد المسار بالذكاء الاصطناعي...'
                      : 'Generating Smart Plan with Gemini AI...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t(lang, 'generatePlan')}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
