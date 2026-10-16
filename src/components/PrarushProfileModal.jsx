import React, { useState } from 'react';
import { 
  User, Shield, Download, Trash2, CheckCircle2, X, Sparkles, 
  Settings, Bell, Lock, Mail, ExternalLink, HardDrive 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber, exportUserDataGDPR } from '../utils/prarushFreemium.js';

export default function PrarushProfileModal({ 
  isOpen, 
  onClose, 
  user = { name: 'Pratham Dev', email: 'pratham@prarush.ai', avatar: '⚡', role: 'Architect & Lead Builder' },
  onOpenSubscription
}) {
  const [copiedGDPR, setCopiedGDPR] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const isPro = isProSubscriber();

  if (!isOpen) return null;

  const handleExportGDPR = () => {
    audioSystem.playSuccessSound();
    exportUserDataGDPR();
    setCopiedGDPR(true);
    setTimeout(() => setCopiedGDPR(false), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local offline workspace caches and reset to factory demo state?')) {
      audioSystem.playWarningSound();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 16
    }}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#0d1322',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(139,92,246,0.1) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              {user.avatar || '⚡'}
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 8,
              padding: 8,
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Subscription status */}
          <div style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: isPro ? 'rgba(16,185,129,0.1)' : 'rgba(6,182,212,0.08)',
            border: isPro ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(6,182,212,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: isPro ? '#10b981' : '#06b6d4', fontWeight: 700, letterSpacing: '0.05em' }}>
                Account Tier
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                {isPro ? 'Prarush Pro (Unlimited AI + Automations)' : 'Prarush Free Scout Tier'}
              </div>
            </div>
            {!isPro && (
              <button
                onClick={() => { onClose(); onOpenSubscription(); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Sparkles size={14} /> Upgrade
              </button>
            )}
          </div>

          {/* Preferences */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
              System Preferences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#e2e8f0' }}>
                  <Bell size={16} color="#06b6d4" />
                  <span>Real-Time In-App Notifications</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  style={{ accentColor: '#06b6d4', width: 16, height: 16, cursor: 'pointer' }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: '#e2e8f0' }}>
                  <Shield size={16} color="#10b981" />
                  <span>Privacy-Preserving Telemetry</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telemetryConsent} 
                  onChange={(e) => setTelemetryConsent(e.target.checked)}
                  style={{ accentColor: '#10b981', width: 16, height: 16, cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* GDPR and Data Privacy */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
              GDPR Compliance & Data Portability
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleExportGDPR}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                  color: '#06b6d4',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Download size={16} />
                  <span>Export Complete Data Archive (GDPR JSON)</span>
                </div>
                {copiedGDPR ? <CheckCircle2 size={16} color="#10b981" /> : <HardDrive size={16} />}
              </button>

              <button
                onClick={handleClearCache}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  color: '#f43f5e',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
                <span>Reset Local Workspaces & Wipe Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span>Prarush Platform v2.0 • Zero-Knowledge Encrypted</span>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#f8fafc',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
