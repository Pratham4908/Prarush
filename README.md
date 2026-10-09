# 🏙️ City Life: Exploring, Experiencing & Navigating the Chaos We Call Home

> **An AI-powered smart mobile exploration platform that converts scattered urban telemetry, pedestrian safety data, living history lore, and citizen crowdsourced reports into verified, actionable insights.**

---

## 🚀 Live Demo & Development Server
The application is currently running live at:
- **Local URL:** `http://localhost:5173/`
- **Port:** `5173` (Vite 8.3.4 + React 19 + Leaflet + Web Audio API)

---

## 🌟 Core Pillars & Feature Implementation

### 1. 🧭 Exploration & Hospitality
- **Curated Urban Discoveries**: Discover hidden food gems (e.g. *The Rusty Lantern Ramen*, *Mama Rosa's Handmade Pasta*), budget-friendly accommodations (*The Nomad Capsule Pods*), rooftop lounges (*Cloudburst Botanical Lounge*), and historical concourses (*Grand Central Heritage Market*).
- **Smart Filtering & Search**: Instant filter chips for *All Gems*, *Food & Izakayas*, *Budget Friendly*, *Stays & Pods*, *Attractions*, and *Saved Favorites*.
- **Localized Cards**: Displays average cost tiers (`$`, `$$`, `$$$`), crowd busy hours, safety scores (`92% Safe`), cleanliness ratings, insider local tips, and direct handoffs to **SafeRoute AI**.
- **Favorites Persistence**: Full LocalStorage bookmarking with haptic audio feedback.

### 2. 🏛️ History & Living Culture
- **Architectural & Heritage Directory**: Deep lore on Victorian and colonial monuments (e.g. *The Clocktower Citadel of 1889*, *Old Guildhall Arcade of 1740s*, *Seafarer's Memorial Lighthouse of 1832*).
- **Interactive Audio Tour Guide**: Built-in speech synthesis (Web Speech API) and audio waveform visualizer delivering bite-sized 60-90 second narrated histories.
- **Living Traditions**: Explains cultural rituals like the *Noon Chime Echo*, *Guild Stamp Wax Passport*, and *Sunset Fog Bell*.
- **Cultural Etiquette Guide**: Practical urban etiquette cards covering Metro transit courtesy, tipping customs, market bargaining norms, and street photography sensitivity.

### 3. 🛡️ Safety & Security (SafeRoute AI™)
- **SafeRoute™ Dual-Engine Navigation**:
  - **SafeRoute AI™ (Guardian Mode)**: 14 mins, **97% Safety Score**, **98% high-output LED lighting**, **94% CCTV coverage**, active footfall, completely bypasses dark unlit alleys.
  - **Fastest Path (Speed-First)**: 11 mins, **62% Safety Score**, cuts through unlit *Elm Lane* and *Shadow Alley*.
- **Turn-by-Turn Guided Walking Simulation**: Audio-assisted step progression alerting travelers to lit corridors and safe police posts.
- **Incident Radar**: Real-time pins and telemetry for dim street lamps, high-collision intersections, and 24/7 Police Sub-stations.
- **SOS Guard Kit**:
  - **110dB Acoustic Siren Alarm**: Web Audio API oscillator synthesizing an emergency siren beacon with visual strobe animation.
  - **Fake Call Generator**: Simulates an incoming call from a patrol escort with realistic audio dialogue to exit uncomfortable situations.
  - **One-Touch Emergency Directory**: 911/112 Police Dispatch, Tourist Safety Helpline, Transit Safety, and Free Night Escorts.
  - **Live GPS Share**: Instant one-click clipboard copy of exact coordinates and route corridor.

### 4. ⚖️ Best vs. Worst Places (Urban Benchmark)
- **Interactive 6-Vector Radar Chart**: HTML5 Canvas polygon visualizer rendering:
  1. *Safety & Security*
  2. *Cleanliness & Hygiene*
  3. *Affordability & Value*
  4. *Visitor Ratings*
  5. *Transit Accessibility*
  6. *Peace & Low Noise*
- **Side-by-Side District Comparators**: Pick any two metropolitan districts (e.g. *Old Quarter* vs. *Financial Uptown* vs. *Arts District* vs. *Harbor Bay* vs. *North Freight Terminal* vs. *Eco Garden Haven*).
- **Metric Winner Showdown**: Animated comparison progress bars crowning category winners.
- **Ranked City Leaderboard**: Sort districts by *Safety*, *Cleanliness*, or *Affordability*.
- **AI Tradeoff Verdict**: Explains why certain districts excel in authentic night food while others lead in corporate tranquility.

### 5. 🛰️ Smart City Pulse & Live Telemetry
- **Weather Alerts & Micro-Climates**: Real-time flash cloudburst surge warnings (e.g. 70% rain surge at 17:30) and AQI marine air quality tracker.
- **Traffic Congestion Corridors**: Real-time arterial meters showing congestion percentages, average speeds, and delay minutes.
- **Citizen Crowdsourced Reporting Studio**:
  - Post reports with photos, category tags (*Road Hazard*, *Poor Lighting*, *Food Gem*, *Culture*).
  - **Voice Memo Recording Studio**: Synthesizes and captures voice notes with real-time waveform equalizer animations and NLP transcriptions.
  - **Upvoting System**: Gamified verification with `canvas-confetti` celebrations.
  - Persisted in browser `localStorage`.
- **Live Social Media Buzz**: Hyper-local pulse feed with hashtag tracking (`#SafeWalk`, `#CityEats`, `#TransitAlert`).

### 6. 🤖 UrbanSense AI™ Copilot (NLP Engine)
- **Context-Aware Intent Classifier**: Categorizes queries across safety, culinary recommendations, heritage lore, district benchmarks, and real-time weather/traffic.
- **Actionable Responses**: Answers include structured data cards and one-click direct jump buttons to activate maps or routes.
- **Text-to-Speech Readout**: Listen to answers read aloud.

---

## 📱 Mobile App Simulator & Responsive Design
- **iPhone 16 Pro Frame Shell**: Realistic mobile bezel with interactive Dynamic Island, speaker slit, live clock, 5G & battery indicators.
- **Full Viewport Toggle**: Switch between compact phone bezel mode and responsive tablet/fullscreen mode with one click.
- **Aesthetic**: Premium dark-luxe glassmorphism (`#090d16` background, cyan, amber, emerald, and violet neon accents).

---

## 🧪 Testing & Verification
The codebase includes an automated unit test suite:
```bash
node src/test-city-app.js
```
**Results:** `97 Passed, 0 Failed` validating all 6 core pillars, data schemas, coordinates, route algorithms, and NLP classifiers.
# Prarush  
