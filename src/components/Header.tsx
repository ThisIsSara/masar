import React from 'react';
import { Language } from '../types';
import { t } from '../translations';
import { MapPin, Thermometer, Clock, Users, Globe, Settings, Compass } from 'lucide-react';
import { getNextPrayerHeaderLabel } from '../data/mockPrayerSchedule';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: () => void;
  onOpenSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageToggle, onOpenSetup }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & City Tag */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {lang === 'ar' ? 'مسار | Masar' : 'Masar | مسار'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-3 h-3" />
                  {lang === 'ar' ? 'الرياض' : 'Riyadh'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{t(lang, 'tagline')}</p>
            </div>
          </div>

          {/* Setup Trigger Button for Mobile */}
          <button
            onClick={onOpenSetup}
            className="sm:hidden flex items-center gap-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors font-semibold"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t(lang, 'setupTrip')}</span>
          </button>
        </div>

        {/* Live Riyadh Environmental Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>{t(lang, 'tempLabel')}</span>
          </div>
          <span className="text-slate-700 hidden xs:inline">•</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{getNextPrayerHeaderLabel(lang)}</span>
          </div>
          <span className="text-slate-700 hidden md:inline">•</span>
          <div className="flex items-center gap-1.5 text-sky-400 font-medium hidden md:flex">
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>{t(lang, 'expectedCrowdsLabel')}</span>
          </div>
        </div>

        {/* Controls: Language Toggle & Setup Trip */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ar' ? 'English (EN)' : 'عربي (AR)'}</span>
          </button>

          <button
            onClick={onOpenSetup}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{t(lang, 'setupTrip')}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
