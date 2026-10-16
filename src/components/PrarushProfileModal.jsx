import React, { useState } from 'react';
import { 
  User, Shield, Download, Trash2, CheckCircle2, X, Sparkles, 
  Settings, Bell, Lock, Mail, ExternalLink, HardDrive, Archive, RefreshCw 
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { isProSubscriber, exportUserDataGDPR, exportCompleteBackupZip } from '../utils/prarushFreemium.js';
import { clearPrarushStorageOnly } from '../utils/prarushStore.js';
import { clearAllFilesFromIndexedDB } from '../utils/indexedDbStore.js';

export default function PrarushProfileModal({ 
  isOpen, 
  onClose, 
  user,
  onOpenSubscription,
  onOpenAuth,
  onLogout
}) {
  const [copiedGDPR, setCopiedGDPR] = useState(false);
  const [copiedZip, setCopiedZip] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const isPro = isProSubscriber();

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExportingZip(true);
    audioSystem.playTone(600, 'sine', 0.1);
    try {
      await exportCompleteBackupZip(user);
      audioSystem.playSuccessSound();
      setCopiedZip(true);
      setTimeout(() => setCopiedZip(false), 3000);
    } catch (err) {
      console.warn('Backup error:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportGDPR = () => {
    audioSystem.playSuccessSound();
    exportUserDataGDPR(user);
    setCopiedGDPR(true);
    setTimeout(() => setCopiedGDPR(false), 3000);
  };

  const handleClearCache = async () => {
    if (window.confirm('Clear all local offline workspaces, notes, tasks, AND all uploaded binary files in IndexedDB? This will perform a complete factory reset of Prarush local storage on this browser.')) {
      audioSystem.playWarningSound();
      try {
        const idbCleared = await clearAllFilesFromIndexedDB();
        if (!idbCleared) {
          window.alert('Error: Could not clear IndexedDB file storage. Please verify browser storage permissions and try again.');
          return;
        }
        clearPrarushStorageOnly();
        window.alert('Reset Complete: All Prarush local storage and IndexedDB binary files have been purged.');
        window.location.reload();
      } catch (err) {
        window.alert(`Reset error: ${err.message || 'Storage wipe failed.'}`);
      }
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
              {/* 1. Complete Archive Backup (ZIP with Files) */}
              <button
                onClick={handleExportZip}
                disabled={isExportingZip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isExportingZip ? 'wait' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  {isExportingZip ? <RefreshCw size={16} className="spin-slow" /> : <Archive size={16} />}
                  <div>
                    <div style={{ fontWeight: 700 }}>Export Complete Backup (.ZIP with Files)</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>
                      Includes metadata.json AND all uploaded binary files from IndexedDB
                    </div>
                  </div>
                </div>
                {copiedZip ? <CheckCircle2 size={16} color="#10b981" /> : <Download size={16} />}
              </button>

              {/* 2. Metadata-only JSON */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  <Download size={16} />
                  <div>
                    <div>Export Metadata Only (JSON)</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>
                      Lightweight export of tasks, notes &amp; document metadata
                    </div>
                  </div>
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
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Trash2 size={16} />
                <div>
                  <div>Reset Local Storage &amp; IndexedDB Files</div>
                  <div style={{ fontSize: '0.68rem', color: '#fb7185', fontWeight: 400 }}>
                    Wipes localStorage preferences AND all binary files in IndexedDB
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Account Authentication & Sessions */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
              Account & Session Security
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { onClose(); if (onOpenAuth) onOpenAuth(); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Lock size={15} color="#06b6d4" />
                <span>{user?.isGuest ? 'Sign In / Register' : 'Switch Account'}</span>
              </button>

              {!user?.isGuest && onLogout && (
                <button
                  onClick={() => { onClose(); onLogout(); }}
                  style={{
                    padding: '11px 16px',
                    borderRadius: 12,
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    color: '#f43f5e',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              )}
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
          <span>Prarush Platform v2.0 • Local-First Architecture</span>
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
