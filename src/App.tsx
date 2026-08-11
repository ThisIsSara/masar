import React, { useState, useEffect } from 'react';
import {
  Language,
  TripPreferences,
  Itinerary,
  ItineraryStop,
  AssistantMessage,
} from './types';
import { t } from './translations';
import { INITIAL_MOCK_ITINERARY, REPLACE_OPTIONS_DATABASE } from './mockData';
import { recalculateItineraryTimes } from './utils/itineraryUtils';
import { mapGeminiResponseToItinerary } from './utils/itineraryMapper';
import { Header } from './components/Header';
import { TripSetupModal } from './components/TripSetupModal';
import { InteractiveMap } from './components/InteractiveMap';
import { Timeline } from './components/Timeline';
import { StopDetailsModal } from './components/StopDetailsModal';
import { ReplaceStopModal } from './components/ReplaceStopModal';
import { TripAssistantDrawer } from './components/TripAssistantDrawer';
import { Bot, Sparkles, MessageSquare, Settings, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';

// Helper to generate local device date in YYYY-MM-DD format
function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [lang, setLang] = useState<Language>('ar');

  // Sync document direction and lang attributes for RTL/LTR compliance
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Initial Trip Preferences
  const [preferences, setPreferences] = useState<TripPreferences>(() => ({
    city: 'Riyadh',
    tripDate: getTodayLocalDateString(),
    startTime: '16:00',
    endTime: '22:00',
    avoidHeat: true,
    interests: ['culture', 'cafes', 'dining'],
    walkingPreference: 'moderate',
    accessibility: {
      hasChildren: true,
      hasElderly: false,
      wheelchairRequired: false,
    },
    currentLocation: {
      lat: 24.7136,
      lng: 46.6753,
      addressAr: 'وسط الرياض',
      addressEn: 'Central Riyadh',
    },
  }));

  // Active Itinerary State
  const [itinerary, setItinerary] = useState<Itinerary>(() =>
    recalculateItineraryTimes(INITIAL_MOCK_ITINERARY, '16:00', '22:00')
  );
  const [activeStopId, setActiveStopId] = useState<string | null>('stop-2');

  // UI Modals & Drawers
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isStopDetailsOpen, setIsStopDetailsOpen] = useState<boolean>(false);
  const [selectedStopDetails, setSelectedStopDetails] = useState<ItineraryStop | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState<boolean>(false);
  const [replaceTargetStop, setReplaceTargetStop] = useState<ItineraryStop | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Assistant Chat Messages Log
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      textAr: t('ar', 'assistantDefaultGreeting'),
      textEn: t('en', 'assistantDefaultGreeting'),
      timestamp: '16:00',
    },
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);

  // Language Toggle Handler
  const handleLanguageToggle = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Plan Loading State
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Save Preferences & Generate Real Gemini Itinerary
  const handleSavePreferences = async (updated: TripPreferences) => {
    setPreferences(updated);
    setIsGeneratingPlan(true);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            (lang === 'ar'
              ? 'فشل توليد الخطة بالذكاء الاصطناعي.'
              : 'Failed to generate itinerary with Gemini.')
        );
      }

      const newItinerary = mapGeminiResponseToItinerary(data.itinerary);
      setItinerary(newItinerary);

      if (newItinerary.stops.length > 0) {
        setActiveStopId(newItinerary.stops[0].id);
      }

      showToast(
        lang === 'ar'
          ? 'تم توليد خطة الرحلة الذكية بنجاح عبر Gemini!'
          : 'Smart itinerary generated successfully with Gemini!'
      );
    } catch (err: any) {
      console.error('Gemini itinerary generation error:', err);
      // Requirement 3: A failed Gemini request must NOT silently reuse/recalculate the old itinerary
      // Leave current itinerary unchanged and throw error to keep setup modal open and show error
      throw new Error(
        err?.message ||
          (lang === 'ar'
            ? 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي (Gemini).'
            : 'Error communicating with Gemini AI.')
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Status Change for Stop (Completed / Current / Upcoming)
  const handleStatusChange = (stopId: string, newStatus: 'completed' | 'current' | 'upcoming') => {
    setItinerary((prev) => {
      const updatedStops = prev.stops.map((stop) => {
        if (stop.id === stopId) {
          return { ...stop, status: newStatus };
        }
        if (newStatus === 'current' && stop.status === 'current') {
          return { ...stop, status: 'upcoming' as const };
        }
        return stop;
      });
      return { ...prev, stops: updatedStops };
    });
    setActiveStopId(stopId);
  };

  // Confirm Swap Stop from Replace Modal
  const handleConfirmSwap = (oldStopId: string, newStop: ItineraryStop) => {
    setItinerary((prev) => {
      const updatedStops = prev.stops.map((stop) => {
        if (stop.id === oldStopId) {
          return {
            ...newStop,
            id: oldStopId, // preserve order id
            order: stop.order,
            status: stop.status,
          };
        }
        return stop;
      });
      return { ...prev, stops: updatedStops };
    });
    showToast(t(lang, 'stopSwappedToast'));
  };

  // Assistant Command Interpreter (Server-Side Gemini Function Calling)
  const handleAssistantCommand = async (commandKeyOrPrompt: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let displayUserText = commandKeyOrPrompt;
    if (commandKeyOrPrompt === 'cmd_tired') displayUserText = t(lang, 'cmd_tired');
    else if (commandKeyOrPrompt === 'cmd_heat') displayUserText = t(lang, 'cmd_heat');
    else if (commandKeyOrPrompt === 'cmd_coffee') displayUserText = t(lang, 'cmd_coffee');
    else if (commandKeyOrPrompt === 'cmd_reduce_walk') displayUserText = t(lang, 'cmd_reduce_walk');
    else if (commandKeyOrPrompt === 'cmd_skip') displayUserText = t(lang, 'cmd_skip');

    const newMsgUser: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textAr: displayUserText,
      textEn: displayUserText,
      timestamp,
    };

    setAssistantMessages((prev) => [...prev, newMsgUser]);
    setIsAssistantLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandKeyOrPrompt,
          lang,
          itinerary,
          activeStopId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            (lang === 'ar'
              ? 'حدث خطأ أثناء معالجة طلب المساعد.'
              : 'Failed to process assistant request.'),
        );
      }

      if (data.updatedItinerary) {
        setItinerary(data.updatedItinerary);
      }

      const newMsgBot: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        textAr: data.messageAr,
        textEn: data.messageEn,
        timestamp,
        actionTakenAr: data.actionTakenAr,
        actionTakenEn: data.actionTakenEn,
      };

      setAssistantMessages((prev) => [...prev, newMsgBot]);
      showToast(lang === 'ar' ? data.messageAr : data.messageEn);
    } catch (err: any) {
      console.error('Assistant API error:', err);
      const errorBotMsg: AssistantMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        textAr: err?.message || 'تعذر الاتصال بالمساعد الذكي، تمت المحافظة على المسار الحالي.',
        textEn: err?.message || 'Failed to communicate with assistant. Existing itinerary preserved.',
        timestamp,
      };
      setAssistantMessages((prev) => [...prev, errorBotMsg]);
      showToast(
        lang === 'ar'
          ? 'تعذر تنفيذ طلب المساعد، تم الحفاظ على خطتك.'
          : 'Failed to execute request. Preserved existing plan.',
      );
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const activeStopObj = itinerary.stops.find((s) => s.id === activeStopId) || itinerary.stops[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 start-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        lang={lang}
        onLanguageToggle={handleLanguageToggle}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Summary & Dynamic Assistant Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                {lang === 'ar' ? 'مسار يومي نشط' : 'Active Daily Trail'}
              </span>
              <span className="text-xs text-slate-400">
                {preferences.tripDate} ({preferences.startTime} - {preferences.endTime})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {lang === 'ar' ? itinerary.tripTitleAr : itinerary.tripTitleEn}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'ar' ? itinerary.summaryAr : itinerary.summaryEn}
            </p>
          </div>

          {/* Quick Trigger for Assistant Drawer */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/15 cursor-pointer shrink-0 w-full md:w-auto justify-center"
          >
            <Bot className="w-4 h-4" />
            <span>{t(lang, 'assistantTitle')}</span>
          </button>
        </div>

        {/* Core Layout: Left Map / Right Timeline Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-4">
            <InteractiveMap
              stops={itinerary.stops}
              activeStopId={activeStopId}
              onSelectStop={(id) => setActiveStopId(id)}
              lang={lang}
            />

            {/* Focused Active Stop Highlight Card */}
            {activeStopObj && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                    {lang === 'ar' ? 'المحطة المحددة حالياً' : 'Currently Focused Stop'}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar' ? activeStopObj.nameAr : activeStopObj.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'ar' ? activeStopObj.location.addressAr : activeStopObj.location.addressEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setSelectedStopDetails(activeStopObj);
                      setIsStopDetailsOpen(true);
                    }}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {t(lang, 'viewDetails')}
                  </button>

                  <button
                    onClick={() => {
                      setReplaceTargetStop(activeStopObj);
                      setIsReplaceModalOpen(true);
                    }}
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t(lang, 'replaceStop')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
            <Timeline
              stops={itinerary.stops}
              activeStopId={activeStopId}
              onSelectStop={(id) => setActiveStopId(id)}
              onOpenDetails={(stop) => {
                setSelectedStopDetails(stop);
                setIsStopDetailsOpen(true);
              }}
              onOpenReplace={(stop) => {
                setReplaceTargetStop(stop);
                setIsReplaceModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
              lang={lang}
            />
          </div>

        </div>

      </main>

      {/* Modals & Drawers */}
      <TripSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        lang={lang}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        isLoading={isGeneratingPlan}
      />

      <StopDetailsModal
        stop={selectedStopDetails}
        isOpen={isStopDetailsOpen}
        onClose={() => setIsStopDetailsOpen(false)}
        onTriggerReplace={(stop) => {
          setReplaceTargetStop(stop);
          setIsReplaceModalOpen(true);
        }}
        lang={lang}
      />

      <ReplaceStopModal
        targetStop={replaceTargetStop}
        allStopsInItinerary={itinerary.stops}
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        onConfirmSwap={handleConfirmSwap}
        lang={lang}
      />

      <TripAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        messages={assistantMessages}
        onCommand={handleAssistantCommand}
        lang={lang}
        isLoading={isAssistantLoading}
      />

    </div>
  );
}
