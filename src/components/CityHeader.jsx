import React from 'react';
import { 
  ShieldAlert, Bot, CloudSun, AlertTriangle, ChevronDown, Radio, 
  Crosshair, User, ShieldCheck, Languages, Globe, Sparkles 
} from 'lucide-react';
import { CITIES } from '../data/cityData.js';
import { isProSubscriber } from '../utils/freemiumService.js';
import { SUPPORTED_LOCALES } from '../utils/i18n.js';

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
  onOpenPhrasebook,
  onOpenSubscription,
  currentLocale = 'en',
  onChangeLocale
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
          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              className="header-icon-btn"
              style={{ width: 32, height: 32, fontSize: '0.88rem' }}
              title="Select Language"
              aria-label="Select Language"
            >
              {SUPPORTED_LOCALES.find(l => l.code === currentLocale)?.flag || '🌐'}
            </button>
            <select
              aria-label="Change Language"
              value={currentLocale}
              onChange={(e) => {
                if (onChangeLocale) onChangeLocale(e.target.value);
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
              {SUPPORTED_LOCALES.map(loc => (
                <option key={loc.code} value={loc.code}>
                  {loc.flag} {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scout Pro Pill / Upgrade Trigger */}
          <button
            className="header-icon-btn"
            style={{
              width: 'auto',
              height: 30,
              padding: '0 8px',
              borderRadius: 999,
              fontSize: '0.68rem',
              fontWeight: 800,
              background: isProSubscriber() ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' : 'rgba(255, 255, 255, 0.05)',
              border: isProSubscriber() ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-glass)',
              color: isProSubscriber() ? '#f59e0b' : '#38bdf8',
              gap: 4
            }}
            onClick={onOpenSubscription}
            title={isProSubscriber() ? "Scout Pro Active Membership" : "Upgrade to Scout Pro"}
            aria-label="Scout Pro Membership"
          >
            <Sparkles size={12} color={isProSubscriber() ? '#f59e0b' : '#38bdf8'} />
            <span>{isProSubscriber() ? 'PRO' : 'UPGRADE'}</span>
          </button>

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
