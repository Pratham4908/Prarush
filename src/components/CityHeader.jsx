import React from 'react';
import { 
  ShieldAlert, Bot, CloudSun, AlertTriangle, ChevronDown, Radio, 
  Crosshair, User, ShieldCheck, Languages, Globe 
} from 'lucide-react';
import { CITIES } from '../data/cityData.js';

export default function CityHeader({
  selectedCity,
  currentCityData,
  onSelectCity,
  onOpenAI,
  onToggleSOS,
  isSirenActive,
  onOpenReportModal,
  onTriggerGPS,
  onOpenGlobalSearch,
  currentUser,
  onOpenProfile,
  onOpenGuardian,
  onOpenPhrasebook
}) {
  const activeCity = currentCityData || CITIES.find(c => c.id === selectedCity) || CITIES[0];

  return (
    <header className="app-header">
      <div className="header-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* City / Location Pill */}
          <div className="city-selector-btn" style={{ position: 'relative' }}>
            <span style={{ fontSize: '1.05rem' }}>📍</span>
            <select
              id="city-select-dropdown"
              aria-label="Select City or Location"
              value={selectedCity}
              onChange={(e) => {
                if (e.target.value === '__locate__') {
                  if (onTriggerGPS) onTriggerGPS();
                } else if (e.target.value === '__search__') {
                  if (onOpenGlobalSearch) onOpenGlobalSearch();
                } else {
                  onSelectCity(e.target.value);
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            >
              <optgroup label="Presets">
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Global Options">
                <option value="__locate__">📡 Use My Current GPS Location</option>
                <option value="__search__">🔍 Search Any City Worldwide...</option>
              </optgroup>
            </select>
            <span style={{ maxWidth: 95, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeCity.name.split(' (')[0]}
            </span>
            <ChevronDown size={13} color="#94a3b8" />
          </div>

          {/* Quick GPS Auto-Detect Button */}
          <button
            className="header-icon-btn"
            style={{ width: 30, height: 30 }}
            onClick={onTriggerGPS}
            title="Auto-Detect My GPS"
            aria-label="Auto-Detect GPS"
          >
            <Crosshair size={14} color="#38bdf8" />
          </button>
        </div>

        <div className="header-actions">
          {/* Night Walk Guardian Companion */}
          <button
            className="header-icon-btn"
            style={{ width: 32, height: 32, color: '#10b981' }}
            onClick={onOpenGuardian}
            title="Night Walk Guardian"
            aria-label="Night Walk Guardian"
          >
            <ShieldCheck size={16} />
          </button>

          {/* Global Phrasebook */}
          <button
            className="header-icon-btn"
            style={{ width: 32, height: 32, color: '#a855f7' }}
            onClick={onOpenPhrasebook}
            title="Emergency Phrasebook"
            aria-label="Emergency Phrasebook"
          >
            <Languages size={15} />
          </button>

          {/* AI Copilot Launcher */}
          <button
            id="header-ai-btn"
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            onClick={onOpenAI}
            title="UrbanSense AI Copilot"
            aria-label="UrbanSense AI Copilot"
          >
            <Bot size={16} color="#06b6d4" />
          </button>

          {/* User Account / Profile */}
          <button
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            onClick={onOpenProfile}
            title={currentUser ? `Profile: ${currentUser.name}` : 'Sign In / Create Account'}
            aria-label="User Account"
          >
            <span style={{ fontSize: '0.95rem' }}>{currentUser?.avatar || '👤'}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            id="header-sos-btn"
            className={`header-icon-btn sos-trigger-btn ${isSirenActive ? 'flashing' : ''}`}
            style={{ width: 32, height: 32 }}
            onClick={onToggleSOS}
            title={isSirenActive ? "Stop Emergency Siren" : "Emergency SOS & Siren"}
            aria-label="Emergency SOS"
          >
            <ShieldAlert size={16} />
          </button>
        </div>
      </div>

      {/* Real-time Ticker Strip (Real Open-Meteo & Live telemetry) */}
      <div className="live-ticker-strip">
        <div className="ticker-item">
          <CloudSun size={13} color="#38bdf8" />
          <span>{activeCity.weather?.temp || 22}°C {activeCity.weather?.condition || 'Clear'}</span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-item">
          <span className="ticker-badge-safe">AQI {activeCity.weather?.aqi || 38} ({activeCity.weather?.aqiStatus || 'Good'})</span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-item">
          <Radio size={13} color="#f59e0b" />
          <span>Traffic: <strong>{activeCity.trafficIndex || 48}% Delay</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-item ticker-badge-warn">
          <AlertTriangle size={12} />
          <span>Rain: {activeCity.weather?.rainChance || 15}%</span>
        </div>
      </div>
    </header>
  );
}
