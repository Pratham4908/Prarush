import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, Heart, Navigation, Volume2, ShieldCheck, 
  DollarSign, Clock, Sparkles, MapPin, Globe, Crosshair, Map, 
  List, Maximize2, Loader2, CloudSun, Wind, AlertCircle, CheckCircle2, Download 
} from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap.jsx';
import { EXPLORE_SPOTS } from '../data/cityData.js';
import { audioSystem } from '../utils/audioSystem.js';
import { searchRealPlaces } from '../utils/realDataService.js';
import { isProSubscriber, downloadCityOfflinePack, getDownloadedPacks } from '../utils/freemiumService.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80';

export default function ExploreView({ 
  currentCityData = null,
  spots = EXPLORE_SPOTS, 
  heritageSites = [],
  incidents = [],
  routeData = null,
  activeRouteType = 'safest',
  onNavigateToSpot, 
  onPlayAudioStory,
  onTriggerGPS,
  onOpenGlobalSearch,
  onNavigateTab,
  onAddSpots,
  onOpenSubscription
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [dashboardViewMode, setDashboardViewMode] = useState('split'); // 'split', 'map', 'list'
  const [isSearchingLiveOSM, setIsSearchingLiveOSM] = useState(false);
  const [liveSearchNotice, setLiveSearchNotice] = useState(null);
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('city_saved_spots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const cityName = currentCityData?.name || 'MetroPulse';
  const centerCoords = currentCityData?.center || [40.7128, -74.006];
  const weather = currentCityData?.weather || {};

  const [downloadedPacks, setDownloadedPacks] = useState(() => getDownloadedPacks());
  const isPackCached = downloadedPacks.some(p => p.cityName.toLowerCase() === (currentCityData?.name || '').toLowerCase());

  const handleDownloadPack = () => {
    if (!isProSubscriber()) {
      if (onOpenSubscription) onOpenSubscription();
      return;
    }

    const cached = downloadCityOfflinePack(cityName, centerCoords);
    if (cached) {
      setDownloadedPacks(getDownloadedPacks());
      audioSystem.playSuccessSound();
      setLiveSearchNotice(`✓ Downloaded Offline Pack for ${cityName} (${cached.sizeMB} MB cached)!`);
    }
  };

  const toggleFavorite = (spotId, e) => {
    if (e) e.stopPropagation();
    setSavedFavorites(prev => {
      const updated = prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId];
      try {
        localStorage.setItem('city_saved_spots', JSON.stringify(updated));
      } catch {}
      audioSystem.playTone(700, 'sine', 0.08);
      return updated;
    });
  };

  const currentSpots = spots && spots.length > 0 ? spots : EXPLORE_SPOTS;
  const filteredSpots = currentSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'food') return spot.category === 'food';
    if (activeCategory === 'attraction') return spot.category === 'attraction';
    if (activeCategory === 'budget') return spot.isBudgetPick;
    if (activeCategory === 'hotel') return spot.category === 'hotel';
    if (activeCategory === 'favorites') return savedFavorites.includes(spot.id);
    return true;
  });

  // Live OpenStreetMap POI Search
  const handleLiveOSMSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLiveOSM(true);
    setLiveSearchNotice(null);
    audioSystem.playTone(550, 'sine', 0.1);

    try {
      const found = await searchRealPlaces(
        searchQuery.trim(),
        centerCoords[0],
        centerCoords[1],
        cityName
      );

      if (found && found.length > 0) {
        if (onAddSpots) {
          onAddSpots(found);
        }
        setLiveSearchNotice(`Found ${found.length} real places on OpenStreetMap!`);
        audioSystem.playSuccessSound();
      } else {
        setLiveSearchNotice(`No live OSM results found for "${searchQuery}".`);
      }
    } catch (err) {
      setLiveSearchNotice('Network lookup error. Showing local guides.');
    } finally {
      setIsSearchingLiveOSM(false);
    }
  };

  return (
    <div className="view-content" id="explore-view">
      {/* 1. LIVE URBAN TELEMETRY DASHBOARD HERO */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid var(--border-glass-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              Live Urban Radar &bull; Active Hub
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📍 {cityName}</span>
            </h2>
            <div style={{ fontSize: '0.68rem', color: '#67e8f9', marginTop: 2 }}>
              Coordinates: {centerCoords[0].toFixed(4)}°, {centerCoords[1].toFixed(4)}°
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {onTriggerGPS && (
              <button 
                className="sim-btn" 
                onClick={onTriggerGPS}
                title="Detect GPS"
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
              >
                <Crosshair size={12} color="#38bdf8" /> GPS
              </button>
            )}
            {onOpenGlobalSearch && (
              <button 
                className="sim-btn" 
                onClick={onOpenGlobalSearch}
                title="Search Global City"
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
              >
                <Globe size={12} color="#c084fc" /> City
              </button>
            )}
          </div>
        </div>

        {/* Live Weather & AQI Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
            <span>{weather.iconEmoji || '☀️'}</span>
            <strong>{weather.temp ?? 22}°C</strong>
            <span style={{ color: '#94a3b8' }}>{weather.condition || 'Clear Sky'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '2px 6px',
              borderRadius: 4
            }}>
              AQI {weather.aqi ?? 38} ({weather.aqiStatus || 'Good'})
            </span>

            <span style={{ color: '#38bdf8', fontSize: '0.68rem', fontWeight: 600 }}>
              Rain: {weather.rainChance ?? 15}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. LIVE SEARCH FORM (LOCAL + OPENSTREETMAP) */}
      <form onSubmit={handleLiveOSMSearch} style={{ display: 'flex', gap: 6 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            id="explore-search-input"
            type="text"
            className="form-input"
            placeholder="Search pizza, ramen, parks, boutique pods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, paddingRight: 30, background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setLiveSearchNotice(null); }}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isSearchingLiveOSM}
          style={{ padding: '0 12px', fontSize: '0.74rem', flexShrink: 0, height: 38 }}
          title="Search OpenStreetMap Live Directory"
        >
          {isSearchingLiveOSM ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Globe size={13} />
              <span>OSM</span>
            </>
          )}
        </button>
      </form>

      {/* Live Search Feedback Banner */}
      {liveSearchNotice && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: '0.72rem',
          color: '#67e8f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{liveSearchNotice}</span>
          <button 
            onClick={() => setLiveSearchNotice(null)}
            style={{ background: 'none', border: 'none', color: '#67e8f9', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. PROMINENT EMBEDDED DASHBOARD MAP */}
      {(dashboardViewMode === 'split' || dashboardViewMode === 'map') && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Map Controls Header */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(15, 23, 42, 0.85)',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff' }}>
              <Map size={14} color="#06b6d4" />
              <span>Interactive District Map ({filteredSpots.length} Pins)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Offline Pack Download (Freemium Gated) */}
              <button
                className="sim-btn"
                onClick={handleDownloadPack}
                title={isPackCached ? "Offline Pack Cached on Device" : isProSubscriber() ? "Download Offline Map Pack" : "Upgrade to Pro for Offline Packs"}
                style={{
                  fontSize: '0.65rem',
                  padding: '3px 7px',
                  background: isPackCached ? 'rgba(16, 185, 129, 0.15)' : !isProSubscriber() ? 'rgba(245, 158, 11, 0.15)' : undefined,
                  color: isPackCached ? '#10b981' : !isProSubscriber() ? '#f59e0b' : '#cbd5e1',
                  borderColor: isPackCached ? 'rgba(16, 185, 129, 0.4)' : !isProSubscriber() ? 'rgba(245, 158, 11, 0.4)' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                {isPackCached ? <CheckCircle2 size={11} color="#10b981" /> : <Download size={11} />}
                <span>{isPackCached ? 'Cached' : isProSubscriber() ? 'Offline' : 'Offline ⭐'}</span>
              </button>

              <button
                className={`sim-btn ${dashboardViewMode === 'split' ? 'active' : ''}`}
                onClick={() => setDashboardViewMode('split')}
                title="Split Map & Gems"
                style={{ fontSize: '0.65rem', padding: '3px 6px' }}
              >
                Split
              </button>
              <button
                className={`sim-btn ${dashboardViewMode === 'map' ? 'active' : ''}`}
                onClick={() => setDashboardViewMode('map')}
                title="Map Only"
                style={{ fontSize: '0.65rem', padding: '3px 6px' }}
              >
                Map
              </button>
              <button
                className="sim-btn"
                onClick={() => onNavigateTab && onNavigateTab('map')}
                title="Full View"
                style={{ fontSize: '0.65rem', padding: '3px 6px', color: '#38bdf8' }}
              >
                <Maximize2 size={11} /> Full
              </button>
            </div>
          </div>

          {/* Actual Embedded Leaflet Map */}
          <div style={{ height: dashboardViewMode === 'map' ? '420px' : '230px', position: 'relative' }}>
            <InteractiveMap
              center={centerCoords}
              zoom={13}
              spots={filteredSpots}
              heritageSites={heritageSites}
              incidents={incidents}
              routeData={routeData}
              activeRouteType={activeRouteType}
              onSelectSpot={onNavigateToSpot}
              height="100%"
            />
          </div>
        </div>
      )}

      {/* View Toggle Bar (if in map mode or collapsed) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
          Urban Gems &amp; Establishments ({filteredSpots.length})
        </div>

        <button
          className="sim-btn"
          onClick={() => setDashboardViewMode(prev => prev === 'list' ? 'split' : 'list')}
          style={{ fontSize: '0.68rem', padding: '3px 8px' }}
        >
          {dashboardViewMode === 'list' ? '🗺️ Show Map' : '📋 List Only'}
        </button>
      </div>

      {/* 4. FILTER CHIPS */}
      <div className="chip-filter-row" role="tablist">
        <button
          className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌟 All ({currentSpots.length})
        </button>
        <button
          className={`filter-chip ${activeCategory === 'food' ? 'active' : ''}`}
          onClick={() => setActiveCategory('food')}
        >
          🍜 Food
        </button>
        <button
          className={`filter-chip ${activeCategory === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveCategory('budget')}
        >
          🏷️ Budget
        </button>
        <button
          className={`filter-chip ${activeCategory === 'hotel' ? 'active' : ''}`}
          onClick={() => setActiveCategory('hotel')}
        >
          🏨 Stays
        </button>
        <button
          className={`filter-chip ${activeCategory === 'attraction' ? 'active' : ''}`}
          onClick={() => setActiveCategory('attraction')}
        >
          🏛️ Attractions
        </button>
        <button
          className={`filter-chip ${activeCategory === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveCategory('favorites')}
        >
          ❤️ Saved ({savedFavorites.length})
        </button>
      </div>

      {/* 5. SPOT CARDS GRID */}
      {dashboardViewMode !== 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredSpots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-glass)' }}>
              <AlertCircle size={28} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                No local preset gems found for "{searchQuery}"
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 14px 0' }}>
                Search OpenStreetMap global directory to query live restaurants, cafes, and attractions in {cityName}.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button
                  className="btn-primary"
                  onClick={handleLiveOSMSearch}
                  disabled={isSearchingLiveOSM}
                  style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                >
                  {isSearchingLiveOSM ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                  <span>Search OpenStreetMap Live</span>
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  style={{ fontSize: '0.74rem', padding: '6px 12px' }}
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            filteredSpots.map(spot => {
              const isFav = savedFavorites.includes(spot.id);

              return (
                <article
                  key={spot.id}
                  className="city-card"
                  onClick={() => setSelectedSpot(spot)}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${spot.name}`}
                >
                  {/* Media Image */}
                  <div className="card-media">
                    <img 
                      src={spot.image || FALLBACK_IMG} 
                      alt={spot.name} 
                      loading="lazy" 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                    />
                    <div className="card-badge-top-left" style={{ color: spot.isRealOSMData ? '#6ee7b7' : '#38bdf8', borderColor: spot.isRealOSMData ? '#10b98155' : 'var(--border-glass)' }}>
                      <span>{spot.isRealOSMData ? '🌐 OSM Live' : spot.subCategory}</span>
                    </div>
                    <div className="card-badge-top-right">
                      <span>★ {spot.rating}</span>
                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>({spot.reviewsCount})</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(spot.id, e)}
                      aria-label={isFav ? "Remove favorite" : "Save favorite"}
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(9, 13, 22, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: isFav ? '#f43f5e' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={16} fill={isFav ? '#f43f5e' : 'none'} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{spot.name}</span>
                      {spot.isRealOSMData && (
                        <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          REAL OSM POI
                        </span>
                      )}
                    </div>

                    <div className="card-meta-row">
                      <span>📍 {spot.neighborhood}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{spot.costAvg}</span>
                    </div>

                    {/* Safety & Cleanliness indicators */}
                    <div className="card-scores-row">
                      <div className="score-badge" style={{ color: '#10b981' }}>
                        <ShieldCheck size={14} />
                        <span>{spot.safetyScore}% Safety</span>
                      </div>
                      <span style={{ opacity: 0.3 }}>|</span>
                      <div className="score-badge" style={{ color: '#38bdf8' }}>
                        <span>✨ {spot.cleanlinessScore}% Clean</span>
                      </div>
                      <span style={{ opacity: 0.3 }}>|</span>
                      <div className="score-badge" style={{ color: '#f59e0b' }}>
                        <Clock size={13} />
                        <span>{spot.busyLevel}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {spot.description}
                    </p>

                    {/* Insider Tip Box */}
                    <div className="card-tip-box">
                      <span>💡</span>
                      <span><strong>Local Tip:</strong> {spot.insiderTip}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="card-actions-row">
                      <button
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToSpot(spot);
                        }}
                      >
                        <Navigation size={14} />
                        Navigate via SafeRoute
                      </button>

                      {spot.audioStory && (
                        <button
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayAudioStory(spot.name, spot.audioStory);
                          }}
                          title="Listen to story"
                          aria-label="Play audio story"
                        >
                          <Volume2 size={14} color="#a78bfa" />
                          Audio Story
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="modal-overlay" onClick={() => setSelectedSpot(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="sheet-title">{selectedSpot.name}</span>
              <button
                className="header-icon-btn"
                onClick={() => setSelectedSpot(null)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className="sheet-content">
              <div style={{ borderRadius: 14, overflow: 'hidden', height: 180 }}>
                <img 
                  src={selectedSpot.image || FALLBACK_IMG} 
                  alt={selectedSpot.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedSpot.neighborhood}</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {selectedSpot.rating} ({selectedSpot.reviewsCount} reviews)</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                {selectedSpot.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedSpot.tags.map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', color: '#94a3b8' }}>
                    #{t}
                  </span>
                ))}
              </div>

              <div className="card-tip-box" style={{ marginTop: 8 }}>
                <span>💡</span>
                <span><strong>Insider Tip:</strong> {selectedSpot.insiderTip}</span>
              </div>

              {selectedSpot.audioStory && (
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Volume2 size={16} /> Heritage &amp; Lore Audio
                    </span>
                    <button
                      className="sim-btn active"
                      onClick={() => onPlayAudioStory(selectedSpot.name, selectedSpot.audioStory)}
                    >
                      ▶ Listen Aloud
                    </button>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    "{selectedSpot.audioStory}"
                  </p>
                </div>
              )}

              <button
                className="btn-primary"
                style={{ marginTop: 10 }}
                onClick={() => {
                  const s = selectedSpot;
                  setSelectedSpot(null);
                  onNavigateToSpot(s);
                }}
              >
                <Navigation size={16} />
                Set Destination in SafeRoute AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
