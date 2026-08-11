# Masar | مسار — Adaptive Riyadh Trip Planner

> **Masar (مسار)** is an AI-powered adaptive tourism planner designed specifically for Riyadh, Saudi Arabia. It generates personalized, context-aware day-trip itineraries that dynamically adapt to real-world factors such as summer heat, prayer times, venue crowd levels, accessibility needs, and real-time user requests.

---

## 🌟 Key Features

- 🌐 **Bilingual & Directional UX:** Full **Arabic (RTL)** and **English (LTR)** interface with instant non-destructive language switching (`AR` / `EN`).
- 🤖 **Gemini 3.6 Flash Powered:**
  - **Structured Output:** Server-side JSON schema-validated itinerary generation (`/api/plan`).
  - **Function Calling:** Intent detection and real-time itinerary mutation (`/api/assistant`).
- 🗺️ **Interactive Google Maps:** Real-time route polylines, status-coded pins (`Completed`, `Current`, `Upcoming`), and travel leg overlays.
- ☀️ **Real-World Riyadh Constraints:**
  - Heat mitigation (`avoidHeat`) prioritizing shaded/AC indoor venues during peak daytime.
  - Prayer buffer alerts (Maghrib, Isha, etc.) and nearest mosque references.
  - Expected crowd level estimation and mobility/walking preference adjustments.
  - Wheelchair, stroller, and elderly accessibility flags.
  - Mandatory minimum 20-minute transfer buffer between consecutive stops.
- 🔄 **Smart Replace Stop:** Replace any venue with 5 intelligent presets:
  1. *Similar* — Matching category and vibe.
  2. *Closer* — Geographically nearest alternative.
  3. *Indoor* — Fully air-conditioned/shaded indoor venue.
  4. *Less Crowded* — Quieter venue with lower crowd level.
  5. *Different Activity* — Diverse activity switch.
- 💬 **Natural-Language Assistant:** Execute real-time trip adaptations through natural language prompts:
  - `"تعبت"` / `"I'm tired"` — Lowers walking and inserts rest stop.
  - `"الجو حار"` / `"It's too hot"` — Converts outdoor stops to shaded indoor venues.
  - `"أبي كوفي قريب"` / `"Find a nearby coffee"` — Inserts a real nearby specialty cafe.
  - `"قلل المشي"` / `"Reduce walking"` — Recalculates route for minimal foot travel.
  - `"تخطى المحطة الحالية"` / `"Skip current stop"` — Advances itinerary to next destination.

---

## 🏗️ Technical Architecture & Stack

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
│ │ Single Source of Truth Itinerary State             │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Express Server (Gemini 3.6 Flash + Function Call)   │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Google Maps JS API + Riyadh Places Dataset          │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18/19, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend:** Node.js Express server (`server.ts`) bundled with esbuild for production.
- **AI SDK:** `@google/genai` using model `gemini-3.6-flash`.
- **Mapping:** Google Maps JavaScript API.

---

## 🔒 API Key Security

All Gemini API calls are executed strictly **server-side** via Express endpoints (`/api/plan` and `/api/assistant`). The `GEMINI_API_KEY` is never exposed to the client or browser context.

---

## ⚙️ Environment Variables

Use `.env.example` as a reference for the required environment variables.

```env
# GEMINI_API_KEY: Required server-side key for Gemini 3.6 Flash
GEMINI_API_KEY="your_gemini_api_key"

# APP_URL: Runtime hosting URL
APP_URL="http://localhost:3000"

# VITE_GOOGLE_MAPS_API_KEY: Key for Google Maps Platform JS API
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

---

## 🚀 Local Run Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   Before starting the server, make sure `GEMINI_API_KEY` is set in your terminal/process environment.
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Start Production Server:**
   ```bash
   npm run start
   ```

---

## 🎬 1-Minute Demo Flow

1. **Language Switch:** Toggle `AR` ⇆ `EN` in top header bar.
2. **Setup Trip:** Configure date, time range, interests, `avoidHeat`, mobility level, and family preferences.
3. **Generate Plan:** Click **"توليد خطة الرحلة / Generate Itinerary"**.
4. **Explore Route:** View the interactive Google Map and Timeline with current, completed, and upcoming stops.
5. **Replace Stop:** Click any stop, select **"استبدال المحطة / Replace Stop"**, and pick a preset (e.g., *Indoor* or *Closer*).
6. **Smart Assistant:** Open the Assistant drawer and type `"أبي كوفي قريب"` or `"الجو حار"` to watch the map and itinerary mutate in real time.

---

## 🔮 Future Work

- Integration with official Saudi Seasons & Experience APIs for live ticket booking.
- Real-time IoT crowd density sensors integration across Riyadh landmarks.
- Offline PWA caching for continuous navigation without network connection.
