import React from 'react';
import { ShieldAlert, Bot, CloudSun, AlertTriangle, ChevronDown, Radio, Crosshair, Globe } from 'lucide-react';
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
  onOpenGlobalSearch
}) {
  // Use passed active city data if custom, else find in CITIES
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
            <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeCity.name.split(' (')[0]}
            </span>
            <ChevronDown size={13} color="#94a3b8" />
          </div>

          {/* Quick GPS Button */}
          <button
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            onClick={onTriggerGPS}
            title="Locate via GPS"
            aria-label="Use Current GPS Location"
          >
            <Crosshair size={14} color="#38bdf8" />
          </button>
        </div>

        <div className="header-actions">
          {/* Citizen Report Trigger */}
          <button
            id="header-report-btn"
            className="header-icon-btn"
            onClick={onOpenReportModal}
            title="Report Incident or Gem"
            aria-label="Report Incident"
          >
            <span style={{ fontSize: '1rem' }}>📣</span>
          </button>

          {/* AI Copilot Launcher */}
          <button
            id="header-ai-btn"
            className="header-icon-btn"
            onClick={onOpenAI}
            title="UrbanSense AI Copilot"
            aria-label="UrbanSense AI Copilot"
          >
            <Bot size={18} color="#06b6d4" />
          </button>

          {/* Emergency SOS Button */}
          <button
            id="header-sos-btn"
            className={`header-icon-btn sos-trigger-btn ${isSirenActive ? 'flashing' : ''}`}
            onClick={onToggleSOS}
            title={isSirenActive ? "Stop Emergency Siren" : "Emergency SOS & Siren"}
            aria-label="Emergency SOS"
          >
            <ShieldAlert size={18} />
          </button>
        </div>
      </div>

      {/* Real-time Ticker Strip */}
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
          <span>Traffic: <strong>{activeCity.trafficIndex || 50}% Delay</strong></span>
        </div>
        <span style={{ opacity: 0.3 }}>•</span>
        <div className="ticker-item ticker-badge-warn">
          <AlertTriangle size={12} />
          <span>Rain surge: {activeCity.weather?.rainChance || 20}%</span>
        </div>
      </div>
    </header>
  );
}
