import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Maximize2, Minimize2, Volume2, X, ShieldAlert, Sparkles, Navigation as NavIcon, Globe 
} from 'lucide-react';

// Components
import CityHeader from './components/CityHeader.jsx';
import Navigation from './components/Navigation.jsx';
import InteractiveMap from './components/InteractiveMap.jsx';
import CitizenReportModal from './components/CitizenReportModal.jsx';
import AIAssistantModal from './components/AIAssistantModal.jsx';
import GlobalLocationSearchModal from './components/GlobalLocationSearchModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import UserProfileModal from './components/UserProfileModal.jsx';
import NightWalkGuardianModal from './components/NightWalkGuardianModal.jsx';
import MultilingualPhrasebookModal from './components/MultilingualPhrasebookModal.jsx';

// Views
import ExploreView from './views/ExploreView.jsx';
import HistoryCultureView from './views/HistoryCultureView.jsx';
import SafetySecurityView from './views/SafetySecurityView.jsx';
import BestWorstView from './views/BestWorstView.jsx';
import SmartPulseView from './views/SmartPulseView.jsx';

// Data & Utilities
import { CITIES, EXPLORE_SPOTS } from './data/cityData.js';
import { HERITAGE_SITES } from './data/historyCultureData.js';
import { SAFETY_INCIDENTS, ROUTE_OPTIONS } from './data/safetyData.js';
import { INITIAL_CITIZEN_REPORTS } from './data/pulseData.js';
import { audioSystem } from './utils/audioSystem.js';
import { getCurrentUser } from './utils/authService.js';
import { 
  generateCityProfileForLocation, 
  getBrowserGeolocation, 
  reverseGeocodeCoords 
} from './utils/locationService.js';
import { 
  fetchLiveWeather, 
  fetchLiveAirQuality, 
  fetchRealNearbyPOIs 
} from './utils/realDataService.js';

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState('metropulse');
  const [currentCityData, setCurrentCityData] = useState(() => CITIES[0]);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'history', 'map', 'safety', 'compare', 'pulse'
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Award-Winning Feature Modals
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isPhrasebookModalOpen, setIsPhrasebookModalOpen] = useState(false);

  // Dynamic datasets (adapts dynamically when user changes location to ANY city globally)
  const [activeSpots, setActiveSpots] = useState(EXPLORE_SPOTS);
  const [activeHeritage, setActiveHeritage] = useState(HERITAGE_SITES);
  const [activeIncidents, setActiveIncidents] = useState(SAFETY_INCIDENTS);
  const [activeRouteData, setActiveRouteData] = useState(ROUTE_OPTIONS);
  const [activeRouteType, setActiveRouteType] = useState('safest'); // 'safest', 'fastest', 'both'

  // Simulator UI state
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('09:41');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalDefaults, setReportModalDefaults] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Safety & Audio state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [activeAudioGuide, setActiveAudioGuide] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dynamic Island status
  const [islandExpanded, setIslandExpanded] = useState(false);

  // Crowdsourced Citizen Reports (persisted in LocalStorage)
  const [citizenReports, setCitizenReports] = useState(() => {
    try {
      const saved = localStorage.getItem('city_citizen_reports');
      return saved ? JSON.parse(saved) : INITIAL_CITIZEN_REPORTS;
    } catch {
      return INITIAL_CITIZEN_REPORTS;
    }
  });

  // Auto-Fetch Real Browser GPS Location on First Launch!
  useEffect(() => {
    async function autoFetchLocation() {
      try {
        if (!navigator.geolocation) return;
        const pos = await getBrowserGeolocation();
        const [lat, lon] = pos.coords;

        // Fetch real reverse geocode
        const geoInfo = await reverseGeocodeCoords(lat, lon);
        const cityName = geoInfo.city || geoInfo.name || 'Local District';

        // Fetch real live weather and air quality from Open-Meteo
        const [liveWeather, liveAQI, realPOIs] = await Promise.all([
          fetchLiveWeather(lat, lon),
          fetchLiveAirQuality(lat, lon),
          fetchRealNearbyPOIs(lat, lon, cityName)
        ]);

        const customProfile = generateCityProfileForLocation(cityName, [lat, lon], geoInfo.country);
        customProfile.weather = {
          ...customProfile.weather,
          ...liveWeather,
          aqi: liveAQI.aqi,
          aqiStatus: liveAQI.status
        };

        if (realPOIs && realPOIs.length > 0) {
          customProfile.spots = realPOIs;
        }

        setSelectedCityId(customProfile.id);
        setCurrentCityData(customProfile);
        setActiveSpots(customProfile.spots);
        setActiveIncidents(customProfile.incidents);
        setActiveRouteData(customProfile.routes);
      } catch (e) {
        // Fallback default city loaded
        console.log('GPS auto-fetch notice (using default global metropolis):', e.message);
      }
    }

    autoFetchLocation();
  }, []);

  // Clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Handler: Switch to Preset City
  const handleSelectPresetCity = async (cityId) => {
    setSelectedCityId(cityId);
    const found = CITIES.find(c => c.id === cityId);
    if (found) {
      // Fetch real live weather from Open-Meteo for preset coordinates
      try {
        const [liveWeather, liveAQI] = await Promise.all([
          fetchLiveWeather(found.center[0], found.center[1]),
          fetchLiveAirQuality(found.center[0], found.center[1])
        ]);
        found.weather = { ...found.weather, ...liveWeather, aqi: liveAQI.aqi, aqiStatus: liveAQI.status };
      } catch {}

      setCurrentCityData({ ...found });
      setActiveSpots(EXPLORE_SPOTS.filter(s => s.cityId === cityId || !s.cityId));
      setActiveHeritage(HERITAGE_SITES);
      setActiveIncidents(SAFETY_INCIDENTS);
      setActiveRouteData(ROUTE_OPTIONS);
      audioSystem.playTone(550, 'sine', 0.1);
    }
  };

  // Handler: Set ANY Global Location (from search or GPS)
  const handleSelectGlobalLocation = async (name, coords, country = 'World') => {
    const customProfile = generateCityProfileForLocation(name, coords, country);

    // Fetch real live weather and AQI
    try {
      const [liveWeather, liveAQI, realPOIs] = await Promise.all([
        fetchLiveWeather(coords[0], coords[1]),
        fetchLiveAirQuality(coords[0], coords[1]),
        fetchRealNearbyPOIs(coords[0], coords[1], name)
      ]);
      customProfile.weather = { ...customProfile.weather, ...liveWeather, aqi: liveAQI.aqi, aqiStatus: liveAQI.status };
      if (realPOIs && realPOIs.length > 0) {
        customProfile.spots = realPOIs;
      }
    } catch {}

    setSelectedCityId(customProfile.id);
    setCurrentCityData(customProfile);
    setActiveSpots(customProfile.spots);
    setActiveIncidents(customProfile.incidents);
    setActiveRouteData(customProfile.routes);
    audioSystem.playSuccessSound();
  };

  // Handler: Trigger Real Browser GPS manually
  const handleTriggerGPS = async () => {
    try {
      const pos = await getBrowserGeolocation();
      const geoInfo = await reverseGeocodeCoords(pos.coords[0], pos.coords[1]);
      handleSelectGlobalLocation(geoInfo.city || geoInfo.name, pos.coords, geoInfo.country);
    } catch (err) {
      alert('Unable to detect physical GPS: ' + (err.message || 'Please check browser location permissions'));
    }
  };

  // Sync citizen reports to LocalStorage
  const handleAddCitizenReport = (newReport) => {
    setCitizenReports(prev => {
      const updated = [newReport, ...prev];
      try {
        localStorage.setItem('city_citizen_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpvoteReport = (reportId) => {
    setCitizenReports(prev => {
      const updated = prev.map(r => r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r);
      try {
        localStorage.setItem('city_citizen_reports', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Trigger Emergency Siren
  const handleToggleSOS = () => {
    audioSystem.toggleEmergencySiren(
      () => setIsSirenActive(true),
      () => setIsSirenActive(false)
    );
  };

  // Play Audio Stories / Lore
  const handlePlayAudioStory = (title, transcript) => {
    setActiveAudioGuide({ title, text: transcript });
    setIsPlayingAudio(true);
    audioSystem.speak(
      transcript,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleStopAudio = () => {
    audioSystem.stopSpeech();
    setIsPlayingAudio(false);
    setActiveAudioGuide(null);
  };

  // Destination handover from Explore or Map to SafeRoute Navigation
  const handleNavigateToSpot = (spot) => {
    setActiveRouteData(prev => ({
      ...prev,
      destination: {
        name: spot.name,
        coords: spot.coords
      }
    }));
    setActiveTab('safety');
    audioSystem.playTone(640, 'triangle', 0.15);
  };

  // Map tap hazard reporting
  const handleOpenReportAtLocation = (locName, coords) => {
    setReportModalDefaults({ location: locName, coords });
    setIsReportModalOpen(true);
  };

  return (
    <div className={`desktop-container ${isFullscreenMode ? 'fullscreen-mode' : ''}`}>
      {/* Ambient background glow */}
      <div className="ambient-bg" />

      {/* Simulator Device Top Controls Bar */}
      <header className="simulator-controls" aria-label="Device Simulator Controls">
        <div className="sim-brand">
          <span>🏙️ City Life</span>
          <span className="sim-brand-badge">Global AI Platform</span>
        </div>

        <div className="sim-toggles">
          <a
            href="/presentation.html"
            target="_blank"
            rel="noopener noreferrer"
            className="sim-btn"
            title="Open 10-Slide Pitch Deck Presentation"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontSize: '12px' }}>📊</span>
            <span>Pitch Deck</span>
          </a>

          <button
            className="sim-btn"
            onClick={() => setIsGlobalSearchOpen(true)}
            title="Search Any Global Location"
          >
            <Globe size={13} color="#06b6d4" />
            <span>Search World</span>
          </button>

          <button
            className={`sim-btn ${!isFullscreenMode ? 'active' : ''}`}
            onClick={() => setIsFullscreenMode(false)}
            title="iPhone 16 Pro Viewport"
            aria-label="Toggle Phone Frame"
          >
            <Smartphone size={13} />
            <span>Phone</span>
          </button>

          <button
            className={`sim-btn ${isFullscreenMode ? 'active' : ''}`}
            onClick={() => setIsFullscreenMode(true)}
            title="Full Responsive Viewport"
            aria-label="Toggle Fullscreen Mode"
          >
            {isFullscreenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreenMode ? 'Compact' : 'Full'}</span>
          </button>
        </div>
      </header>

      {/* Main Realistic Phone Shell */}
      <main className="phone-frame" id="city-life-mobile-app">
        {/* Phone Top Status Bar & Dynamic Island */}
        <div className="phone-status-bar">
          <span style={{ fontWeight: 700 }}>{currentTimeStr}</span>

          {/* Dynamic Island */}
          <div 
            className={`dynamic-island ${islandExpanded ? 'expanded' : ''}`}
            onClick={() => setIslandExpanded(!islandExpanded)}
            title="Tap Dynamic Island"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 size={12} color="#a855f7" />
                <span style={{ fontSize: '0.62rem', color: '#c084fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 75 }}>
                  {activeAudioGuide?.title.split(' ')[0] || 'Audio'}
                </span>
                <span className="island-sensor" />
              </>
            ) : isSirenActive ? (
              <>
                <ShieldAlert size={12} color="#f43f5e" />
                <span style={{ fontSize: '0.62rem', color: '#f43f5e', fontWeight: 700 }}>SIREN SOS</span>
                <span className="island-sensor" style={{ background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
              </>
            ) : (
              <>
                <span className="island-camera" />
                <span style={{ fontSize: '0.62rem' }}>SafeRoute</span>
                <span className="island-sensor" />
              </>
            )}
          </div>

          <div className="status-bar-icons">
            <span style={{ fontSize: '0.72rem' }}>5G</span>
            <span style={{ fontSize: '0.75rem' }}>🔋 94%</span>
          </div>
        </div>

        {/* City Life Top Header */}
        <CityHeader
          selectedCity={selectedCityId}
          currentCityData={currentCityData}
          onSelectCity={handleSelectPresetCity}
          onOpenAI={() => setIsAIModalOpen(true)}
          onToggleSOS={handleToggleSOS}
          isSirenActive={isSirenActive}
          onOpenReportModal={() => {
            setReportModalDefaults(null);
            setIsReportModalOpen(true);
          }}
          onTriggerGPS={handleTriggerGPS}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          currentUser={currentUser}
          onOpenProfile={() => {
            if (currentUser) {
              setIsProfileModalOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          onOpenGuardian={() => setIsGuardianModalOpen(true)}
          onOpenPhrasebook={() => setIsPhrasebookModalOpen(true)}
        />

        {/* Scrollable Viewport Content */}
        <div className="app-viewport">
          {/* Active Audio Guide Player Banner */}
          {activeAudioGuide && isPlayingAudio && (
            <div style={{ padding: '8px 18px 0 18px' }}>
              <div className="audio-player-banner">
                <div className="audio-info">
                  <div className="soundwave-box">
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>
                      Playing: {activeAudioGuide.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#c084fc' }}>
                      Urban Voice Narration Active
                    </div>
                  </div>
                </div>

                <button
                  className="header-icon-btn"
                  onClick={handleStopAudio}
                  aria-label="Stop audio"
                  style={{ width: 28, height: 28 }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: EXPLORE & HOSPITALITY */}
          {activeTab === 'explore' && (
            <ExploreView
              spots={activeSpots}
              onNavigateToSpot={handleNavigateToSpot}
              onPlayAudioStory={handlePlayAudioStory}
            />
          )}

          {/* TAB 2: HISTORY & CULTURE */}
          {activeTab === 'history' && (
            <HistoryCultureView
              sites={activeHeritage}
              onPlayAudioStory={handlePlayAudioStory}
            />
          )}

          {/* TAB 3: DEDICATED FULL MAP VIEW (Real Map API, Global Search, Layers, GPS) */}
          {activeTab === 'map' && (
            <div className="view-content" style={{ paddingBottom: 0 }}>
              <div className="section-title-wrap">
                <div>
                  <h2 className="section-h2">
                    <NavIcon size={20} color="#06b6d4" />
                    Interactive Global Map
                  </h2>
                  <p className="section-subtitle">
                    Live OpenStreetMap vector tiles, Nominatim global search &amp; safe routing
                  </p>
                </div>
              </div>

              <InteractiveMap
                center={currentCityData.center}
                zoom={currentCityData.zoom || 14}
                spots={activeSpots}
                heritageSites={activeHeritage}
                incidents={activeIncidents}
                routeData={activeRouteData}
                activeRouteType={activeRouteType}
                onSelectSpot={handleNavigateToSpot}
                onSelectHeritage={(h) => handlePlayAudioStory(h.name, h.audioGuide.transcript)}
                onLocationSelected={handleSelectGlobalLocation}
                onSetRouteDestination={(dest) => {
                  handleNavigateToSpot(dest);
                }}
                onOpenReportAtLocation={handleOpenReportAtLocation}
                height="560px"
              />
            </div>
          )}

          {/* TAB 4: SAFETY & SECURITY & SAFEROUTE */}
          {activeTab === 'safety' && (
            <>
              {/* Mini Map Preview for SafeRoute */}
              <div style={{ padding: '12px 18px 0 18px' }}>
                <InteractiveMap
                  center={currentCityData.center}
                  zoom={14}
                  spots={activeSpots}
                  heritageSites={activeHeritage}
                  incidents={activeIncidents}
                  routeData={activeRouteData}
                  activeRouteType={activeRouteType}
                  onLocationSelected={handleSelectGlobalLocation}
                  onSetRouteDestination={handleNavigateToSpot}
                  height="220px"
                />
              </div>

              <SafetySecurityView
                routeOptions={activeRouteData}
                incidentsList={activeIncidents}
                activeRouteType={activeRouteType}
                setActiveRouteType={setActiveRouteType}
                onToggleSOS={handleToggleSOS}
                isSirenActive={isSirenActive}
                onOpenReportModal={() => {
                  setReportModalDefaults(null);
                  setIsReportModalOpen(true);
                }}
              />
            </>
          )}

          {/* TAB 5: BEST VS WORST PLACES BENCHMARK */}
          {activeTab === 'compare' && (
            <BestWorstView />
          )}

          {/* TAB 6: SMART CITY PULSE & TELEMETRY */}
          {activeTab === 'pulse' && (
            <SmartPulseView
              citizenReports={citizenReports}
              onUpvoteReport={handleUpvoteReport}
              onOpenReportModal={() => {
                setReportModalDefaults(null);
                setIsReportModalOpen(true);
              }}
              onPlayVoiceNote={handlePlayAudioStory}
            />
          )}
        </div>

        {/* Bottom Tab Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadReportsCount={citizenReports.length}
        />

        {/* Phone Bottom Home Indicator */}
        <div className="phone-home-indicator" />
      </main>

      {/* Global Location Search Modal (for ANY location on Earth) */}
      <GlobalLocationSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectLocation={handleSelectGlobalLocation}
      />

      {/* Citizen Crowdsourced Report Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        initialValues={reportModalDefaults}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportModalDefaults(null);
        }}
        onSubmitReport={handleAddCitizenReport}
      />

      {/* UrbanSense Conversational AI Agent Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        activeCityName={currentCityData.name}
        onClose={() => setIsAIModalOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* User Authentication Modal (Create Account / Sign In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* User Profile & Account Settings Modal (Delete Account / Stats) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        user={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />

      {/* Night Walk Guardian Companion Modal */}
      <NightWalkGuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        user={currentUser}
        currentCityName={currentCityData.name}
        onTriggerSOS={handleToggleSOS}
      />

      {/* Multilingual Emergency Phrasebook Modal */}
      <MultilingualPhrasebookModal
        isOpen={isPhrasebookModalOpen}
        onClose={() => setIsPhrasebookModalOpen(false)}
      />
    </div>
  );
}
