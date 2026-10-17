import { 
  User, Shield, Download, Trash2, CheckCircle2, X, Sparkles, 
  Settings, Bell, Lock, Mail, ExternalLink, HardDrive, Archive, RefreshCw,
  UploadCloud, AlertCircle, FileCheck
} from 'lucide-react';
import { audioSystem } from '../utils/audioSystem.js';
import { 
  isProSubscriber, 
  exportUserDataGDPR, 
  exportCompleteBackupZip, 
  validateBackupZip, 
  restoreCompleteBackupZip 
} from '../utils/prarushFreemium.js';
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
  
  // Backup Restore State
  const [restoreFile, setRestoreFile] = useState(null);
  const [restorePreview, setRestorePreview] = useState(null);
  const [isInspectingRestore, setIsInspectingRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [conflictStrategy, setConflictStrategy] = useState('merge'); // 'merge' | 'overwrite'
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');

  const isPro = isProSubscriber();

  if (!isOpen) return null;

  const handleSelectRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError('');
    setRestoreSuccess('');
    setIsInspectingRestore(true);
    audioSystem.playTone(550, 'sine', 0.1);

    try {
      const validation = await validateBackupZip(file);
      if (validation.valid) {
        setRestorePreview(validation);
        audioSystem.playSuccessSound();
      } else {
        setRestorePreview(null);
        setRestoreError(validation.error || 'Invalid backup archive.');
        audioSystem.playWarningSound();
      }
    } catch (err) {
      setRestorePreview(null);
      setRestoreError(err.message || 'Failed to inspect backup file.');
      audioSystem.playWarningSound();
    } finally {
      setIsInspectingRestore(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreFile || !restorePreview) return;
    setIsRestoring(true);
    setRestoreError('');
    audioSystem.playTone(650, 'sine', 0.15);

    try {
      const result = await restoreCompleteBackupZip(restoreFile, user, { conflictStrategy });
      if (result.success) {
        audioSystem.playSuccessSound();
        setRestoreSuccess(`Restore complete! Successfully imported ${result.restoredWorkspaces} workspaces, ${result.restoredTasks} tasks, and ${result.restoredFiles} documents into your profile.`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setRestoreError(result.error || 'Restore failed.');
        audioSystem.playWarningSound();
      }
    } catch (err) {
      setRestoreError(err.message || 'Failed to execute restore.');
      audioSystem.playWarningSound();
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setRestoreFile(null);
    setRestorePreview(null);
    setRestoreError('');
    setRestoreSuccess('');
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    audioSystem.playTone(600, 'sine', 0.1);
    try {
      const res = await exportCompleteBackupZip(user);
      if (res && res.success) {
        audioSystem.playSuccessSound();
        setCopiedZip(true);
        setTimeout(() => setCopiedZip(false), 3000);
      } else {
        audioSystem.playWarningSound();
        window.alert(`Backup Error: ${res?.error || 'Could not compile complete archive.'}`);
      }
    } catch (err) {
      console.warn('Backup error:', err);
      window.alert(`Backup Error: ${err.message || 'Export failed.'}`);
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
        const storageCleared = clearPrarushStorageOnly();

        if (!idbCleared && !storageCleared) {
          window.alert('Reset Failure: Neither IndexedDB nor LocalStorage could be cleared. Please check storage permissions.');
          return;
        }
        if (!idbCleared) {
          window.alert('Partial Reset Error: LocalStorage was cleared, but IndexedDB files could not be purged. Please check browser permissions.');
          return;
        }
        if (!storageCleared) {
          window.alert('Partial Reset Error: IndexedDB files were purged, but LocalStorage keys could not be cleared.');
          return;
        }

        window.alert('Reset Complete: Both Prarush local storage and IndexedDB binary files have been verified purged.');
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

              {/* 2. Restore Backup Archive (.ZIP) */}
              <div>
                <input
                  type="file"
                  id="backup-restore-input"
                  accept=".zip"
                  style={{ display: 'none' }}
                  onChange={handleSelectRestoreFile}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('backup-restore-input')?.click()}
                  disabled={isInspectingRestore || isRestoring}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(56, 189, 248, 0.10)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    color: '#38bdf8',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: (isInspectingRestore || isRestoring) ? 'wait' : 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                    {isInspectingRestore ? <RefreshCw size={16} className="spin-slow" /> : <UploadCloud size={16} />}
                    <div>
                      <div style={{ fontWeight: 700 }}>Restore from Backup Archive (.ZIP)</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>
                        Validate archive, preview workspace contents &amp; restore to this profile
                      </div>
                    </div>
                  </div>
                  <FileCheck size={16} />
                </button>
              </div>

              {/* Restore Error Banner */}
              {restoreError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span>{restoreError}</span>
                </div>
              )}

              {/* Restore Success Banner */}
              {restoreSuccess && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <CheckCircle2 size={16} />
                  <span>{restoreSuccess}</span>
                </div>
              )}

              {/* Restore Interactive Preview Card */}
              {restorePreview && (
                <div style={{
                  padding: '14px',
                  borderRadius: 14,
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                      <FileCheck size={16} />
                      <span>Archive Verified Valid</span>
                    </div>
                    <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      {restorePreview.exportTimestamp ? new Date(restorePreview.exportTimestamp).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                    <strong>Origin User:</strong> {restorePreview.sourceUser?.name || 'Local User'} ({restorePreview.sourceUser?.email || 'local'})
                  </div>

                  {/* Metric Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    <div style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8' }}>Workspaces</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700 }}>{restorePreview.workspaceCount}</div>
                    </div>
                    <div style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8' }}>Tasks</div>
                      <div style={{ color: '#f8fafc', fontWeight: 700 }}>{restorePreview.taskCount}</div>
                    </div>
                    <div style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontSize: '0.72rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8' }}>Files (IDB)</div>
                      <div style={{ color: '#10b981', fontWeight: 700 }}>{restorePreview.binaryFiles.length}</div>
                    </div>
                  </div>

                  {/* Conflict Handling Strategy */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                      Conflict Handling:
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setConflictStrategy('merge')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: conflictStrategy === 'merge' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: conflictStrategy === 'merge' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                          color: conflictStrategy === 'merge' ? '#38bdf8' : '#94a3b8'
                        }}
                      >
                        Merge (Safe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConflictStrategy('overwrite')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: conflictStrategy === 'overwrite' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: conflictStrategy === 'overwrite' ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                          color: conflictStrategy === 'overwrite' ? '#f43f5e' : '#94a3b8'
                        }}
                      >
                        Replace All
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={handleCancelRestore}
                      disabled={isRestoring}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      disabled={isRestoring}
                      style={{
                        flex: 2,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: isRestoring ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      {isRestoring ? <RefreshCw size={13} className="spin-slow" /> : <FileCheck size={14} />}
                      <span>{isRestoring ? 'Restoring Profile...' : 'Confirm & Restore'}</span>
                    </button>
                  </div>
                </div>
              )}

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
