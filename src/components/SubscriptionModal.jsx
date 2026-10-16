import React, { useState } from 'react';
import { 
  Sparkles, Check, X, Shield, Zap, Download, Cpu, 
  CreditCard, Award, ArrowRight, RefreshCw, AlertCircle, Layers, BellRing, Lock 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PRARUSH_PLANS, 
  getSubscription, 
  isProSubscriber, 
  isTeamSubscriber,
  cancelSubscription 
} from '../utils/prarushFreemium.js';
import { audioSystem } from '../utils/audioSystem.js';

export default function SubscriptionModal({ isOpen, onClose, user, onSubscriptionChanged }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [selectedTier, setSelectedTier] = useState('pro'); // 'pro' | 'team'
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email || '');
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  if (!isOpen) return null;

  const currentSub = getSubscription();
  const isPro = isProSubscriber();

  const handleJoinWaitlist = (e) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) return;

    try {
      localStorage.setItem('prarush_local_waitlist_demo', JSON.stringify({
        email: waitlistEmail,
        tier: selectedTier,
        billingCycle,
        joinedAt: new Date().toISOString()
      }));
    } catch {
      // Ignore storage quota errors
    }

    setWaitlistJoined(true);
    audioSystem.playSuccessSound();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleResetToFree = () => {
    const cancelled = cancelSubscription();
    audioSystem.playWarningSound();
    if (onSubscriptionChanged) onSubscriptionChanged(cancelled);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxHeight: '92%', maxWidth: 560, margin: '0 auto' }}
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                Prarush Cloud Plans &amp; Waitlist
              </div>
              <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600 }}>
                Pricing Preview &bull; Currently 100% Free for Local Usage
              </div>
            </div>
          </div>

          <button className="header-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="sheet-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Honest Notice Box */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: '0.76rem',
            color: '#cbd5e1',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
              <Lock size={15} />
              <span>Purchases Disabled During Local-First Preview</span>
            </div>
            Prarush is currently provided completely free for local browser productivity and BYOK AI. Server-verified multi-device cloud sync, team workspaces, and paid subscription billing are currently in active development.
          </div>

          {/* If existing local test sub */}
          {isPro && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 700 }}>Local Prototype Pro Active</span>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Reset your local test status to standard Free Scout tier.</p>
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '6px 12px', color: '#fb7185' }}
                onClick={handleResetToFree}
              >
                Reset to Free
              </button>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 12,
            padding: 4,
            border: '1px solid var(--border-glass)'
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 9,
                border: 'none',
                background: billingCycle === 'annual' ? 'var(--accent-cyan)' : 'transparent',
                color: billingCycle === 'annual' ? '#090d16' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              onClick={() => setBillingCycle('annual')}
            >
              <span>Annual Billing</span>
              <span style={{
                fontSize: '0.62rem',
                background: billingCycle === 'annual' ? '#090d16' : 'rgba(16, 185, 129, 0.2)',
                color: billingCycle === 'annual' ? '#38bdf8' : '#10b981',
                padding: '2px 6px',
                borderRadius: 999,
                fontWeight: 800
              }}>
                SAVE 33%
              </span>
            </button>

            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 9,
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--accent-cyan)' : 'transparent',
                color: billingCycle === 'monthly' ? '#090d16' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
          </div>

          {/* Tier Selector (Pro vs Team) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div
              onClick={() => setSelectedTier('pro')}
              style={{
                border: selectedTier === 'pro' ? '2px solid #06b6d4' : '1px solid var(--border-glass)',
                borderRadius: 12,
                padding: 12,
                background: selectedTier === 'pro' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Prarush Pro</strong>
                <span style={{ fontSize: '0.62rem', background: '#06b6d4', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>PLANNED</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: 4 }}>
                {billingCycle === 'annual' ? '$8' : '$12'}
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: 2 }}>
                For power developers &amp; researchers.
              </div>
            </div>

            <div
              onClick={() => setSelectedTier('team')}
              style={{
                border: selectedTier === 'team' ? '2px solid #f59e0b' : '1px solid var(--border-glass)',
                borderRadius: 12,
                padding: 12,
                background: selectedTier === 'team' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Prarush Team</strong>
                <span style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#090d16', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>BUSINESS</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginTop: 4 }}>
                {billingCycle === 'annual' ? '$23' : '$29'}
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/seat/mo</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: 2 }}>
                Multi-user workspaces &amp; audit logs.
              </div>
            </div>
          </div>

          {/* Planned Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Server-backed PostgreSQL database synchronization',
              'End-to-end encrypted multi-device state replication',
              'Collaborative real-time Kanban boards and team notes',
              'Dedicated high-throughput cloud AI endpoints',
              'Continuous automatic cloud backups & version history'
            ].map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Waitlist Form */}
          {waitlistJoined ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '14px 16px',
              color: '#f8fafc',
              fontSize: '0.8rem',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 800, marginBottom: 6 }}>
                <Check size={16} />
                <span>Local Interest Recorded (Demo Preview)</span>
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#cbd5e1' }}>
                Your email <strong style={{ color: '#fff' }}>{waitlistEmail}</strong> has been stored locally on this device.
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.72rem',
                color: '#94a3b8'
              }}>
                <strong style={{ color: '#e2e8f0' }}>Notice:</strong> Because Prarush is currently an offline local-first prototype without a cloud backend, no automated remote email was dispatched. For live release announcements and backend availability, monitor the official repository.
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <a
                  href="https://github.com/Pratham4908/Prarush"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.75rem',
                    padding: '8px 14px',
                    textDecoration: 'none'
                  }}
                >
                  <span>Follow GitHub Releases</span>
                  <ArrowRight size={13} />
                </a>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 14px' }}
                  onClick={() => setWaitlistJoined(false)}
                >
                  Edit Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600 }}>
                  Demo Waitlist &bull; Local Interest Tracker
                </label>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  Offline Preview
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter email to record interest..."
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <BellRing size={14} />
                  <span>Join Waitlist (Preview)</span>
                </button>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>
                Saves email to local browser settings. No cloud transmission occurs until a backend service is connected.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
