import React, { useState } from 'react';
import { Search, MapPin, Crosshair, X, Globe, Sparkles, Loader2 } from 'lucide-react';
import { searchGlobalLocation, getBrowserGeolocation, reverseGeocodeCoords } from '../utils/locationService.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function GlobalLocationSearchModal({ isOpen, onClose, onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const POPULAR_CITIES = [
    { name: 'Tokyo', country: 'Japan', coords: [35.6762, 139.6503] },
    { name: 'Paris', country: 'France', coords: [48.8566, 2.3522] },
    { name: 'New York', country: 'United States', coords: [40.7128, -74.006] },
    { name: 'London', country: 'United Kingdom', coords: [51.5074, -0.1278] },
    { name: 'Mumbai', country: 'India', coords: [19.076, 72.8777] },
    { name: 'Berlin', country: 'Germany', coords: [52.52, 13.405] },
    { name: 'Sydney', country: 'Australia', coords: [-33.8688, 151.2093] },
    { name: 'Dubai', country: 'United Arab Emirates', coords: [25.2048, 55.2708] }
  ];

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await searchGlobalLocation(query);
      setResults(res);
    } catch (err) {
      console.warn('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGPSDetect = async () => {
    setIsLocating(true);
    try {
      const pos = await getBrowserGeolocation();
      const geoInfo = await reverseGeocodeCoords(pos.coords[0], pos.coords[1]);
      audioSystem.playSuccessSound();
      onSelectLocation(geoInfo.city || geoInfo.name, pos.coords, geoInfo.country);
      onClose();
    } catch (err) {
      alert('Unable to retrieve GPS coordinates: ' + (err.message || 'Please check browser location permissions'));
    } finally {
      setIsLocating(false);
    }
  };

  const handlePickCity = (name, coords, country) => {
    audioSystem.playTone(660, 'sine', 0.1);
    onSelectLocation(name, coords, country);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '88%' }}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4'
            }}>
              <Globe size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Global Location Search</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>OpenStreetMap Live Geocoding API</div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content">
          {/* Real GPS Location Button */}
          <button
            onClick={handleGPSDetect}
            disabled={isLocating}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#fff',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isLocating ? (
                <Loader2 size={20} color="#38bdf8" className="animate-spin" />
              ) : (
                <Crosshair size={20} color="#38bdf8" />
              )}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                  {isLocating ? 'Acquiring GPS Signal...' : 'Use My Current Physical Location'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Centers the app, map &amp; SafeRoute around where you are right now
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Auto-Detect 📍</span>
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="global-location-input"
                type="text"
                className="form-input"
                placeholder="Type ANY city, town or address globally..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: 68, flex: 'none', padding: 0 }}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Live Search Results */}
          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Search Results:</div>
              {results.map((res) => (
                <div
                  key={res.id}
                  onClick={() => handlePickCity(res.name, res.coords, res.country)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                >
                  <MapPin size={16} color="#06b6d4" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{res.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.fullName}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600 }}>Explore →</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Popular Global Hubs */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#f59e0b" />
              Popular Global Metropolises
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handlePickCity(c.name, c.coords, c.country)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <MapPin size={14} color="#8b5cf6" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{c.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
