import React, { useState } from 'react';
import { 
  Radio, CloudRain, Wind, AlertCircle, ThumbsUp, Volume2, 
  MessageSquare, PlusCircle, CheckCircle, Flame, Car, Share2, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRAFFIC_CORRIDORS, WEATHER_ALERTS, SOCIAL_BUZZ_STREAM } from '../data/pulseData';
import { audioSystem } from '../utils/audioSystem';

export default function SmartPulseView({ 
  citizenReports = [], 
  onUpvoteReport, 
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

      {/* TAB 3: WEATHER & AIR QUALITY */}
      {pulseSubTab === 'weather' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WEATHER_ALERTS.map(alert => (
            <div
              key={alert.id}
              style={{
                background: alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: alert.severity === 'warning' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: alert.severity === 'warning' ? '#f59e0b' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {alert.severity === 'warning' ? <CloudRain size={16} /> : <Wind size={16} />}
                  {alert.title}
                </span>

                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{alert.window}</span>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {alert.detail}
              </p>

              <div style={{
                fontSize: '0.72rem',
                color: '#fff',
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 10px',
                borderRadius: 6,
                marginTop: 4
              }}>
                💡 <strong>Action:</strong> {alert.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

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
