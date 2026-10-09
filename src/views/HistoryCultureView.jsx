import React, { useState } from 'react';
import { Landmark, Volume2, BookOpen, CheckCircle2, XCircle, Users, Award, Sparkles, Compass } from 'lucide-react';
import { HERITAGE_SITES, CULTURAL_ETIQUETTE_GUIDE } from '../data/historyCultureData.js';

export default function HistoryCultureView({ sites = HERITAGE_SITES, onPlayAudioStory }) {
  const currentSites = sites && sites.length > 0 ? sites : HERITAGE_SITES;
  const [selectedSite, setSelectedSite] = useState(null);
  const [activeTab, setActiveTab] = useState('sites'); // 'sites', 'traditions', 'etiquette'

  return (
    <div className="view-content" id="history-view">
      {/* Title & Tagline */}
      <div className="section-title-wrap">
        <div>
          <h2 className="section-h2">
            <Landmark size={20} color="#c084fc" />
            History &amp; Living Culture
          </h2>
          <p className="section-subtitle">
            Walk centuries of urban memory, listen to archival stories &amp; master local customs
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="chip-filter-row" role="tablist">
        <button
          className={`filter-chip ${activeTab === 'sites' ? 'active' : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          🏛️ Heritage Sites ({currentSites.length})
        </button>
        <button
          className={`filter-chip ${activeTab === 'traditions' ? 'active' : ''}`}
          onClick={() => setActiveTab('traditions')}
        >
          🎭 Traditions &amp; Lore
        </button>
        <button
          className={`filter-chip ${activeTab === 'etiquette' ? 'active' : ''}`}
          onClick={() => setActiveTab('etiquette')}
        >
          🤝 Cultural Etiquette
        </button>
      </div>

      {/* Tab 1: Heritage Sites */}
      {activeTab === 'sites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {currentSites.map(site => (
            <article
              key={site.id}
              className="city-card"
              onClick={() => setSelectedSite(site)}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              role="button"
              aria-label={`View heritage site ${site.name}`}
            >
              <div className="card-media">
                <img src={site.image} alt={site.name} loading="lazy" />
                <div className="card-badge-top-left" style={{ color: '#c084fc', borderColor: '#c084fc55' }}>
                  <span>{site.period}</span>
                </div>
                <div className="card-badge-top-right">
                  <Award size={13} color="#f59e0b" />
                  <span>★ {site.rating}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-title">{site.name}</div>
                <div className="card-meta-row">
                  <span>🏛️ Architect: {site.architect}</span>
                  <span style={{ color: '#38bdf8' }}>👥 {site.visitorsAnnually} / yr</span>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {site.summary}
                </p>

                {/* Audio Guide Callout Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      <Volume2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>
                        Audio Guide ({site.audioGuide.duration})
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        Narrated by {site.audioGuide.narrator}
                      </div>
                    </div>
                  </div>

                  <button
                    className="sim-btn active"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudioStory(site.name, site.audioGuide.transcript);
                    }}
                    aria-label={`Play audio tour for ${site.name}`}
                  >
                    ▶ Listen
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {site.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: 4, fontSize: '0.68rem', color: '#94a3b8' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tab 2: Living Traditions & Lore */}
      {activeTab === 'traditions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(currentSites.some(s => s.traditions) ? currentSites.filter(s => s.traditions) : HERITAGE_SITES).map(site => (
            <div
              key={`trad-${site.id}`}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
                padding: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1.2rem' }}>📜</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{site.name} Traditions</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Living rituals handed down through centuries</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {site.traditions.map((trad, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      borderLeft: '3px solid var(--accent-purple)'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#e9d5ff', marginBottom: 2 }}>
                      {trad.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {trad.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Cultural Etiquette */}
      {activeTab === 'etiquette' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
              💡 Urban Local Wisdom
            </div>
            <p style={{ fontSize: '0.74rem', color: '#e2e8f0', lineHeight: 1.4 }}>
              Every neighborhood carries unwritten codes. Blending in keeps you safer, helps you make friends with locals, and respects city traditions.
            </p>
          </div>

          {CULTURAL_ETIQUETTE_GUIDE.map((eti, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                {idx === 0 ? '🚇' : idx === 1 ? '☕' : idx === 2 ? '📸' : '🛍️'}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: 3 }}>
                  {eti.topic}
                </div>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {eti.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Heritage Detail Full Modal */}
      {selectedSite && (
        <div className="modal-overlay" onClick={() => setSelectedSite(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span className="sheet-title">{selectedSite.name}</span>
              <button
                className="header-icon-btn"
                onClick={() => setSelectedSite(null)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className="sheet-content">
              <div style={{ borderRadius: 14, overflow: 'hidden', height: 180 }}>
                <img src={selectedSite.image} alt={selectedSite.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>{selectedSite.period} • {selectedSite.significance}</div>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: 8, lineHeight: 1.5 }}>
                  {selectedSite.fullHistory}
                </p>
              </div>

              {/* Do's and Don'ts */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  Visiting Etiquette &amp; Guidelines
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedSite.dosAndDonts.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.75rem',
                        color: item.type === 'do' ? '#86efac' : '#fca5a5',
                        background: item.type === 'do' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        padding: '6px 10px',
                        borderRadius: 8
                      }}
                    >
                      {item.type === 'do' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio guide listen button */}
              <button
                className="btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  const transcript = selectedSite.audioGuide.transcript;
                  const name = selectedSite.name;
                  setSelectedSite(null);
                  onPlayAudioStory(name, transcript);
                }}
              >
                <Volume2 size={16} />
                Start Interactive Audio Tour ({selectedSite.audioGuide.duration})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
