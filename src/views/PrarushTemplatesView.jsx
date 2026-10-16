import React, { useState } from 'react';
import { 
  Layers, Star, Download, Copy, Check, Filter, 
  Sparkles, User, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { COMMUNITY_TEMPLATES } from '../utils/prarushStore.js';
import { audioSystem } from '../utils/audioSystem.js';
import confetti from 'canvas-confetti';

export default function PrarushTemplatesView({ onCloneTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [clonedId, setClonedId] = useState(null);

  const categories = ['all', 'Engineering', 'Academic', 'Business', 'Creator'];

  const filtered = selectedCategory === 'all'
    ? COMMUNITY_TEMPLATES
    : COMMUNITY_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleClone = (tpl) => {
    setClonedId(tpl.id);
    audioSystem.playSuccessSound();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    if (onCloneTemplate) onCloneTemplate(tpl);
    setTimeout(() => setClonedId(null), 2500);
  };

  return (
    <div className="prarush-view-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={24} color="#8b5cf6" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Community Templates &amp; Workflow Blueprints
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0', maxWidth: 650 }}>
            Clone pre-built operating systems, Kanban sprint boards, and academic research pipelines curated by top professionals worldwide.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid',
                background: selectedCategory === cat ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.04)',
                borderColor: selectedCategory === cat ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                color: selectedCategory === cat ? '#090d16' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {filtered.map(tpl => {
          const isCloned = clonedId === tpl.id;
          return (
            <div
              key={tpl.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {tpl.name}
                  </h3>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                    Category: <strong>{tpl.category}</strong> &bull; By {tpl.author}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  <Star size={12} fill="#f59e0b" />
                  <span>{tpl.stars}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                {tpl.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  📥 {tpl.clones.toLocaleString()} clones
                </span>

                <button
                  onClick={() => handleClone(tpl)}
                  className="btn-primary"
                  style={{
                    fontSize: '0.74rem',
                    padding: '6px 14px',
                    background: isCloned ? '#10b981' : undefined
                  }}
                >
                  {isCloned ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Cloned to Workspace ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Clone Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
