import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Navigation, AlertTriangle, LightbulbOff, 
  PhoneCall, BellRing, Eye, Share2, Volume2, CheckCircle, ChevronRight, Zap, Sparkles, Filter 
} from 'lucide-react';
import { SAFETY_INCIDENTS, ROUTE_OPTIONS, EMERGENCY_CONTACTS } from '../data/safetyData.js';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber } from '../utils/freemiumService.js';

export default function SafetySecurityView({ 
  routeOptions = ROUTE_OPTIONS,
  incidentsList = SAFETY_INCIDENTS,
  activeRouteType, 
  setActiveRouteType, 
  onToggleSOS, 
  isSirenActive,
  onRecalculateRealRoute,
  onOpenReportModal,
  onOpenSubscription
}) {
  const currentRoute = routeOptions || ROUTE_OPTIONS;
  const currentIncidents = incidentsList && incidentsList.length > 0 ? incidentsList : SAFETY_INCIDENTS;
  const [activeTab, setActiveTab] = useState('route'); // 'route', 'incidents', 'sos'
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [showFakeCallModal, setShowFakeCallModal] = useState(false);
  const [locationCopied, setLocationCopied] = useState(false);
  
  // Scout Pro Hazard Filters
  const [avoidLowLight, setAvoidLowLight] = useState(true);
  const [bypassRoadworks, setBypassRoadworks] = useState(true);
  const [policeBufferActive, setPoliceBufferActive] = useState(true);

  const navSteps = (currentRoute.steps && currentRoute.steps.length > 0)
    ? currentRoute.steps
    : [
      { text: `Start at ${currentRoute.origin?.name || 'Metropolis Central Station'}. Head along lit main avenue.`, safeNotice: "Well-lit corridor (98% LED), High footfall" },
      { text: "Pass Civic Plaza North Police Substation & Emergency Kiosk.", safeNotice: "Manned Police post & Emergency call box on your left" },
      { text: "Turn along illuminated pedestrian boulevard toward destination.", safeNotice: "Avoided unlit alley shortcut. Safe pedestrian corridor" },
      { text: `Arrived safely at ${currentRoute.destination?.name || 'The Rusty Lantern Ramen'}!`, safeNotice: "Area rated 92% night safety" }
    ];

  const handleStartNav = () => {
    setIsNavigating(true);
    setNavStepIndex(0);
    audioSystem.speak(
      navSteps[0].text,
      null,
      null,
      () => {}
    );
  };

  const handleNextStep = () => {
    if (navStepIndex < navSteps.length - 1) {
      const nextIdx = navStepIndex + 1;
      setNavStepIndex(nextIdx);
      audioSystem.speak(navSteps[nextIdx].text);
    } else {
      setIsNavigating(false);
      audioSystem.playSuccessSound();
    }
  };

  const handleShareLocation = () => {
    const text = "📍 My current location: Metropolis Central Station (40.7182, -74.0085). Walking via SafeRoute AI to Old Quarter. Safe & on tracked corridor.";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setLocationCopied(true);
    setTimeout(() => setLocationCopied(false), 2500);
    audioSystem.playTone(600, 'sine', 0.1);
  };

  const triggerFakeCall = () => {
    setShowFakeCallModal(true);
    audioSystem.playTone(440, 'sine', 0.3);
  };

  return (
    <div className="view-content" id="safety-view">
      {/* Title & Tagline */}
      <div className="section-title-wrap">
        <div>
          <h2 className="section-h2">
            <ShieldAlert size={20} color="#10b981" />
            Safety &amp; SafeRoute AI™
          </h2>
          <p className="section-subtitle">
            Bypass dark corridors, dodge accident hotspots &amp; walk with confidence
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="chip-filter-row" role="tablist">
        <button
          className={`filter-chip ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          🧭 SafeRoute AI
        </button>
        <button
          className={`filter-chip ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          ⚠️ Incident Radar ({currentIncidents.length})
        </button>
        <button
          className={`filter-chip ${activeTab === 'sos' ? 'active' : ''}`}
          onClick={() => setActiveTab('sos')}
        >
          🚨 SOS Guard &amp; Tools
        </button>
      </div>

      {/* TAB 1: SAFEROUTE AI COMPARISON */}
      {activeTab === 'route' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Origin and Destination Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
              <div style={{ flex: 1, fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>FROM</span>
                <strong>{currentRoute.origin.name}</strong>
              </div>
            </div>

            <div style={{ borderLeft: '2px dashed #475569', marginLeft: 4, height: 12 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }} />
              <div style={{ flex: 1, fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>TO</span>
                <strong>{currentRoute.destination.name}</strong>
              </div>
            </div>
          </div>

          {/* Live OSRM Walking Network Status Banner */}
          <div style={{
            background: currentRoute.isRealOSRM ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
            border: `1px solid ${currentRoute.isRealOSRM ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.3)'}`,
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem' }}>
              <span style={{ fontSize: '1rem' }}>🌐</span>
              <div>
                <strong style={{ color: currentRoute.isRealOSRM ? '#6ee7b7' : '#38bdf8' }}>
                  {currentRoute.isRealOSRM ? 'OSRM Live Walking Engine Active' : 'Real-Time Pedestrian Route Engine'}
                </strong>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                  Street geometry &amp; turn steps synced via OpenStreetMap
                </div>
              </div>
            </div>

            {onRecalculateRealRoute && (
              <button
                className="sim-btn"
                onClick={onRecalculateRealRoute}
                title="Recalculate route via live OSRM API"
                style={{ fontSize: '0.68rem', padding: '4px 8px', flexShrink: 0 }}
              >
                🔄 Recalculate
              </button>
            )}
          </div>

          {/* Scout Pro Advanced Hazard Avoidance Filters */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={13} color="#f59e0b" />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff' }}>
                  Advanced Hazard Filters
                </span>
              </div>
              <span style={{
                fontSize: '0.62rem',
                background: isProSubscriber() ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                color: isProSubscriber() ? '#090d16' : '#f59e0b',
                padding: '1px 6px',
                borderRadius: 999,
                fontWeight: 800
              }}>
                {isProSubscriber() ? 'PRO ACTIVE' : 'SCOUT PRO ⭐'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { label: 'Avoid Low-Light Alleys', active: avoidLowLight, toggle: () => setAvoidLowLight(!avoidLowLight) },
                { label: 'Bypass Roadworks', active: bypassRoadworks, toggle: () => setBypassRoadworks(!bypassRoadworks) },
                { label: 'Police/Haven Buffer', active: policeBufferActive, toggle: () => setPoliceBufferActive(!policeBufferActive) }
              ].map((f, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    fontSize: '0.66rem',
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: f.active && isProSubscriber() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: f.active && isProSubscriber() ? '#10b981' : 'rgba(255,255,255,0.1)',
                    color: f.active && isProSubscriber() ? '#6ee7b7' : '#94a3b8'
                  }}
                  onClick={() => {
                    if (!isProSubscriber()) {
                      if (onOpenSubscription) onOpenSubscription();
                    } else {
                      f.toggle();
                      audioSystem.playTone(600, 'sine', 0.08);
                    }
                  }}
                  title={!isProSubscriber() ? "Upgrade to Pro to toggle advanced filters" : "Toggle filter"}
                >
                  {f.active && isProSubscriber() ? '✓ ' : ''}{f.label} {!isProSubscriber() ? '🔒' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Route Mode Toggle Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            padding: 4,
            borderRadius: 14
          }}>
            {/* Safest Route Option */}
            <button
              onClick={() => setActiveRouteType('safest')}
              style={{
                background: activeRouteType === 'safest' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                border: activeRouteType === 'safest' ? '1px solid #10b981' : '1px solid transparent',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>SAFE ROUTE AI™</span>
                <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>97% SAFE</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                {currentRoute.safestRoute?.durationMinutes ? `${currentRoute.safestRoute.durationMinutes} mins` : '14 mins'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {currentRoute.safestRoute?.distanceKm || '1.4 km'} • Well-lit Boulevard
              </div>
            </button>

            {/* Fastest Route Option */}
            <button
              onClick={() => setActiveRouteType('fastest')}
              style={{
                background: activeRouteType === 'fastest' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                border: activeRouteType === 'fastest' ? '1px solid #f59e0b' : '1px solid transparent',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>FASTEST PATH</span>
                <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>62% SAFE</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                {currentRoute.fastestRoute?.durationMinutes ? `${currentRoute.fastestRoute.durationMinutes} mins` : '11 mins'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {currentRoute.fastestRoute?.distanceKm || '1.1 km'} • Dark Elm Alley
              </div>
            </button>
          </div>

          {/* Deep Route Comparison Matrix */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: 16
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} color="#06b6d4" />
              Safety Telemetry Comparison
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Street Lighting Index</span>
                <span>
                  <strong style={{ color: '#10b981' }}>98% LED (Safest)</strong> vs <span style={{ color: '#f59e0b' }}>48% (Fastest)</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Smart CCTV Coverage</span>
                <span>
                  <strong style={{ color: '#10b981' }}>94% Coverage</strong> vs <span style={{ color: '#f59e0b' }}>32%</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>Active Footfall (Pedestrians)</span>
                <span>
                  <strong style={{ color: '#10b981' }}>Bustling/Crowded</strong> vs <span style={{ color: '#f59e0b' }}>Isolated Passageway</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                <span style={{ color: '#94a3b8' }}>Hazard Avoidance</span>
                <span>
                  <strong style={{ color: '#10b981' }}>Both Hazards Avoided ✅</strong>
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderLeft: '3px solid #10b981',
              padding: '8px 10px',
              borderRadius: 4,
              fontSize: '0.72rem',
              color: '#cbd5e1',
              marginTop: 12
            }}>
              💡 <strong>AI Recommendation:</strong> For only 3 minutes extra walking, SafeRoute AI keeps you fully illuminated and passes the 24/7 Civic Plaza Police Kiosk.
            </div>
          </div>

          {/* Navigation Control Banner */}
          {!isNavigating ? (
            <button className="btn-primary" onClick={handleStartNav} style={{ padding: '12px' }}>
              <Navigation size={18} />
              Start SafeRoute™ Guided Walking
            </button>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid #10b981',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                  STEP {navStepIndex + 1} OF {navSteps.length}
                </span>
                <button
                  className="sim-btn"
                  onClick={() => setIsNavigating(false)}
                >
                  End Navigation
                </button>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {navSteps[navStepIndex].text}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#86efac' }}>
                <ShieldCheck size={14} />
                <span>{navSteps[navStepIndex].safeNotice}</span>
              </div>

              <button className="btn-primary" onClick={handleNextStep}>
                {navStepIndex < navSteps.length - 1 ? 'Next Turn Step' : 'Arrived at Destination 🎉'}
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCIDENT RADAR */}
      {activeTab === 'incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Crowdsourced &amp; Municipal Verified Alerts
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={onOpenReportModal}
            >
              + Report Incident
            </button>
          </div>

          {currentIncidents.map(inc => {
            const isSafe = inc.type === 'safe_haven';
            const color = isSafe ? '#10b981' : (inc.severity === 'high' ? '#f43f5e' : '#f59e0b');

            return (
              <div
                key={inc.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${color}44`,
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `${color}22`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      {isSafe ? '🛡️' : (inc.type === 'poor_lighting' ? '💡' : '⚠️')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{inc.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📍 {inc.location} • {inc.timestamp}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: `${color}22`,
                    color: color,
                    textTransform: 'uppercase'
                  }}>
                    {inc.severity}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {inc.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>Verified by {inc.reportsCount > 0 ? `${inc.reportsCount} citizen scouts` : 'Police Dept'}</span>
                  <span style={{ color: color, fontWeight: 600 }}>{inc.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SOS GUARD & EMERGENCY TOOLS */}
      {activeTab === 'sos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Siren Strobe Big Card */}
          <div style={{
            background: isSirenActive ? 'var(--gradient-danger)' : 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: 20,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: isSirenActive ? '#fff' : 'rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSirenActive ? '0 0 30px #f43f5e' : 'none'
            }}>
              <BellRing size={36} color={isSirenActive ? '#f43f5e' : '#fb7185'} />
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {isSirenActive ? 'LOUD EMERGENCY SIREN SOUNDING' : 'Loud Acoustic SOS Alarm'}
              </div>
              <div style={{ fontSize: '0.75rem', color: isSirenActive ? '#ffe4e6' : '#94a3b8', marginTop: 2 }}>
                Emits an intense 110dB audio beacon to deter harassers and attract nearby citizens.
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                background: isSirenActive ? '#fff' : 'var(--gradient-danger)',
                color: isSirenActive ? '#e11d48' : '#fff',
                width: '100%',
                padding: '12px',
                fontWeight: 800
              }}
              onClick={onToggleSOS}
            >
              {isSirenActive ? 'STOP SIREN ALARM' : 'ACTIVATE LOUD SIREN NOW'}
            </button>
          </div>

          {/* Rapid Safety Tools Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Fake Call Trigger */}
            <button
              onClick={triggerFakeCall}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <PhoneCall size={20} color="#38bdf8" />
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>Simulate Fake Call</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Rings fake phone call to exit awkward spots</div>
            </button>

            {/* Share GPS Location */}
            <button
              onClick={handleShareLocation}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <Share2 size={20} color="#10b981" />
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
                {locationCopied ? 'Copied to Clipboard! ✅' : 'Share Live GPS'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Copy safety coordinates to WhatsApp/SMS</div>
            </button>
          </div>

          {/* Emergency Hotlines Directory */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: 16
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Verified Emergency Hotlines (1-Touch)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EMERGENCY_CONTACTS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{c.desc}</div>
                  </div>
                  <a
                    href={`tel:${c.number.replace(/\D/g, '')}`}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Call {c.number.split(' ')[0]}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fake Phone Call Modal Simulator */}
      {showFakeCallModal && (
        <div className="modal-overlay" onClick={() => setShowFakeCallModal(false)}>
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 24,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Incoming Cellular Call...
            </div>

            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              👮
            </div>

            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Officer Davis (Patrol 4)</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981' }}>City SafeWalk Companion • Ringing</div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: 280 }}>
              "Hold phone to your ear and pretend you are meeting someone right around the corner."
            </p>

            <div style={{ display: 'flex', gap: 16, width: '100%', marginTop: 10 }}>
              <button
                className="btn-primary"
                style={{ background: '#10b981' }}
                onClick={() => {
                  audioSystem.speak("Hello! I am just across the street at the lit intersection. I can see you now.");
                }}
              >
                Accept Call
              </button>
              <button
                className="btn-primary"
                style={{ background: '#f43f5e' }}
                onClick={() => setShowFakeCallModal(false)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
