import React, { useState } from 'react';
import { Search, SlidersHorizontal, Heart, Navigation, Volume2, ShieldCheck, DollarSign, Clock, Sparkles } from 'lucide-react';
import { EXPLORE_SPOTS } from '../data/cityData.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function ExploreView({ spots = EXPLORE_SPOTS, onNavigateToSpot, onPlayAudioStory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('city_saved_spots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (spotId, e) => {
    e.stopPropagation();
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

  return (
    <div className="view-content" id="explore-view">
      {/* Title & Tagline */}
      <div className="section-title-wrap">
        <div>
          <h2 className="section-h2">
            <Sparkles size={20} color="#06b6d4" />
            Exploration &amp; Hospitality
          </h2>
          <p className="section-subtitle">
            Uncover hidden culinary dens, budget stays &amp; top urban attractions
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
        <input
          id="explore-search-input"
          type="text"
          className="form-input"
          placeholder="Search hidden ramen, rooftop bars, boutique pods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 42, background: 'rgba(255, 255, 255, 0.05)' }}
        />
      </div>

      {/* Filter Chips */}
      <div className="chip-filter-row" role="tablist">
        <button
          className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌟 All Gems
        </button>
        <button
          className={`filter-chip ${activeCategory === 'food' ? 'active' : ''}`}
          onClick={() => setActiveCategory('food')}
        >
          🍜 Food &amp; Izakayas
        </button>
        <button
          className={`filter-chip ${activeCategory === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveCategory('budget')}
        >
          🏷️ Budget Friendly
        </button>
        <button
          className={`filter-chip ${activeCategory === 'hotel' ? 'active' : ''}`}
          onClick={() => setActiveCategory('hotel')}
        >
          🏨 Stays &amp; Pods
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

      {/* Spot Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredSpots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <p>No spots match your filters or search query.</p>
            <button
              className="btn-secondary"
              style={{ margin: '12px auto' }}
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            >
              Reset Filters
            </button>
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
                  <img src={spot.image} alt={spot.name} loading="lazy" />
                  <div className="card-badge-top-left">
                    <span>{spot.subCategory}</span>
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
                  <div className="card-title">{spot.name}</div>
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
                <img src={selectedSpot.image} alt={selectedSpot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
