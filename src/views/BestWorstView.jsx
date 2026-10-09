import React, { useState, useEffect, useRef } from 'react';
import { Scale, Shield, Sparkles, DollarSign, Star, MapPin, VolumeX, Trophy, ChevronRight, ArrowRight } from 'lucide-react';
import { NEIGHBORHOOD_BENCHMARKS, COMPARISON_METRIC_CONFIG } from '../data/placesComparisonData';

export default function BestWorstView() {
  const [districtAId, setDistrictAId] = useState('old-quarter');
  const [districtBId, setDistrictBId] = useState('financial-uptown');
  const [leaderboardSort, setLeaderboardSort] = useState('safety'); // 'safety', 'cleanliness', 'affordability', 'ratings'
  
  const canvasRef = useRef(null);

  const districtA = NEIGHBORHOOD_BENCHMARKS.find(d => d.id === districtAId) || NEIGHBORHOOD_BENCHMARKS[0];
  const districtB = NEIGHBORHOOD_BENCHMARKS.find(d => d.id === districtBId) || NEIGHBORHOOD_BENCHMARKS[1];

  // Draw Radar Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 34;

    ctx.clearRect(0, 0, width, height);

    const metrics = COMPARISON_METRIC_CONFIG;
    const numPoints = metrics.length;
    const angleStep = (Math.PI * 2) / numPoints;

    // Draw background concentric web polygons (25%, 50%, 75%, 100%)
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach(level => {
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * level);
        const y = centerY + Math.sin(angle) * (radius * level);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw radial spokes and labels
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Spoke line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Label text
      const labelX = centerX + Math.cos(angle) * (radius + 20);
      const labelY = centerY + Math.sin(angle) * (radius + 20);
      const shortLabel = metrics[i].label.split(' ')[0];
      ctx.fillText(shortLabel, labelX, labelY);
    }

    // Helper to draw polygon dataset
    const drawPolygon = (district, strokeColor, fillColor) => {
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const val = district.metrics[metrics[i].key] || 50;
        const normalized = val / 100;
        const x = centerX + Math.cos(angle) * (radius * normalized);
        const y = centerY + Math.sin(angle) * (radius * normalized);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw point dots
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const val = district.metrics[metrics[i].key] || 50;
        const normalized = val / 100;
        const x = centerX + Math.cos(angle) * (radius * normalized);
        const y = centerY + Math.sin(angle) * (radius * normalized);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      }
    };

    // Draw District B (Amber)
    drawPolygon(districtB, '#f59e0b', 'rgba(245, 158, 11, 0.22)');
    // Draw District A (Cyan)
    drawPolygon(districtA, '#06b6d4', 'rgba(6, 182, 212, 0.28)');

  }, [districtA, districtB]);

  // Sort Leaderboard
  const sortedLeaderboard = [...NEIGHBORHOOD_BENCHMARKS].sort((a, b) => {
    return b.metrics[leaderboardSort] - a.metrics[leaderboardSort];
  });

  return (
    <div className="view-content" id="benchmark-view">
      {/* Title & Tagline */}
      <div className="section-title-wrap">
        <div>
          <h2 className="section-h2">
            <Scale size={20} color="#f59e0b" />
            Best vs. Worst Places Comparator
          </h2>
          <p className="section-subtitle">
            Side-by-side urban metrics: Safety, Cleanliness, Affordability &amp; Ratings
          </p>
        </div>
      </div>

      {/* Selectors for District A and B */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
          {/* Selector A */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#06b6d4' }}>DISTRICT A</span>
            <select
              className="form-select"
              value={districtAId}
              onChange={(e) => setDistrictAId(e.target.value)}
              style={{ padding: '8px 10px', fontSize: '0.78rem' }}
            >
              {NEIGHBORHOOD_BENCHMARKS.map(d => (
                <option key={d.id} value={d.id} disabled={d.id === districtBId}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: 18
          }}>
            VS
          </div>

          {/* Selector B */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b' }}>DISTRICT B</span>
            <select
              className="form-select"
              value={districtBId}
              onChange={(e) => setDistrictBId(e.target.value)}
              style={{ padding: '8px 10px', fontSize: '0.78rem' }}
            >
              {NEIGHBORHOOD_BENCHMARKS.map(d => (
                <option key={d.id} value={d.id} disabled={d.id === districtAId}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: '0.75rem', paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#06b6d4' }} />
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>{districtA.name.split(' (')[0]}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{districtB.name.split(' (')[0]}</span>
          </div>
        </div>

        {/* Radar Canvas Chart */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
          <canvas
            ref={canvasRef}
            width={320}
            height={260}
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>

      {/* Side-by-Side Metric Showdown Bar Chart */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 16
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
          Metric Breakdown &amp; Category Winner
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {COMPARISON_METRIC_CONFIG.map(metric => {
            const valA = districtA.metrics[metric.key];
            const valB = districtB.metrics[metric.key];
            const winner = valA > valB ? 'A' : (valB > valA ? 'B' : 'Tie');

            return (
              <div key={metric.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{metric.label}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: winner === 'A' ? 'rgba(6, 182, 212, 0.2)' : (winner === 'B' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.1)'),
                    color: winner === 'A' ? '#06b6d4' : (winner === 'B' ? '#f59e0b' : '#94a3b8')
                  }}>
                    {winner === 'A' ? `${districtA.name.split(' (')[0]} Wins` : (winner === 'B' ? `${districtB.name.split(' (')[0]} Wins` : 'Even Tie')}
                  </span>
                </div>

                {/* Progress bars comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {/* Bar A */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 16, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${valA}%`,
                      height: '100%',
                      background: '#06b6d4',
                      borderRadius: 6,
                      transition: 'width 0.4s ease'
                    }} />
                    <span style={{ position: 'absolute', right: 6, top: 1, fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                      {valA}/100
                    </span>
                  </div>

                  {/* Bar B */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 16, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${valB}%`,
                      height: '100%',
                      background: '#f59e0b',
                      borderRadius: 6,
                      transition: 'width 0.4s ease'
                    }} />
                    <span style={{ position: 'absolute', right: 6, top: 1, fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                      {valB}/100
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Tradeoff Verdict Summary */}
        <div style={{
          marginTop: 16,
          background: 'rgba(139, 92, 246, 0.1)',
          borderLeft: '3px solid var(--accent-purple)',
          padding: '10px 12px',
          borderRadius: 4,
          fontSize: '0.74rem',
          color: '#e2e8f0'
        }}>
          💡 <strong>AI City Verdict:</strong> If your priority is late-night solo peace and cleanliness, <strong>{districtA.metrics.safety > districtB.metrics.safety ? districtA.name : districtB.name}</strong> leads comfortably. However, for authentic food culture and wallet-friendly dining, <strong>{districtA.metrics.affordability > districtB.metrics.affordability ? districtA.name : districtB.name}</strong> delivers superior experiential value.
        </div>
      </div>

      {/* City Index Leaderboard */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={16} color="#fbbf24" />
            City District Leaderboard
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`sim-btn ${leaderboardSort === 'safety' ? 'active' : ''}`}
              onClick={() => setLeaderboardSort('safety')}
            >
              Safety
            </button>
            <button
              className={`sim-btn ${leaderboardSort === 'cleanliness' ? 'active' : ''}`}
              onClick={() => setLeaderboardSort('cleanliness')}
            >
              Clean
            </button>
            <button
              className={`sim-btn ${leaderboardSort === 'affordability' ? 'active' : ''}`}
              onClick={() => setLeaderboardSort('affordability')}
            >
              Budget
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedLeaderboard.map((dist, idx) => (
            <div
              key={dist.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: idx === 0 ? '1px solid #10b98155' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: idx === 0 ? '#fbbf24' : (idx === 1 ? '#cbd5e1' : (idx === 2 ? '#b45309' : '#64748b')),
                  width: 20
                }}>
                  #{idx + 1}
                </span>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{dist.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{dist.bestFor}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>
                  {dist.metrics[leaderboardSort]}
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {leaderboardSort} index
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
