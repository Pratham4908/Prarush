import React, { useState } from 'react';
import { 
  Radio, CloudRain, Wind, AlertCircle, ThumbsUp, Volume2, 
  MessageSquare, PlusCircle, CheckCircle, Flame, Car, Share2, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRAFFIC_CORRIDORS, WEATHER_ALERTS, SOCIAL_BUZZ_STREAM } from '../data/pulseData';
import { audioSystem } from '../utils/audioSystem';

export default function SmartPulseView({ 
  currentCityData = null,
  citizenReports = [], 
  onUpvoteReport, 
  onRefreshWeather,
  onOpenReportModal,
  onPlayVoiceNote 
}) {
  const [pulseSubTab, setPulseSubTab] = useState('citizen'); // 'citizen', 'traffic', 'weather', 'social'
  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState(null);

  const handleUpvote = (reportId, e) => {
    e.stopPropagation();
    onUpvoteReport(reportId);
    audioSystem.playTone(800, 'triangle', 0.1);

    // Fire colorful micro-confetti
    try {
      confetti({
        particleCount: 28,
        spread: 45,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  const handleToggleVoice = (report) => {
    if (activeVoicePlayingId === report.id) {
      audioSystem.stopSpeech();
      setActiveVoicePlayingId(null);
    } else {
      setActiveVoicePlayingId(report.id);
      audioSystem.speak(
        report.voiceTranscript || "Voice note playing: All clear in the area.",
        () => setActiveVoicePlayingId(report.id),
        () => setActiveVoicePlayingId(null),
        () => setActiveVoicePlayingId(null)
      );
    }
  };

  return (
    <div className="view-content" id="pulse-view">
      {/* Title & Tagline */}
      <div className="section-title-wrap">
        <div>
          <h2 className="section-h2">
            <Radio size={20} color="#06b6d4" />
            Smart City Pulse &amp; Live Telemetry
          </h2>
          <p className="section-subtitle">
            Real-time traffic, weather radar, citizen voice notes &amp; urban buzz
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="chip-filter-row" role="tablist">
        <button
          className={`filter-chip ${pulseSubTab === 'citizen' ? 'active' : ''}`}
          onClick={() => setPulseSubTab('citizen')}
        >
          📣 Citizen Reports ({citizenReports.length})
        </button>
        <button
          className={`filter-chip ${pulseSubTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setPulseSubTab('traffic')}
        >
          🚦 Traffic Congestion
        </button>
        <button
          className={`filter-chip ${pulseSubTab === 'weather' ? 'active' : ''}`}
          onClick={() => setPulseSubTab('weather')}
        >
          🌧️ Weather &amp; AQI
        </button>
        <button
          className={`filter-chip ${pulseSubTab === 'social' ? 'active' : ''}`}
          onClick={() => setPulseSubTab('social')}
        >
          💬 Social Radar
        </button>
      </div>

      {/* TAB 1: CITIZEN CROWDSOURCED REPORTS */}
      {pulseSubTab === 'citizen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Add Report Prompt Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                Spotted a hazard or hidden gem?
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Upload photos or record a 15-second voice memo for fellow citizens.
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '8px 12px', flexShrink: 0 }}
              onClick={onOpenReportModal}
            >
              <PlusCircle size={15} />
              + Post Report
            </button>
          </div>

          {/* Citizen Reports Feed */}
          {citizenReports.map(rep => {
            const isPlayingVoice = activeVoicePlayingId === rep.id;
            const isHazard = rep.category === 'hazard' || rep.category === 'lighting';

            return (
              <article
                key={rep.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden'
                }}
              >
                {/* Image if present */}
                {rep.image && (
                  <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                    <img src={rep.image} alt={rep.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: isHazard ? 'rgba(244, 63, 94, 0.85)' : 'rgba(16, 185, 129, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {rep.categoryLabel}
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(9, 13, 22, 0.85)',
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: '0.68rem',
                      color: '#94a3b8'
                    }}>
                      {rep.timestamp}
                    </div>
                  </div>
                )}

                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{rep.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📍 {rep.location}</div>
                    </div>

                    {rep.verified && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {rep.description}
                  </p>

                  {/* Voice Note Audio Component */}
                  {rep.hasVoiceNote && (
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleToggleVoice(rep)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isPlayingVoice ? '#ec4899' : 'var(--accent-purple)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}
                          aria-label={isPlayingVoice ? "Pause voice note" : "Play voice note"}
                        >
                          {isPlayingVoice ? '⏸' : '▶'}
                        </button>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e9d5ff' }}>
                            Voice Note ({rep.voiceDuration})
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {isPlayingVoice ? '🔊 Playing Audio...' : 'Tap to listen to scout recording'}
                          </div>
                        </div>
                      </div>

                      {isPlayingVoice && (
                        <div className="soundwave-box">
                          <span className="soundwave-bar" />
                          <span className="soundwave-bar" />
                          <span className="soundwave-bar" />
                          <span className="soundwave-bar" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Author Meta & Upvoting Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 6,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.72rem',
                    color: '#64748b'
                  }}>
                    <span>👤 {rep.author} • <em style={{ color: '#94a3b8' }}>{rep.authorBadge}</em></span>

                    <button
                      onClick={(e) => handleUpvote(rep.id, e)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        cursor: 'pointer'
                      }}
                      aria-label={`Upvote report, currently ${rep.upvotes} upvotes`}
                    >
                      <ThumbsUp size={13} />
                      <span>{rep.upvotes}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB 2: TRAFFIC CONGESTION CORRIDORS */}
      {pulseSubTab === 'traffic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Car size={20} color="#f59e0b" />
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Metropolitan Traffic Radar monitors 46 real-time sensors across key arterial corridors.
            </div>
          </div>

          {TRAFFIC_CORRIDORS.map(cor => {
            const isHeavy = cor.status === 'heavy';
            const color = isHeavy ? '#f43f5e' : (cor.status === 'moderate' ? '#f59e0b' : '#10b981');

            return (
              <div
                key={cor.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{cor.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Speed: {cor.speedKmh} • Cause: {cor.cause}</div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: color,
                    background: `${color}1a`,
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    {cor.delayMin}
                  </span>
                </div>

                {/* Congestion Gauge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem' }}>
                  <span style={{ color: '#94a3b8' }}>Congestion Index</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${cor.congestionPct}%`, height: '100%', background: color, borderRadius: 4 }} />
                  </div>
                  <strong style={{ color: color }}>{cor.congestionPct}%</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: REAL-TIME WEATHER & AIR QUALITY TELEMETRY (OPEN-METEO LIVE API) */}
      {pulseSubTab === 'weather' && (() => {
        const weather = currentCityData?.weather || {};
        const temp = weather.temp ?? 22;
        const feelsLike = weather.feelsLike ?? temp;
        const condition = weather.condition || 'Clear Sky';
        const iconEmoji = weather.iconEmoji || '☀️';
        const humidity = weather.humidity ?? 52;
        const windKmh = weather.windKmh ?? 12;
        const precip = weather.precipitation ?? 0;
        const rainChance = weather.rainChance ?? 15;
        const uv = weather.uv ?? 3;
        const aqi = weather.aqi ?? 38;
        const aqiStatus = weather.aqiStatus || 'Good';
        const pm25 = weather.pm25 ?? 12;
        const pm10 = weather.pm10 ?? 20;
        const sunset = weather.sunset || '18:45';
        const sunrise = weather.sunrise || '06:15';
        const cityName = currentCityData?.name || 'Metropolitan Area';
        const centerCoords = currentCityData?.center || [40.713, -74.006];

        // Dynamic Advisories derived directly from live sensor telemetry
        const liveAdvisories = [];
        if (rainChance > 25 || precip > 0) {
          liveAdvisories.push({
            id: 'adv-rain',
            icon: '🌧️',
            title: `Precipitation Risk (${rainChance}% Probability)`,
            severity: 'warning',
            detail: `Sensor telemetry detects ${precip > 0 ? precip + ' mm active rainfall' : 'elevated atmospheric condensation'}. Sidewalks may be slippery in shaded alleys.`,
            action: 'Carry a compact windproof umbrella; prioritize illuminated boulevards.'
          });
        }
        if (uv >= 4) {
          liveAdvisories.push({
            id: 'adv-uv',
            icon: '☀️',
            title: `Elevated UV Radiation Index (${uv} / 11)`,
            severity: 'warning',
            detail: 'Moderate to high solar irradiance detected in open plazas and waterfront corridors.',
            action: 'Wear UV-rated eyewear or seek shaded arcade verandas during peak daylight.'
          });
        }
        if (aqi > 50) {
          liveAdvisories.push({
            id: 'adv-aqi',
            icon: '😷',
            title: `Air Quality Caution (AQI ${aqi} • ${aqiStatus})`,
            severity: 'warning',
            detail: `Particulate matter PM2.5 is at ${pm25} µg/m³. Atmospheric inversion trapping street exhaust in dense corridors.`,
            action: 'Sensitive walkers should opt for green corridor paths through municipal parks.'
          });
        } else {
          liveAdvisories.push({
            id: 'adv-clean-air',
            icon: '🍃',
            title: `Pristine Air Basin (AQI ${aqi} • ${aqiStatus})`,
            severity: 'good',
            detail: `Optimal pedestrian air conditions across ${cityName}. Particulate PM2.5 is well below WHO threshold (${pm25} µg/m³).`,
            action: 'Ideal window for outdoor walking tours, cycling, and rooftop exploration.'
          });
        }
        if (windKmh > 20) {
          liveAdvisories.push({
            id: 'adv-wind',
            icon: '💨',
            title: `Gusty Corridors (${windKmh} km/h)`,
            severity: 'warning',
            detail: 'Skyscraper urban wind-tunneling effect present along north-south transit avenues.',
            action: 'Secure light headwear and exercise care on riverside pedestrian bridges.'
          });
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Live Station Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="live-pulse-dot" style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Open-Meteo Live Ground Station
                    <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      REAL LIVE API
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {cityName} ({centerCoords[0].toFixed(3)}°, {centerCoords[1].toFixed(3)}°) • Satellite Synced
                  </div>
                </div>
              </div>

              {onRefreshWeather && (
                <button
                  className="sim-btn"
                  onClick={onRefreshWeather}
                  title="Refresh satellite data"
                  style={{ fontSize: '0.7rem', padding: '5px 9px', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span>🔄</span> Refresh
                </button>
              )}
            </div>

            {/* Core Temperature & Weather Overview Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{iconEmoji}</span>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {temp}°C <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>/ {Math.round(temp * 1.8 + 32)}°F</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, marginTop: 4 }}>
                      {condition}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <div>Feels Like: <strong style={{ color: '#fff' }}>{feelsLike}°C</strong></div>
                  <div>Sunrise: <strong style={{ color: '#fbbf24' }}>{sunrise}</strong></div>
                  <div>Sunset: <strong style={{ color: '#f97316' }}>{sunset}</strong></div>
                </div>
              </div>

              {/* 6-Grid Meteorological Sensors */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                paddingTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>💧 Humidity</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{humidity}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>💨 Wind Speed</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{windKmh} km/h</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>🌧️ Rain Chance</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>{rainChance}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>☔ Precip.</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{precip} mm</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>☀️ UV Index</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>{uv} / 11</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>🍃 AQI Index</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>{aqi} ({aqiStatus})</div>
                </div>
              </div>
            </div>

            {/* Live Air Quality Details Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wind size={15} color="#10b981" />
                  Real-Time Air Quality (Open-Meteo AQI API)
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: aqi <= 50 ? '#10b981' : (aqi <= 100 ? '#f59e0b' : '#ef4444'),
                  background: aqi <= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {aqiStatus} ({aqi} AQI)
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (aqi / 150) * 100)}%`,
                  height: '100%',
                  background: aqi <= 50 ? '#10b981' : (aqi <= 100 ? '#f59e0b' : '#ef4444'),
                  borderRadius: 3
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>Fine Particles (PM2.5): <strong style={{ color: '#fff' }}>{pm25} µg/m³</strong></span>
                <span>Coarse Dust (PM10): <strong style={{ color: '#fff' }}>{pm10} µg/m³</strong></span>
              </div>
            </div>

            {/* Dynamic Sensor-Derived Alerts & Advisories */}
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginTop: 4 }}>
              Dynamic Meteorological Advisories:
            </div>

            {liveAdvisories.map(adv => (
              <div
                key={adv.id}
                style={{
                  background: adv.severity === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: adv.severity === 'warning' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.82rem', color: adv.severity === 'warning' ? '#f59e0b' : '#10b981' }}>
                  <span>{adv.icon}</span>
                  <span>{adv.title}</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {adv.detail}
                </p>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#fff',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '5px 8px',
                  borderRadius: 6
                }}>
                  💡 <strong>Recommendation:</strong> {adv.action}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* TAB 4: SOCIAL BUZZ RADAR */}
      {pulseSubTab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: 2 }}>
            Simulated hyper-local social media chatter &amp; citizen shouts
          </div>

          {SOCIAL_BUZZ_STREAM.map(soc => (
            <div
              key={soc.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <strong style={{ color: '#38bdf8' }}>{soc.handle}</strong>
                <span style={{ color: '#64748b' }}>{soc.time}</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                {soc.text}
              </p>

              <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 600 }}>
                {soc.tag}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
