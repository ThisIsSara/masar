# Masar | مسار — PROJECT_MAP.md

> **Source of Truth for "Masar | مسار" (Challenge 3B MVP)**
> An adaptive, context-aware tourism planner for Riyadh focused on real-time itinerary generation, Google Maps route visualization, and dynamic natural-language replanning.

---

## 1. Project Overview & Scope (النطاق والعرض العام)

### 1.1 Product Mission
**Masar (مسار)** is an intelligent, real-time adaptive tourism planner designed specifically for Riyadh, Saudi Arabia. It creates bespoke day trips that dynamically react to environmental factors (temperature/heat), cultural schedules (prayer times), location constraints, user physical needs (fatigue, mobility, children/elderly present), and expected crowd levels.

### 1.2 Core MVP Scope (مواصفات النسخة الأولية)
- **Target Region:** Riyadh only (الرياض فقط).
- **Bilingual & Directional Support:** Full Arabic (RTL) and English (LTR) with a seamless, instant language switch toggle (`AR` / `EN`).
- **Core MVP Features (Required):**
  - Instant AI Itinerary Generation using **Gemini API Structured Outputs**.
  - Interactive **Google Maps Integration** with route stops and sequential status pins (completed, current, upcoming).
  - **Gemini Function Calling** to dynamically query tools and handle context rules.
  - Real-world constraint awareness: Weather/heat index, prayer time buffers, and expected crowd levels.
  - **Replace Stop Modal** with 5 smart presets (Similar, Closer, Indoor, Less Crowded, Different Activity).
  - **Natural-Language Trip Assistant** for real-time dynamic trip replanning.
  *(Note: Mock/simulated data is permitted only during early Phase 1 development prior to live API hookup).*
- **Excluded from MVP:**
  - ❌ User registration/login, persistent user databases, payment/booking flows, saved user profiles, gamification (badges, challenges), or social sharing feeds.

---

## 2. User Flow & Core Experience (مسار المستخدم)

```
                       ┌───────────────────────────────┐
                       │  Language Switcher (AR ⇆ EN)  │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                         [1. Trip Setup (إعداد الرحلة)]
    (Trip Date, Start/End Time, Interests, Mobility, avoidHeat, Expected Crowds)
                                       │
                                       ▼
                  [2. AI Plan Generation (توليد الخطة الذكية)]
                      (Gemini Structured Output + Tools)
                                       │
                                       ▼
           [3. Adventure Map & Itinerary (خريطة المغامرة والجدول الزمني)]
             ├── Google Maps Route View & Status Tracker (Completed/Current/Upcoming)
             ├── Active Stop Focus & Detailed Specs
             │
             ├── [Action: Replace Stop (استبدال المحطة)] ──► 5 Smart Alternative Presets
             │                                                        │
             └── [Action: Natural Language Assistant (المساعد التفاعلي)] ──┘
                      └─ Context Commands ("تعبت", "الجو حار", "أبي كوفي قريب", "قلل المشي")
```

---

## 3. Screen Specifications (مواصفات الشاشات والواجهات)

All screens feature a global **Bilingual Header** containing the logo "Masar | مسار" and a high-contrast `AR` / `EN` toggle button.

### Screen 1: Trip Setup Modal / Landing (إعداد المسار)
- **Trip Date & Time Selection:** Date picker (`tripDate`), Duration, Start time, End time.
- **Heat Mitigation Toggle:** `avoidHeat` switch (prioritizes indoor/shaded venues during daytime).
- **Interests Multi-select:** Heritage & Culture (تراث وثقافة), Fine Dining & Cafes (مطاعم ومقاهي), Shopping & Luxury (تسوق وترفيه), Nature & Parks (طبيعة وحدائق), Entertainment (فعاليات وترفيه).
- **Mobility & Accessibility Options:**
  - Walking Preference: Low / Moderate / High (مستوى المشي)
  - Family Accommodations: Stroller-friendly (عربات أطفال), Elderly-friendly (كبار السن), Wheelchair/Mobility accessible (كراسي متحركة).
- **Live Context Indicators:** Riyadh current temperature preview, next prayer time alert, and expected crowd levels.

### Screen 2: Interactive Adventure Map & Timeline (خريطة المغامرة والجدول)
- **Google Maps Route Overlay:** Interactive map displaying sequential Riyadh venue pins styled by status:
  - 🟢 **Completed (مكتملة):** Greyed/dimmed pin with checkmark icon.
  - 🟡 **Current (المحطة الحالية):** Highlighted pulsing pin with active venue card.
  - 🔵 **Upcoming (المحطات القادمة):** Standard numbered map pins along the route.
- **Interactive Timeline Stream:** Responsive cards showing time slot, venue name, category badge, indoor/outdoor flag, walking distance, and prayer window buffer.
- **Stop Action Drawer / Modal:**
  - Detailed specs (opening hours, recommended duration, shade/AC state, accessibility).
  - Quick Replace Button ("استبدال المحطة" / "Replace Stop").

### Screen 3: Replace Stop Modal (استبدال المحطة)
Triggered per stop with 5 smart preset replacement filters:
1. **Similar (مماثل / Similar):** Same category and vibe.
2. **Closer (أقرب / Closer):** Minimizes transit and walking distance.
3. **Indoor (داخلي / Indoor):** Priority for fully air-conditioned/shaded spots during high heat.
4. **Less Crowded (أقل ازدحاماً / Less Crowded):** Prefers quieter venues with lower expected crowd levels.
5. **Different Activity (نشاط مختلف / Different Activity):** Swaps activity type (e.g., swapping shopping for a quiet cafe or museum).

### Screen 4: Natural-Language Trip Assistant (المساعد الذكي لإعادة التخطيط)
- **Strict Functional Intent:** NOT a general Q&A chatbot. Every prompt directly mutates the current active itinerary using Gemini function calling.
- **Quick Command Chips (إجراءات سريعة / Quick Actions):**
  - `"تعبت"` / `"I'm tired"` ➔ Lowers walking distance, inserts a rest/cafe stop.
  - `"الجو حار"` / `"It's too hot"` ➔ Converts remaining outdoor stops to indoor/shaded alternatives.
  - `"أبي كوفي قريب"` / `"Nearby coffee"` ➔ Inserts a top-rated nearby cafe before the next main stop.
  - `"قلل المشي"` / `"Reduce walking"` ➔ Recalculates route to minimize foot travel.
  - `"تخطى المحطة الحالية"` / `"Skip current stop"` ➔ Auto-advances itinerary to next destination.

---

## 4. Input & Output Schemas (المخططات البرمجية للبيانات)

### 4.1 Trip Preferences Input Schema (إدخال التفضيلات)
```json
{
  "city": "Riyadh",
  "tripDate": "2026-08-08",
  "startTime": "16:00",
  "endTime": "22:00",
  "avoidHeat": true,
  "interests": ["culture", "cafes", "entertainment"],
  "walkingPreference": "low" | "moderate" | "high",
  "accessibility": {
    "hasChildren": true,
    "hasElderly": false,
    "wheelchairRequired": false
  },
  "currentLocation": {
    "lat": 24.7136,
    "lng": 46.6753,
    "nameAr": "وسط الرياض",
    "nameEn": "Central Riyadh"
  }
}
```

### 4.2 Itinerary Output Schema (مخرجات خطة الرحلة)
```json
{
  "tripTitleAr": "مسار الرياض الأصيل والحديث",
  "tripTitleEn": "Authentic & Modern Riyadh Trail",
  "totalDurationMinutes": 360,
  "summaryAr": "ملخص المسار المخصص للتنقل المريح مع مراعاة أوقات الصلاة والطقس",
  "summaryEn": "Customized itinerary optimized for comfort, prayer schedules, and temperature control",
  "stops": [
    {
      "id": "stop-1",
      "order": 1,
      "nameAr": "قصر المربع التاريخي",
      "nameEn": "Murabba Historical Palace",
      "category": "culture",
      "startTime": "16:15",
      "endTime": "17:30",
      "durationMinutes": 75,
      "isIndoor": true,
      "crowdLevel": "low" | "moderate" | "high",
      "walkingDistanceMeters": 200,
      "location": {
        "lat": 24.6469,
        "lng": 46.7093,
        "addressAr": "المربع، الرياض",
        "addressEn": "Al Murabba, Riyadh"
      },
      "status": "completed" | "current" | "upcoming",
      "amenities": ["air_conditioned", "family_friendly", "restrooms"],
      "prayerBuffer": {
        "prayerNameAr": "المغرب",
        "prayerNameEn": "Maghrib",
        "time": "18:10",
        "nearestMosqueDistanceMeters": 100
      },
      "descriptionAr": "جولة تاريخية ممتعة داخل أروقة القصر التاريخي المكيف.",
      "descriptionEn": "An enjoyable historical tour inside the air-conditioned heritage palace."
    }
  ]
}
```

### 4.3 Replanning Command Schema (مخطط أوامر التعديل)
```json
{
  "currentItineraryId": "trip-123",
  "commandType": "FATIGUE" | "HEAT" | "NEARBY_CAFE" | "REDUCE_WALKING" | "CUSTOM",
  "rawPrompt": "تعبت وابي مكان استريح فيه",
  "activeStopId": "stop-2",
  "targetAction": "REPLACE_CURRENT_AND_ADJUST_REMAINING"
}
```

---

## 5. Technical Architecture (البنية البرمجية)

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite                      │
│     (Tailwind CSS v4 RTL/LTR + Lucide Icons + Motion)  │
├────────────────────────────────────────────────────────┤
│                     UI Layer                           │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐ │
│ │ Language Toggle  │ │ Google Maps View │ │ Assistant│ │
│ └──────────────────┘ └──────────────────┘ └──────────┘ │
├────────────────────────────────────────────────────────┤
│               State Engine & AI Integration            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Itinerary Store (Current Route, Stop States)       │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Gemini API (Structured Output + Function Calling)   │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Google Maps Platform + Weather & Prayer Engines    │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Plan & Phases (مراحل التنفيذ)

### Phase 1: Bilingual Mock UI & Complete Core Flow [COMPLETED]
- Set up bilingual framework (Arabic RTL / English LTR) with instant AR/EN state switcher.
- Implement UI components: Trip Setup Modal (with `tripDate`, duration, interests, `avoidHeat`, mobility), Interactive Map Container, Timeline view, Replace Stop modal, and Assistant drawer.
- Wire full client state machine using realistic mock data.

### Phase 2: Gemini Structured Itinerary Engine [COMPLETED]
- Integrated server-side Gemini 3.6 Flash itinerary generation endpoint (`/api/plan`).
- Enforced JSON Schema (`GEMINI_ITINERARY_RESPONSE_SCHEMA`) via `@google/genai` SDK on the server.
- Built prompt engineering layer (`planningPrompt.ts`) filtering candidates from approved `riyadh_places.json` based on user preferences (interests, avoidHeat, walking, accessibility).
- Enforced a mandatory minimum 20-minute transfer buffer between consecutive stops in prompt guidelines and server validation.
- Connected Trip Setup submission to server-side Gemini execution and mapped returned `placeId`s to the single shared itinerary state (updating title, summary, Timeline, and Adventure Map).
- Ensured strict error handling: failed requests leave the existing itinerary untouched, keep the setup modal open, and display the localized error banner.

### Phase 3: Function Calling & Constraint Integrations [COMPLETED]
- Enabled **Gemini Function Calling** (`gemini-3.6-flash`) via server-side endpoint `/api/assistant` to handle tool calls (`add_coffee`, `avoid_heat`, `reduce_walking`, `handle_fatigue`, `skip_stop`, `replace_stop_with_preset`).
- Implemented constraint resolution engines for Riyadh prayer time buffers, heat index/weather checks, and expected crowd level estimations.

### Phase 4: Real Google Maps Integration & Replace Stop [COMPLETED]
- Integrated Google Maps JavaScript API for interactive route rendering, status-coded marker pins, and path polylines.
- Connected Replace Stop modal to live venue engine using 5 smart filter presets (Similar, Closer, Indoor, Less Crowded, Different Activity) with strict candidate ranking, duplicate exclusion, and exact preview-applied matching.

### Phase 5: Natural-Language Replanning & End-to-End Testing [COMPLETED]
- Connected Assistant natural language input ("تعبت", "الجو حار", "أبي كوفي قريب", "قلل المشي") to Gemini Function Calling replanning logic.
- Conducted complete end-to-end testing across both Arabic and English modes to ensure seamless UX, layout stability, single-source-of-truth state integrity, and accurate route updates.

---

## 7. Integrations Architecture (التكاملات البرمجية)

- **Google Maps Platform (Required MVP):** Interactive map rendering, place location markers, and route polyline visualization.
- **Gemini API with Function Calling & Structured Output (Required MVP):** AI itinerary generation, prompt execution, and dynamic tool invocation for route replanning.
- **Prayer Schedule & Weather Context Engine (Required MVP):** Calculates local Riyadh prayer windows and ambient heat levels to adjust indoor/outdoor stop distribution.

---

## 8. Success Criteria (معايير النجاح)

1. 🌐 **Bilingual & Directional Perfection:** Flawless dual-language experience in Arabic (RTL) and English (LTR) with instant, non-destructive toggle.
2. 🗺️ **Google Maps Integration:** Live interactive map with route polylines and status-coded markers (`completed`, `current`, `upcoming`).
3. 🤖 **Gemini Function Calling & Structured Itineraries:** Schema-validated AI generation and tool calling in under 3 seconds.
4. ☀️ **Real-World Constraint Compliance:** Automated adjustments for `tripDate`, `avoidHeat`, prayer buffers, and expected crowd levels.
5. 🔄 **One-Click Replace Stop:** Seamless stop replacement via 5 targeted presets (Similar, Closer, Indoor, Less Crowded, Different Activity).
6. 💬 **Dynamic Replanning Engine:** Natural language prompts (`"تعبت"`, `"الجو حار"`) mutate active itineraries in real time without losing user context.
